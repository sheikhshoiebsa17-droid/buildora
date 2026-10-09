import mongoose from 'mongoose';
import { baseOptions } from './shared.js';

const demoRequestSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    company: { type: String, required: true, trim: true },
    phone: String,
    businessType: String,
    companySize: String,
    preferredDate: Date,
    message: String,
    status: { type: String, enum: ['new', 'contacted', 'scheduled', 'closed'], default: 'new' },
  },
  baseOptions
);

demoRequestSchema.index({ createdAt: -1 });

export default mongoose.models.DemoRequest || mongoose.model('DemoRequest', demoRequestSchema);
