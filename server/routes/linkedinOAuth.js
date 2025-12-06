const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const linkedinService = require('../services/linkedinService');
const config = require('../lib/config');
const logger = require('../lib/logger');

const router = express.Router();

// Initiate LinkedIn OAuth
router.get('/authorize', authMiddleware, (req, res) => {
  const clientId = config.linkedin?.clientId || process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = `${config.clientUrl}/api/linkedin/callback`;
  const state = req.user.id; // Use user ID as state for security
  const scope = 'openid profile email w_member_social r_liteprofile r_emailaddress';

  if (!clientId) {
    return res.status(500).json({ 
      message: 'LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID in environment variables.' 
    });
  }

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  
  res.json({ authUrl });
});

// LinkedIn OAuth callback
router.get('/callback', authMiddleware, async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      logger.error('LinkedIn OAuth error', { error });
      return res.redirect(`${config.clientUrl}/profile?error=linkedin_oauth_failed&message=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${config.clientUrl}/profile?error=linkedin_oauth_failed`);
    }

    // Verify state matches user ID
    if (state !== req.user.id) {
      return res.redirect(`${config.clientUrl}/profile?error=invalid_state`);
    }

    const clientId = config.linkedin?.clientId || process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = config.linkedin?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;
    const redirectUri = `${config.clientUrl}/api/linkedin/callback`;

    if (!clientId || !clientSecret) {
      logger.error('LinkedIn OAuth credentials not configured');
      return res.redirect(`${config.clientUrl}/profile?error=linkedin_not_configured`);
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      logger.error('LinkedIn OAuth token error', { error: tokenData.error, description: tokenData.error_description });
      return res.redirect(`${config.clientUrl}/profile?error=token_exchange_failed`);
    }

    const accessToken = tokenData.access_token;

    // Sync LinkedIn profile immediately
    try {
      const syncResult = await linkedinService.syncLinkedInProfile(
        req.user.id,
        accessToken,
        prisma
      );

      logger.info('LinkedIn profile synced', { 
        userId: req.user.id,
        experience: syncResult.experience,
        education: syncResult.education,
        skills: syncResult.skills
      });

      res.redirect(`${config.clientUrl}/profile?success=linkedin_connected&synced=true`);
    } catch (syncError) {
      logger.warn('LinkedIn sync failed after OAuth', { error: syncError.message });
      res.redirect(`${config.clientUrl}/profile?success=linkedin_connected&synced=false&error=${encodeURIComponent(syncError.message)}`);
    }
  } catch (error) {
    logger.error('LinkedIn OAuth callback error', { error: error.message });
    res.redirect(`${config.clientUrl}/profile?error=linkedin_callback_failed`);
  }
});

module.exports = router;

