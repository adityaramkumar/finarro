const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Get current user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'pseudonymous_username', 'phone', 'address', 'date_of_birth', 'email_verified', 'created_at')
      .where({ id: req.user.id })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      pseudonymous_username, 
      phone, 
      address, 
      dateOfBirth 
    } = req.body;
    
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      updated_at: new Date()
    };

    // Only update fields if they're provided
    if (pseudonymous_username !== undefined) {
      updateData.pseudonymous_username = pseudonymous_username;
    }
    
    if (phone !== undefined) {
      updateData.phone = phone;
    }
    
    if (address !== undefined) {
      updateData.address = address;
    }
    
    if (dateOfBirth !== undefined) {
      updateData.date_of_birth = dateOfBirth;
    }
    
    await db('users')
      .where({ id: req.user.id })
      .update(updateData);

    const updatedUser = await db('users')
      .select('id', 'email', 'first_name', 'last_name', 'pseudonymous_username', 'phone', 'address', 'date_of_birth', 'email_verified', 'created_at')
      .where({ id: req.user.id })
      .first();

    res.json(updatedUser);
  } catch (error) {
    logger.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Get user with password
    const user = await db('users')
      .select('id', 'password_hash')
      .where({ id: req.user.id })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    await db('users')
      .where({ id: req.user.id })
      .update({
        password_hash: hashedPassword,
        updated_at: new Date()
      });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    logger.error('Error updating password:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user account
router.delete('/account', auth, async (req, res) => {
  try {
    const { password } = req.body;
    
    // Get user with password
    const user = await db('users')
      .select('id', 'password')
      .where({ id: req.user.id })
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Delete user (this will cascade to other tables)
    await db('users').where({ id: req.user.id }).del();

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    logger.error('Error deleting account:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 