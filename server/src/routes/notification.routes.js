import { Router } from 'express';
import * as notificationController from '../controllers/notificationController.js';

const router = Router({ mergeParams: true });

router.get('/', notificationController.list);
router.patch('/:id/read', notificationController.markRead);
router.post('/read-all', notificationController.markAllRead);

export default router;
