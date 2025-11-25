const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./lib/config');
const logger = require('./lib/logger');
const { validateEnv } = require('./lib/envValidator');
const { apiLimiter, authLimiter, matchingLimiter, githubSyncLimiter } = require('./middleware/rateLimiter');

// Validate environment variables on startup
validateEnv();

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const jobsRoutes = require('./routes/jobs');
const analyticsRoutes = require('./routes/analytics');
const githubRoutes = require('./routes/github');
const matchingRoutes = require('./routes/matching');
const codeReviewRoutes = require('./routes/codeReview');
const paymentRoutes = require('./routes/payment');
const githubOAuthRoutes = require('./routes/githubOAuth');
const adminRoutes = require('./routes/admin');
const companyRoutes = require('./routes/company');

const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Compression
app.use(compression());

// Request logging
if (config.nodeEnv === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Body parser with size limits
app.use(express.json({ limit: config.security.requestSizeLimit }));
app.use(express.urlencoded({ extended: true, limit: config.security.requestSizeLimit }));

// Rate limiting
app.use('/api', apiLimiter);

// Routes with rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/github-oauth', githubOAuthRoutes);
app.use('/api/matching', matchingLimiter, matchingRoutes);
app.use('/api/code-review', codeReviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/company', companyRoutes);

// Health check with database connectivity
app.get('/api/health', async (req, res) => {
  const prisma = require('./lib/prisma');
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  };

  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.database = 'connected';
  } catch (error) {
    health.database = 'disconnected';
    health.status = 'degraded';
    logger.error('Database health check failed', { error: error.message });
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    message,
    ...(config.nodeEnv === 'development' && {
      stack: err.stack,
      error: err
    })
  });
});

// Auto-seed jobs if database is empty (development only)
if (config.nodeEnv === 'development') {
  (async () => {
    try {
      const prisma = require('./lib/prisma');
      const jobCount = await prisma.job.count();
      
      if (jobCount === 0) {
        logger.info('No jobs found. Auto-seeding sample jobs...');
        
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
        for (const job of sampleJobs) {
          await prisma.job.create({ data: job });
          created++;
        }
        logger.info(`✅ Auto-seeded ${created} sample jobs`);
      } else {
        logger.info(`📋 Found ${jobCount} existing jobs in database`);
      }
    } catch (error) {
      logger.warn('Could not check/seed jobs on startup:', error.message);
    }
  })();
}

// Graceful shutdown
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`, {
    environment: config.nodeEnv,
    port: config.port
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise, reason });
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);
  
  server.close(async () => {
    logger.info('HTTP server closed');
    
    // Close database connections
    const prisma = require('./lib/prisma');
    await prisma.$disconnect();
    logger.info('Database connections closed');
    
    // Close Redis connections (if available)
    const { getRedisClient } = require('./lib/redis');
    try {
      const redisClient = await getRedisClient();
      if (redisClient && redisClient.isOpen) {
        await redisClient.quit();
        logger.info('Redis connections closed');
      }
    } catch (error) {
      // Redis not configured or not available - ignore
    }
    
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;

