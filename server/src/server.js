import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './index.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';
import { seed } from './scripts/seed.js';

const start = async () => {
  let mongoUri = config.mongoUri;

  // In production, fallback to embedded in-memory MongoDB if no external URI is provided
  if (config.isProd && !process.env.MONGODB_URI && !process.env.MONGO_URL) {
    try {
      logger.info('No external MONGODB_URI provided. Starting embedded in-memory MongoDB for demo...');
      process.env.MONGOMS_VERSION = process.env.MONGOMS_VERSION || '7.0.14';
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        binary: {
          version: process.env.MONGOMS_VERSION,
        },
      });
      mongoUri = mongod.getUri();
      logger.info(`Embedded MongoDB active → ${mongoUri}`);
    } catch (err) {
      logger.warn(`Failed to initialize embedded MongoDB: ${err.message}`);
    }
  }

  try {
    await mongoose.connect(mongoUri);
    logger.info(`MongoDB connected → ${mongoose.connection.host}/${mongoose.connection.name}`);

    // Auto-seed demo data if needed
    try {
      await seed(mongoUri);
    } catch (sErr) {
      logger.warn(`Auto-seed notice: ${sErr.message}`);
    }
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    logger.error('Fix: verify MONGODB_URI or ensure MongoDB service is accessible.');
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`Buildora API listening on http://localhost:${config.port} (${config.env})`);
  });
};

start();
