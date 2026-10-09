import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const poItemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: String,
    rate: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    gstPercent: { type: Number, min: 0, max: 28, default: 18 },
  },
  { _id: true }
);

const poStatusHistory = new mongoose.Schema(
  {
    status: String,
    note: String,
    at: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const poSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    poNumber: { type: String, required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseRequest' },
    items: { type: [poItemSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'rejected', 'ordered', 'partially_received', 'received', 'cancelled'],
      default: 'draft',
      index: true,
    },
    approvals: { type: [poStatusHistory], default: [] },
    statusHistory: { type: [poStatusHistory], default: [] },
    orderDate: Date,
    expectedDate: Date,
    invalidItems: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

poSchema.index({ organization: 1, poNumber: 1 }, { unique: true });

export default mongoose.models.PurchaseOrder || mongoose.model('PurchaseOrder', poSchema);
