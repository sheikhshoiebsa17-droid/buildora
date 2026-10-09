import { Router } from 'express';
import * as copilotController from '../controllers/copilotController.js';

const router = Router({ mergeParams: true });

router.post('/chat', copilotController.chat);

export default router;
