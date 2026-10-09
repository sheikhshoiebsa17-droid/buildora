import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { validate } from '../middleware/validate.js';
import { createCustomerSchema, updateCustomerSchema } from '../validators/customerValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'sales_manager', 'project_manager', 'finance_manager',
]);

router.get('/', staff, customerController.list);
router.post('/', staff, validate(createCustomerSchema), customerController.create);
router.get('/:id', staff, customerController.getOne);
router.patch('/:id', staff, validate(updateCustomerSchema), customerController.update);
router.delete('/:id', requireRoleOrPermission(['super_admin', 'admin']), customerController.remove);
router.post('/:id/notes', staff, customerController.addNote);

export default router;
