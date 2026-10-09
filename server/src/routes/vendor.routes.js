import { Router } from 'express';
import * as vendorController from '../controllers/vendorController.js';
import { validate } from '../middleware/validate.js';
import { createVendorSchema, updateVendorSchema } from '../validators/vendorValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'procurement_manager', 'project_manager', 'finance_manager',
]);
const canManage = requireRoleOrPermission(['super_admin', 'admin', 'procurement_manager']);

router.get('/', staff, vendorController.list);
router.post('/', canManage, validate(createVendorSchema), vendorController.create);
router.get('/:id', staff, vendorController.getOne);
router.patch('/:id', canManage, validate(updateVendorSchema), vendorController.update);
router.delete('/:id', requireRoleOrPermission(['super_admin', 'admin']), vendorController.remove);

export default router;
