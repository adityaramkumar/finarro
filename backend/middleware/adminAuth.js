const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { getRealIP } = require('./analytics');

// Admin authentication middleware
const adminAuth = async (req, res, next) => {
  try {
    const token =
      req.header('Authorization')?.replace('Bearer ', '') ||
      req.header('X-Admin-Token') ||
      req.cookies?.adminToken;

    if (!token) {
      return res.status(401).json({ error: 'No admin token provided' });
    }

    const decoded = jwt.verify(
      token,
      process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET
    );

    const adminUser = await db('admin_users')
      .where({ id: decoded.id, is_active: true })
      .first();

    if (!adminUser) {
      return res.status(401).json({ error: 'Invalid admin token' });
    }

    // Update last login info
    const ip = getRealIP(req);
    await db('admin_users').where({ id: adminUser.id }).update({
      last_login: new Date(),
      last_login_ip: ip,
    });

    req.adminUser = adminUser;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid admin token' });
  }
};

// Check specific admin permission
const requirePermission = permission => {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({ error: 'Admin authentication required' });
    }

    const { role, permissions } = req.adminUser;

    // Super admin has all permissions
    if (role === 'super_admin') {
      return next();
    }

    // Check role-based permissions
    const rolePermissions = {
      admin: ['read_analytics', 'read_users', 'manage_users'],
      analyst: ['read_analytics'],
    };

    const hasRolePermission = rolePermissions[role]?.includes(permission);
    const hasCustomPermission = permissions && permissions[permission] === true;

    if (hasRolePermission || hasCustomPermission) {
      return next();
    }

    return res.status(403).json({ error: 'Insufficient permissions' });
  };
};

// Generate admin JWT token
const generateAdminToken = adminUserId => {
  return jwt.sign(
    { id: adminUserId, type: 'admin' },
    process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.ADMIN_JWT_EXPIRES_IN || '24h' }
  );
};

// Admin login validation
const validateAdminLogin = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Username is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
];

// Admin creation validation
const validateAdminCreation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      'Username must be 3-50 characters and contain only letters, numbers, and underscores'
    ),
  body('email')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 12 })
    .withMessage('Admin password must be at least 12 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('role')
    .isIn(['super_admin', 'admin', 'analyst'])
    .withMessage('Invalid role specified'),
];

// Password reset validation
const validateAdminPasswordReset = [
  body('email')
    .isEmail()
    .normalizeEmail({ gmail_remove_dots: false })
    .withMessage('Please provide a valid email'),
];

// Check validation errors
const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  adminAuth,
  requirePermission,
  generateAdminToken,
  validateAdminLogin,
  validateAdminCreation,
  validateAdminPasswordReset,
  checkValidation,
};
