import PurchaseOrder from '../models/PurchaseOrder.js';
import InventoryItem from '../models/InventoryItem.js';
import Organization from '../models/Organization.js';
import { computeTotals } from '../utils/money.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

const buildItems = (raw = []) =>
  raw.map((it) => ({
    description: it.description,
    quantity: it.quantity,
    unit: it.unit || 'nos',
    rate: it.rate,
    discountPercent: it.discountPercent || 0,
    gstPercent: it.gstPercent ?? 18,
  }));

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['status', 'vendor', 'project'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.poNumber = rx;
    }
    const [items, total] = await Promise.all([
      PurchaseOrder.find(query).sort(sort).skip(skip).limit(limit).populate('vendor', 'name').populate('project', 'name code').lean(),
      PurchaseOrder.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const org = await Organization.findById(req.user.organization);
    const count = await PurchaseOrder.countDocuments({ organization: req.user.organization });
    const items = buildItems(req.body.items);
    const totals = computeTotals(items);
    const po = await PurchaseOrder.create({
      organization: req.user.organization,
      poNumber: `${org?.settings?.poPrefix || 'PO'}-${String(count + 1).padStart(4, '0')}`,
      project: req.body.project || undefined,
      vendor: req.body.vendor,
      request: req.body.request || undefined,
      items,
      expectedDate: req.body.expectedDate ? new Date(req.body.expectedDate) : undefined,
      status: 'draft',
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: po });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization })
      .populate('vendor', 'name email phone address')
      .populate('project', 'name code')
      .populate('approvals.actor', 'name');
    if (!po) return res.fail('Purchase order not found', 404);
    res.ok({ data: po });
  } catch (err) {
    next(err);
  }
}

const pushHistory = (po, status, note, actor) => {
  po.statusHistory.push({ status, note, at: new Date(), actor });
};

export async function update(req, res, next) {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!po) return res.fail('Purchase order not found', 404);
    if (!['draft', 'rejected'].includes(po.status)) {
      return res.fail('Approved purchase orders cannot be edited. Cancel and raise a new PO instead.', 409);
    }
    if (req.body.items) po.items = buildItems(req.body.items);
    if (req.body.vendor) po.vendor = req.body.vendor;
    if (req.body.project !== undefined) po.project = req.body.project || undefined;
    if (req.body.expectedDate) po.expectedDate = new Date(req.body.expectedDate);
    po.updatedBy = req.user._id;
    await po.save();
    res.ok({ data: po });
  } catch (err) {
    next(err);
  }
}

export async function submitForApproval(req, res, next) {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!po) return res.fail('Purchase order not found', 404);
    if (po.status !== 'draft') return res.fail('Only draft POs can be submitted for approval.', 409);
    if (!po.items.length) return res.fail('Add at least one item before submitting.', 400);
    po.status = 'pending_approval';
    pushHistory(po, 'pending_approval', 'Submitted for approval', req.user._id);
    po.updatedBy = req.user._id;
    await po.save();
    res.ok({ data: po, message: 'Submitted for approval.' });
  } catch (err) {
    next(err);
  }
}

export async function approve(req, res, next) {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!po) return res.fail('Purchase order not found', 404);
    if (po.status !== 'pending_approval') return res.fail('Only POs pending approval can be approved.', 409);
    po.status = 'approved';
    po.approvals.push({ status: 'approved', note: String(req.body?.note || ''), at: new Date(), actor: req.user._id });
    pushHistory(po, 'approved', req.body?.note || `Approved by ${req.user.name}`, req.user._id);
    po.updatedBy = req.user._id;
    await po.save();
    res.ok({ data: po, message: 'Purchase order approved.' });
  } catch (err) {
    next(err);
  }
}

export async function reject(req, res, next) {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!po) return res.fail('Purchase order not found', 404);
    if (po.status !== 'pending_approval') return res.fail('Only POs pending approval can be rejected.', 409);
    po.status = 'rejected';
    pushHistory(po, 'rejected', req.body?.note || `Rejected by ${req.user.name}`, req.user._id);
    po.updatedBy = req.user._id;
    await po.save();
    res.ok({ data: po, message: 'Purchase order rejected.' });
  } catch (err) {
    next(err);
  }
}

export async function receive(req, res, next) {
  try {
    const po = await PurchaseOrder.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!po) return res.fail('Purchase order not found', 404);
    if (po.status !== 'approved') return res.fail('Only approved POs can receive goods.', 409);
    const received = req.body?.items;
    if (!Array.isArray(received) || !received.length) return res.fail('Provide received item quantities.', 400);

    for (const line of received) {
      const poItem = po.items.id(line.itemId);
      if (!poItem) {
        return res.fail(`Item ${line.itemId} not found on this PO.`, 400);
      }
      const qty = Number(line.quantity);
      if (!Number.isFinite(qty) || qty <= 0) {
        return res.fail('Received quantities must be greater than zero.', 400);
      }
      // Update / create stock
      const existing = await InventoryItem.findOne({
        organization: req.user.organization,
        sku: `PO-${po.poNumber}-${line.itemId}`,
      });
      if (existing) {
        existing.quantity += qty;
        existing.movements.push({ type: 'in', quantity: qty, reason: `Goods receipt ${po.poNumber}`, actor: req.user._id });
        existing.updatedBy = req.user._id;
        await existing.save();
      } else {
        await InventoryItem.create({
          organization: req.user.organization,
          sku: `PO-${po.poNumber}-${line.itemId}`,
          name: poItem.description,
          category: 'procurement',
          unit: poItem.unit,
          quantity: qty,
          reorderLevel: 0,
          unitPrice: poItem.rate,
          movements: [{ type: 'in', quantity: qty, reason: `Goods receipt ${po.poNumber}`, actor: req.user._id }],
          createdBy: req.user._id,
        });
      }
    }
    po.status = 'received';
    pushHistory(po, 'received', 'Goods received', req.user._id);
    po.updatedBy = req.user._id;
    await po.save();
    res.ok({ data: po, message: 'Goods receipt recorded and inventory updated.' });
  } catch (err) {
    next(err);
  }
}
