import { Router } from 'express';
import * as feedbackController from '../controllers/feedbackController.js';
import { validate } from '../middleware/validate.js';
import { createFeedbackSchema } from '../validators/feedbackValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission(['super_admin', 'admin', 'project_manager', 'sales_manager']);

router.get('/', staff, feedbackController.list);
router.post('/', staff, validate(createFeedbackSchema), feedbackController.create);

export default router;
