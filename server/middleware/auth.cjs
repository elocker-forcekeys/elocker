const jwt = require('jsonwebtoken');
const db = require('../config/database.cjs');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get fresh user data
    const [users] = await db.execute(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.company_id, u.status
      FROM users u 
      WHERE u.id = ? AND u.status = 'active'
    `, [decoded.userId]);

    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid token. User not found.' });
    }

    req.user = {
      userId: users[0].id,
      email: users[0].email,
      role: users[0].role,
      companyId: users[0].company_id,
      firstName: users[0].first_name,
      lastName: users[0].last_name
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = auth;