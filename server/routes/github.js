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

// Get user's GitHub commits
router.get('/commits/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { limit = 30 } = req.query;

    const commits = await githubService.getUserCommits(username, null, parseInt(limit));

    res.json({ commits });
  } catch (error) {
    console.error('Get Commits Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch commits' });
  }
});

// Get user's commit activity
router.get('/commits/:username/activity', async (req, res) => {
  try {
    const { username } = req.params;
    const { days = 30 } = req.query;

    const activity = await githubService.getUserCommitActivity(username, null, parseInt(days));

    res.json({ activity });
  } catch (error) {
    console.error('Get Commit Activity Error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch commit activity' });
  }
});

module.exports = router;

