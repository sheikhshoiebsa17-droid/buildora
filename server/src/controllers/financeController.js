import Invoice from '../models/Invoice.js';
import VendorBill from '../models/VendorBill.js';
import Money from '../models/Money.js';

export async function summary(req, res, next) {
  try {
    const orgId = req.user.organization;
    const [invoices, bills, entries] = await Promise.all([
      Invoice.find({ organization: orgId, status: { $nin: ['cancelled', 'draft'] } }).lean(),
      VendorBill.find({ organization: orgId, status: { $nin: ['cancelled', 'draft'] } }).lean(),
      Money.find({ organization: orgId }).lean(),
    ]);

    const receivable = invoices.reduce((s, i) => s + (i.total - (i.amountPaid || 0)), 0);
    const received = invoices.reduce((s, i) => s + (i.amountPaid || 0), 0);
    const payable = bills.reduce((s, b) => s + b.total, 0);
    const expense = entries.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);

    const overdue = invoices
      .filter((i) => i.dueDate && new Date(i.dueDate) < new Date() && i.amountPaid < i.total)
      .map((i) => ({ id: i._id, number: i.number, total: i.total, dueDate: i.dueDate }));

    res.ok({
      data: {
        receivable,
        received,
        payable,
        expense,
        overdue,
        counts: {
          invoices: invoices.length,
          overdue: overdue.length,
          vendorBills: bills.length,
          pendingBills: bills.filter((b) => b.status === 'pending').length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
