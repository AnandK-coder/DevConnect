const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const githubService = require('../services/githubService');

const router = express.Router();

// Get GitHub repositories
router.get('/repositories/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const repositories = await githubService.getUserRepositories(username);

    res.json({ repositories });
  } catch (error) {
    console.error('Get Repositories Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch repositories' });
  }
});

// Get GitHub user profile
router.get('/profile/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await githubService.getUserProfile(username);

    res.json({ profile });
  } catch (error) {
    console.error('Get GitHub Profile Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch profile' });
  }
});

// Get repository languages
router.get('/repositories/:username/:repo/languages', async (req, res) => {
  try {
    const { username, repo } = req.params;

    const languages = await githubService.getRepositoryLanguages(username, repo);

    res.json({ languages });
  } catch (error) {
    console.error('Get Repository Languages Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch languages' });
  }
});

module.exports = router;

