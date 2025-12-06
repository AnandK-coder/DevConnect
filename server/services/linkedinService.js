const axios = require('axios');

/**
 * Get LinkedIn user profile using access token (OpenID Connect)
 */
async function getLinkedInProfile(accessToken) {
  try {
    const response = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
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
    console.warn('LinkedIn OpenID Connect failed, trying legacy API:', error.response?.data || error.message);
    return getLinkedInProfileLegacy(accessToken);
  }
}

/**
 * Get LinkedIn user profile (legacy API - requires different scopes)
 */
async function getLinkedInProfileLegacy(accessToken) {
  try {
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
    } catch (emailError) {
      console.warn('Could not fetch LinkedIn email:', emailError.message);
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
    console.error('LinkedIn Profile API Error:', error.response?.data || error.message);
    throw new Error('Failed to fetch LinkedIn profile');
  }
}

/**
 * Get LinkedIn user experience/positions
 */
async function getLinkedInExperience(accessToken) {
  try {
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

    return response.data.elements || [];
  } catch (error) {
    console.error('LinkedIn Experience API Error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Get LinkedIn user education
 */
async function getLinkedInEducation(accessToken) {
  try {
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

    return response.data.elements || [];
  } catch (error) {
    console.error('LinkedIn Education API Error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Get LinkedIn user skills
 */
async function getLinkedInSkills(accessToken) {
  try {
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

    return (response.data.elements || []).map(skill => skill.name);
  } catch (error) {
    console.error('LinkedIn Skills API Error:', error.response?.data || error.message);
    return [];
  }
}

/**
 * Sync LinkedIn data to user profile
 */
async function syncLinkedInProfile(userId, accessToken, prisma) {
  try {
    // Try new API first, fallback to legacy
    let profile;
    try {
      profile = await getLinkedInProfile(accessToken);
    } catch (error) {
      console.warn('New LinkedIn API failed, trying legacy API:', error.message);
      profile = await getLinkedInProfileLegacy(accessToken);
    }

    // Get additional data
    const [experience, education, skills] = await Promise.all([
      getLinkedInExperience(accessToken).catch(() => []),
      getLinkedInEducation(accessToken).catch(() => []),
      getLinkedInSkills(accessToken).catch(() => [])
    ]);

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

    // Update user profile
    const updateData = {
      linkedin: profile.linkedinId || profile.id || null,
      avatar: profile.picture || profile.profilePicture || null
    };

    // Update skills if LinkedIn skills are available
    if (skills && skills.length > 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const existingSkills = user?.skills || [];
      const linkedinSkills = skills.map(s => s.trim()).filter(Boolean);
      const combinedSkills = Array.from(new Set([...existingSkills, ...linkedinSkills]));
      updateData.skills = combinedSkills;
    }

    // Update experience if calculated
    if (totalExperience > 0) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      const currentExperience = user?.experience || 0;
      updateData.experience = Math.max(currentExperience, Math.floor(totalExperience));
    }

    // Update bio with LinkedIn summary if available
    if (profile.summary) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user?.bio) {
        updateData.bio = profile.summary;
      }
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return {
      profile,
      experience: experience.length,
      education: education.length,
      skills: skills.length,
      totalExperience: Math.floor(totalExperience)
    };
  } catch (error) {
    console.error('LinkedIn Sync Error:', error);
    throw new Error('Failed to sync LinkedIn profile');
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

