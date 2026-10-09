import AuditLog from '../models/AuditLog.js';

export const audit = async ({ req, action, target, details }) => {
  try {
    await AuditLog.create({
      organization: req.user?.organization || null,
      user: req.user?._id || null,
      action,
      target,
      details,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (err) {
    console.error('[audit] failed:', err.message);
  }
};
