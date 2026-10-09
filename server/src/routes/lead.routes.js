import { Router } from 'express';
import * as leadController from '../controllers/leadController.js';
import { validate } from '../middleware/validate.js';
import { createLeadSchema, updateLeadSchema } from '../validators/leadValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const canManageLeads = requireRoleOrPermission(['super_admin', 'admin', 'sales_manager']);
const canViewLeads = requireRoleOrPermission([
  'super_admin', 'admin', 'sales_manager', 'project_manager', 'designer',
  'procurement_manager', 'finance_manager', 'site_engineer',
]);

router.get('/', canViewLeads, leadController.list);
router.post('/', canManageLeads, validate(createLeadSchema), leadController.create);
router.get('/:id', canViewLeads, leadController.getOne);
router.patch('/:id', canManageLeads, validate(updateLeadSchema), leadController.update);
router.delete('/:id', requireRoleOrPermission(['super_admin', 'admin']), leadController.remove);
router.post('/:id/notes', canManageLeads, leadController.addNote);
router.post('/:id/convert', canManageLeads, leadController.convert);

export default router;
