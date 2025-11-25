const redis = require('redis');

let redisClient = null;
let redisAvailable = false;
let connectionAttempted = false;

async function getRedisClient() {
  // If Redis is not configured or already failed, return null
  if (!process.env.REDIS_URL && !connectionAttempted) {
    return null;
  }

  // If connection already failed, don't retry
  if (connectionAttempted && !redisAvailable) {
    return null;
  }

  if (!redisClient && !connectionAttempted) {
    connectionAttempted = true;
    
    try {
      redisClient = redis.createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 3) {
              redisAvailable = false;
              return false; // Stop reconnecting
            }
            return Math.min(retries * 100, 3000);
          }
        }
      });

      redisClient.on('error', (err) => {
        // Only log once, don't spam
        if (redisAvailable) {
          console.warn('Redis connection lost. Using memory cache fallback.');
          redisAvailable = false;
        }
      });

      redisClient.on('connect', () => {
        redisAvailable = true;
        console.log('✅ Redis connected');
      });

      // Try to connect, but don't block if it fails
      try {
        if (!redisClient.isOpen) {
          await Promise.race([
            redisClient.connect(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Redis connection timeout')), 2000)
            )
          ]);
          redisAvailable = true;
        }
      } catch (error) {
        // Redis not available, use memory cache
        redisAvailable = false;
        redisClient = null;
        if (process.env.NODE_ENV === 'development') {
          console.log('⚠️  Redis not available. Using memory cache fallback.');
        }
        return null;
      }
    } catch (error) {
      redisAvailable = false;
      redisClient = null;
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Redis not available. Using memory cache fallback.');
      }
      return null;
    }
  }

  // Return client only if it's available and connected
  if (redisClient && redisAvailable && redisClient.isOpen) {
    return redisClient;
  }

  return null;
}

module.exports = { getRedisClient };

