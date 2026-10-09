import mongoose from 'mongoose';
import Invoice from '../models/Invoice.js';
import Project from '../models/Project.js';
import Lead from '../models/Lead.js';

export async function overview(req, res, next) {
  try {
    const orgId = new mongoose.Types.ObjectId(req.user.organization);
    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(String(from));
    if (to) dateFilter.$lte = new Date(String(to));
    const hasDate = Boolean(from || to);

    const [revenueTrend, budgetVsActual, projectStatus, leadFunnel] = await Promise.all([
      Invoice.aggregate([
        { $match: { organization: orgId, status: { $in: ['partially_paid', 'paid'] }, ...(hasDate ? { issueDate: dateFilter } : {}) } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$issueDate' } },
            revenue: { $sum: { $add: ['$amountPaid', 0] } },
            invoiced: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Project.aggregate([
        { $match: { organization: orgId } },
        {
          $project: {
            _id: 1,
            name: 1,
            code: 1,
            allocated: '$budget.allocated',
            spent: '$budget.spent',
            utilization: {
              $cond: [
                { $gt: ['$budget.allocated', 0] },
                { $round: [{ $multiply: [{ $divide: ['$budget.spent', '$budget.allocated'] }, 100] }, 1] },
                0,
              ],
            },
          },
        },
        { $sort: { utilization: -1 } },
        { $limit: 10 },
      ]),
      Project.aggregate([
        { $match: { organization: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: { organization: orgId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.ok({
      data: {
        revenueTrend: revenueTrend.map((r) => ({ month: r._id, revenue: r.revenue, invoiced: r.invoiced, count: r.count })),
        budgetVsActual: budgetVsActual.map((p) => ({
          project: p.name,
          code: p.code,
          allocated: p.allocated,
          spent: p.spent,
          utilization: p.utilization,
        })),
        projectStatus: projectStatus.map((s) => ({ status: s._id, count: s.count })),
        leadFunnel: leadFunnel.map((l) => ({ status: l._id, count: l.count })),
      },
      demoData: false,
    });
  } catch (err) {
    next(err);
  }
}
