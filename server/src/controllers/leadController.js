import Lead from '../models/Lead.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const EDITABLE_FIELDS = [
  'name', 'email', 'phone', 'source', 'interest', 'city', 'estimateValue',
  'status', 'priority', 'assignedTo', 'followUpDate',
];

const buildData = (user, body) => {
  const data = {};
  for (const f of EDITABLE_FIELDS) {
    if (body[f] !== undefined) {
      data[f] = f === 'followUpDate' && body[f] ? new Date(body[f]) : body[f];
    }
  }
  data.createdBy = user._id;
  data.updatedBy = user._id;
  return data;
};

const pushActivity = (lead, type, detail, actor) => {
  lead.activity.push({ type, detail, actor });
};

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'priority', 'assignedTo', 'customerId'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { email: rx }, { phone: rx }, { interest: rx }, { city: rx }];
    }
    const [items, total] = await Promise.all([
      Lead.find(query).sort(sort).skip(skip).limit(limit).populate('assignedTo', 'name').lean(),
      Lead.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const lead = await Lead.create({ ...buildData(req.user, req.body), organization: req.user.organization });
    res.created({ data: lead });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('assignedTo', 'name email')
      .populate('customerId', 'name email');
    if (!lead) return res.fail('Lead not found', 404);
    res.ok({ data: lead });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!lead) return res.fail('Lead not found', 404);
    const previousStatus = lead.status;
    for (const f of EDITABLE_FIELDS) {
      if (req.body[f] !== undefined) lead[f] = f === 'followUpDate' && req.body[f] ? new Date(req.body[f]) : req.body[f];
    }
    if (req.body.note) lead.notes.push({ body: req.body.note, author: req.user._id });
    if (req.body.status && req.body.status !== previousStatus) {
      pushActivity(lead, 'status_change', `Status changed from ${previousStatus} to ${req.body.status}`, req.user._id);
    }
    lead.updatedBy = req.user._id;
    await lead.save();
    res.ok({ data: lead });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const lead = await Lead.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!lead) return res.fail('Lead not found', 404);
    res.ok({ data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

export async function addNote(req, res, next) {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!lead) return res.fail('Lead not found', 404);
    const { body } = req.body;
    if (!body || !String(body).trim()) return res.fail('Note text is required', 400);
    lead.notes.push({ body: String(body).trim(), author: req.user._id });
    pushActivity(lead, 'note', 'Note added', req.user._id);
    lead.updatedBy = req.user._id;
    await lead.save();
    res.created({ data: lead.notes[lead.notes.length - 1] });
  } catch (err) {
    next(err);
  }
}

export async function convert(req, res, next) {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!lead) return res.fail('Lead not found', 404);
    if (lead.status === 'won') return res.fail('Lead has already been converted', 400);

    const customer = await Customer.create({
      organization: req.user.organization,
      name: lead.name,
      email: lead.email || undefined,
      phone: lead.phone || undefined,
      city: lead.city,
      createdBy: req.user._id,
    });

    const project = await Project.create({
      organization: req.user.organization,
      code: `PRJ-${Date.now().toString(36).toUpperCase()}`,
      name: `${lead.name} — ${lead.interest || 'New Project'}`,
      type: 'interior',
      customer: customer._id,
      status: 'planning',
      description: `Auto-created from converted lead "${lead.name}".`,
      createdBy: req.user._id,
    });

    lead.status = 'won';
    lead.customerId = customer._id;
    lead.projectId = project._id;
    pushActivity(lead, 'conversion', `Converted to customer ${customer.name}`, req.user._id);
    lead.updatedBy = req.user._id;
    await lead.save();

    res.ok({
      data: { customer, project, lead },
      message: 'Lead converted successfully.',
    });
  } catch (err) {
    next(err);
  }
}
