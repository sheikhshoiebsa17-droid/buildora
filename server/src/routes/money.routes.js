import { Router } from 'express';
import * as moneyController from '../controllers/moneyController.js';
import { validate } from '../middleware/validate.js';
import { createMoneySchema } from '../validators/moneyValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const financeTeam = requireRoleOrPermission(['super_admin', 'admin', 'finance_manager']);

router.get('/', financeTeam, moneyController.list);
router.post('/', financeTeam, validate(createMoneySchema), moneyController.create);

export default router;
