import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import { config } from '../config/env.js';
import { logAction } from '../services/auditService.js';

const cookieOptions = () => ({
  httpOnly: true,
  ...(config.cookieSecure ? { secure: true, sameSite: 'none' } : { sameSite: 'lax' }),
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

const signToken = (user) =>
  jwt.sign(
    { sub: String(user._id), role: user.role, organizationId: String(user.organization?._id || user.organization || '') },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

const resolveOrgName = async (req, user) => {
  const org = req.body.organization || {};
  const orgDoc = req.organization || (user?.organization?.name ? user.organization : null);
  if (orgDoc?.name) return orgDoc.name;
  if (org.id) {
    const found = await Organization.findById(org.id).lean();
    return found?.name || '';
  }
  return org.name || '';
};

export async function register(req, res, next) {
  try {
    const { name, email, password, phone, organization: orgPayload } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.fail('User with this email already exists.', 409);

    let orgId = null;
    let orgDoc = null;
    if (orgPayload) {
      if (orgPayload.id) {
        orgDoc = await Organization.findById(orgPayload.id);
        if (orgDoc) orgId = orgDoc._id;
      }
      if (!orgId) {
        orgDoc = await Organization.create({
          name: orgPayload.name || `${name}'s Studio`,
          contactEmail: email,
        });
        orgId = orgDoc._id;
      }
    } else {
      orgDoc = await Organization.create({
        name: `${name}'s Studio`,
        contactEmail: email,
      });
      orgId = orgDoc._id;
    }

    req.organization = orgDoc;

    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'admin',
      organization: orgId,
    });

    const token = signToken(user);
    res.cookie(config.cookieName, token, cookieOptions());
    res.user = user;
    res.locals.user = user.toPublicJSON();
    await logAction({ req, action: 'auth.register', targetId: user._id });

    return res.status(201).json({
      success: true,
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (err) {
    if (err.code === 11000) return res.fail('User with this email already exists.', 409);
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('organization');
    if (!user) return res.fail('Invalid email or password', 401);
    const ok = await user.comparePassword(password);
    if (!ok) return res.fail('Invalid email or password', 401);

    const token = signToken(user);
    res.cookie(config.cookieName, token, cookieOptions());
    res.user = user;
    res.locals.user = user.toPublicJSON();
    await logAction({ req, action: 'auth.login', targetId: user._id });

    return res.ok({
      data: {
        user: user.toPublicJSON(),
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  await logAction({ req, action: 'auth.logout', actorFrom: true, targetId: req.user?.id });
  res.clearCookie(config.cookieName, { ...cookieOptions(), maxAge: 0 });
  return res.ok();
}

export async function me(req, res) {
  if (!req.user) {
    return res.fail('Not authenticated', 401);
  }
  return res.ok({ data: res.locals.user });
}

export async function whoamiName(req, res) {
  const name = await resolveOrgName(req, res.locals.user);
  return res.ok({ data: { organization: name || '—' } });
}
