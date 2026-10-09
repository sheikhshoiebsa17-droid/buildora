import VendorBill from '../models/VendorBill.js';
import { computeTotals } from '../utils/money.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const buildItems = (raw = []) =>
  raw.map((it) => ({
    description: it.description,
    quantity: it.quantity,
    rate: it.rate,
    gstPercent: it.gstPercent ?? 18,
  }));

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'vendor'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ billNumber: rx }];
    }
    const [items, total] = await Promise.all([
      VendorBill.find(query).sort(sort).skip(skip).limit(limit).populate('vendor', 'name').lean(),
      VendorBill.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    if (!req.body.items?.length) return res.fail('Add at least one bill line item.', 400);
    const items = buildItems(req.body.items);
    const { subtotal } = computeTotals(items);
    const bill = await VendorBill.create({
      organization: req.user.organization,
      billNumber: req.body.billNumber || '',
      vendor: req.body.vendor,
      purchaseOrder: req.body.purchaseOrder || undefined,
      items,
      total: subtotal,
      status: req.body.status || 'pending',
      issueDate: req.body.issueDate ? new Date(req.body.issueDate) : undefined,
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: bill });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const bill = await VendorBill.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('vendor', 'name email phone');
    if (!bill) return res.fail('Vendor bill not found', 404);
    res.ok({ data: bill });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const bill = await VendorBill.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!bill) return res.fail('Vendor bill not found', 404);
    if (req.body.items) {
      bill.items = buildItems(req.body.items);
      const { subtotal } = computeTotals(bill.items);
      bill.total = subtotal;
    }
    if (req.body.vendor) bill.vendor = req.body.vendor;
    if (req.body.status) bill.status = req.body.status;
    if (req.body.dueDate) bill.dueDate = new Date(req.body.dueDate);
    bill.updatedBy = req.user._id;
    await bill.save();
    res.ok({ data: bill });
  } catch (err) {
    next(err);
  }
}
