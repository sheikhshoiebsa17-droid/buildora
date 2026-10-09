import Estimate from '../models/Estimate.js';
import Notification from '../models/Notification.js';
import { computeTotals } from '../utils/money.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const buildItems = (rawItems = []) =>
  rawItems.map((it) => ({
    description: it.description,
    unit: it.unit,
    quantity: it.quantity,
    rate: it.rate,
    discountPercent: it.discountPercent || 0,
    gstPercent: it.gstPercent ?? 18,
  }));

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'project', 'customer'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ title: rx }, { notes: rx }];
    }
    const [items, total] = await Promise.all([
      Estimate.find(query).sort(sort).skip(skip).limit(limit).populate('project', 'name code').populate('customer', 'name').lean(),
      Estimate.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function calculate(req, res, next) {
  try {
    const totals = computeTotals(buildItems(req.body.items));
    res.ok({ data: totals });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const items = buildItems(req.body.items);
    const totals = computeTotals(items);
    const payload = {
      organization: req.user.organization,
      title: req.body.title,
      items,
      subtotal: totals.subtotal,
      gstTotal: totals.gstTotal,
      total: totals.total,
      status: req.body.status || 'draft',
      notes: req.body.notes || '',
      createdBy: req.user._id,
      updatedBy: req.user._id,
      version: 1,
    };
    if (req.body.project) payload.project = req.body.project;
    if (req.body.customer) payload.customer = req.body.customer;
    if (req.body.validUntil) payload.validUntil = new Date(req.body.validUntil);
    const estimate = await Estimate.create(payload);
    res.created({ data: estimate });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const estimate = await Estimate.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('project', 'name code')
      .populate('customer', 'name email phone')
      .populate('approvedBy', 'name');
    if (!estimate) return res.fail('Estimate not found', 404);
    res.ok({ data: estimate });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const estimate = await Estimate.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!estimate) return res.fail('Estimate not found', 404);
    if (!['draft', 'rejected', 'internal_review'].includes(estimate.status)) {
      return res.fail('Only draft, review or rejected estimates can be edited directly. Create a new version instead.', 409);
    }
    if (req.body.items) {
      estimate.items = buildItems(req.body.items);
      const totals = computeTotals(estimate.items);
      estimate.subtotal = totals.subtotal;
      estimate.gstTotal = totals.gstTotal;
      estimate.total = totals.total;
    }
    if (req.body.title) estimate.title = req.body.title;
    if (req.body.notes !== undefined) estimate.notes = req.body.notes;
    if (req.body.validUntil) estimate.validUntil = new Date(req.body.validUntil);
    estimate.updatedBy = req.user._id;
    await estimate.save();
    res.ok({ data: estimate });
  } catch (err) {
    next(err);
  }
}

export async function newVersion(req, res, next) {
  try {
    const source = await Estimate.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!source) return res.fail('Estimate not found', 404);
    if (source.status === 'client_approved') {
      return res.fail('Generate a revision from a non-approved estimate — approved estimates are locked.', 409);
    }
    const items = buildItems(req.body.items);
    const totals = computeTotals(items);
    const revision = {
      version: source.version,
      items: source.items,
      subtotal: source.subtotal,
      gstTotal: source.gstTotal,
      total: source.total,
      changedAt: new Date(),
      actor: req.user._id,
    };
    source.revisions.push(revision);
    source.items = items;
    source.subtotal = totals.subtotal;
    source.gstTotal = totals.gstTotal;
    source.total = totals.total;
    source.version += 1;
    source.status = 'draft';
    source.notes = req.body.notes !== undefined ? req.body.notes : source.notes;
    source.updatedBy = req.user._id;
    await source.save();
    res.ok({ data: source, message: `Revision v${source.version} created.` });
  } catch (err) {
    next(err);
  }
}

export async function markSent(req, res, next) {
  try {
    const estimate = await Estimate.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!estimate) return res.fail('Estimate not found', 404);
    if (estimate.items.length === 0) return res.fail('Add at least one item before sending.', 400);
    estimate.status = 'sent';
    estimate.sentAt = new Date();
    estimate.updatedBy = req.user._id;
    await estimate.save();

    if (estimate.customer) {
      await Notification.create({
        organization: req.user.organization,
        recipients: [],
        type: 'estimate_sent',
        title: 'Estimate awaiting your approval',
        body: `A new estimate “${estimate.title}” has been sent for your approval.`,
        link: `/portal/estimates/${estimate._id}`,
        createdBy: req.user._id,
      });
    }
    res.ok({ data: estimate });
  } catch (err) {
    next(err);
  }
}

export async function clientApprove(req, res, next) {
  try {
    const estimate = await Estimate.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!estimate) return res.fail('Estimate not found', 404);
    if (estimate.status !== 'sent') return res.fail('Only estimates sent to the client can be approved here.', 409);
    estimate.status = 'client_approved';
    estimate.approvedAt = new Date();
    estimate.approvedBy = req.user._id;
    estimate.updatedBy = req.user._id;
    await estimate.save();
    res.ok({ data: estimate });
  } catch (err) {
    next(err);
  }
}

export async function clientReject(req, res, next) {
  try {
    const estimate = await Estimate.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!estimate) return res.fail('Estimate not found', 404);
    if (estimate.status !== 'sent') return res.fail('Only estimates sent to the client can be rejected here.', 409);
    estimate.status = 'rejected';
    estimate.rejectionNote = String(req.body?.note || '').slice(0, 1000);
    estimate.updatedBy = req.user._id;
    await estimate.save();
    res.ok({ data: estimate });
  } catch (err) {
    next(err);
  }
}
