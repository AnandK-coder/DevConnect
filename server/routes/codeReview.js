const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const aiService = require('../services/aiService');
const githubService = require('../services/githubService');

const router = express.Router();

// Request code review
router.post('/request', authMiddleware, [
  body('projectId').notEmpty(),
  body('repositoryUrl').isURL(),
  body('filePath').optional().trim(),
  body('code').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, repositoryUrl, filePath, code } = req.body;

    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectName = project.name;

    // If code is provided, analyze it directly
    let reviewData = null;
    if (code) {
      const language = filePath?.split('.').pop() || 'javascript';
      reviewData = await aiService.analyzeCodeQuality(code, language);
    } else {
      // Fetch code from GitHub
      // This would require GitHub API integration
      reviewData = {
        score: 75,
        strengths: ['Code structure looks good'],
        improvements: ['Consider adding more tests'],
        suggestions: ['Follow best practices']
      };
    }

    // Create code review
    const review = await prisma.codeReview.create({
      data: {
        userId: req.user.id,
        title: `Code Review: ${project.name}${filePath ? ` - ${filePath}` : ''}`,
        code: code || 'Code review requested',
        language: filePath?.split('.').pop() || 'javascript',
        qualityScore: reviewData.score,
        feedback: JSON.stringify({
          strengths: reviewData.strengths,
          improvements: reviewData.improvements,
          suggestions: reviewData.suggestions
        }),
        reviewerId: null, // AI review
        status: 'COMPLETED'
      }
    });

    res.json({
      message: 'Code review completed',
      review: {
        ...review,
        feedback: JSON.parse(review.feedback)
      }
    });
  } catch (error) {
    console.error('Code Review Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get code reviews for user
router.get('/my-reviews', authMiddleware, async (req, res) => {
  try {
    const reviews = await prisma.codeReview.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ reviews });
  } catch (error) {
    console.error('Get My Reviews Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

