import AuditLog from '../models/AuditLog.js';

const sanitiseBody = (body = {}) => {
  const clone = { ...body };
  delete clone.password;
  return clone;
};

export async function logAction({ req, action, targetId, actorFrom = false }) {
  try {
    const actor = actorFrom ? req.user?._id : null;
    const organization = req.user?.organization || req.organization?._id || null;
    await AuditLog.create({
      organization,
      user: actor || req.user?._id || null,
      action,
      details: JSON.stringify(sanitiseBody(req.body)).slice(0, 2000),
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
    if (targetId) void targetId; // reserved for future target-kind routing
  } catch (err) {
    console.error('[audit] write failed:', err.message);
  }
}

export default logAction;
