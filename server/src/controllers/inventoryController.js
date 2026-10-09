import InventoryItem from '../models/InventoryItem.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['category'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ name: rx }, { sku: rx }];
    }
    const [items, total] = await Promise.all([
      InventoryItem.find(query).sort(sort).skip(skip).limit(limit).lean(),
      InventoryItem.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function alerts(req, res, next) {
  try {
    const items = await InventoryItem.find({
      organization: req.user.organization,
      $expr: { $lte: ['$quantity', '$reorderLevel'] },
      reorderLevel: { $gt: 0 },
    }).lean();
    res.ok({ data: items });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const dup = await InventoryItem.findOne({ organization: req.user.organization, sku: req.body.sku });
    if (dup) return res.fail('An item with this SKU already exists.', 409);
    const payload = {};
    for (const f of ['sku', 'name', 'category', 'unit', 'quantity', 'reorderLevel', 'unitPrice', 'warehouseLocation']) {
      if (req.body[f] !== undefined && req.body[f] !== '') payload[f] = req.body[f];
    }
    payload.movements = payload.quantity
      ? [{ type: 'in', quantity: payload.quantity, reason: 'Opening stock', actor: req.user._id }]
      : [];
    payload.createdBy = req.user._id;
    const item = await InventoryItem.create({ ...payload, organization: req.user.organization });
    res.created({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req, res, next) {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, organization: req.user.organization }).lean();
    if (!item) return res.fail('Inventory item not found', 404);
    item.movements = (item.movements || []).slice(-50).reverse();
    res.ok({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!item) return res.fail('Inventory item not found', 404);
    for (const f of ['name', 'category', 'unit', 'reorderLevel', 'unitPrice', 'warehouseLocation']) {
      if (req.body[f] !== undefined && req.body[f] !== '') item[f] = req.body[f];
    }
    item.updatedBy = req.user._id;
    await item.save();
    res.ok({ data: item });
  } catch (err) {
    next(err);
  }
}

export async function addMovement(req, res, next) {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, organization: req.user.organization });
    if (!item) return res.fail('Inventory item not found', 404);
    const qty = req.body.quantity;
    if (req.body.type === 'out' && qty > item.quantity) {
      return res.fail(`Insufficient stock: only ${item.quantity} ${item.unit || 'units'} available.`, 409);
    }
    item.movements.push({
      type: req.body.type,
      quantity: qty,
      reason: req.body.reason || (req.body.type === 'in' ? 'Stock in' : 'Stock out'),
      actor: req.user._id,
    });
    item.quantity = req.body.type === 'in' ? item.quantity + qty : item.quantity - qty;
    item.updatedBy = req.user._id;
    await item.save();
    res.ok({ data: item });
  } catch (err) {
    next(err);
  }
}
