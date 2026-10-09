import mongoose from 'mongoose';
import { baseOptions } from './shared.js';

const stageSchema = new mongoose.Schema(
  { name: String, order: Number },
  { _id: true }
);

export default mongoose.models.Stage || mongoose.model('Stage', stageSchema);
