const prisma = require('../lib/prisma');
const aiService = require('./aiService');

/**
 * Match jobs for a user using AI
 */
async function matchJobsForUser(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Get all active jobs
    const jobs = await prisma.job.findMany({
      where: { active: true },
      orderBy: { postedAt: 'desc' }
    });

    // Calculate match scores for each job
    const matches = await Promise.all(
      jobs.map(async (job) => {
        // Check if match already exists
        const existingMatch = await prisma.jobMatch.findUnique({
          where: {
            userId_jobId: {
              userId,
              jobId: job.id
            }
          }
        });

        if (existingMatch) {
          return {
            job,
            match: existingMatch
          };
        }

        // Calculate new match score using AI
        const matchData = await aiService.calculateJobMatchScore(user, job);

        // Save match to database
        const match = await prisma.jobMatch.create({
          data: {
            userId,
            jobId: job.id,
            score: matchData.score
          }
        });

        return {
          job,
          match: {
            ...match,
            reasoning: matchData.reasoning,
            skillMatch: matchData.skillMatch,
            experienceMatch: matchData.experienceMatch,
            locationMatch: matchData.locationMatch
          }
        };
      })
    );

    // Sort by match score (highest first)
    matches.sort((a, b) => b.match.score - a.match.score);

    return matches;
  } catch (error) {
    console.error('Matching Error:', error);
    throw error;
  }
}

/**
 * Get top N job matches for a user
 */
async function getTopJobMatches(userId, limit = 10) {
  const matches = await matchJobsForUser(userId);
  return matches.slice(0, limit).map(m => ({
    ...m.job,
    matchScore: m.match.score,
    matchReasoning: m.match.reasoning
  }));
}

/**
 * Match users for collaboration (co-founders, contributors, etc.)
 */
async function matchUsersForCollaboration(userId, type = 'co-founder') {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { projects: true }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Find users with complementary skills
    const allUsers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        subscription: { in: ['FREE', 'PRO'] }
      },
      include: { projects: true }
    });

    // Calculate compatibility scores
    const matches = allUsers.map(targetUser => {
      const userSkills = new Set(user.skills.map(s => s.toLowerCase()));
      const targetSkills = new Set(targetUser.skills.map(s => s.toLowerCase()));
      
      // Calculate skill complementarity
      const commonSkills = [...userSkills].filter(s => targetSkills.has(s)).length;
      const uniqueSkills = [...targetSkills].filter(s => !userSkills.has(s)).length;
      
      // Score based on:
      // - Some common skills (shows compatibility)
      // - Unique skills (shows complementarity)
      // - Similar experience level
      const experienceDiff = Math.abs(user.experience - targetUser.experience);
      const experienceScore = Math.max(0, 100 - (experienceDiff * 10));
      
      const skillScore = (commonSkills * 20) + (uniqueSkills * 15);
      const totalScore = (skillScore * 0.6) + (experienceScore * 0.4);
      
      return {
        user: targetUser,
        score: Math.min(100, totalScore),
        commonSkills,
        uniqueSkills
      };
    });

    // Sort by score
    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, 10);
  } catch (error) {
    console.error('Collaboration Matching Error:', error);
    throw error;
  }
}

module.exports = {
  matchJobsForUser,
  getTopJobMatches,
  matchUsersForCollaboration
};

