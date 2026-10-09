import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const itemSchema = new mongoose.Schema(
  { description: String, quantity: Number, unit: String, rate: Number, estimated: { type: Number, default: 0 } },
  { _id: true }
);

const purchaseRequestSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    requiredBy: Date,
    notes: String,
    items: { type: [itemSchema], default: [] },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'quoted', 'rejected', 'converted'],
      default: 'draft',
      index: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

export default mongoose.models.PurchaseRequest ||
  mongoose.model('PurchaseRequest', purchaseRequestSchema);
