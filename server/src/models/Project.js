import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const projectSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['interior', 'construction', 'renovation', 'other'], default: 'interior' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    siteAddress: String,
    city: String,
    status: {
      type: String,
      enum: ['planning', 'design', 'in_progress', 'on_hold', 'completed', 'cancelled'],
      default: 'planning',
      index: true,
    },
    startDate: Date,
    targetDate: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    budget: {
      allocated: { type: Number, min: 0, default: 0 },
      spent: { type: Number, min: 0, default: 0 },
    },
    team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

projectSchema.index({ organization: 1, code: 1 }, { unique: true });
projectSchema.index({ organization: 1, status: 1, customer: 1 });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
