import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const documentSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: String,
    category: {
      type: String,
      enum: ['legal', 'design', 'invoice', 'site_photo', 'contract', 'other'],
      default: 'other',
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    fileName: String,
    fileUrl: String,
    mimeType: String,
    size: Number,
    visibility: { type: String, enum: ['staff', 'customer'], default: 'staff' },
    versions: [
      {
        fileName: String,
        fileUrl: String,
        uploadedAt: { type: Date, default: Date.now },
        uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],
    tags: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

documentSchema.index({ organization: 1, category: 1, project: 1 });
documentSchema.index({ organization: 1, title: 'text' });

export default mongoose.models.Document || mongoose.model('Document', documentSchema);
