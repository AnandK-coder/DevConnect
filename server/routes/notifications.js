const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const logger = require('../lib/logger');

const router = express.Router();

// Get user notifications
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user.id);
    
    res.json({ notifications });
  } catch (error) {
    logger.error('Get notifications error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read (placeholder for future implementation)
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    // In production, update notification status in database
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    logger.error('Mark notification read error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

