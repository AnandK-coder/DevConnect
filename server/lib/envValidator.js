/**
 * Validate all required environment variables
 */
function validateEnv() {
  const required = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000'
  };

  const optional = {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    REDIS_URL: process.env.REDIS_URL
  };

  const missing = [];
  const warnings = [];

  // Check required
  Object.entries(required).forEach(([key, value]) => {
    if (!value) {
      missing.push(key);
    }
  });

  // Check optional (warn if missing in production)
  if (process.env.NODE_ENV === 'production') {
    Object.entries(optional).forEach(([key, value]) => {
      if (!value) {
        warnings.push(key);
      }
    });
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Missing optional environment variables (may affect features):');
    warnings.forEach(key => console.warn(`   - ${key}`));
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long!');
  }

  console.log('✅ Environment variables validated');
}

module.exports = { validateEnv };

