import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const FIELDS = [
  'name', 'code', 'type', 'customer', 'manager', 'siteAddress', 'city',
  'status', 'startDate', 'targetDate', 'description',
];

const pick = (body, fields) => {
  const out = {};
  for (const f of fields) {
    if (body[f] !== undefined && body[f] !== '') {
      if (f === 'startDate' || f === 'targetDate') out[f] = new Date(body[f]);
      else if (f === 'customer' || f === 'manager') {
        if (body[f]) out[f] = body[f];
      } else out[f] = body[f];
    }
  }
  return out;
};

const rollupProgress = async (orgId, projectId) => {
  const tasks = await Task.find({ organization: orgId, project: projectId }).lean();
  if (!tasks.length) return;
  const avg = Math.round(tasks.reduce((s, t) => s + (t.progress ?? (t.status === 'done' ? 100 : 0)), 0) / tasks.length);
  await Project.updateOne({ _id: projectId, organization: orgId }, { progress: avg });
};

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'type', 'customer', 'manager'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { code: rx }, { city: rx }];
    }
    const [items, total] = await Promise.all([
      Project.find(query).sort(sort).skip(skip).limit(limit).populate('customer', 'name').populate('manager', 'name').lean(),
      Project.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const payload = pick(req.body, FIELDS);
    const count = await Project.countDocuments({ organization: req.user.organization });
    payload.code = req.body.code || `PRJ-${String(count + 1).padStart(4, '0')}`;
    if (req.body.budget?.allocated !== undefined) payload.budget = { allocated: req.body.budget.allocated, spent: 0 };
    payload.createdBy = req.user._id;
    payload.updatedBy = req.user._id;
    const project = await Project.create({ ...payload, organization: req.user.organization });
    res.created({ data: project });
  } catch (err) {
    if (err.code === 11000) return next(Object.assign(err, { status: 409, userMessage: 'A project with this code already exists.' }));
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('customer', 'name email phone')
      .populate('manager', 'name email')
      .populate('team', 'name role')
      .lean();
    if (!project) return res.fail('Project not found', 404);
    const tasks = await Task.find({ organization: req.user.organization, project: project._id })
      .populate('assignee', 'name')
      .lean();
    const taskStats = {
      total: tasks.length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter((t) => t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date()).length,
    };
    res.ok({ data: { ...project, tasks, taskStats } });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!project) return res.fail('Project not found', 404);
    Object.assign(project, pick(req.body, FIELDS));
    if (req.body.budget?.allocated !== undefined) project.budget.allocated = req.body.budget.allocated;
    project.updatedBy = req.user._id;
    await project.save();
    res.ok({ data: project });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const project = await Project.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!project) return res.fail('Project not found', 404);
    await Task.deleteMany({ organization: req.user.organization, project: project._id });
    res.ok({ data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

export { rollupProgress };
