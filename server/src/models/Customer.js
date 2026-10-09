import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const customerSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: String,
    city: String,
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

customerSchema.index({ organization: 1, phone: 1 });
customerSchema.index({ organization: 1, name: 'text', email: 'text' });

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
