import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const taskSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    stage: { type: mongoose.Schema.Types.ObjectId, ref: 'Stage' },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: Date,
    dueDate: Date,
    completedAt: Date,
    progress: { type: Number, min: 0, max: 100, default: 0 },
    warnings: [String],
    dependsOn: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

taskSchema.index({ organization: 1, project: 1, status: 1 });

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
