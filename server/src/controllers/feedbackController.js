import CustomerFeedback from '../models/CustomerFeedback.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

export async function list(req, res, next) {
  try {
    const { filter, page, limit, skip, sort } = buildListQuery(req, {
      allowedFilters: ['project', 'customer'],
    });
    const query = { organization: req.user.organization, ...filter };
    const [items, total] = await Promise.all([
      CustomerFeedback.find(query).sort(sort).skip(skip).limit(limit)
        .populate('customer', 'name').populate('project', 'name code').lean(),
      CustomerFeedback.countDocuments(query),
    ]);
    res.ok({ data: items, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const fb = await CustomerFeedback.create({
      organization: req.user.organization,
      customer: req.body.customer || undefined,
      project: req.body.project || undefined,
      rating: req.body.rating,
      title: req.body.title,
      message: req.body.message || '',
      reviewer: req.body.reviewer || req.user.name,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    res.created({ data: fb });
  } catch (err) {
    next(err);
  }
}
