import DemoRequest from '../models/DemoRequest.js';

export async function create(req, res, next) {
  try {
    const recent = await DemoRequest.findOne({
      email: req.body.email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - 15 * 60 * 1000) },
    });
    if (recent) {
      return res.fail('You have already requested a demo recently. Our team will reach out shortly.', 429);
    }
    const request = await DemoRequest.create({
      ...req.body,
      email: req.body.email.toLowerCase(),
    });
    res.created({ data: { id: request._id }, message: 'Demo request received — our team will contact you within one business day.' });
  } catch (err) {
    next(err);
  }
}

export async function listForOrg(req, res, next) {
  try {
    if (!req.user) return res.fail('Authentication required.', 401);
    const requests = await DemoRequest.find({ organization: req.user.organization })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.ok({ data: requests });
  } catch (err) {
    next(err);
  }
}
