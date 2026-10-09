import { Router } from 'express';
import * as profileController from '../controllers/profileController.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/profileValidators.js';

const router = Router({ mergeParams: true });

router.get('/', profileController.getProfile);
router.patch('/', validate(updateProfileSchema), profileController.updateProfile);
router.post('/password', validate(changePasswordSchema), profileController.changePassword);

export default router;
