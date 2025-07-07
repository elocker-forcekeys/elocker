const express = require('express');
const db = require('../config/database.cjs');
const auth = require('../middleware/auth.cjs');
const qrService = require('../services/qrService.cjs');
const emailService = require('../services/emailService.cjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all deliveries
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT d.*, 
             u.first_name as delivery_person_name,
             lc.name as cabinet_name,
             comp.compartment_number,
             c.name as company_name
      FROM deliveries d
      LEFT JOIN users u ON d.delivery_person_id = u.id
      LEFT JOIN compartments comp ON d.compartment_id = comp.id
      LEFT JOIN locker_cabinets lc ON comp.cabinet_id = lc.id
      LEFT JOIN companies c ON d.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    // Apply company filter for non-superadmin users
    if (req.user.role !== 'superadmin') {
      query += ' AND d.company_id = ?';
      params.push(req.user.companyId);
    }

    // Filter by delivery person for delivery role
    if (req.user.role === 'delivery') {
      query += ' AND d.delivery_person_id = ?';
      params.push(req.user.userId);
    }

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    query += ' ORDER BY d.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [deliveries] = await db.execute(query, params);

    res.json({ deliveries });

  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new delivery
router.post('/', auth, [
  body('recipientName').isLength({ min: 2 }),
  body('recipientEmail').isEmail().normalizeEmail(),
  body('recipientPhone').optional().isMobilePhone(),
  body('compartmentId').isInt()
], async (req, res) => {
  try {
    // Only delivery persons and admins can create deliveries
    if (!['superadmin', 'admin', 'delivery'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      recipientName,
      recipientEmail,
      recipientPhone,
      compartmentId,
      notes
    } = req.body;

    // Verify compartment is available
    const [compartments] = await db.execute(`
      SELECT comp.*, lc.company_id
      FROM compartments comp
      JOIN locker_cabinets lc ON comp.cabinet_id = lc.id
      WHERE comp.id = ? AND comp.status = 'available'
    `, [compartmentId]);

    if (compartments.length === 0) {
      return res.status(400).json({ message: 'Compartment not available' });
    }

    const compartment = compartments[0];

    // Check company permissions
    if (req.user.role !== 'superadmin' && req.user.companyId !== compartment.company_id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Generate tracking number and pickup code
    const trackingNumber = `TRK${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const pickupCode = Math.random().toString(36).substr(2, 8).toUpperCase();

    // Generate QR code
    const qrCodeData = {
      trackingNumber,
      pickupCode,
      recipientEmail
    };
    const qrCode = await qrService.generateQRCode(JSON.stringify(qrCodeData));

    // Set expiry date (72 hours from now by default)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 72);

    // Create delivery
    const [result] = await db.execute(`
      INSERT INTO deliveries (
        tracking_number, company_id, delivery_person_id, recipient_name, 
        recipient_email, recipient_phone, compartment_id, pickup_code, 
        qr_code, expiry_date, notes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'delivered')
    `, [
      trackingNumber,
      compartment.company_id,
      req.user.userId,
      recipientName,
      recipientEmail,
      recipientPhone,
      compartmentId,
      pickupCode,
      qrCode,
      expiryDate,
      notes
    ]);

    // Update compartment status
    await db.execute('UPDATE compartments SET status = ? WHERE id = ?', ['occupied', compartmentId]);

    // Send notification email
    await emailService.sendDeliveryNotification({
      recipientEmail,
      recipientName,
      trackingNumber,
      pickupCode,
      qrCode,
      expiryDate
    });

    res.status(201).json({
      message: 'Delivery created successfully',
      deliveryId: result.insertId,
      trackingNumber,
      pickupCode
    });

  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Pickup delivery (by client)
router.post('/pickup', [
  body('trackingNumber').isLength({ min: 5 }),
  body('pickupCode').isLength({ min: 5 })
], async (req, res) => {
  try {
    const { trackingNumber, pickupCode } = req.body;

    // Find delivery
    const [deliveries] = await db.execute(`
      SELECT d.*, comp.compartment_number, comp.gpio_pin, lc.mqtt_topic, lc.esp32_id
      FROM deliveries d
      JOIN compartments comp ON d.compartment_id = comp.id
      JOIN locker_cabinets lc ON comp.cabinet_id = lc.id
      WHERE d.tracking_number = ? AND d.pickup_code = ? AND d.status = 'delivered'
    `, [trackingNumber, pickupCode]);

    if (deliveries.length === 0) {
      return res.status(404).json({ message: 'Delivery not found or already picked up' });
    }

    const delivery = deliveries[0];

    // Check if not expired
    if (new Date() > new Date(delivery.expiry_date)) {
      return res.status(400).json({ message: 'Delivery has expired' });
    }

    // Update delivery status
    await db.execute(`
      UPDATE deliveries SET status = 'picked_up', pickup_date = NOW() WHERE id = ?
    `, [delivery.id]);

    // Update compartment status
    await db.execute('UPDATE compartments SET status = ? WHERE id = ?', ['available', delivery.compartment_id]);

    // Send MQTT command to open compartment
    const mqttService = require('../services/mqttService.cjs');
    const command = {
      action: 'open',
      compartment: delivery.compartment_number,
      gpio_pin: delivery.gpio_pin,
      timestamp: new Date().toISOString()
    };
    mqttService.publishCommand(delivery.mqtt_topic, command);

    res.json({
      message: 'Pickup successful',
      compartmentNumber: delivery.compartment_number
    });

  } catch (error) {
    console.error('Pickup delivery error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// QR Code pickup
router.post('/pickup/qr', [
  body('qrData').isLength({ min: 10 })
], async (req, res) => {
  try {
    const { qrData } = req.body;

    let parsedData;
    try {
      parsedData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code format' });
    }

    const { trackingNumber, pickupCode } = parsedData;

    if (!trackingNumber || !pickupCode) {
      return res.status(400).json({ message: 'Invalid QR code data' });
    }

    // Use the same pickup logic
    return req.body = { trackingNumber, pickupCode };
    // This would redirect to the pickup endpoint logic above

  } catch (error) {
    console.error('QR pickup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;