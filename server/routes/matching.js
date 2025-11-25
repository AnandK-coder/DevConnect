const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const matchingService = require('../services/matchingService');
const emailService = require('../services/emailService');
const logger = require('../lib/logger');

const router = express.Router();

// Get job matches for current user
router.get('/jobs', authMiddleware, async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const matches = await matchingService.getTopJobMatches(
      req.user.id,
      parseInt(limit)
    );

    res.json({ matches });
  } catch (error) {
    console.error('Get Job Matches Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all job matches with scores
router.get('/jobs/all', authMiddleware, async (req, res) => {
  try {
    const matches = await matchingService.matchJobsForUser(req.user.id);

    // Send email for high-score matches (only if not recently sent)
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const highScoreMatches = matches.filter(m => m.match.score >= 85).slice(0, 3);
    
    if (highScoreMatches.length > 0 && user) {
      // In production, add logic to prevent spam (check last email sent time)
      highScoreMatches.forEach(match => {
        emailService.sendJobMatchEmail(user, match.job, match.match.score).catch(err => {
          logger.warn('Failed to send job match email', { error: err.message });
        });
      });
    }

    res.json({ matches });
  } catch (error) {
    logger.error('Get All Job Matches Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get collaboration matches
router.get('/collaboration', authMiddleware, async (req, res) => {
  try {
    const { type = 'co-founder' } = req.query;

    const matches = await matchingService.matchUsersForCollaboration(
      req.user.id,
      type
    );

    res.json({ matches });
  } catch (error) {
    console.error('Get Collaboration Matches Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

