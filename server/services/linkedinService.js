const axios = require('axios');
const logger = require('../lib/logger');

/**
 * Get LinkedIn user profile using access token (OpenID Connect)
 */
async function getLinkedInProfile(accessToken) {
  try {
    if (!accessToken || accessToken === 'undefined' || accessToken === '') {
      throw new Error('Invalid access token provided');
    }

    logger.info('Fetching LinkedIn profile via OpenID Connect', { 
      tokenPresent: !!accessToken,
      tokenLength: accessToken?.length 
    });

    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    logger.info('LinkedIn OpenID Connect successful', { 
      linkedinId: response.data.sub 
    });

    return {
      id: response.data.sub,
      name: response.data.name,
      email: response.data.email,
      picture: response.data.picture,
      givenName: response.data.given_name,
      familyName: response.data.family_name,
      linkedinId: response.data.sub
    };
  } catch (error) {
    // If OpenID Connect fails, try legacy API
    logger.warn('LinkedIn OpenID Connect failed, trying legacy API', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    });
    return getLinkedInProfileLegacy(accessToken);
  }
}

/**
 * Get LinkedIn user profile (legacy API - requires different scopes)
 */
async function getLinkedInProfileLegacy(accessToken) {
  try {
    logger.info('Attempting LinkedIn legacy API profile fetch', { 
      tokenPresent: !!accessToken 
    });

    // Get basic profile info
    const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        projection: '(id,firstName,lastName,profilePicture(displayImage~:playableStreams))'
      }
    });

    logger.info('LinkedIn legacy profile API successful', { 
      linkedinId: profileResponse.data.id 
    });

    // Get email
    let email = null;
    try {
      const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        params: {
          q: 'members',
          projection: '(elements*(handle~))'
        }
      });
      
      if (emailResponse.data.elements && emailResponse.data.elements.length > 0) {
        email = emailResponse.data.elements[0]['handle~']?.emailAddress;
      }
      logger.info('LinkedIn email fetch successful', { emailFound: !!email });
    } catch (emailError) {
      logger.warn('Could not fetch LinkedIn email', { 
        error: emailError.message,
        status: emailError.response?.status 
      });
    }

    const firstName = profileResponse.data.firstName?.localized?.en_US || 
                      profileResponse.data.firstName?.preferredLocale?.language || 
                      profileResponse.data.firstName || '';
    const lastName = profileResponse.data.lastName?.localized?.en_US || 
                     profileResponse.data.lastName?.preferredLocale?.language || 
                     profileResponse.data.lastName || '';

    // LinkedIn API uses 'displayImage~' as a field name, but we need to access it differently
    const displayImage = profileResponse.data.profilePicture?.['displayImage~'] || 
                         profileResponse.data.profilePicture?.displayImage;
    const profilePicture = displayImage?.elements?.[0]?.identifiers?.[0]?.identifier ||
                          profileResponse.data.profilePicture?.elements?.[0]?.identifiers?.[0]?.identifier;

    return {
      id: profileResponse.data.id,
      name: `${firstName} ${lastName}`.trim() || 'LinkedIn User',
      email: email,
      firstName: firstName,
      lastName: lastName,
      profilePicture: profilePicture,
      linkedinId: profileResponse.data.id
    };
  } catch (error) {
    logger.error('LinkedIn Profile API Error', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    });
    throw new Error(`Failed to fetch LinkedIn profile: ${error.message}`);
  }
}

/**
 * Get LinkedIn user experience/positions
 */
async function getLinkedInExperience(accessToken) {
  try {
    logger.info('Fetching LinkedIn experience', { tokenPresent: !!accessToken });

    const response = await axios.get('https://api.linkedin.com/v2/positions', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        q: 'viewer',
        projection: '(elements*(id,title,company,timePeriod,description))'
      }
    });

    const experience = response.data.elements || [];
    logger.info('LinkedIn experience fetch successful', { count: experience.length });
    return experience;
  } catch (error) {
    logger.warn('LinkedIn Experience API Error', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    });
    return [];
  }
}

/**
 * Get LinkedIn user education
 */
async function getLinkedInEducation(accessToken) {
  try {
    logger.info('Fetching LinkedIn education', { tokenPresent: !!accessToken });

    const response = await axios.get('https://api.linkedin.com/v2/educations', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        q: 'viewer',
        projection: '(elements*(id,schoolName,degree,fieldOfStudy,timePeriod))'
      }
    });

    const education = response.data.elements || [];
    logger.info('LinkedIn education fetch successful', { count: education.length });
    return education;
  } catch (error) {
    logger.warn('LinkedIn Education API Error', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    });
    return [];
  }
}

/**
 * Get LinkedIn user skills
 */
