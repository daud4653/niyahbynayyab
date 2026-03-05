import mongoose from 'mongoose';

const adminConfigSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    mustChangePassword: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AdminConfig = mongoose.model('AdminConfig', adminConfigSchema);
