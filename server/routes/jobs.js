const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth');
const emailService = require('../services/emailService');
const logger = require('../lib/logger');
const { cacheMiddleware } = require('../middleware/cache');

const router = express.Router();

// Seed sample jobs (development only)
router.post('/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not available in production' });
  }

  try {
    const sampleJobs = [
      {
        title: 'Senior Full Stack Developer',
        company: 'TechCorp',
        description: 'We are looking for an experienced full-stack developer to join our growing team. You will work on building scalable web applications using modern technologies.',
        requirements: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
        location: 'San Francisco, CA',
        remote: true,
        salary: 150000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        active: true,
        postedAt: new Date()
      },
      {
        title: 'Frontend Engineer',
        company: 'StartupXYZ',
        description: 'Join our team to build beautiful and performant user interfaces. We value clean code, user experience, and continuous learning.',
        requirements: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'GraphQL'],
        location: 'Remote',
        remote: true,
        salary: 120000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'MID',
        active: true,
        postedAt: new Date()
      },
      {
        title: 'Backend Developer',
        company: 'CloudScale Inc',
        description: 'Design and implement robust backend systems that handle millions of requests. Work with microservices architecture and cloud infrastructure.',
        requirements: ['Python', 'FastAPI', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis'],
        location: 'New York, NY',
        remote: false,
        salary: 140000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        active: true,
        postedAt: new Date()
      },
      {
        title: 'DevOps Engineer',
        company: 'InfraTech',
        description: 'Manage our cloud infrastructure and CI/CD pipelines. Help us scale our systems and improve deployment processes.',
        requirements: ['AWS', 'Terraform', 'Kubernetes', 'Jenkins', 'Linux', 'Bash'],
        location: 'Austin, TX',
        remote: true,
        salary: 130000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'MID',
        active: true,
        postedAt: new Date()
      },
      {
        title: 'Mobile App Developer',
        company: 'AppWorks',
        description: 'Build native and cross-platform mobile applications. Work on both iOS and Android platforms using modern frameworks.',
        requirements: ['React Native', 'Swift', 'Kotlin', 'Firebase', 'REST APIs'],
        location: 'Seattle, WA',
        remote: true,
        salary: 125000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'MID',
        active: true,
        postedAt: new Date()
      },
      {
        title: 'Machine Learning Engineer',
        company: 'AI Innovations',
        description: 'Develop and deploy machine learning models for production systems. Work with large datasets and cutting-edge AI technologies.',
        requirements: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Docker', 'AWS'],
        location: 'Boston, MA',
        remote: false,
        salary: 160000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'SENIOR',
        active: true,
        postedAt: new Date()
      },
      {
        title: 'React Developer',
        company: 'WebStudio',
        description: 'Create interactive and responsive web applications. Collaborate with designers to bring beautiful UIs to life.',
        requirements: ['React', 'JavaScript', 'CSS', 'HTML', 'Redux'],
        location: 'Remote',
        remote: true,
        salary: 100000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'JUNIOR',
        active: true,
        postedAt: new Date()
      },
      {
        title: 'Full Stack Developer',
        company: 'Digital Solutions',
        description: 'Work on end-to-end feature development. From database design to frontend implementation, you will own the full stack.',
        requirements: ['Vue.js', 'Node.js', 'MongoDB', 'Express', 'TypeScript'],
        location: 'Chicago, IL',
        remote: true,
        salary: 115000,
        salaryCurrency: 'USD',
        jobType: 'FULL_TIME',
        experienceLevel: 'MID',
        active: true,
        postedAt: new Date()
      }
    ];

    let created = 0;
    let skipped = 0;

    for (const job of sampleJobs) {
      const existing = await prisma.job.findFirst({
        where: {
          title: job.title,
          company: job.company
        }
      });

      if (!existing) {
        await prisma.job.create({ data: job });
        created++;
      } else {
        skipped++;
      }
    }

    res.json({ 
      message: `Jobs seeding completed! Created: ${created}, Skipped: ${skipped}`,
      created,
      skipped
    });
  } catch (error) {
    console.error('Seed Jobs Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all jobs (with caching)
router.get('/', cacheMiddleware, async (req, res) => {
  try {
    const { location, remote, search, page = 1, limit = 20, jobType, experienceLevel, minSalary } = req.query;

    const where = {
      active: true
    };

    // Location filter
    if (location && location.trim() !== '') {
      where.location = { contains: location.trim(), mode: 'insensitive' };
    }

    // Remote filter - only apply if explicitly set
    if (remote !== undefined && remote !== null && remote !== '') {
      where.remote = remote === 'true' || remote === true;
    }

    // Search filter
    if (search && search.trim() !== '') {
      where.OR = [
        { title: { contains: search.trim(), mode: 'insensitive' } },
        { company: { contains: search.trim(), mode: 'insensitive' } },
        { description: { contains: search.trim(), mode: 'insensitive' } },
        { requirements: { hasSome: [search.trim()] } }
      ];
    }

    // Job type filter
    if (jobType && jobType.trim() !== '') {
      where.jobType = jobType;
    }

    // Experience level filter
    if (experienceLevel && experienceLevel.trim() !== '') {
      where.experienceLevel = experienceLevel;
    }

    // Minimum salary filter
    if (minSalary && minSalary.trim() !== '') {
      where.salary = { gte: parseInt(minSalary) };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { postedAt: 'desc' }
      }),
      prisma.job.count({ where })
    ]);

    console.log(`Found ${jobs.length} jobs (total: ${total}) with filters:`, { location, remote, search });

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
    console.error('Get Jobs Error:', error);
    res.status(500).json({ message: 'Internal server error', error: process.env.NODE_ENV === 'development' ? error.message : undefined });
  }
});

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            matches: true,
            applications: true
          }
        }
      }
    });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get Job Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create job (for companies/admins)
router.post('/', authMiddleware, [
  body('title').trim().notEmpty(),
  body('company').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('requirements').isArray(),
  body('location').trim().notEmpty()
], async (req, res) => {
  try {
    // Check if user has permission (company subscription or admin)
    if (req.user.subscription !== 'COMPANY') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

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

    const job = await prisma.job.create({
      data: {
        title,
        company,
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
        expiresAt: expiresAt ? new Date(expiresAt) : null
      }
    });

    res.status(201).json({
      message: 'Job posted successfully',
      job
    });
  } catch (error) {
    console.error('Create Job Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Apply to job
router.post('/:id/apply', authMiddleware, [
  body('coverLetter').optional().trim()
], async (req, res) => {
  try {
    const { id: jobId } = req.params;
    const { coverLetter } = req.body;

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId }
    });

    if (!job || !job.active) {
      return res.status(404).json({ message: 'Job not found or inactive' });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId: req.user.id,
          jobId
        }
      }
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied' });
    }

    const application = await prisma.application.create({
      data: {
        userId: req.user.id,
        jobId,
        coverLetter: coverLetter || null,
        status: 'PENDING'
      }
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    emailService.sendApplicationConfirmation(user, job).catch(err => {
      logger.warn('Failed to send application confirmation email', { error: err.message });
    });

    logger.info('Job application submitted', { userId: req.user.id, jobId });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Apply Job Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

