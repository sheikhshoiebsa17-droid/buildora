import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router({ mergeParams: true });

router.get('/overview', dashboardController.dashboardOverview);

export default router;
