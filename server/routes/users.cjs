const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database.cjs');
const auth = require('../middleware/auth.cjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all users (with filtering by role and company)
router.get('/', auth, async (req, res) => {
  try {
    const { role, companyId, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.status, 
             u.last_login, u.created_at, c.name as company_name
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      WHERE 1=1
    `;
    const params = [];

    // Apply filters based on user role
    if (req.user.role !== 'superadmin') {
      query += ' AND u.company_id = ?';
      params.push(req.user.companyId);
    }

    if (role) {
      query += ' AND u.role = ?';
      params.push(role);
    }

    if (companyId && req.user.role === 'superadmin') {
      query += ' AND u.company_id = ?';
      params.push(companyId);
    }

    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [users] = await db.execute(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM users u WHERE 1=1';
    const countParams = [];

    if (req.user.role !== 'superadmin') {
      countQuery += ' AND u.company_id = ?';
      countParams.push(req.user.companyId);
    }

    if (role) {
      countQuery += ' AND u.role = ?';
      countParams.push(role);
    }

    if (companyId && req.user.role === 'superadmin') {
      countQuery += ' AND u.company_id = ?';
      countParams.push(companyId);
    }

    const [countResult] = await db.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    let query = `
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.status, 
             u.last_login, u.created_at, u.company_id, c.name as company_name
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      WHERE u.id = ?
    `;
    const params = [id];

    // Non-superadmin users can only see users from their company
    if (req.user.role !== 'superadmin') {
      query += ' AND u.company_id = ?';
      params.push(req.user.companyId);
    }

    const [users] = await db.execute(query, params);

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/:id', auth, [
  body('firstName').optional().isLength({ min: 2 }),
  body('lastName').optional().isLength({ min: 2 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('status').optional().isIn(['active', 'inactive', 'suspended'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { firstName, lastName, email, phone, status } = req.body;

    // Check if user exists and user has permission to update
    let checkQuery = 'SELECT id, company_id FROM users WHERE id = ?';
    const checkParams = [id];

    if (req.user.role !== 'superadmin') {
      checkQuery += ' AND company_id = ?';
      checkParams.push(req.user.companyId);
    }

    const [existingUsers] = await db.execute(checkQuery, checkParams);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build update query
    const updateFields = [];
    const updateParams = [];

    if (firstName) {
      updateFields.push('first_name = ?');
      updateParams.push(firstName);
    }
    if (lastName) {
      updateFields.push('last_name = ?');
      updateParams.push(lastName);
    }
    if (email) {
      updateFields.push('email = ?');
      updateParams.push(email);
    }
    if (phone) {
      updateFields.push('phone = ?');
      updateParams.push(phone);
    }
    if (status && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
      updateFields.push('status = ?');
      updateParams.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    updateParams.push(id);

    await db.execute(
      `UPDATE users SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = ?`,
      updateParams
    );

    res.json({ message: 'User updated successfully' });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Only superadmin and admin can delete users
    if (!['superadmin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Check if user exists and user has permission to delete
    let checkQuery = 'SELECT id, company_id FROM users WHERE id = ?';
    const checkParams = [id];

    if (req.user.role !== 'superadmin') {
      checkQuery += ' AND company_id = ?';
      checkParams.push(req.user.companyId);
    }

    const [existingUsers] = await db.execute(checkQuery, checkParams);
    if (existingUsers.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Soft delete by setting status to inactive
    await db.execute('UPDATE users SET status = ?, updated_at = NOW() WHERE id = ?', ['inactive', id]);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;