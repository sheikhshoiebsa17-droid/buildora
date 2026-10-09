import Design from '../models/Design.js';
import Project from '../models/Project.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'projectId', 'customer'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: rx }, { room: rx }, { scope: rx }];
    }
    const [items, total] = await Promise.all([
      Design.find(query).sort(sort).skip(skip).limit(limit).populate('projectId', 'name code').lean(),
      Design.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const project = await Project.findOne({ _id: req.body.projectId, organization: req.user.organization });
    if (!project) return res.fail('Project not found', 404);
    const design = await Design.create({
      organization: req.user.organization,
      projectId: project._id,
      customer: project.customer,
      title: req.body.title,
      room: req.body.room || '',
      scope: req.body.scope || '',
      notes: req.body.notes || '',
      versions: [{ version: 1, label: 'Initial concept', createdBy: req.user._id, sentForApproval: false }],
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: design });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const design = await Design.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('projectId', 'name code customer')
      .populate('customer', 'name email');
    if (!design) return res.fail('Design not found', 404);
    res.ok({ data: design });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const design = await Design.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!design) return res.fail('Design not found', 404);
    for (const f of ['title', 'room', 'scope', 'notes']) {
      if (req.body[f] !== undefined) design[f] = req.body[f];
    }
    if (req.body.projectId) design.projectId = req.body.projectId;
    design.updatedBy = req.user._id;
    await design.save();
    res.ok({ data: design });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const design = await Design.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!design) return res.fail('Design not found', 404);
    res.ok({ data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

export async function newVersion(req, res, next) {
  try {
    const design = await Design.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!design) return res.fail('Design not found', 404);
    const label = req.body.label || `Revision ${design.versions.length + 1}`;
    design.versions.push({
      version: design.versions.length + 1,
      label,
      notes: req.body.notes || '',
      sentForApproval: !!req.body.sendForApproval,
      createdBy: req.user._id,
    });
    if (req.body.sendForApproval) design.status = 'sent';
    else if (design.status !== 'client_approved') design.status = 'draft';
    design.updatedBy = req.user._id;
    await design.save();
    res.ok({ data: design });
  } catch (err) {
    next(err);
  }
}

export async function clientRespond(req, res, next) {
  try {
    const design = await Design.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!design) return res.fail('Design not found', 404);
    const idx = req.body.versionIndex ?? design.versions.length - 1;
    const version = design.versions[idx];
    if (!version) return res.fail('Version not found', 404);
    version.approvedByClient = req.body.decision === 'approved';
    version.respondedAt = new Date();
    version.responseNote = req.body.note || '';
    if (req.body.decision === 'approved') {
      design.status = 'client_approved';
    } else if (req.body.decision === 'changes_requested') {
      design.status = 'changes_requested';
    } else {
      design.status = 'rejected';
    }
    design.updatedBy = req.user._id;
    await design.save();
    res.ok({ data: design });
  } catch (err) {
    next(err);
  }
}
