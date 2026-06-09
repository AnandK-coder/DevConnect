#!/usr/bin/env node

/**
 * Test LinkedIn OAuth URL Generation
 * This script verifies that the OAuth authorization URL is correct
 */

require('dotenv').config();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const LINKEDIN_REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:5000/api/linkedin/callback';

console.log('\n=== LinkedIn OAuth URL Test ===\n');

// Check environment variables
console.log('📋 Environment Variables:');
console.log(`   CLIENT_ID: ${LINKEDIN_CLIENT_ID ? '✅ SET' : '❌ MISSING'}`);
console.log(`   CLIENT_SECRET: ${LINKEDIN_CLIENT_SECRET ? '✅ SET' : '❌ MISSING'}`);
console.log(`   REDIRECT_URI: ${LINKEDIN_REDIRECT_URI}`);

if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET) {
  console.error('\n❌ ERROR: Missing LinkedIn credentials in .env file');
  console.error('   Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET');
  process.exit(1);
}

// Generate OAuth URL
const params = new URLSearchParams({
  response_type: 'code',
  client_id: LINKEDIN_CLIENT_ID,
  redirect_uri: LINKEDIN_REDIRECT_URI,
  state: 'test-state-123',
  scope: 'openid profile email'
});

const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

console.log('\n🔗 Generated OAuth URL:');
console.log(`   ${authUrl}`);

console.log('\n📊 URL Parameters:');
console.log(`   response_type: code`);
console.log(`   client_id: ${LINKEDIN_CLIENT_ID}`);
console.log(`   redirect_uri: ${LINKEDIN_REDIRECT_URI}`);
console.log(`   state: test-state-123`);
console.log(`   scope: openid profile email`);

console.log('\n✅ URL Generated Successfully');
console.log('\n💡 Next Steps:');
console.log('   1. Copy the OAuth URL above');
console.log('   2. Open it in your browser');
console.log('   3. LinkedIn should show AUTHORIZATION page (not LOGIN page)');
console.log('   4. If you see LOGIN page, the issue is with your LinkedIn app settings');

console.log('\n🔍 Troubleshooting:');
console.log('   If you see LOGIN instead of AUTHORIZATION:');
console.log('   1. Go to https://www.linkedin.com/developers/');
console.log('   2. Check app settings');
console.log('   3. Make sure redirect_uri matches EXACTLY:');
console.log(`      Expected: ${LINKEDIN_REDIRECT_URI}`);
console.log('   4. Verify "Sign In with LinkedIn using OpenID Connect" is enabled');
console.log('   5. Wait 1-2 minutes after updating settings');

console.log('\n');
