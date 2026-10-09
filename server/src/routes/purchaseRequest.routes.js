import { Router } from 'express';
import * as prController from '../controllers/purchaseRequestController.js';
import { validate } from '../middleware/validate.js';
import { createPRSchema, updatePRSchema } from '../validators/prValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'procurement_manager', 'project_manager', 'site_engineer', 'finance_manager',
]);
const canManage = requireRoleOrPermission(['super_admin', 'admin', 'procurement_manager', 'project_manager', 'site_engineer']);

router.get('/', staff, prController.list);
router.post('/', canManage, validate(createPRSchema), prController.create);
router.get('/:id', staff, prController.getOne);
router.patch('/:id', canManage, validate(updatePRSchema), prController.update);
router.post('/:id/submit', canManage, prController.submit);
router.delete('/:id', requireRoleOrPermission(['super_admin', 'admin', 'procurement_manager']), prController.remove);

export default router;
