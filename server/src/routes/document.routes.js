import { Router } from 'express';
import * as documentController from '../controllers/documentController.js';
import { validate } from '../middleware/validate.js';
import { createDocumentSchema, updateDocumentSchema } from '../validators/documentValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';
import { upload } from '../middleware/upload.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'project_manager', 'designer', 'site_engineer', 'finance_manager', 'sales_manager',
]);

router.get('/', staff, documentController.list);
router.post('/', staff, upload.single('file'), validate(createDocumentSchema), documentController.create);
router.get('/:id', staff, documentController.getOne);
router.patch('/:id', staff, validate(updateDocumentSchema), documentController.update);
router.get('/:id/download', staff, documentController.download);

export default router;
