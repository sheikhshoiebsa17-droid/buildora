import { Router } from 'express';
import { optionalAuth, addResponseHelpers } from '../middleware/context.js';
import { authLimiter } from '../middleware/rateLimit.js';
import * as auth from '../controllers/authController.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

const router = Router();

router.use(addResponseHelpers);

router.post('/register', authLimiter, validate(registerSchema), optionalAuth, auth.register);
router.post('/login', authLimiter, validate(loginSchema), auth.login);
router.post('/logout', optionalAuth, auth.logout);
router.get('/me', optionalAuth, auth.me);

export default router;
