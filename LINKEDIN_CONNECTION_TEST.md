# LinkedIn Connection Test Guide

## Overview
LinkedIn connection has been enhanced with comprehensive logging and error handling to help you verify if it's working properly.

## How to Check LinkedIn Connection Status

### Option 1: Using the Test Script
We've created a test script that checks the complete LinkedIn connection status for a user.

**Run the test:**
```bash
cd server
node scripts/testLinkedInConnection.js <USER_ID>
```

**Replace `<USER_ID>` with an actual user ID from your database**

**Example:**
```bash
node scripts/testLinkedInConnection.js "clxyz123abc456"
```

### What the Test Shows
The test script will display:

1. **User Information**
   - Name and email

2. **LinkedIn Connection Status**
   - LinkedIn ID (should be set if connected)
   - Whether token exists
   - Whether refresh token exists
   - Token expiration status

3. **Stored LinkedIn Data**
   - Profile data (name, email, etc.)
   - Experience entries count
   - Education entries count

4. **Token Validity Test**
   - Attempts to fetch LinkedIn profile with stored token
   - Shows if token is valid or expired
   - Displays specific errors if authentication fails

5. **Summary**
   - Overall connection status
   - What actions are needed (if any)

## LinkedIn Connection States

### ✅ LinkedIn FULLY CONNECTED
- `linkedin` field is set (has LinkedIn ID)
- `linkedinToken` exists and is valid
- `linkedinProfile` has synced profile data

**Action:** Everything is working, user can sync data

### ⏰ LinkedIn Token EXPIRED
- `linkedin` field is set
- `linkedinToken` exists but is expired
- User needs to reconnect via OAuth

**Action:** User should click "Connect LinkedIn" button again on profile page

### ❌ LinkedIn NOT CONNECTED
- `linkedin` field is empty/null
- No token stored

**Action:** User needs to click "Connect LinkedIn" button on profile page

### ⚠️ LinkedIn Connected but Not Synced
- `linkedin` field is set
- Token exists and is valid
- But `linkedinProfile` is empty

**Action:** Click "Sync LinkedIn" button to sync profile data

## What Gets Synced

When LinkedIn is connected and synced, these are stored:

1. **Profile Information**
   - Name
   - Email
   - Profile picture
   - LinkedIn ID

2. **Experience Data**
   - Job titles
   - Companies
   - Time periods
   - Job descriptions

3. **Education Data**
   - School names
   - Degrees
   - Fields of study
   - Time periods

4. **Skills**
   - All LinkedIn endorsed skills
   - Merged with existing user skills

5. **Calculated Metrics**
   - Total years of experience
   - Biography (if available)

## Server Logs

The server now logs detailed information about LinkedIn operations:

1. **During OAuth Connect**
   - Authorization URL generation
   - Token exchange with LinkedIn
   - Profile sync initiation

2. **During Profile Sync**
   - Token validation
   - API calls to fetch profile, experience, education, skills
   - Data transformation and storage
   - Any API errors with detailed information

**To view logs:**
```bash
# In the server terminal where it's running
# Logs will show automatically
```

## Common Issues and Solutions

### Issue: "LinkedIn token is invalid"
- Token has expired
- Solution: User should reconnect via OAuth

### Issue: "LinkedIn not connected"
- User hasn't authorized LinkedIn yet
- Solution: Click "Connect LinkedIn" button

### Issue: "Failed to fetch LinkedIn profile"
- API call failed (LinkedIn API down, network issue, etc.)
- Solution: Try again, check network, or contact support

### Issue: Token exists but no profile data
- OAuth succeeded but sync failed
- Solution: Click "Sync LinkedIn" button manually

## Testing the Connection in Browser

### Step 1: Go to Profile Page
Navigate to `/profile` in your app

### Step 2: Check LinkedIn Status
- If you see "LinkedIn Connected" link → Already connected
- If you see "Connect LinkedIn" button → Not connected yet

### Step 3: Connect or Sync
- **To connect:** Click "Connect LinkedIn" button
- **To sync data:** Click "Sync LinkedIn" button (only appears if connected)

### Step 4: Check Results
- "LinkedIn Connected" status should appear
- Profile data should be populated with LinkedIn information

## Database Verification

Check the database directly to see stored LinkedIn data:

```sql
-- PostgreSQL query
SELECT 
  id,
  email,
  name,
  linkedin,
  linkedinToken IS NOT NULL as has_token,
  linkedinTokenExpiresAt,
  linkedinProfile IS NOT NULL as has_profile,
  linkedinExperience IS NOT NULL as has_experience,
  linkedinEducation IS NOT NULL as has_education
FROM "User"
WHERE linkedin IS NOT NULL;
```

This will show all users with LinkedIn connected and what data is stored.

## Enhanced Error Messages

The system now provides detailed error messages for:

1. **Missing Token**
   - Tells you which step failed
   - Suggests next action

2. **Invalid Token**
   - Shows HTTP status code
   - Explains that re-authentication is needed

3. **API Errors**
   - Shows LinkedIn API error response
   - Logs exact API endpoint that failed

4. **Token Expiration**
   - Tells you exact expiration time
   - Shows comparison with current time

## Next Steps

1. **Run the test script** with a user ID to check their LinkedIn connection status
2. **Review the logs** to see what happens during sync
3. **Contact support** if you see any unexpected errors in the logs
4. **Verify database** to confirm data is being stored correctly

---

**Note:** All tokens and sensitive data are encrypted in production. In development, be careful not to expose tokens in logs or error messages.
