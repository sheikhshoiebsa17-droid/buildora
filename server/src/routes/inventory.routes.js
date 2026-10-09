import { Router } from 'express';
import * as inventoryController from '../controllers/inventoryController.js';
import { validate } from '../middleware/validate.js';
import { createItemSchema, updateItemSchema, movementSchema } from '../validators/inventoryValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'procurement_manager', 'project_manager', 'site_engineer', 'finance_manager',
]);
const canManage = requireRoleOrPermission(['super_admin', 'admin', 'procurement_manager', 'site_engineer']);

router.get('/', staff, inventoryController.list);
router.get('/alerts', staff, inventoryController.alerts);
router.post('/', canManage, validate(createItemSchema), inventoryController.create);
router.get('/:id', staff, inventoryController.getOne);
router.patch('/:id', canManage, validate(updateItemSchema), inventoryController.update);
router.post('/:id/movements', canManage, validate(movementSchema), inventoryController.addMovement);

export default router;
