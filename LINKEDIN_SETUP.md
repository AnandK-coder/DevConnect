# 🔗 LinkedIn OAuth Setup Guide

Step-by-step guide to get LinkedIn Client ID and Client Secret for DevConnect.

## Prerequisites

- LinkedIn account
- Email address (for verification)
- Website URL (your app's URL)

---

## Step 1: Access LinkedIn Developers Portal

1. Go to [LinkedIn Developers Portal](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. If you don't have a developer account, you'll be prompted to create one

---

## Step 2: Create a New App

1. Click on **"Create app"** button (top right corner)
2. Fill in the required information:

   **App Name:**
   - Enter: `DevConnect` (or your preferred name)
   - This will be visible to users when they authorize

   **LinkedIn Page:**
   - Select your LinkedIn company page (or create one if needed)
   - If you don't have one, you can use your personal profile

   **App Logo:**
   - Upload a logo (optional but recommended)
   - Size: 100x100 pixels (PNG or JPG)

   **Privacy Policy URL:**
   - Required for production apps
   - For development: `http://localhost:3000/privacy` (can be a placeholder)
   - For production: Your actual privacy policy URL

   **App Use:**
   - Select: "Sign In with LinkedIn using OpenID Connect"
   - Or: "Allow members to access their data via your app"

3. Click **"Create app"**

---

## Step 3: Get Client ID and Client Secret

After creating the app, you'll be redirected to the app dashboard:

1. Go to the **"Auth"** tab (left sidebar)
2. You'll see:
   - **Client ID** - Copy this value
   - **Client Secret** - Click "Show" to reveal and copy

**⚠️ Important:** Keep Client Secret secure! Never commit it to public repositories.

---

## Step 4: Configure Redirect URLs

1. In the **"Auth"** tab, scroll down to **"Redirect URLs"**
2. Click **"Add redirect URL"**
3. Add these URLs:

   **For Development:**
   ```
   http://localhost:3000/api/linkedin/callback
   ```

   **For Production:**
   ```
   https://yourdomain.com/api/linkedin/callback
   ```

4. Click **"Update"** to save

---

## Step 5: Request API Products (Scopes)

1. Go to the **"Products"** tab (left sidebar)
2. Request access to these products:

   **Required Products:**
   - ✅ **Sign In with LinkedIn using OpenID Connect** (Recommended)
     - Provides: `openid`, `profile`, `email` scopes
   
   **Optional Products (if using legacy API):**
   - ✅ **Share on LinkedIn**
   - ✅ **Marketing Developer Platform** (for more data)

3. Click **"Request access"** for each product
4. Wait for approval (usually instant for basic products)

---

## Step 6: Configure Scopes

1. Go back to **"Auth"** tab
2. Under **"OAuth 2.0 scopes"**, select:

   **Required Scopes:**
   - ✅ `openid` - OpenID Connect authentication
   - ✅ `profile` - Basic profile information
   - ✅ `email` - Email address
   
   **Optional Scopes (if using legacy API):**
   - ✅ `r_liteprofile` - Basic profile (legacy)
   - ✅ `r_emailaddress` - Email address (legacy)
   - ✅ `w_member_social` - Share content

3. Click **"Update"** to save

---

## Step 7: Add to Environment Variables

Add the credentials to your `.env` file:

### Server Environment (`server/.env`)

```env
# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-client-id-here
LINKEDIN_CLIENT_SECRET=your-client-secret-here
```

### Example:

```env
LINKEDIN_CLIENT_ID=86abc123xyz
LINKEDIN_CLIENT_SECRET=ABC123xyz789
```

---

## Step 8: Verify Configuration

1. Restart your server:
   ```bash
   cd server
   npm run dev
   ```

2. Check server logs for any LinkedIn-related errors

3. Test the connection:
   - Go to your profile page
   - Click "Connect LinkedIn"
   - You should be redirected to LinkedIn authorization page

---

## Troubleshooting

### Issue: "Invalid redirect_uri"

**Solution:**
- Make sure the redirect URL in your app matches exactly:
  - Development: `http://localhost:3000/api/linkedin/callback`
  - Check for trailing slashes, http vs https, etc.

### Issue: "Invalid client credentials"

**Solution:**
- Verify Client ID and Client Secret are correct
- Make sure there are no extra spaces in `.env` file
- Restart server after updating `.env`

### Issue: "Insufficient permissions"

**Solution:**
- Go to "Products" tab and request required products
- Wait for approval (usually instant)
- Make sure scopes are selected in "Auth" tab

### Issue: "App not approved"

**Solution:**
- For development, basic products are usually auto-approved
- For production, you may need to submit for review
- Check "Products" tab for approval status

---

## Security Best Practices

1. **Never commit secrets to Git:**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Use different apps for dev/prod:**
   - Create separate LinkedIn apps for development and production
   - Use different Client IDs and Secrets

3. **Rotate secrets regularly:**
   - Change Client Secret periodically
   - Revoke old secrets if compromised

4. **Limit scopes:**
   - Only request scopes you actually need
   - Don't request unnecessary permissions

---

## Production Checklist

Before going to production:

- [ ] App has proper logo and description
- [ ] Privacy Policy URL is set and accessible
- [ ] Terms of Service URL is set (if required)
- [ ] Production redirect URL is added
- [ ] All required products are approved
- [ ] Scopes are properly configured
- [ ] Client Secret is stored securely (not in code)
- [ ] HTTPS is enabled for production URLs

---

## Quick Reference

**LinkedIn Developers Portal:**
- URL: https://www.linkedin.com/developers/
- Documentation: https://docs.microsoft.com/en-us/linkedin/

**OAuth 2.0 Flow:**
1. User clicks "Connect LinkedIn"
2. Redirected to LinkedIn authorization
3. User approves permissions
4. LinkedIn redirects back with code
5. Exchange code for access token
6. Use token to fetch user data

**Required Environment Variables:**
```env
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
```

---

## Support

If you encounter issues:

1. Check LinkedIn Developer Forums
2. Review LinkedIn API Documentation
3. Check server logs for detailed error messages
4. Verify all configuration steps are completed

---

**Note:** LinkedIn API access may require approval for certain products. Basic authentication (Sign In with LinkedIn) is usually approved instantly for development purposes.

