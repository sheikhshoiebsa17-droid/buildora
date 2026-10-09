import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const moneySchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    type: { type: String, enum: ['income', 'expense'], required: true, index: true },
    category: {
      type: String,
      enum: ['client_payment', 'vendor_bill', 'salary', 'logistics', 'tools', 'marketing', 'misc'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    description: String,
    spentBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'paid'], default: 'paid' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

export default mongoose.models.Money || mongoose.model('Money', moneySchema);
