import Money from '../models/Money.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort, search } = buildListQuery(req, {
      allowedFilters: ['type', 'category', 'project'],
    });
    const query = { organization: req.user.organization, ...filter };
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.description = rx;
    }
    const [items, total] = await Promise.all([
      Money.find(query).sort(sort).skip(skip).limit(limit).populate('project', 'name code').lean(),
      Money.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const entry = await Money.create({
      organization: req.user.organization,
      type: req.body.type,
      category: req.body.category,
      amount: req.body.amount,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      project: req.body.project || undefined,
      description: req.body.description || '',
      spentBy: req.user._id,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: entry });
  } catch (err) {
    next(err);
  }
}
