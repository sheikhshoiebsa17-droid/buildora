import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from './index.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const start = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info(`MongoDB connected → ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    logger.error('Fix: make sure MongoDB is running (mongod or the MongoDB service) and MONGODB_URI in server/.env is correct.');
    process.exit(1);
  }

  app.listen(config.port, () => {
    logger.info(`Buildora API listening on http://localhost:${config.port} (${config.env})`);
  });
};

start();
