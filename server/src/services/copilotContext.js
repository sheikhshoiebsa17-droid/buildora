import Invoice from '../models/Invoice.js';
import Project from '../models/Project.js';
import Lead from '../models/Lead.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

/**
 * Builds a compact JSON snapshot of business data for AI grounding.
 * Figures come straight from the database — never invented.
 */
export async function buildDataContext(orgId, message) {
  const q = String(message || '').toLowerCase();

  const wants = (words) => words.some((w) => q.includes(w));

  const ctx = { generatedAt: new Date().toISOString() };

  if (wants(['delay', 'risk', 'completion', 'progress'])) {
    ctx.projects = await Project.find({ organization: orgId })
      .select('name code status progress startDate targetDate budget')
      .lean();
  }
  if (wants(['payment', 'receivable', 'overdue', 'invoice', 'revenue'])) {
    ctx.invoices = await Invoice.find({ organization: orgId, status: { $nin: ['cancelled', 'draft'] } })
      .select('number customer status total amountPaid dueDate')
      .limit(100)
      .populate('customer', 'name')
      .lean();
  }
  if (wants(['lead', 'pipeline'])) {
    ctx.leads = await Lead.find({ organization: orgId })
      .select('name status priority estimateValue followUpDate')
      .limit(100)
      .lean();
  }
  if (wants(['purchase', 'po', 'procurement', 'vendor', 'spend'])) {
    ctx.purchaseOrders = await PurchaseOrder.find({ organization: orgId })
      .select('poNumber vendor status orderDate')
      .limit(100)
      .populate('vendor', 'name')
      .lean();
  }

  // Default snapshot when the intent is unclear
  if (Object.keys(ctx).length === 1) {
    const [projects, invoices, leads] = await Promise.all([
      Project.find({ organization: orgId }).select('name status progress budget').limit(20).lean(),
      Invoice.find({ organization: orgId, status: { $nin: ['cancelled', 'draft'] } })
        .select('number status total amountPaid')
        .limit(50)
        .lean(),
      Lead.find({ organization: orgId }).select('name status priority').limit(50).lean(),
    ]);
    ctx.projects = projects;
    ctx.invoices = invoices;
    ctx.leads = leads;
  }
  return ctx;
}
