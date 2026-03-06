import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    inventory: { type: Number, default: null, min: 0 },
    currency: { type: String, default: 'PKR', trim: true },
    badge: { type: String, default: '', trim: true },
    image: { type: String, default: '', trim: true },
    images: [{ type: String, trim: true }],
    sizes: [{ type: String, trim: true }],
    sizeInventory: { type: Map, of: Number, default: {} },
    color: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model('Product', productSchema);
