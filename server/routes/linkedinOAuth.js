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
  
  // Use explicit redirect URI - must match exactly what's in LinkedIn app settings
  // For development: http://localhost:3000/api/linkedin/callback
  // For production: https://yourdomain.com/api/linkedin/callback
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${config.clientUrl}/api/linkedin/callback`;
  const state = req.user.id; // Use user ID as state for security
  // Use only OpenID Connect scopes (legacy scopes like r_emailaddress, r_liteprofile are deprecated)
  const scope = 'openid profile email';

  if (!clientId) {
    return res.status(500).json({ 
      message: 'LinkedIn OAuth not configured. Please set LINKEDIN_CLIENT_ID in environment variables.' 
    });
  }

  // Log redirect URI for debugging
  logger.info('LinkedIn OAuth redirect URI', { redirectUri, clientUrl: config.clientUrl });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;
  
  res.json({ authUrl, redirectUri }); // Include redirectUri in response for debugging
});

// LinkedIn OAuth callback
// Note: No authMiddleware here because LinkedIn redirects without auth token
// We use the state parameter (user ID) to identify the user
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    logger.info('LinkedIn OAuth callback received', { code: code ? 'present' : 'missing', state, error, queryParams: req.query });

    if (error) {
      logger.error('LinkedIn OAuth error from LinkedIn', { error, errorDescription: req.query.error_description });
      return res.redirect(`${config.clientUrl}/profile?error=linkedin_oauth_failed&message=${encodeURIComponent(error)}`);
    }

    if (!code) {
      logger.error('LinkedIn OAuth callback missing code', { query: req.query });
      return res.redirect(`${config.clientUrl}/profile?error=linkedin_oauth_failed&message=missing_code`);
    }

    if (!state) {
      logger.error('LinkedIn OAuth callback missing state', { query: req.query });
      return res.redirect(`${config.clientUrl}/profile?error=invalid_state&message=missing_state`);
    }

    // Find user by state (which is the user ID)
    const user = await prisma.user.findUnique({
      where: { id: state }
    });

    if (!user) {
      logger.error('LinkedIn OAuth callback: User not found', { state });
      return res.redirect(`${config.clientUrl}/profile?error=user_not_found`);
    }

    const clientId = config.linkedin?.clientId || process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = config.linkedin?.clientSecret || process.env.LINKEDIN_CLIENT_SECRET;
    // Use same redirect URI as in authorize endpoint
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${config.clientUrl}/api/linkedin/callback`;

    if (!clientId || !clientSecret) {
      logger.error('LinkedIn OAuth credentials not configured');
      return res.redirect(`${config.clientUrl}/profile?error=linkedin_not_configured`);
    }

    // Exchange code for access token
    logger.info('Exchanging LinkedIn code for access token', { clientId: clientId ? 'present' : 'missing', redirectUri });
    
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

    logger.info('Token response from LinkedIn', { 
      status: tokenResponse.status,
      hasError: !!tokenData.error,
      hasAccessToken: !!tokenData.access_token
    });

    if (tokenData.error) {
      logger.error('LinkedIn OAuth token error', { 
        error: tokenData.error, 
        description: tokenData.error_description,
        tokenResponse: JSON.stringify(tokenData)
      });
      return res.redirect(`${config.clientUrl}/profile?error=token_exchange_failed&message=${encodeURIComponent(tokenData.error_description || tokenData.error)}`);
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = tokenData.expires_in || 5184000; // Default 60 days

    // Store access token and refresh token in user record
    // Note: In production, encrypt these tokens before storing
    logger.info('Storing LinkedIn token for user', { userId: user.id });
    
    await prisma.user.update({
      where: { id: user.id },
      data: {
        linkedinToken: accessToken, // Store access token
        linkedinRefreshToken: refreshToken, // Store refresh token if available
        linkedinTokenExpiresAt: new Date(Date.now() + expiresIn * 1000) // Calculate expiration
      }
    });

    logger.info('LinkedIn token stored successfully', { userId: user.id });

    // Sync LinkedIn profile immediately
    try {
      const syncResult = await linkedinService.syncLinkedInProfile(
        user.id,
        accessToken,
        prisma
      );

      logger.info('LinkedIn profile synced', { 
        userId: user.id,
        experience: syncResult.experience,
        education: syncResult.education,
        skills: syncResult.skills
      });

      res.redirect(`${config.clientUrl}/profile?success=linkedin_connected&synced=true`);
    } catch (syncError) {
      logger.warn('LinkedIn sync failed after OAuth', { error: syncError.message, userId: user.id });
      res.redirect(`${config.clientUrl}/profile?success=linkedin_connected&synced=false&error=${encodeURIComponent(syncError.message)}`);
    }
  } catch (error) {
    logger.error('LinkedIn OAuth callback error', { error: error.message, stack: error.stack });
    res.redirect(`${config.clientUrl}/profile?error=linkedin_callback_failed&message=${encodeURIComponent(error.message)}`);
  }
});

module.exports = router;

