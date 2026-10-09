import mongoose from 'mongoose';
import { baseOptions, auditSchema } from './shared.js';

const stockMovementSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['in', 'out'], required: true },
    quantity: { type: Number, required: true, min: 0 },
    reason: { type: String, trim: true },
    date: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: true }
);

const inventoryItemSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
    sku: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: String,
    unit: { type: String, default: 'nos' },
    quantity: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    unitPrice: { type: Number, min: 0, default: 0 },
    warehouseLocation: String,
    movements: { type: [stockMovementSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  baseOptions
);

inventoryItemSchema.index({ organization: 1, sku: 1 }, { unique: true });
inventoryItemSchema.index({ organization: 1, name: 1 });

export default mongoose.models.InventoryItem ||
  mongoose.model('InventoryItem', inventoryItemSchema);
