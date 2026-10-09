import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { baseOptions, auditSchema } from './shared.js';

export const ROLES = [
  'super_admin', 'admin', 'sales_manager', 'project_manager', 'designer',
  'procurement_manager', 'finance_manager', 'site_engineer', 'customer', 'vendor',
];

const userSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ROLES, default: 'admin' },
    phone: { type: String, trim: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    ...auditSchema,
  },
  baseOptions
);

userSchema.statics.SENSITIVE = new Set(['password']);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toPublicJSON = function () {
  return {
    id: this._id,
    organization: this.organization,
    name: this.name,
    email: this.email,
    role: this.role,
    phone: this.phone,
    customerId: this.customerId,
    vendorId: this.vendorId,
  };
};

export default mongoose.models.User || mongoose.model('User', userSchema);
