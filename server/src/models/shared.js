import mongoose from 'mongoose';

const auditSchema = {
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
};

export const baseOptions = { timestamps: true, versionKey: false };

export { auditSchema };
