import User from '../models/User.js';

export async function getProfile(req, res, next) {
  try {
    res.ok({ data: req.user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.fail('User not found', 404);
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    await user.save();
    res.ok({ data: user.toPublicJSON() });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    const user = await User.findById(req.user._id).select('+password');
    const ok = await user.comparePassword(req.body.current);
    if (!ok) return res.fail('Current password is incorrect.', 401);
    if (await user.comparePassword(req.body.next)) {
      return res.fail('New password must be different from the current password.', 400);
    }
    user.password = req.body.next;
    await user.save();
    res.ok({ data: { changed: true } });
  } catch (err) {
    next(err);
  }
}
