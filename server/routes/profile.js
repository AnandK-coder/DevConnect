const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const githubService = require('../services/githubService');

const router = express.Router();

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        githubUsername: true,
        skills: true,
        experience: true,
        location: true,
        bio: true,
        avatar: true,
        website: true,
        linkedin: true,
        twitter: true,
        subscription: true,
        createdAt: true,
        projects: {
          orderBy: [
            { featured: 'desc' },
            { stars: 'desc' }
          ]
        },
        _count: {
          select: {
            jobMatches: true,
            codeReviews: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update profile
router.put('/', authMiddleware, [
  body('name').optional({ checkFalsy: true }).trim().isLength({ min: 2, max: 50 }),
  body('location').optional({ checkFalsy: true }).trim(),
  body('bio').optional({ checkFalsy: true }).trim(),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Website must be a valid URL'),
  body('linkedin').optional({ checkFalsy: true }).trim(),
  body('twitter').optional({ checkFalsy: true }).trim(),
  body('skills').optional({ checkFalsy: true }).isArray(),
  body('experience').optional({ checkFalsy: true }).isInt({ min: 0 }).withMessage('Experience must be a non-negative integer'),
  body('githubUsername').optional({ checkFalsy: true }).trim().isLength({ min: 1, max: 39 })
], async (req, res) => {
  try {
    // Convert empty strings to null for optional fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === '' || req.body[key] === null) {
        delete req.body[key];
      }
    });

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, location, bio, website, linkedin, twitter, skills, experience, githubUsername } = req.body;

    const updateData = {};
    
    // Name - required if provided, must be valid
    if (name !== undefined && name !== null && name !== '') {
      updateData.name = name.trim();
    }
    
    // Optional fields
    if (location !== undefined && location !== null && location !== '') {
      updateData.location = location.trim();
    }
    
    if (bio !== undefined && bio !== null && bio !== '') {
      updateData.bio = bio.trim();
    }
    
    if (website !== undefined && website !== null && website !== '') {
      updateData.website = website.trim();
    }
    
    if (linkedin !== undefined && linkedin !== null && linkedin !== '') {
      updateData.linkedin = linkedin.trim();
    }
    
    if (twitter !== undefined && twitter !== null && twitter !== '') {
      updateData.twitter = twitter.trim();
    }
    
    if (skills !== undefined && Array.isArray(skills) && skills.length > 0) {
      updateData.skills = skills;
    }
    
    if (experience !== undefined && experience !== null && !isNaN(experience)) {
      updateData.experience = parseInt(experience);
    }
    
    if (githubUsername !== undefined && githubUsername !== null && githubUsername !== '') {
      updateData.githubUsername = githubUsername.trim();
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    console.log('Updating profile for user:', req.user.id, 'with data:', updateData);

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        githubUsername: true,
        skills: true,
        experience: true,
        location: true,
        bio: true,
        avatar: true,
        website: true,
        linkedin: true,
        twitter: true,
        subscription: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ 
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Sync LinkedIn profile
router.post('/sync-linkedin', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if LinkedIn is connected (has linkedin field set)
    if (!user.linkedin) {
      return res.status(400).json({ 
        message: 'LinkedIn not connected. Please connect your LinkedIn account first using OAuth.' 
      });
    }

    // For manual sync, we need the access token
    // In production, store this securely in database
    // For now, return a message to use OAuth
    return res.status(400).json({
      message: 'Please use the "Connect LinkedIn" button to sync your profile. Manual sync requires OAuth authentication.'
    });
  } catch (error) {
    console.error('Sync LinkedIn Error:', error);
    res.status(500).json({ 
      message: error.message || 'Failed to sync LinkedIn profile' 
    });
  }
});

// Sync GitHub repositories
router.post('/sync-github', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.githubUsername) {
      return res.status(400).json({ 
        message: 'GitHub username not set. Please add your GitHub username in your profile first.' 
      });
    }

    console.log(`Syncing GitHub for user ${user.id} with username: ${user.githubUsername}`);

    const projectIds = await githubService.syncUserRepositories(
      user.id,
      user.githubUsername,
      null, // token - implement OAuth token storage in production
      prisma
    );

    // Fetch updated user with projects
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        githubUsername: true,
        skills: true,
        experience: true,
        location: true,
        bio: true,
        avatar: true,
        website: true,
        linkedin: true,
        twitter: true,
        subscription: true,
        projects: {
          orderBy: [
            { featured: 'desc' },
            { stars: 'desc' }
          ]
        }
      }
    });

    res.json({
      message: `Successfully synced ${projectIds.length} repositories from GitHub`,
      syncedProjects: projectIds.length,
      user: updatedUser
    });
  } catch (error) {
    console.error('Sync GitHub Error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      return res.status(404).json({ 
        message: 'GitHub username not found. Please check your username and try again.' 
      });
    }
    
    if (error.message?.includes('rate limit') || error.status === 403) {
      return res.status(429).json({ 
        message: 'GitHub API rate limit exceeded. Please try again in a few minutes.' 
      });
    }

    res.status(500).json({ 
      message: error.message || 'Failed to sync repositories. Please make sure your GitHub username is correct and your repositories are public.' 
    });
  }
});

// Get user projects
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;

    const projects = await prisma.project.findMany({
      where: { userId: id },
      orderBy: [
        { featured: 'desc' },
        { stars: 'desc' }
      ]
    });

    res.json({ projects });
  } catch (error) {
    console.error('Get Projects Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create/Update project
router.post('/projects', authMiddleware, [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('githubUrl').isURL(),
  body('techStack').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, githubUrl, liveUrl, techStack, featured } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        description,
        githubUrl,
        liveUrl,
        techStack,
        featured: featured || false,
        userId: req.user.id
      }
    });

    res.status(201).json({
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    console.error('Create Project Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

