const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const config = require('../lib/config');
const logger = require('../lib/logger');
const { AppError } = require('../middleware/errorHandler');
const { sanitizeInput, commonRules, handleValidationErrors } = require('../middleware/validator');
const emailService = require('../services/emailService');

const router = express.Router();

// Register
router.post('/register', 
  sanitizeInput,
  [
    commonRules.email,
    commonRules.password,
    commonRules.name,
    body('githubUsername').optional().trim().isLength({ min: 1, max: 39 }).withMessage('GitHub username must be between 1 and 39 characters'),
    body('role').optional().isIn(['USER', 'COMPANY']).withMessage('Invalid role'),
    body('website').optional().isURL().withMessage('Invalid website URL')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password, name, githubUsername, role, website } = req.body;
      
      logger.info('Registration attempt', { email, name, role, timestamp: new Date() });

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, config.security.bcryptRounds);

  // Determine role and subscription
  const userRole = role === 'COMPANY' ? 'COMPANY' : 'USER';
  const subscription = userRole === 'COMPANY' ? 'COMPANY' : 'FREE';

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      githubUsername,
      skills: [],
      role: userRole,
      subscription: subscription,
      website: website || null
    },
    select: {
      id: true,
      email: true,
      name: true,
      githubUsername: true,
      skills: true,
      experience: true,
      location: true,
      bio: true,
      role: true,
      subscription: true,
      createdAt: true
    }
  });

  // Generate token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

  logger.info('User registered', { userId: user.id, email: user.email });

      // Send welcome email (async, don't wait)
      emailService.sendWelcomeEmail(user).catch(err => {
        logger.warn('Failed to send welcome email', { error: err.message });
      });

      res.status(201).json({
        message: 'User created successfully',
        user,
        token
      });
    } catch (error) {
      logger.error('Register error', { error: error.message, email: req.body.email });
      if (error.code === 'P2002') {
        return next(new AppError('Email already exists', 400));
      }
      next(error);
    }
  }
);

// Login
router.post('/login',
  sanitizeInput,
  [
    commonRules.email,
    body('password').notEmpty().withMessage('Password is required')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      
      console.log('🔓 [LOGIN] Attempt:', email);

      // Find user
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        console.log('❌ [LOGIN] User not found:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!user.password) {
        console.log('❌ [LOGIN] No password set:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Verify password
      console.log('🔑 [LOGIN] Comparing passwords...');
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        console.log('❌ [LOGIN] Password mismatch for:', email);
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      
      console.log('✅ [LOGIN] Password verified');

      // Generate token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      logger.info('User logged in', { userId: user.id, email: user.email });

      const { password: _, ...userWithoutPassword } = user;

      console.log('🎫 [LOGIN] Success, returning token');

      res.json({
        message: 'Login successful',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('❌ [LOGIN] Error:', error.message);
      logger.error('Login error', { error: error.message, email: req.body.email });
      next(error);
    }
  }
);

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

// GitHub OAuth callback (simplified - in production, use proper OAuth flow)
router.get('/github', async (req, res) => {
  // This is a placeholder - implement full OAuth flow in production
  res.json({ message: 'GitHub OAuth - implement OAuth flow' });
});

module.exports = router;

