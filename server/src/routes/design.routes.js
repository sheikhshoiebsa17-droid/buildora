import { Router } from 'express';
import * as designController from '../controllers/designController.js';
import { validate } from '../middleware/validate.js';
import { createDesignSchema, updateDesignSchema, versionDesignSchema, clientResponseSchema } from '../validators/designValidators.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'designer', 'project_manager', 'sales_manager', 'site_engineer',
]);
const designTeam = requireRoleOrPermission(['super_admin', 'admin', 'designer']);

router.get('/', staff, designController.list);
router.post('/', designTeam, validate(createDesignSchema), designController.create);
router.get('/:id', staff, designController.getOne);
router.patch('/:id', designTeam, validate(updateDesignSchema), designController.update);
router.delete('/:id', requireRoleOrPermission(['super_admin', 'admin']), designController.remove);
router.post('/:id/versions', designTeam, validate(versionDesignSchema), designController.newVersion);
router.post('/:id/respond', validate(clientResponseSchema), designController.clientRespond);

export default router;
