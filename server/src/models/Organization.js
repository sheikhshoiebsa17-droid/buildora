import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const orgSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactEmail: { type: String, lowercase: true, trim: true },
    contactPhone: { type: String, trim: true },
    address: String,
    gstin: { type: String, trim: true, uppercase: true },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    settings: {
      invoicePrefix: { type: String, default: 'INV' },
      poPrefix: { type: String, default: 'PO' },
      estimatePrefix: { type: String, default: 'EST' },
      customerPrefix: { type: String, default: 'CUS' },
      projectPrefix: { type: String, default: 'PRJ' },
    },
  },
  baseOptions
);

export default mongoose.models.Organization || mongoose.model('Organization', orgSchema);
