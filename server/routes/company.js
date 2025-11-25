const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const logger = require('../lib/logger');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Company middleware - check if user is company or admin
const companyMiddleware = async (req, res, next) => {
  if (req.user.role !== 'COMPANY' && req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Company access required' });
  }
  next();
};

// Get company dashboard stats
router.get('/stats', authMiddleware, companyMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      recentApplications
    ] = await Promise.all([
      prisma.job.count({ where: { company: { contains: req.user.name } } }),
      prisma.job.count({ 
        where: { 
          company: { contains: req.user.name },
          active: true 
        } 
      }),
      prisma.application.count({
        where: {
          job: {
            company: { contains: req.user.name }
          }
        }
      }),
      prisma.application.count({
        where: {
          job: {
            company: { contains: req.user.name }
          },
          status: 'PENDING'
        }
      }),
      prisma.application.findMany({
        take: 5,
        where: {
          job: {
            company: { contains: req.user.name }
          }
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              experience: true,
              skills: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              company: true
            }
          }
        }
      })
    ]);

    res.json({
      stats: {
        totalJobs,
        activeJobs,
        totalApplications,
        pendingApplications
      },
      recentApplications
    });
  } catch (error) {
    logger.error('Company stats error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get company's jobs
router.get('/jobs', authMiddleware, companyMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where: {
          company: { contains: req.user.name }
        },
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
      prisma.job.count({
        where: {
          company: { contains: req.user.name }
        }
      })
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
    logger.error('Company jobs error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create job (for companies)
router.post('/jobs', authMiddleware, companyMiddleware, [
  body('title').trim().notEmpty().withMessage('Job title is required'),
  body('company').trim().notEmpty().withMessage('Company name is required'),
  body('description').trim().notEmpty().withMessage('Job description is required'),
  body('requirements').isArray().withMessage('Requirements must be an array'),
  body('location').trim().notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      description,
      requirements,
      location,
      remote,
      salary,
      salaryCurrency,
      jobType,
      experienceLevel,
      companyLogo,
      companyUrl,
      expiresAt
    } = req.body;

    // Use user's name as company name to ensure proper filtering
    const companyName = company || req.user.name;

    const job = await prisma.job.create({
      data: {
        title,
        company: companyName,
        description,
        requirements,
        location,
        remote: remote || false,
        salary,
        salaryCurrency,
        jobType: jobType || 'FULL_TIME',
        experienceLevel,
        companyLogo,
        companyUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: true
      }
    });

    logger.info('Job created', { jobId: job.id, company: req.user.name });

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    logger.error('Create job error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update application status (for companies)
router.patch('/applications/:id/status', authMiddleware, companyMiddleware, [
  body('status').isIn(['PENDING', 'REVIEWED', 'INTERVIEW', 'ACCEPTED', 'REJECTED'])
], async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify the application belongs to company's job
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: {
          select: {
            company: true
          }
        }
      }
    });

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Check if job belongs to company
    if (!application.job.company.includes(req.user.name)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            company: true
          }
        }
      }
    });

    logger.info('Application status updated', { 
      applicationId: id, 
      status, 
      company: req.user.name 
    });

    res.json({ message: 'Application status updated', application: updated });
  } catch (error) {
    logger.error('Update application status error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get company's applications
router.get('/applications', authMiddleware, companyMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, jobId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      job: {
        company: { contains: req.user.name }
      }
    };

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
              email: true,
              experience: true,
              skills: true,
              location: true,
              bio: true
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
    logger.error('Company applications error', { error: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

