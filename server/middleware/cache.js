const { getRedisClient } = require('../lib/redis');

/**
 * Simple in-memory cache for development
 * In production, use Redis
 */
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Cache middleware
 */
async function cacheMiddleware(req, res, next) {
  // Only cache GET requests
  if (req.method !== 'GET') {
    return next();
  }

  const cacheKey = `${req.originalUrl}:${JSON.stringify(req.query)}`;
  
  try {
    // Try Redis first (silently fail if not available)
    const redisClient = await getRedisClient();
    if (redisClient && redisClient.isOpen) {
      try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
          return res.json(JSON.parse(cached));
        }
      } catch (redisError) {
        // Redis error, fallback to memory cache silently
      }
    }
  } catch (error) {
    // Redis not available, continue to memory cache
  }

  // Try memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }

  // Store original json method
  const originalJson = res.json.bind(res);
  
  // Override json method to cache response
  res.json = function(data) {
    // Cache the response (async, don't block response)
    setImmediate(async () => {
      try {
        const redisClient = await getRedisClient();
        if (redisClient && redisClient.isOpen) {
          try {
            await redisClient.setEx(cacheKey, 300, JSON.stringify(data)); // 5 min TTL
            return;
          } catch (redisError) {
            // Redis error, fallback to memory
          }
        }
      } catch (error) {
        // Redis not available
      }
      
      // Use memory cache as fallback
      memoryCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
    });
    
    return originalJson(data);
  };

  next();
}

/**
 * Clear cache for a pattern
 */
async function clearCache(pattern) {
  try {
    const redisClient = await getRedisClient();
    if (redisClient && redisClient.isOpen) {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    }
  } catch (error) {
    // Clear memory cache
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
  }
}

module.exports = {
  cacheMiddleware,
  clearCache
};

