import { Router } from 'express';
import * as estimateController from '../controllers/estimateController.js';
import { validate } from '../middleware/validate.js';
import { createEstimateSchema, updateEstimateSchema, versionEstimateSchema } from '../validators/estimateValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'sales_manager', 'designer', 'project_manager', 'finance_manager',
]);
const canManage = requireRoleOrPermission(['super_admin', 'admin', 'sales_manager', 'designer']);
const canApprove = requireRoleOrPermission(['super_admin', 'admin', 'sales_manager']);

router.get('/', staff, estimateController.list);
router.post('/', canManage, validate(createEstimateSchema), estimateController.create);
router.post('/calculate', canManage, validate(createEstimateSchema), estimateController.calculate);
router.get('/:id', staff, estimateController.getOne);
router.patch('/:id', canManage, estimateController.update);
router.post('/:id/versions', canManage, validate(versionEstimateSchema), estimateController.newVersion);
router.post('/:id/sent', canManage, estimateController.markSent);
router.post('/:id/client-approve', estimateController.clientApprove);
router.post('/:id/client-reject', estimateController.clientReject);

export default router;
