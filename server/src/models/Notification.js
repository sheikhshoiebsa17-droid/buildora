import mongoose from 'mongoose';
import { baseOptions } from './shared.js';

const readReceiptSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const notificationSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    type: {
      type: String,
      enum: ['lead_assigned', 'estimate_sent', 'design_responded', 'project_completed', 'po_approved', 'po_created', 'invoice_created', 'system'],
      default: 'system',
    },
    title: { type: String, required: true },
    body: String,
    link: String,
    date: { type: Date, default: Date.now },
    readBy: { type: [readReceiptSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

notificationSchema.index({ organization: 1, recipients: 1, date: -1 });

export default mongoose.models.Notification ||
  mongoose.model('Notification', notificationSchema);
