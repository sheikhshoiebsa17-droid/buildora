import { Router } from 'express';
import * as poController from '../controllers/purchaseOrderController.js';
import { validate } from '../middleware/validate.js';
import { createPOSchema, updatePOSchema } from '../validators/poValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'procurement_manager', 'project_manager', 'finance_manager', 'site_engineer',
]);
const canManage = requireRoleOrPermission(['super_admin', 'admin', 'procurement_manager']);
const canApprove = requireRoleOrPermission(['super_admin', 'admin', 'finance_manager']);

router.get('/', staff, poController.list);
router.post('/', canManage, validate(createPOSchema), poController.create);
router.get('/:id', staff, poController.getOne);
router.patch('/:id', canManage, validate(updatePOSchema), poController.update);
router.post('/:id/submit', canManage, poController.submitForApproval);
router.post('/:id/approve', canApprove, poController.approve);
router.post('/:id/reject', canApprove, poController.reject);
router.post('/:id/receive', canManage, poController.receive);

export default router;
