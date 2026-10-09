import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const vendorSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: String,
    address: String,
    gstin: { type: String, uppercase: true, trim: true },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    categories: [{ type: String, trim: true }],
    specialties: [{ type: String, trim: true }],
    notes: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

vendorSchema.index({ organization: 1, name: 'text', email: 'text' });

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
