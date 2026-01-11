# LinkedIn Connection - Quick Reference

## 🚀 Quick Test

### Option 1: Visual Check (Easiest)
1. Go to `/profile` on your app
2. Look at LinkedIn section
3. Should show one of these:
   - ✅ **Synced** - Working perfectly
   - ⏳ **Pending Sync** - Connected, click Sync button
   - ⏰ **Token Expired** - Reconnect needed
   - "Connect LinkedIn" button - Not connected yet

### Option 2: Run Test Script (Most Complete)
```bash
cd server
node scripts/testLinkedInConnection.js <USER_ID>
```

Example:
```bash
node scripts/testLinkedInConnection.js "clxy9abc123def456"
```

### Option 3: API Check (Programmatic)
```bash
curl http://localhost:5000/api/profile/linkedin-status \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

## 📊 What Each Status Means

| Status | Icon | Meaning | Action |
|--------|------|---------|--------|
| **Synced** | ✅ | Profile data is up-to-date | No action needed |
| **Pending Sync** | ⏳ | Connected but no data | Click "Sync LinkedIn" |
| **Token Expired** | ⏰ | OAuth token invalid | Click "Reconnect LinkedIn" |
| **Not Connected** | — | No LinkedIn connection | Click "Connect LinkedIn" |

## 📋 Connection Checklist

```
[ ] User can click "Connect LinkedIn" button
    ↓ Redirects to LinkedIn login page
    ↓ User authorizes app
    ↓ Redirects back to profile page
    
[ ] LinkedIn ID appears in profile
    
[ ] User can click "Sync LinkedIn" button
    ↓ Fetches latest profile data
    ↓ Shows success message
    
[ ] Profile data is populated
    - Name, email, picture
    - Work experience entries
    - Education entries
    - Skills merged with existing ones
    
[ ] Status badge shows "✅ Synced"
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see "Connect LinkedIn" button | Check if LINKEDIN_CLIENT_ID is set |
| Redirect says "Invalid redirect_uri" | Verify LINKEDIN_REDIRECT_URI matches LinkedIn app settings |
| Connected but "Pending Sync" badge | Click "Sync LinkedIn" button |
| "Token Expired" error | Click "Reconnect LinkedIn" button |
| No profile data after sync | Check server logs for API errors |
| Skills not showing | Make sure you have skills endorsed on LinkedIn |

## 🗄️ Database Fields

When fully connected, these fields should have data:

```
linkedin              ✅ LinkedIn ID (urn:li:person:...)
linkedinToken         ✅ OAuth access token
linkedinTokenExpiresAt ✅ Token expiration date
linkedinProfile       ✅ Full profile data (JSON)
linkedinExperience    ✅ Job positions (JSON array)
linkedinEducation     ✅ Education entries (JSON array)
avatar                ✅ Profile picture URL
experience            ✅ Years (calculated from LinkedIn)
skills                ✅ Array includes LinkedIn skills
```

## 📝 Server Log Indicators

### ✅ Success
```
[info]: LinkedIn OAuth redirect URI
[info]: Token response from LinkedIn { status: 200 }
[info]: LinkedIn profile sync completed successfully
```

### ⚠️ Warning
```
[warn]: LinkedIn OpenID Connect failed, trying legacy API
[warn]: Could not fetch LinkedIn email
[warn]: LinkedIn token is invalid
```

### ❌ Error
```
[error]: LinkedIn OAuth error from LinkedIn
[error]: LinkedIn Sync Error
[error]: LinkedIn Profile API Error
```

## 🎯 What Gets Synced

✅ **Profile Information**
- Name
- Email
- Profile picture
- LinkedIn ID

✅ **Experience**
- Job titles
- Company names
- Time periods
- Job descriptions

✅ **Education**
- School name
- Degree
- Field of study
- Time periods

✅ **Skills**
- All endorsed skills
- Merged with existing skills
- Duplicates removed

✅ **Calculated**
- Total years of experience
- Updated profile picture
- Biography (if available)

## 🔐 Security

- Tokens encrypted in production
- All API calls server-side only
- Client Secret never exposed
- Tokens auto-refresh when expired

## 📞 Getting Help

1. **Check status:** Go to `/profile`, look for LinkedIn badge
2. **Run test:** `node scripts/testLinkedInConnection.js <USER_ID>`
3. **Check logs:** Look at server terminal for errors
4. **Read docs:** See `LINKEDIN_VERIFICATION.md` for full guide

## 🎓 Files Added

| File | Purpose |
|------|---------|
| `LINKEDIN_VERIFICATION.md` | Complete verification guide |
| `LINKEDIN_CONNECTION_TEST.md` | Testing instructions |
| `server/scripts/testLinkedInConnection.js` | Diagnostic script |
| Enhanced `linkedinService.js` | Better logging |
| Enhanced `profile.tsx` | Status badge |

---

**Ready to test?** Run this:
```bash
cd server
node scripts/testLinkedInConnection.js <USER_ID>
```

That's it! The script will tell you exactly what's working and what needs fixing.
