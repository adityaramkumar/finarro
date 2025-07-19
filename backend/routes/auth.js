const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const db = require('../config/database');
const { 
  generateToken, 
  generateRefreshToken,
  validateSignup,
  validateLogin,
  validatePasswordReset,
  validatePasswordUpdate,
  checkValidation,
  auth
} = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');
const logger = require('../config/logger');

const router = express.Router();

// Register new user
router.post('/signup', validateSignup, checkValidation, async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ 
        error: 'User already exists with this email',
        details: 'An account with this email address already exists. Please try logging in instead or use a different email address.'
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const [user] = await db('users').insert({
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      email_verification_token: emailVerificationToken
    }).returning(['id', 'email', 'first_name', 'last_name', 'email_verified', 'subscription_tier']);

    // Send verification email (in production, unless skipped)
    if (process.env.NODE_ENV === 'production' && !process.env.SKIP_EMAIL_VERIFICATION) {
      try {
        await sendEmail({
          to: email,
          subject: 'Verify Your Financier Account',
          template: 'email-verification',
          context: {
            firstName,
            verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`
          }
        });
      } catch (emailError) {
        logger.error('Email sending failed during signup:', emailError);
        // Continue with signup even if email fails
      }
    }

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user,
      token,
      refreshToken
    });

    logger.info(`New user registered: ${email}`);
  } catch (error) {
    logger.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login user
router.post('/login', validateLogin, checkValidation, async (req, res) => {
  try {
    const { email, password } = req.body;


    // Find user
    const user = await db('users').where({ email, is_active: true }).first();

    
    if (!user) {

      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'No account found with this email address. Please check your email or create a new account.'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    
    if (!isValidPassword) {

      return res.status(401).json({ 
        error: 'Invalid credentials',
        details: 'The password you entered is incorrect. Please try again or reset your password.'
      });
    }

    // Update last login
    await db('users').where({ id: user.id }).update({ last_login: new Date() });

    // Generate tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Remove sensitive data
    const { password_hash, email_verification_token, password_reset_token, ...userResponse } = user;

    res.json({
      message: 'Login successful',
      user: userResponse,
      token,
      refreshToken
    });

    logger.info(`User logged in: ${email}`);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    const user = await db('users').where({ email_verification_token: token }).first();
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    // Update user as verified
    await db('users')
      .where({ id: user.id })
      .update({ 
        email_verified: true, 
        email_verification_token: null,
        updated_at: new Date()
      });

    res.json({ message: 'Email verified successfully' });
    logger.info(`Email verified for user: ${user.email}`);
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Request password reset
router.post('/forgot-password', validatePasswordReset, checkValidation, async (req, res) => {
  try {
    const { email } = req.body;

    const user = await db('users').where({ email, is_active: true }).first();
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If account exists, password reset email has been sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour

    // Update user with reset token
    await db('users')
      .where({ id: user.id })
      .update({ 
        password_reset_token: resetToken,
        password_reset_expires: resetExpires,
        updated_at: new Date()
      });

    // Send reset email (in production)
    if (process.env.NODE_ENV === 'production') {
      await sendEmail({
        to: email,
        subject: 'Reset Your Financier Password',
        template: 'password-reset',
        context: {
          firstName: user.first_name,
          resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        }
      });
    }

    res.json({ message: 'If account exists, password reset email has been sent' });
    logger.info(`Password reset requested for: ${email}`);
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reset password
router.post('/reset-password', validatePasswordUpdate, checkValidation, async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await db('users')
      .where({ password_reset_token: token })
      .where('password_reset_expires', '>', new Date())
      .first();

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    await db('users')
      .where({ id: user.id })
      .update({ 
        password_hash: passwordHash,
        password_reset_token: null,
        password_reset_expires: null,
        updated_at: new Date()
      });

    res.json({ message: 'Password reset successfully' });
    logger.info(`Password reset completed for user: ${user.email}`);
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const { password_hash, email_verification_token, password_reset_token, ...userResponse } = req.user;
    res.json({ user: userResponse });
  } catch (error) {
    logger.error('Get user profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout (client-side token removal, but we can log it)
router.post('/logout', auth, async (req, res) => {
  try {
    logger.info(`User logged out: ${req.user.email}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 