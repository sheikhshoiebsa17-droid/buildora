import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { validate } from '../middleware/validate.js';
import { createProjectSchema, updateProjectSchema, createTaskSchema, updateTaskSchema } from '../validators/projectValidators.js';
import * as taskController from '../controllers/taskController.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'sales_manager', 'project_manager', 'designer',
  'procurement_manager', 'finance_manager', 'site_engineer',
]);
const canManage = requireRoleOrPermission(['super_admin', 'admin', 'project_manager']);
const siteStaff = requireRoleOrPermission(['super_admin', 'admin', 'project_manager', 'site_engineer']);

router.get('/', staff, projectController.list);
router.post('/', canManage, validate(createProjectSchema), projectController.create);
router.get('/:id', staff, projectController.getOne);
router.patch('/:id', canManage, validate(updateProjectSchema), projectController.update);
router.delete('/:id', requireRoleOrPermission(['super_admin', 'admin']), projectController.remove);
router.get('/:id/tasks', staff, taskController.listForProject);
router.post('/:id/tasks', siteStaff, validate(createTaskSchema), taskController.create);
router.patch('/:id/tasks/:taskId', siteStaff, validate(updateTaskSchema), taskController.update);

export default router;
