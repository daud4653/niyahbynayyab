import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    name: { type: String, required: true, trim: true },
    image: { type: String, default: '', trim: true },
    size: { type: String, default: null },
    qty: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      notes: { type: String, default: '', trim: true },
    },
    payment: {
      method: {
        type: String,
        enum: ['bank_transfer', 'wallet_transfer'],
        required: true,
      },
      proofUrl: { type: String, required: true, trim: true },
      status: {
        type: String,
        enum: ['submitted', 'verified', 'rejected'],
        default: 'submitted',
      },
      submittedAt: { type: Date, default: Date.now },
    },
    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, 'At least one item is required'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    shipping: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'PKR' },
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
