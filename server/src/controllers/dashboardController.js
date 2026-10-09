import User from '../models/User.js';
import Customer from '../models/Customer.js';
import Project from '../models/Project.js';
import Invoice from '../models/Invoice.js';
import Lead from '../models/Lead.js';
import Estimate from '../models/Estimate.js';
import Notification from '../models/Notification.js';
import InventoryItem from '../models/InventoryItem.js';
import VendorBill from '../models/VendorBill.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

export async function dashboardOverview(req, res, next) {
  try {
    const orgId = req.user.organization;
    const [
      projects,
      invoices,
      leads,
      estimates,
      lowStock,
      pendingBills,
      openPOs,
    ] = await Promise.all([
      Project.find({ organization: orgId }).lean(),
      Invoice.find({ organization: orgId }).lean(),
      Lead.find({ organization: orgId }).lean(),
      Estimate.find({ organization: orgId }).lean(),
      InventoryItem.find({
        organization: orgId,
        $expr: { $lte: ['$quantity', '$reorderLevel'] },
        reorderLevel: { $gt: 0 },
      }).countDocuments(),
      VendorBill.countDocuments({ organization: orgId, status: { $in: ['pending', 'partially_paid'] } }),
      PurchaseOrder.countDocuments({ organization: orgId, status: 'pending_approval' }),
    ]);

    const revenue = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + (i.amountPaid || 0), 0);
    const outstanding = invoices
      .filter((i) => !['paid', 'cancelled', 'draft'].includes(i.status))
      .reduce((sum, i) => sum + (i.total - (i.amountPaid || 0)), 0);

    const payload = {
      metricsKpis: [
        { label: 'Revenue', value: revenue, format: 'currency', status: 'positive', icon: 'revenue' },
        { label: 'Outstanding Invoices', value: outstanding, format: 'currency', status: 'warning', icon: 'invoice' },
        { label: 'Active Projects', value: projects.filter((p) => p.status === 'in_progress').length, format: 'number', status: 'info', icon: 'project' },
        { label: 'Leads in Pipeline', value: leads.filter((l) => !['won', 'lost'].includes(l.status)).length, format: 'number', status: 'info', icon: 'lead' },
      ],
      revenueTrend: [],
      projectStatusBreakdown: Object.entries(
        projects.reduce((acc, p) => ({ ...acc, [p.status]: (acc[p.status] || 0) + 1 }), {})
      ).map(([status, count]) => ({ status: status.replace(/_/g, ' '), count })),
      estimatesPendingApproval: estimates.filter((e) => e.status === 'internal_review').length,
      lowStockCount: lowStock,
      pendingVendorBills: pendingBills,
      pendingApprovals: openPOs + estimates.filter((e) => e.status === 'internal_review').length,
    };

    res.ok({ data: payload });
  } catch (err) {
    next(err);
  }
}
