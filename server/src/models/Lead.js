import mongoose from 'mongoose';
import { baseOptions } from './shared.js';

const noteSchema = new mongoose.Schema(
  { body: { type: String, required: true }, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } },
  { timestamps: true, _id: true }
);

const leadSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    source: { type: String, trim: true },
    interest: { type: String, trim: true },
    city: String,
    estimateValue: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'],
      default: 'new',
      index: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium', index: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    followUpDate: Date,
    notes: [noteSchema],
    activity: [
      {
        at: { type: Date, default: Date.now },
        type: String,
        detail: String,
        actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

leadSchema.index({ organization: 1, status: 1, assignedTo: 1 });

export default mongoose.models.Lead || mongoose.model('Lead', leadSchema);
