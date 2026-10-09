import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const renderSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const designSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    title: { type: String, required: true, trim: true },
    room: { type: String, trim: true },
    status: {
      type: String,
      enum: ['draft', 'internal_review', 'sent', 'client_approved', 'changes_requested', 'rejected'],
      default: 'draft',
      index: true,
    },
    scope: { type: String, trim: true },
    notes: String,
    versions: [
      {
        version: Number,
        label: String,
        notes: String,
        sentForApproval: { type: Boolean, default: false },
        approvedByClient: { type: Boolean, default: false },
        respondedAt: Date,
        responseNote: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        _id: false,
      },
    ],
    renders: { type: [renderSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

export default mongoose.models.Design || mongoose.model('Design', designSchema);
