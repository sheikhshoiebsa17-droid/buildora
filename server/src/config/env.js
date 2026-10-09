import 'dotenv/config';
import mongoose from 'mongoose';

const bool = (v, fallback = false) => (v === undefined ? fallback : v === 'true');

export const config = {
  env: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/buildora',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  extraOrigins: (process.env.CORS_EXTRA_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean),
  throttle: bool(process.env.THROTTLE, true),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: 'buildora_token',
  cookieSecure: bool(process.env.COOKIE_SECURE, false),
  ai: {
    provider: (process.env.AI_PROVIDER || '').toLowerCase(),
    apiKey: process.env.AI_API_KEY || '',
    model: process.env.AI_MODEL || 'gpt-4o-mini',
    baseUrl: process.env.AI_BASE_URL || '',
  },
};

if (config.env !== 'test') {
  if (!config.jwtSecret || config.jwtSecret.length < 16) {
    console.error(
      '[config] JWT_SECRET is missing or too short. Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
    );
    process.exit(1);
  }
  if (config.isProd && !process.env.MONGODB_URI && !process.env.MONGO_URL && !config.mongoUri.startsWith('mongodb+srv')) {
    console.error('[config] MONGODB_URI or MONGO_URL is required in production.');
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  mongoose.set('debug', process.env.MONGO_DEBUG === 'true');
}
