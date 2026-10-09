import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { audit } from './audit.js';

const addResponseHelpers = (req, res, next) => {
  res.ok = (payload = {}) => {
    const body = { success: true, ...payload };
    if (res.user) delete res.user.password;
    if (res.locals.user) body.data = (body.data && typeof body.data === 'object') ? body.data : res.locals.user;
    res.status(res.statusCode >= 400 ? res.statusCode : 200).json(body);
  };
  res.created = (payload = {}) => {
    const data = payload.data ?? (res.user ? res.user.toPublicJSON() : payload);
    res.status(201).json({ success: true, data });
  };
  res.fail = (message, status = 400, extra = {}) => {
    res.status(status).json({ success: false, message, ...extra });
  };
  next();
};

const requireAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[config.cookieName] || (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.fail('Authentication required.', 401);
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).populate('organization');
    if (!user) return res.fail('Authentication required.', 401);
    req.user = user;
    res.locals.user = user.toPublicJSON();
    next();
  } catch {
    return res.fail('Session expired or invalid. Please sign in again.', 401);
  }
};

const optionalAuth = async (req, res, next) => {
  const token = req.cookies?.[config.cookieName] || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return next();
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(payload.sub).populate('organization');
    if (user) {
      req.user = user;
      res.locals.user = user.toPublicJSON();
    }
  } catch {
    /* anonymous */
  }
  next();
};

const requireRoleOrPermission = (roles) => (req, res, next) => {
  if (!req.user) return res.fail('Authentication required.', 401);
  const userRoles = Array.isArray(roles) ? roles : [roles];
  if (!userRoles.includes(req.user.role)) {
    return res.fail('You do not have permission to perform this action.', 403);
  }
  next();
};

const httpLogger = (req, res, next) => {
  res.on('finish', () => {
    const line = `${req.method} ${req.originalUrl} → ${res.statusCode}`;
    if (res.statusCode >= 400) console.log(line);
  });
  next();
};

const attachRequestContext = (req, res, next) => {
  req.id = req.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  req.audit = audit;
  next();
};

export { addResponseHelpers, requireAuth, optionalAuth, requireRoleOrPermission, httpLogger, attachRequestContext };
