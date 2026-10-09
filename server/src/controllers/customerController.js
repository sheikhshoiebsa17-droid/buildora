import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const FIELDS = ['name', 'email', 'phone', 'address', 'city', 'status', 'notes'];

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'city'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { email: rx }, { phone: rx }, { city: rx }];
    }
    const [items, total] = await Promise.all([
      Customer.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Customer.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    if (req.body.phone) {
      const dup = await Customer.findOne({ organization: req.user.organization, phone: req.body.phone });
      if (dup) return res.fail('A customer with this phone number already exists.', 409);
    }
    const payload = {};
    for (const f of FIELDS) if (req.body[f] !== undefined && req.body[f] !== '') payload[f] = req.body[f];
    payload.createdBy = req.user._id;
    payload.updatedBy = req.user._id;
    const customer = await Customer.create({ ...payload, organization: req.user.organization });
    res.created({ data: customer });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, organization: req.user.organization }).lean();
    if (!customer) return res.fail('Customer not found', 404);
    const projects = await Project.find({ organization: req.user.organization, customer: customer._id })
      .select('name status progress budget')
      .lean();
    res.ok({ data: { ...customer, projects } });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!customer) return res.fail('Customer not found', 404);
    for (const f of FIELDS) if (req.body[f] !== undefined && req.body[f] !== '') customer[f] = req.body[f];
    customer.updatedBy = req.user._id;
    await customer.save();
    res.ok({ data: customer });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, organization: req.user.organization });
    if (!customer) return res.fail('Customer not found', 404);
    res.ok({ data: { id: req.params.id } });
  } catch (err) {
    next(err);
  }
}

export async function addNote(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!customer) return res.fail('Customer not found', 404);
    const text = String(req.body.body || '').trim();
    if (!text) return res.fail('Note text is required', 400);
    customer.notes = customer.notes ? `${customer.notes}\n[${new Date().toLocaleDateString()}] ${text}` : text;
    customer.updatedBy = req.user._id;
    await customer.save();
    res.ok({ data: customer });
  } catch (err) {
    next(err);
  }
}
