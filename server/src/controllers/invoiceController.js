import Invoice from '../models/Invoice.js';
import Organization from '../models/Organization.js';
import { computeTotals, round2 } from '../utils/money.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const buildItems = (raw = []) =>
  raw.map((it) => ({
    description: it.description,
    quantity: it.quantity,
    rate: it.rate,
    discountPercent: it.discountPercent || 0,
    gstPercent: it.gstPercent ?? 18,
  }));

const deriveStatus = (invoice) => {
  if (invoice.status === 'cancelled' || invoice.status === 'draft') return invoice.status;
  if (invoice.amountPaid >= invoice.total && invoice.total > 0) return 'paid';
  if (invoice.amountPaid > 0) return 'partially_paid';
  if (invoice.dueDate && new Date(invoice.dueDate) < new Date()) return 'overdue';
  return invoice.status === 'pending' ? 'pending' : invoice.status;
};

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'customer', 'project'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ number: rx }, { milestone: rx }];
    }
    const [items, total] = await Promise.all([
      Invoice.find(query).sort(sort).skip(skip).limit(limit).populate('customer', 'name').populate('project', 'name code').lean(),
      Invoice.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    if (!req.body.items?.length) return res.fail('Add at least one invoice line item.', 400);
    const org = await Organization.findById(req.user.organization);
    const count = await Invoice.countDocuments({ organization: req.user.organization });
    const items = buildItems(req.body.items);
    const totals = computeTotals(items);
    const invoice = await Invoice.create({
      organization: req.user.organization,
      number: `${org?.settings?.invoicePrefix || 'INV'}-${String(count + 1).padStart(4, '0')}`,
      project: req.body.project || undefined,
      customer: req.body.customer,
      milestone: req.body.milestone || '',
      items,
      subtotal: totals.subtotal,
      gstTotal: totals.gstTotal,
      total: totals.total,
      amountPaid: 0,
      status: req.body.status || 'pending',
      issueDate: req.body.issueDate ? new Date(req.body.issueDate) : new Date(),
      dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
      notes: req.body.notes || '',
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('customer', 'name email phone')
      .populate('project', 'name code')
      .populate('payments.recordedBy', 'name');
    if (!invoice) return res.fail('Invoice not found', 404);
    res.ok({ data: invoice, balanceDue: round2(invoice.total - (invoice.amountPaid || 0)) });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!invoice) return res.fail('Invoice not found', 404);
    if (invoice.amountPaid > 0) {
      return res.fail('Invoices with recorded payments cannot be edited. Cancel and re-issue instead.', 409);
    }
    if (req.body.items) {
      invoice.items = buildItems(req.body.items);
      const totals = computeTotals(invoice.items);
      invoice.subtotal = totals.subtotal;
      invoice.gstTotal = totals.gstTotal;
      invoice.total = totals.total;
    }
    for (const f of ['milestone', 'notes']) {
      if (req.body[f] !== undefined) invoice[f] = req.body[f];
    }
    if (req.body.dueDate) invoice.dueDate = new Date(req.body.dueDate);
    if (req.body.customer) invoice.customer = req.body.customer;
    if (req.body.project !== undefined) invoice.project = req.body.project || undefined;
    invoice.status = deriveStatus(invoice);
    invoice.updatedBy = req.user._id;
    await invoice.save();
    res.ok({ data: invoice });
  } catch (err) {
    next(err);
  }
}

export async function recordPayment(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!invoice) return res.fail('Invoice not found', 404);
    if (invoice.status === 'cancelled') return res.fail('Cannot record payments against a cancelled invoice.', 409);
    const balance = round2(invoice.total - (invoice.amountPaid || 0));
    if (req.body.amount > balance + 0.001) {
      return res.fail(`Payment exceeds balance due (₹${balance.toFixed(2)}).`, 400);
    }
    invoice.payments.push({
      amount: round2(req.body.amount),
      mode: req.body.mode || 'bank_transfer',
      reference: req.body.reference || '',
      paidOn: req.body.paidOn ? new Date(req.body.paidOn) : new Date(),
      recordedBy: req.user._id,
    });
    invoice.amountPaid = round2((invoice.amountPaid || 0) + req.body.amount);
    invoice.status = deriveStatus(invoice);
    invoice.updatedBy = req.user._id;
    await invoice.save();
    res.ok({ data: invoice, balanceDue: round2(invoice.total - invoice.amountPaid) });
  } catch (err) {
    next(err);
  }
}

export async function cancel(req, res, next) {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!invoice) return res.fail('Invoice not found', 404);
    if (invoice.amountPaid > 0) return res.fail('Invoices with payments cannot be cancelled. Issue a credit note workflow instead.', 409);
    invoice.status = 'cancelled';
    invoice.updatedBy = req.user._id;
    await invoice.save();
    res.ok({ data: invoice });
  } catch (err) {
    next(err);
  }
}
