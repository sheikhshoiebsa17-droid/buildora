import { Router } from 'express';
import * as analyticsController from '../controllers/analyticsController.js';

const router = Router({ mergeParams: true });

router.get('/overview', analyticsController.overview);

export default router;
