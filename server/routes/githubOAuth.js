const express = require('express');
const { Octokit } = require('octokit');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const githubService = require('../services/githubService');
const config = require('../lib/config');
const logger = require('../lib/logger');

const router = express.Router();

// Initiate GitHub OAuth
router.get('/authorize', authMiddleware, (req, res) => {
  const clientId = config.github.clientId;
  const redirectUri = `${config.clientUrl}/api/github/callback`;
  const state = req.user.id; // Use user ID as state for security

  const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${state}`;
  
  res.json({ authUrl });
});

// GitHub OAuth callback
router.get('/callback', authMiddleware, async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.redirect(`${config.clientUrl}/profile?error=oauth_failed`);
    }

    // Verify state matches user ID
    if (state !== req.user.id) {
      return res.redirect(`${config.clientUrl}/profile?error=invalid_state`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        client_secret: config.github.clientSecret,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      logger.error('GitHub OAuth error', { error: tokenData.error });
      return res.redirect(`${config.clientUrl}/profile?error=token_exchange_failed`);
    }

    // Get GitHub user info
    const octokit = new Octokit({ auth: tokenData.access_token });
    const { data: githubUser } = await octokit.rest.users.getAuthenticated();

    // Update user with GitHub username and token
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        githubUsername: githubUser.login,
        // Store token securely (in production, encrypt this)
        // For now, we'll just sync immediately
      }
    });

    // Sync repositories immediately
    try {
      await githubService.syncUserRepositories(
        req.user.id,
        githubUser.login,
        tokenData.access_token,
        prisma
      );
    } catch (syncError) {
      logger.warn('GitHub sync failed after OAuth', { error: syncError.message });
    }

    res.redirect(`${config.clientUrl}/profile?success=github_connected`);
  } catch (error) {
    logger.error('GitHub OAuth callback error', { error: error.message });
    res.redirect(`${config.clientUrl}/profile?error=oauth_callback_failed`);
  }
});

module.exports = router;

