const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get skill analytics for current user
router.get('/skills', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        projects: true,
        jobMatches: {
          include: {
            job: true
          }
        }
      }
    });

    // Calculate skill proficiency from projects
    const skillCounts = {};
    user.projects.forEach(project => {
      project.techStack.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });

    const totalProjects = user.projects.length;
    const skillAnalytics = Object.entries(skillCounts).map(([skill, count]) => ({
      skill,
      proficiency: Math.min(100, (count / totalProjects) * 100),
      projectCount: count,
      demand: 70 // Placeholder - would calculate from job market data
    }));

    // Sort by proficiency
    skillAnalytics.sort((a, b) => b.proficiency - a.proficiency);

    res.json({ analytics: skillAnalytics });
  } catch (error) {
    console.error('Get Skills Analytics Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get technology trends
router.get('/trends', async (req, res) => {
  try {
    const { location, limit = 10 } = req.query;

    // Get all projects and aggregate tech stack usage
    const where = location ? {
      user: {
        location: { contains: location, mode: 'insensitive' }
      }
    } : {};

    const projects = await prisma.project.findMany({
      where,
      select: {
        techStack: true
      }
    });

    // Count technology usage
    const techCounts = {};
    projects.forEach(project => {
      project.techStack.forEach(tech => {
        techCounts[tech] = (techCounts[tech] || 0) + 1;
      });
    });

    const trends = Object.entries(techCounts)
      .map(([tech, count]) => ({
        technology: tech,
        usage: count,
        percentage: (count / projects.length) * 100,
        trend: 'RISING' // Placeholder - would analyze historical data
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, parseInt(limit));

    res.json({ trends });
  } catch (error) {
    console.error('Get Trends Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get trending technologies
router.get('/trending', async (req, res) => {
  try {
    const trendingService = require('../services/trendingService');
    const trends = await trendingService.getTrendingTechnologies();
    
    res.json({ trends });
  } catch (error) {
    console.error('Get Trending Technologies Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get salary insights
router.get('/salary', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Get jobs matching user's skills and location
    const matchingJobs = await prisma.job.findMany({
      where: {
        active: true,
        salary: { not: null },
        OR: [
          { location: { contains: user.location || '', mode: 'insensitive' } },
          { remote: true }
        ]
      },
      select: {
        salary: true,
        title: true,
        experienceLevel: true,
        location: true
      }
    });

    if (matchingJobs.length === 0) {
      return res.json({
        insights: {
          average: null,
          min: null,
          max: null,
          median: null,
          recommendation: 'No salary data available for your profile'
        }
      });
    }

    const salaries = matchingJobs
      .map(job => job.salary)
      .filter(Boolean)
      .sort((a, b) => a - b);

    const average = salaries.reduce((a, b) => a + b, 0) / salaries.length;
    const median = salaries[Math.floor(salaries.length / 2)];

    res.json({
      insights: {
        average: Math.round(average),
        min: salaries[0],
        max: salaries[salaries.length - 1],
        median: Math.round(median),
        sampleSize: salaries.length,
        recommendation: `Based on ${salaries.length} jobs matching your profile, the market rate is around $${Math.round(average)}`
      }
    });
  } catch (error) {
    console.error('Get Salary Insights Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

