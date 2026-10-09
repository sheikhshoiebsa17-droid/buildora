import { Router } from 'express';
import * as financeController from '../controllers/financeController.js';

const router = Router({ mergeParams: true });

router.get('/summary', financeController.summary);

export default router;
