import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const feedbackSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, required: true, trim: true },
    message: String,
    reviewer: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

export default mongoose.models.CustomerFeedback || mongoose.model('CustomerFeedback', feedbackSchema);
