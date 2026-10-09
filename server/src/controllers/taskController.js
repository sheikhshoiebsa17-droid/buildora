import Task from '../models/Task.js';
import { rollupProgress } from './projectController.js';

const FIELDS = ['title', 'description', 'status', 'priority', 'assignee', 'dueDate', 'startDate'];

const pick = (body) => {
  const out = {};
  for (const f of FIELDS) {
    if (body[f] !== undefined && body[f] !== '') out[f] = f === 'dueDate' || f === 'startDate' ? new Date(body[f]) : body[f];
  }
  if (body.progress !== undefined) out.progress = body.progress;
  return out;
};

export async function listForProject(req, res, next) {
  try {
    const tasks = await Task.find({ organization: req.user.organization, project: req.params.id })
      .populate('assignee', 'name')
      .sort({ dueDate: 1, createdAt: -1 })
      .lean();
    res.ok({ data: tasks });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const task = await Task.create({
      ...pick(req.body),
      organization: req.user.organization,
      project: req.params.id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await rollupProgress(req.user.organization, req.params.id);
    res.created({ data: task });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      project: req.params.id,
      organization: req.user.organization,
    });
    if (!task) return res.fail('Task not found', 404);
    Object.assign(task, pick(req.body));
    if (req.body.status === 'done') {
      task.progress = 100;
      task.completedAt = task.completedAt || new Date();
    }
    if (req.body.status && req.body.status !== 'done') task.completedAt = undefined;
    task.updatedBy = req.user._id;
    await task.save();
    await rollupProgress(req.user.organization, req.params.id);
    res.ok({ data: task });
  } catch (err) {
    next(err);
  }
}
