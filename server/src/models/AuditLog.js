import mongoose from 'mongoose';
import { baseOptions } from './shared.js';

const targetSchema = new mongoose.Schema(
  {
    kind: String,
    id: String,
    label: String,
  },
  { _id: false }
);

const auditLogSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, index: true },
    target: { type: targetSchema, default: {} },
    details: String,
    date: { type: Date, default: Date.now },
    ip: String,
    userAgent: String,
  },
  baseOptions
);

auditLogSchema.index({ organization: 1, date: -1 });
auditLogSchema.index({ organization: 1, action: 1, date: -1 });

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
