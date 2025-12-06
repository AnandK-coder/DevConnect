const prisma = require('../lib/prisma');
const logger = require('../lib/logger');
const emailService = require('./emailService');

/**
 * Check for new trending technologies and notify users
 */
async function checkAndNotifyTrendingTechs() {
  try {
    const trendingService = require('./trendingService');
    const currentTrends = await trendingService.getTrendingTechnologies();
    
    // Get all users who want notifications
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
        subscription: { in: ['FREE', 'PRO'] }
      },
      select: {
        id: true,
        email: true,
        name: true,
        skills: true
      }
    });

    const notifications = [];
    
    for (const user of users) {
      try {
        // Check if trends data is valid
        if (!currentTrends || !currentTrends.technologies || !Array.isArray(currentTrends.technologies)) {
          continue;
        }

        const userSkills = new Set((user.skills || []).map(s => s && s.toLowerCase ? s.toLowerCase() : String(s).toLowerCase()));
        
        // Find new trending techs user doesn't know
        const newTrendingTechs = currentTrends.technologies
          .filter(tech => 
            tech && 
            tech.name && 
            !userSkills.has(tech.name.toLowerCase()) && 
            tech.trend === 'RISING' &&
            (tech.popularity || 0) > 1000
          )
          .slice(0, 5);

        if (newTrendingTechs.length > 0) {
          // Create notification (you can store in database if you have notifications table)
          notifications.push({
            userId: user.id,
            type: 'TRENDING_TECH',
            message: `${newTrendingTechs.length} new trending technologies you might want to learn`,
            data: {
              technologies: newTrendingTechs.map(t => t.name)
            }
          });

          // Send email notification (optional)
          try {
            await emailService.sendTrendingTechNotification(user, newTrendingTechs);
          } catch (error) {
            logger.warn('Failed to send trending tech email', { userId: user.id, error: error.message });
          }
        }
      } catch (error) {
        logger.warn('Error processing notification for user', { userId: user.id, error: error.message });
        continue;
      }
    }

    logger.info('Trending tech notifications processed', { 
      totalUsers: users.length,
      notificationsSent: notifications.length 
    });

    return notifications;
  } catch (error) {
    logger.error('Trending tech notification error', { error: error.message });
    throw error;
  }
}

/**
 * Get notifications for a user
 */
async function getUserNotifications(userId) {
  try {
    // For now, return in-memory notifications
    // In production, store in database
    const trendingService = require('./trendingService');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { skills: true }
    });

    if (!user) return [];

    try {
      const currentTrends = await trendingService.getTrendingTechnologies();
      
      // Check if trends data is valid
      if (!currentTrends || !currentTrends.technologies || !Array.isArray(currentTrends.technologies)) {
        return [];
      }
      
      const userSkills = new Set((user.skills || []).map(s => s && s.toLowerCase ? s.toLowerCase() : String(s).toLowerCase()));

      const newTrendingTechs = currentTrends.technologies
        .filter(tech => 
          tech && 
          tech.name && 
          !userSkills.has(tech.name.toLowerCase()) && 
          tech.trend === 'RISING'
        )
        .slice(0, 5);

      return newTrendingTechs.map(tech => ({
        id: `trending-${tech.name}`,
        type: 'TRENDING_TECH',
        title: `New Trending: ${tech.name}`,
        message: `${tech.name} is trending in the market with ${tech.popularity?.toLocaleString() || 'high'} popularity`,
        timestamp: new Date().toISOString(),
        data: tech
      }));
    } catch (error) {
      logger.error('Get notifications error in getUserNotifications', { error: error.message });
      return [];
    }
  } catch (error) {
    logger.error('Get notifications error', { error: error.message });
    return [];
  }
}

module.exports = {
  checkAndNotifyTrendingTechs,
  getUserNotifications
};

