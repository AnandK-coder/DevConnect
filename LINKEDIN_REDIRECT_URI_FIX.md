# 🔧 LinkedIn Redirect URI Fix Guide

## Problem
You're getting this error:
```
Bummer, something went wrong.
The redirect_uri does not match the registered value
```

## Solution

### Step 1: Understand the Correct Redirect URI

⚠️ **IMPORTANT:** The redirect URI must point to your **SERVER**, NOT your client!

- ❌ **WRONG:** `http://localhost:3000/api/linkedin/callback` (this is your frontend)
- ✅ **CORRECT:** `http://localhost:5000/api/linkedin/callback` (this is your backend)

### Step 2: Check Your Current Redirect URI

The redirect URI being used is now:
```
http://localhost:5000/api/linkedin/callback
```

### Step 3: Update LinkedIn App Settings

1. Go to [LinkedIn Developers Portal](https://www.linkedin.com/developers/)
2. Select your app (Client ID: `86fxuo12fc227h`)
3. Go to **"Auth"** tab (left sidebar)
4. Scroll down to **"Redirect URLs"** section
5. Remove the old incorrect URL if it exists: `http://localhost:3000/api/linkedin/callback`
6. Add/verify this exact URL is listed:
   ```
   http://localhost:5000/api/linkedin/callback
   ```
7. Click **"Update"** to save

### Step 4: Update Server Environment Variable

✅ **Already Done** - Your `server/.env` now has:
```env
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/linkedin/callback
```

### Step 5: Restart Your Server

```bash
# In your server terminal
npm start
# or
node index.js
```

### Step 6: Test Again
1. Go to your profile page
2. Click **"Connect LinkedIn"** button
3. After authorizing on LinkedIn, you should be redirected back to `http://localhost:5000/api/linkedin/callback`
4. The backend will process the callback and redirect you to the profile page with success message

After updating:
1. Wait 1-2 minutes for LinkedIn to update settings
2. Try connecting LinkedIn again from your profile page
3. The redirect should work now

## Common Issues

### Issue 1: Port Mismatch
**Problem:** Your app runs on port 5000 but redirect URI uses 3000
**Solution:** 
- Either change redirect URI to `http://localhost:5000/api/linkedin/callback`
- Or set `CLIENT_URL=http://localhost:5000` in your `.env` file

### Issue 2: HTTPS vs HTTP
**Problem:** Using `https://localhost:3000` but registered `http://localhost:3000`
**Solution:** For localhost, always use `http://` (not `https://`)

### Issue 3: Trailing Slash
**Problem:** Registered URI has trailing slash: `http://localhost:3000/api/linkedin/callback/`
**Solution:** Remove trailing slash - LinkedIn is strict about exact matches

### Issue 4: Custom Redirect URI
If you want to use a different redirect URI, you can set it in `.env`:
```env
LINKEDIN_REDIRECT_URI=http://localhost:3000/api/linkedin/callback
```

Then make sure this exact value is registered in LinkedIn app settings.

## Production Setup

For production, you'll need to:
1. Add your production redirect URI in LinkedIn app settings:
   ```
   https://yourdomain.com/api/linkedin/callback
   ```
2. Set `CLIENT_URL` in production environment:
   ```env
   CLIENT_URL=https://yourdomain.com
   ```
3. Or set explicit redirect URI:
   ```env
   LINKEDIN_REDIRECT_URI=https://yourdomain.com/api/linkedin/callback
   ```

## Quick Checklist

- [ ] LinkedIn app redirect URI matches exactly: `http://localhost:3000/api/linkedin/callback`
- [ ] No trailing slashes
- [ ] Correct protocol (http for localhost, https for production)
- [ ] Correct port number
- [ ] Path is case-sensitive and matches exactly
- [ ] Waited 1-2 minutes after updating LinkedIn settings
- [ ] Cleared browser cache if needed

## Still Not Working?

If it's still not working after following these steps:

1. **Check server logs** - The redirect URI is now logged when OAuth is initiated
2. **Verify in browser** - Check the actual redirect URI in the authorization URL
3. **Double-check LinkedIn app** - Make sure you're editing the correct app
4. **Try incognito mode** - Clear any cached OAuth state

