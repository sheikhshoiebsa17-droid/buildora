import PurchaseRequest from '../models/PurchaseRequest.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const buildItems = (raw = []) =>
  raw.map((it) => ({
    description: it.description,
    quantity: it.quantity,
    unit: it.unit,
    rate: it.rate || 0,
    estimated: (it.quantity * (it.rate || 0)) || 0,
  }));

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'project'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ notes: rx }];
    }
    const [items, total] = await Promise.all([
      PurchaseRequest.find(query).sort(sort).skip(skip).limit(limit).populate('project', 'name code').populate('vendor', 'name').lean(),
      PurchaseRequest.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const pr = await PurchaseRequest.create({
      organization: req.user.organization,
      project: req.body.project || undefined,
      vendor: req.body.vendor || undefined,
      items: buildItems(req.body.items),
      requiredBy: req.body.requiredBy ? new Date(req.body.requiredBy) : undefined,
      notes: req.body.notes || '',
      status: 'draft',
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: pr });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const pr = await PurchaseRequest.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('project', 'name code')
      .populate('vendor', 'name email phone');
    if (!pr) return res.fail('Purchase request not found', 404);
    res.ok({ data: pr });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const pr = await PurchaseRequest.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!pr) return res.fail('Purchase request not found', 404);
    if (!['draft', 'rejected'].includes(pr.status)) {
      return res.fail('Only draft or rejected requests can be edited.', 409);
    }
    if (req.body.items) pr.items = buildItems(req.body.items);
    if (req.body.project !== undefined) pr.project = req.body.project || undefined;
    if (req.body.vendor !== undefined) pr.vendor = req.body.vendor || undefined;
    if (req.body.notes !== undefined) pr.notes = req.body.notes;
    if (req.body.requiredBy) pr.requiredBy = new Date(req.body.requiredBy);
    pr.updatedBy = req.user._id;
    await pr.save();
    res.ok({ data: pr });
  } catch (err) {
    next(err);
  }
}

export async function submit(req, res, next) {
  try {
    const pr = await PurchaseRequest.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!pr) return res.fail('Purchase request not found', 404);
    if (pr.status !== 'draft') return res.fail('Only draft requests can be submitted.', 409);
    if (!pr.items.length) return res.fail('Add at least one item before submitting.', 400);
    pr.status = 'submitted';
    pr.submittedAt = new Date();
    pr.updatedBy = req.user._id;
    await pr.save();
    res.ok({ data: pr, message: 'Purchase request submitted for quotation.' });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const pr = await PurchaseRequest.findOneAndDelete({
      _id: req.params.id,
      organization: req.user.organization,
      status: { $in: ['draft', 'rejected'] },
    });
    if (!pr) return res.fail('Only draft or rejected requests can be deleted.', 409);
    res.ok({ data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}