async function getLinkedInSkills(accessToken) {
  try {
    logger.info('Fetching LinkedIn skills', { tokenPresent: !!accessToken });

    const response = await axios.get('https://api.linkedin.com/v2/skills', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      params: {
        q: 'viewer',
        projection: '(elements*(id,name))'
      }
    });

    const skills = (response.data.elements || []).map(skill => skill.name);
    logger.info('LinkedIn skills fetch successful', { count: skills.length });
    return skills;
  } catch (error) {
    logger.warn('LinkedIn Skills API Error', { 
      error: error.message,
      status: error.response?.status,
      data: error.response?.data 
    });
    return [];
  }
}

/**
 * Sync LinkedIn data to user profile
 */
async function syncLinkedInProfile(userId, accessToken, prisma) {
  try {
    logger.info('Starting LinkedIn profile sync', { userId, tokenPresent: !!accessToken });

    // Try new API first, fallback to legacy
    let profile;
    try {
      logger.info('Attempting OpenID Connect profile fetch');
      profile = await getLinkedInProfile(accessToken);
      logger.info('Successfully fetched LinkedIn profile', { linkedinId: profile.linkedinId });
    } catch (error) {
      logger.warn('New LinkedIn API failed, trying legacy API', { error: error.message });
      profile = await getLinkedInProfileLegacy(accessToken);
    }

    // Get additional data
    logger.info('Fetching additional LinkedIn data (experience, education, skills)');
    const [experience, education, skills] = await Promise.all([
      getLinkedInExperience(accessToken).catch(() => []),
      getLinkedInEducation(accessToken).catch(() => []),
      getLinkedInSkills(accessToken).catch(() => [])
    ]);

    logger.info('Additional LinkedIn data fetched', { 
      experienceCount: experience.length,
      educationCount: education.length,
      skillsCount: skills.length
    });

    // Calculate experience years from positions
    let totalExperience = 0;
    if (experience && experience.length > 0) {
      experience.forEach(exp => {
        if (exp.timePeriod) {
          const startDate = exp.timePeriod.startDate;
          const endDate = exp.timePeriod.endDate || new Date();
          if (startDate) {
            const start = new Date(`${startDate.year}-${startDate.month || 1}-${startDate.day || 1}`);
            const end = endDate ? new Date(`${endDate.year}-${endDate.month || 12}-${endDate.day || 31}`) : new Date();
            const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
            totalExperience += Math.max(0, years);
          }
        }
      });
    }

    logger.info('Calculated experience from LinkedIn', { totalExperience: totalExperience.toFixed(1) });

    // Update user profile
    const updateData = {
      linkedin: profile.linkedinId || profile.id || null,
      avatar: profile.picture || profile.profilePicture || null,
      linkedinProfile: profile,  // Store full profile data
      linkedinExperience: experience,  // Store all experience entries
      linkedinEducation: education  // Store all education entries
    };

    // Update skills if LinkedIn skills are available
    if (skills && skills.length > 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const existingSkills = user?.skills || [];
      const linkedinSkills = skills.map(s => s.trim()).filter(Boolean);
      const combinedSkills = Array.from(new Set([...existingSkills, ...linkedinSkills]));
      updateData.skills = combinedSkills;
      logger.info('Updated skills from LinkedIn', { 
        newSkillsCount: linkedinSkills.length,
        totalSkillsCount: combinedSkills.length
      });
    }

    // Update experience if calculated
    if (totalExperience > 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const currentExperience = user?.experience || 0;
      updateData.experience = Math.max(currentExperience, Math.floor(totalExperience));
      logger.info('Updated experience from LinkedIn', { 
        yearsFromLinkedIn: Math.floor(totalExperience),
        previousYears: currentExperience,
        finalYears: updateData.experience
      });
    }

    // Update bio with LinkedIn summary if available
    if (profile.summary) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.bio) {
        updateData.bio = profile.summary;
        logger.info('Updated bio from LinkedIn profile');
      }
    }

    logger.info('Updating user in database', { userId, fieldsToUpdate: Object.keys(updateData) });

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    logger.info('LinkedIn profile sync completed successfully', { userId });

    return {
      profile,
      experience: experience.length,
      education: education.length,
      skills: skills.length,
      totalExperience: Math.floor(totalExperience)
    };
  } catch (error) {
    logger.error('LinkedIn Sync Error', { 
      userId,
      error: error.message,
      stack: error.stack 
    });
    throw new Error(`Failed to sync LinkedIn profile: ${error.message}`);
  }
}

module.exports = {
  getLinkedInProfile,
  getLinkedInProfileLegacy,
  getLinkedInExperience,
  getLinkedInEducation,
  getLinkedInSkills,
  syncLinkedInProfile
};

