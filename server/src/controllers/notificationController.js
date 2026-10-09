import Notification from '../models/Notification.js';
import { pageMeta, buildListQuery } from '../utils/query.js';

export async function list(req, res, next) {
  try {
    const { page, limit, skip, sort } = buildListQuery(req, {});
    const query = {
      organization: req.user.organization,
      recipients: req.user._id,
    };
    const [items, total] = await Promise.all([
      Notification.find(query).sort(sort).skip(skip).limit(limit).lean(),
      Notification.countDocuments(query),
    ]);
    const data = items.map((n) => ({
      ...n,
      read: (n.readBy || []).some((r) => String(r.userId) === String(req.user._id)),
    }));
    res.ok({ data, meta: pageMeta(total, page, limit) });
  } catch (err) {
    next(err);
  }
}

export async function markRead(req, res, next) {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      organization: req.user.organization,
      recipients: req.user._id,
    });
    if (!notification) return res.fail('Notification not found', 404);
    if (!notification.readBy.some((r) => String(r.userId) === String(req.user._id))) {
      notification.readBy.push({ userId: req.user._id });
      await notification.save();
    }
    res.ok({ data: { id: notification._id, read: true } });
  } catch (err) {
    next(err);
  }
}

export async function markAllRead(req, res, next) {
  try {
    await Notification.updateMany(
      { organization: req.user.organization, recipients: req.user._id },
      { $addToSet: { readBy: { userId: req.user._id, readAt: new Date() } } }
    );
    res.ok({ data: { read: true } });
  } catch (err) {
    next(err);
  }
}
