import { Router } from 'express';
import { mountRoutes } from '../routes/index.js';
import { logger } from '../utils/logger.js';

/**
 * Wrapping router that mounts feature routes and surfaces unmatched misses.
 * Express 5+ / path-to-regexp issues are avoided by using catch-all only here.
 */
export default function routeWatcher() {
  return {
    Router() {
      const router = Router({ mergeParams: true });
      try {
        mountRoutes(router);
      } catch (err) {
        logger.error(`Failed to mount routes: ${err.message}`);
      }
      return router;
    },
  };
}

routeWatcher.Router = function () {
  return routeWatcher().Router();
};
