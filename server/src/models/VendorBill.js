import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const billItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    gstPercent: { type: Number, min: 0, max: 28, default: 18 },
  },
  { _id: true }
);

const billHistory = new mongoose.Schema(
  {
    action: String,
    note: String,
    at: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const vendorBillSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    billNumber: { type: String, trim: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    items: { type: [billItemSchema], default: [] },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['draft', 'pending', 'partially_paid', 'paid', 'cancelled'],
      default: 'draft',
    },
    issueDate: Date,
    dueDate: Date,
    history: { type: [billHistory], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

vendorBillSchema.index({ organization: 1, vendor: 1, status: 1 });

export default mongoose.models.VendorBill || mongoose.model('VendorBill', vendorBillSchema);
