const express = require('express');
const db = require('../config/database.cjs');
const auth = require('../middleware/auth.cjs');
const mqttService = require('../services/mqttService.cjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all locker cabinets
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT lc.*, c.name as company_name,
             COUNT(comp.id) as total_compartments,
             COUNT(CASE WHEN comp.status = 'available' THEN 1 END) as available_compartments,
             COUNT(CASE WHEN comp.status = 'occupied' THEN 1 END) as occupied_compartments
      FROM locker_cabinets lc
      LEFT JOIN companies c ON lc.company_id = c.id
      LEFT JOIN compartments comp ON lc.id = comp.cabinet_id
      WHERE 1=1
    `;
    const params = [];

    // Apply company filter for non-superadmin users
    if (req.user.role !== 'superadmin') {
      query += ' AND lc.company_id = ?';
      params.push(req.user.companyId);
    }

    if (status) {
      query += ' AND lc.status = ?';
      params.push(status);
    }

    query += ' GROUP BY lc.id ORDER BY lc.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [cabinets] = await db.execute(query, params);

    res.json({ cabinets });

  } catch (error) {
    console.error('Get lockers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get specific locker cabinet with compartments
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT lc.*, c.name as company_name
      FROM locker_cabinets lc
      LEFT JOIN companies c ON lc.company_id = c.id
      WHERE lc.id = ?
    `;
    const params = [id];

    if (req.user.role !== 'superadmin') {
      query += ' AND lc.company_id = ?';
      params.push(req.user.companyId);
    }

    const [cabinets] = await db.execute(query, params);

    if (cabinets.length === 0) {
      return res.status(404).json({ message: 'Locker cabinet not found' });
    }

    // Get compartments for this cabinet
    const [compartments] = await db.execute(`
      SELECT comp.*, d.tracking_number, d.recipient_name, d.pickup_code
      FROM compartments comp
      LEFT JOIN deliveries d ON comp.id = d.compartment_id AND d.status IN ('delivered', 'pending')
      WHERE comp.cabinet_id = ?
      ORDER BY comp.compartment_number
    `, [id]);

    res.json({
      cabinet: cabinets[0],
      compartments
    });

  } catch (error) {
    console.error('Get locker error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new locker cabinet
router.post('/', auth, [
  body('name').isLength({ min: 3 }),
  body('locationAddress').isLength({ min: 10 }),
  body('esp32Id').isLength({ min: 5 }),
  body('totalCompartments').isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    // Only superadmin and admin can create cabinets
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      locationAddress,
      latitude,
      longitude,
      esp32Id,
      totalCompartments,
      companyId
    } = req.body;

    // Use user's company if not superadmin
    const finalCompanyId = req.user.role === 'superadmin' ? companyId : req.user.companyId;

    // Check if ESP32 ID is unique
    const [existingCabinets] = await db.execute('SELECT id FROM locker_cabinets WHERE esp32_id = ?', [esp32Id]);
    if (existingCabinets.length > 0) {
      return res.status(400).json({ message: 'ESP32 ID already exists' });
    }

    const mqttTopic = `lockers/${esp32Id}`;

    // Create cabinet
    const [cabinetResult] = await db.execute(`
      INSERT INTO locker_cabinets (company_id, name, location_address, latitude, longitude, esp32_id, mqtt_topic, total_compartments)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [finalCompanyId, name, locationAddress, latitude, longitude, esp32Id, mqttTopic, totalCompartments]);

    const cabinetId = cabinetResult.insertId;

    // Create compartments
    const compartmentInserts = [];
    for (let i = 1; i <= totalCompartments; i++) {
      compartmentInserts.push([cabinetId, i, 'medium', i]); // Default size medium, GPIO pin = compartment number
    }

    await db.execute(`
      INSERT INTO compartments (cabinet_id, compartment_number, size, gpio_pin)
      VALUES ${compartmentInserts.map(() => '(?, ?, ?, ?)').join(', ')}
    `, compartmentInserts.flat());

    res.status(201).json({
      message: 'Locker cabinet created successfully',
      cabinetId
    });

  } catch (error) {
    console.error('Create locker error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Control compartment (open/close)
router.post('/:cabinetId/compartments/:compartmentId/control', auth, [
  body('action').isIn(['open', 'close'])
], async (req, res) => {
  try {
    const { cabinetId, compartmentId } = req.params;
    const { action } = req.body;

    // Get cabinet and compartment info
    const [compartments] = await db.execute(`
      SELECT comp.*, lc.esp32_id, lc.mqtt_topic, lc.company_id
      FROM compartments comp
      JOIN locker_cabinets lc ON comp.cabinet_id = lc.id
      WHERE comp.id = ? AND lc.id = ?
    `, [compartmentId, cabinetId]);

    if (compartments.length === 0) {
      return res.status(404).json({ message: 'Compartment not found' });
    }

    const compartment = compartments[0];

    // Check permissions
    if (req.user.role !== 'superadmin' && req.user.companyId !== compartment.company_id) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Send MQTT command
    const command = {
      action,
      compartment: compartment.compartment_number,
      gpio_pin: compartment.gpio_pin,
      timestamp: new Date().toISOString()
    };

    mqttService.publishCommand(compartment.mqtt_topic, command);

    // Log activity
    await db.execute(`
      INSERT INTO activity_logs (user_id, compartment_id, action, description)
      VALUES (?, ?, ?, ?)
    `, [req.user.userId, compartmentId, `compartment_${action}`, `${action} compartment ${compartment.compartment_number}`]);

    res.json({
      message: `Compartment ${action} command sent successfully`,
      command
    });

  } catch (error) {
    console.error('Control compartment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update compartment status (from ESP32 feedback)
router.put('/:cabinetId/compartments/:compartmentId/status', auth, [
  body('status').isIn(['available', 'occupied', 'maintenance'])
], async (req, res) => {
  try {
    const { cabinetId, compartmentId } = req.params;
    const { status } = req.body;

    // Verify compartment exists and belongs to cabinet
    const [compartments] = await db.execute(`
      SELECT comp.*, lc.company_id
      FROM compartments comp
      JOIN locker_cabinets lc ON comp.cabinet_id = lc.id
      WHERE comp.id = ? AND lc.id = ?
    `, [compartmentId, cabinetId]);

    if (compartments.length === 0) {
      return res.status(404).json({ message: 'Compartment not found' });
    }

    // Update status
    await db.execute('UPDATE compartments SET status = ?, updated_at = NOW() WHERE id = ?', [status, compartmentId]);

    res.json({ message: 'Compartment status updated successfully' });

  } catch (error) {
    console.error('Update compartment status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;