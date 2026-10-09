import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const itemSchema = new mongoose.Schema(
  {
    description: { type: String, required: true, trim: true },
    unit: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, min: 0 },
    discountPercent: { type: Number, min: 0, max: 100, default: 0 },
    gstPercent: { type: Number, min: 0, max: 28, default: 18 },
    _category: { type: String, default: 'general' },
  },
  { _id: true }
);

const revisionSchema = new mongoose.Schema(
  {
    version: Number,
    items: [itemSchema],
    subtotal: Number,
    gstTotal: Number,
    total: Number,
    changedAt: Date,
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const estimateSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    status: {
      type: String,
      enum: ['draft', 'internal_review', 'sent', 'client_approved', 'rejected', 'superseded'],
      default: 'draft',
      index: true,
    },
    version: { type: Number, default: 1 },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Estimate' },
    items: { type: [itemSchema], default: [] },
    subtotal: { type: Number, default: 0 },
    gstTotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    profitMargin: { type: Number, min: 0, max: 100, default: 0 },
    validUntil: Date,
    notes: String,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: Date,
    revisions: { type: [revisionSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

estimateSchema.index({ organization: 1, status: 1 });
estimateSchema.index({ organization: 1, title: 'text', notes: 'text' });

export default mongoose.models.Estimate || mongoose.model('Estimate', estimateSchema);
