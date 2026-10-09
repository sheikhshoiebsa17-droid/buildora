import { Router } from 'express';
import * as demoController from '../controllers/demoController.js';
import { validate } from '../middleware/validate.js';
import { createDemoRequestSchema } from '../validators/demoValidators.js';

const router = Router({ mergeParams: true });

router.post('/', validate(createDemoRequestSchema), demoController.create);
router.get('/', demoController.listForOrg);

export default router;
