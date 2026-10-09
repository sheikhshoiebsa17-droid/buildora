import { Router } from 'express';
import Task from '../models/Task.js';
import { requireRoleOrPermission } from '../middleware/context.js';

const router = Router({ mergeParams: true });

const staff = requireRoleOrPermission([
  'super_admin', 'admin', 'sales_manager', 'project_manager', 'designer',
  'procurement_manager', 'finance_manager', 'site_engineer',
]);

router.get('/', staff, async (req, res, next) => {
  try {
    const tasks = await Task.find({ organization: req.user.organization })
      .populate('project', 'name code')
      .populate('assignee', 'name')
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();
    res.ok({ data: tasks });
  } catch (err) {
    next(err);
  }
});

export default router;
