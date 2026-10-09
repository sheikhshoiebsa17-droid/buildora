import Vendor from '../models/Vendor.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const FIELDS = ['name', 'contactPerson', 'email', 'phone', 'address', 'gstin', 'rating', 'status', 'categories', 'specialties', 'notes'];

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { email: rx }, { contactPerson: rx }];
    }
    const [items, total] = await Promise.all([
      Vendor.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Vendor.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const payload = {};
    for (const f of FIELDS) if (req.body[f] !== undefined && req.body[f] !== '') payload[f] = req.body[f];
    payload.createdBy = req.user._id;
    payload.updatedBy = req.user._id;
    const vendor = await Vendor.create({ ...payload, organization: req.user.organization });
    res.created({ data: vendor });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, organization: req.user.organization }).lean();
    if (!vendor) return res.fail('Vendor not found', 404);
    res.ok({ data: vendor });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const vendor = await Vendor.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!vendor) return res.fail('Vendor not found', 404);
    for (const f of FIELDS) if (req.body[f] !== undefined) vendor[f] = req.body[f];
    vendor.updatedBy = req.user._id;
    await vendor.save();
    res.ok({ data: vendor });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const vendor = await Vendor.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!vendor) return res.fail('Vendor not found', 404);
    res.ok({ data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}
