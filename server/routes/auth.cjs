const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database.cjs');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user with company info
    const [users] = await db.execute(`
      SELECT u.*, c.name as company_name 
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      WHERE u.email = ? AND u.status = 'active'
    `, [email]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await db.execute('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        companyId: user.company_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    delete user.password;

    res.json({
      message: 'Login successful',
      token,
      user
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register endpoint (for admins to create users)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').isLength({ min: 2 }),
  body('lastName').isLength({ min: 2 }),
  body('role').isIn(['admin', 'delivery', 'client', 'helpdesk'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, role, companyId, phone } = req.body;

    // Check if user already exists
    const [existingUsers] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const [result] = await db.execute(`
      INSERT INTO users (company_id, email, password, first_name, last_name, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [companyId, email, hashedPassword, firstName, lastName, phone, role]);

    res.status(201).json({
      message: 'User created successfully',
      userId: result.insertId
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data
    const [users] = await db.execute(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.company_id, c.name as company_name
      FROM users u 
      LEFT JOIN companies c ON u.company_id = c.id 
      WHERE u.id = ? AND u.status = 'active'
    `, [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user: users[0] });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;