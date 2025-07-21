const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../../config/database');
const {
  adminAuth,
  requirePermission,
  generateAdminToken,
  validateAdminLogin,
  validateAdminCreation,
  checkValidation,
} = require('../../middleware/adminAuth');
const logger = require('../../config/logger');

const router = express.Router();

// Admin login
router.post('/login', validateAdminLogin, checkValidation, async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin user by username or email
    const adminUser = await db('admin_users')
      .where('username', username)
      .orWhere('email', username)
      .where('is_active', true)
      .first();

    if (!adminUser) {
      logger.warn(`Failed admin login attempt for username: ${username}`);
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Username or password is incorrect.',
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(
      password,
      adminUser.password_hash
    );

    if (!isValidPassword) {
      logger.warn(
        `Failed admin login attempt for username: ${username} - invalid password`
      );
      return res.status(401).json({
        error: 'Invalid credentials',
        details: 'Username or password is incorrect.',
      });
    }

    // Generate token
    const token = generateAdminToken(adminUser.id);

    // Update last login
    await db('admin_users')
      .where({ id: adminUser.id })
      .update({ last_login: new Date() });

    // Remove sensitive data
    // eslint-disable-next-line no-unused-vars
    const { password_hash, password_reset_token, ...adminResponse } = adminUser;

    res.json({
      message: 'Admin login successful',
      admin: adminResponse,
      token,
    });

    logger.info(
      `Admin user logged in: ${adminUser.username} (${adminUser.email})`
    );
  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create admin user (super admin only)
router.post(
  '/create-admin',
  adminAuth,
  requirePermission('manage_admins'),
  validateAdminCreation,
  checkValidation,
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        firstName,
        lastName,
        role,
        permissions,
      } = req.body;

      // Check if admin already exists
      const existingAdmin = await db('admin_users')
        .where('username', username)
        .orWhere('email', email)
        .first();

      if (existingAdmin) {
        return res.status(400).json({
          error: 'Admin user already exists',
          details: 'An admin user with this username or email already exists.',
        });
      }

      // Hash password
      const saltRounds = 14; // Higher security for admin accounts
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create admin user
      const [newAdmin] = await db('admin_users')
        .insert({
          username,
          email,
          password_hash: passwordHash,
          first_name: firstName,
          last_name: lastName,
          role,
          permissions: permissions || {},
        })
        .returning([
          'id',
          'username',
          'email',
          'first_name',
          'last_name',
          'role',
          'permissions',
          'is_active',
        ]);

      res.status(201).json({
        message: 'Admin user created successfully',
        admin: newAdmin,
      });

      logger.info(
        `New admin user created: ${username} (${email}) by ${req.adminUser.username}`
      );
    } catch (error) {
      logger.error('Create admin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get current admin profile
router.get('/me', adminAuth, async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const { password_hash, password_reset_token, ...adminResponse } =
      req.adminUser;
    res.json({ admin: adminResponse });
  } catch (error) {
    logger.error('Get admin profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all admin users (admin+ only)
router.get(
  '/admins',
  adminAuth,
  requirePermission('read_admins'),
  async (req, res) => {
    try {
      const admins = await db('admin_users')
        .select([
          'id',
          'username',
          'email',
          'first_name',
          'last_name',
          'role',
          'is_active',
          'last_login',
          'created_at',
        ])
        .orderBy('created_at', 'desc');

      res.json({ admins });
    } catch (error) {
      logger.error('List admins error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update admin user (super admin only)
router.put(
  '/admins/:id',
  adminAuth,
  requirePermission('manage_admins'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role, permissions, is_active } = req.body;

      const adminToUpdate = await db('admin_users').where('id', id).first();
      if (!adminToUpdate) {
        return res.status(404).json({ error: 'Admin user not found' });
      }

      // Prevent super admin from demoting themselves
      if (
        adminToUpdate.id === req.adminUser.id &&
        req.adminUser.role === 'super_admin' &&
        role !== 'super_admin'
      ) {
        return res
          .status(400)
          .json({ error: 'Cannot demote yourself from super admin' });
      }

      const updateData = {};
      if (role !== undefined) {
        updateData.role = role;
      }
      if (permissions !== undefined) {
        updateData.permissions = permissions;
      }
      if (is_active !== undefined) {
        updateData.is_active = is_active;
      }
      updateData.updated_at = new Date();

      await db('admin_users').where('id', id).update(updateData);

      const updatedAdmin = await db('admin_users')
        .select([
          'id',
          'username',
          'email',
          'first_name',
          'last_name',
          'role',
          'permissions',
          'is_active',
        ])
        .where('id', id)
        .first();

      res.json({
        message: 'Admin user updated successfully',
        admin: updatedAdmin,
      });

      logger.info(
        `Admin user updated: ${updatedAdmin.username} by ${req.adminUser.username}`
      );
    } catch (error) {
      logger.error('Update admin error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Change admin password
router.put('/change-password', adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 12) {
      return res
        .status(400)
        .json({ error: 'New password must be at least 12 characters long' });
    }

    // Get current admin with password
    const admin = await db('admin_users')
      .select('id', 'password_hash')
      .where('id', req.adminUser.id)
      .first();

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      admin.password_hash
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 14);

    // Update password
    await db('admin_users').where('id', req.adminUser.id).update({
      password_hash: hashedPassword,
      updated_at: new Date(),
    });

    res.json({ message: 'Password updated successfully' });

    logger.info(`Admin password changed: ${req.adminUser.username}`);
  } catch (error) {
    logger.error('Admin password change error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin logout
router.post('/logout', adminAuth, async (req, res) => {
  try {
    logger.info(`Admin user logged out: ${req.adminUser.username}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Admin logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
