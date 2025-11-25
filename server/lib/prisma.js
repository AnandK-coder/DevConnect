const { PrismaClient } = require('@prisma/client');
const config = require('./config');
const logger = require('./logger');

const prisma = new PrismaClient({
  log: config.nodeEnv === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  datasources: {
    db: {
      url: config.database.url
    }
  }
});

// Connection pool error handling
prisma.$on('error', (e) => {
  logger.error('Prisma error:', e);
});

// Disconnect handling
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

module.exports = prisma;

