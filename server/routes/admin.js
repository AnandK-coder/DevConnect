const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const logger = require('../lib/logger');

const router = express.Router();

// Admin middleware - check if user has admin role
const adminMiddleware = async (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Get admin dashboard stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      totalProjects,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.job.count({ where: { active: true } }),
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.project.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          subscription: true
        }
      })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications,
        totalProjects
      },
      recentUsers
    });
  } catch (error) {
    logger.error('Admin stats error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all jobs (admin view)
router.get('/jobs', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status === 'active') {
      where.active = true;
    } else if (status === 'inactive') {
      where.active = false;
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { postedAt: 'desc' },
        include: {
          _count: {
            select: {
              applications: true,
              matches: true
            }
          }
        }
      }),
      prisma.job.count({ where })
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Admin jobs error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update job status (activate/deactivate)
router.patch('/jobs/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const job = await prisma.job.update({
      where: { id },
      data: { active: active === true }
    });

    res.json({ message: `Job ${active ? 'activated' : 'deactivated'}`, job });
  } catch (error) {
    logger.error('Admin update job status error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete job
router.delete('/jobs/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.job.delete({
      where: { id }
    });

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    logger.error('Admin delete job error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            subscription: true,
            experience: true,
            location: true,
            createdAt: true,
            _count: {
              select: {
                projects: true,
                jobMatches: true,
                applications: true
              }
            }
          }
      }),
      prisma.user.count({ where })
    ]);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Admin users error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all applications
router.get('/applications', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, jobId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) {
      where.status = status;
    }
    if (jobId) {
      where.jobId = jobId;
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          job: {
            select: {
              id: true,
              title: true,
              company: true
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      }),
      prisma.application.count({ where })
    ]);

    res.json({
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Admin applications error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update application status
router.patch('/applications/:id/status', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const application = await prisma.application.update({
      where: { id },
      data: { status }
    });

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    logger.error('Admin update application status error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

