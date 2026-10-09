import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const invoiceItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    gstPercent: { type: Number, min: 0, max: 28, default: 18 },
  },
  { _id: true }
);

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    mode: { type: String, enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'card'], default: 'bank_transfer' },
    reference: String,
    paidOn: { type: Date, default: Date.now },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const historySchema = new mongoose.Schema(
  {
    action: String,
    note: String,
    at: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    number: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    milestone: String,
    items: { type: [invoiceItemSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'pending', 'partially_paid', 'paid', 'overdue', 'cancelled'],
      default: 'draft',
      index: true,
    },
    issueDate: { type: Date },
    dueDate: Date,
    subtotal: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    payments: { type: [paymentSchema], default: [] },
    history: { type: [historySchema], default: [] },
    notes: String,
    invalidItems: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

invoiceSchema.index({ organization: 1, number: 1 }, { unique: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
