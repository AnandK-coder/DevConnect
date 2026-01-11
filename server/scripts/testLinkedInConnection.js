#!/usr/bin/env node

/**
 * Test LinkedIn Connection Status
 * This script checks if a user's LinkedIn connection is valid and working
 */

const prisma = require('../lib/prisma');
const linkedinService = require('../services/linkedinService');
const logger = require('../lib/logger');

async function testLinkedInConnection(userId) {
  try {
    console.log('\n=== LinkedIn Connection Test ===\n');
    console.log(`Testing LinkedIn connection for user: ${userId}\n`);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        linkedin: true,
        linkedinToken: true,
        linkedinRefreshToken: true,
        linkedinTokenExpiresAt: true,
        linkedinProfile: true,
        linkedinExperience: true,
        linkedinEducation: true
      }
    });

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('📋 User Information:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`\n🔗 LinkedIn Connection Status:`);
    console.log(`   LinkedIn ID: ${user.linkedin || 'NOT SET'}`);
    console.log(`   Has Token: ${!!user.linkedinToken ? '✅ YES' : '❌ NO'}`);
    console.log(`   Has Refresh Token: ${!!user.linkedinRefreshToken ? '✅ YES' : '❌ NO'}`);
    
    if (user.linkedinTokenExpiresAt) {
      const expiresAt = new Date(user.linkedinTokenExpiresAt);
      const now = new Date();
      const isExpired = expiresAt < now;
      console.log(`   Token Expires At: ${expiresAt.toISOString()}`);
      console.log(`   Token Status: ${isExpired ? '⏰ EXPIRED' : '✅ VALID'}`);
    } else {
      console.log(`   Token Expires At: NOT SET`);
    }

    // Check stored profile data
    console.log(`\n📊 Stored LinkedIn Data:`);
    console.log(`   Profile Data: ${user.linkedinProfile ? '✅ YES' : '❌ NO'}`);
    if (user.linkedinProfile) {
      console.log(`      Name: ${user.linkedinProfile.name || 'N/A'}`);
      console.log(`      Email: ${user.linkedinProfile.email || 'N/A'}`);
    }
    console.log(`   Experience Data: ${user.linkedinExperience ? `✅ YES (${Array.isArray(user.linkedinExperience) ? user.linkedinExperience.length : '?'} entries)` : '❌ NO'}`);
    console.log(`   Education Data: ${user.linkedinEducation ? `✅ YES (${Array.isArray(user.linkedinEducation) ? user.linkedinEducation.length : '?'} entries)` : '❌ NO'}`);

    // Test token validity if it exists
    if (user.linkedinToken && user.linkedin) {
      console.log(`\n🧪 Testing Token Validity...`);
      try {
        const profile = await linkedinService.getLinkedInProfile(user.linkedinToken);
        console.log(`   ✅ Token is VALID`);
        console.log(`   Retrieved Profile:`);
        console.log(`      ID: ${profile.id || profile.linkedinId}`);
        console.log(`      Name: ${profile.name}`);
        console.log(`      Email: ${profile.email || 'N/A'}`);
      } catch (error) {
        console.log(`   ❌ Token is INVALID`);
        console.log(`   Error: ${error.message}`);
        if (error.response?.status === 401) {
          console.log(`   Status: 401 Unauthorized - Token needs refresh or re-authentication`);
        }
      }
    } else {
      console.log(`\n⚠️  Cannot test token (no token stored or no LinkedIn ID)`);
    }

    console.log(`\n=== Summary ===`);
    if (!user.linkedin) {
      console.log('❌ LinkedIn NOT connected - User needs to authorize via OAuth');
    } else if (!user.linkedinToken) {
      console.log('⚠️  LinkedIn connected but NO token - Data cannot be synced');
    } else if (user.linkedinTokenExpiresAt && new Date(user.linkedinTokenExpiresAt) < new Date()) {
      console.log('⏰ LinkedIn token EXPIRED - User needs to reconnect');
    } else if (user.linkedinProfile) {
      console.log('✅ LinkedIn FULLY CONNECTED - Data is synced and available');
    } else {
      console.log('⚠️  LinkedIn token valid but profile data NOT synced yet');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Test Error:', error.message);
    logger.error('LinkedIn Connection Test Error', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get user ID from command line argument
const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node testLinkedInConnection.js <userId>');
  console.error('Example: node testLinkedInConnection.js "user-id-here"');
  process.exit(1);
}

testLinkedInConnection(userId);
