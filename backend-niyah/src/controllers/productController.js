import mongoose from 'mongoose';
import { Product } from '../models/Product.js';

function normalizeProductPayload(body = {}) {
  const rawPrice = body.price;
  const parsedPrice =
    typeof rawPrice === 'number'
      ? rawPrice
      : Number(String(rawPrice || '').replace(/,/g, ''));

  const rawInventory = body.inventory;
  const parsedInventory =
    rawInventory === null || rawInventory === undefined || rawInventory === ''
      ? null
      : Number(String(rawInventory).replace(/,/g, ''));

  const rawImages = Array.isArray(body.images)
    ? body.images.map((s) => String(s).trim()).filter(Boolean)
    : [];
  const primaryImage = rawImages[0] || String(body.image || '').trim();

  return {
    name: String(body.name || '').trim(),
    tagline: String(body.tagline || '').trim(),
    description: String(body.description || '').trim(),
    price: Number.isFinite(parsedPrice) ? parsedPrice : NaN,
    inventory: parsedInventory === null ? null : (Number.isFinite(parsedInventory) ? parsedInventory : NaN),
    currency: String(body.currency || 'PKR').trim(),
    badge: String(body.badge || '').trim(),
    image: primaryImage,
    images: rawImages,
    sizes: Array.isArray(body.sizes)
      ? body.sizes.map((s) => String(s).trim()).filter(Boolean)
      : [],
    color: String(body.color || '').trim(),
    category: String(body.category || '').trim(),
    isActive: body.isActive !== false,
  };
}

export async function listProducts(_req, res) {
  const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
  return res.json(products);
}

export async function getProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const product = await Product.findById(id);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json(product);
}

export async function createProduct(req, res) {
  const payload = normalizeProductPayload(req.body);

  if (!payload.name) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return res.status(400).json({ message: 'Valid price is required' });
  }

  if (payload.inventory !== null) {
    if (!Number.isFinite(payload.inventory) || payload.inventory < 0) {
      return res.status(400).json({ message: 'Valid inventory is required' });
    }
    payload.inventory = Math.floor(payload.inventory);
  }

  const product = await Product.create(payload);
  return res.status(201).json(product);
}

export async function updateProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const payload = normalizeProductPayload(req.body);

  if (!payload.name) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    return res.status(400).json({ message: 'Valid price is required' });
  }

  if (payload.inventory !== null) {
    if (!Number.isFinite(payload.inventory) || payload.inventory < 0) {
      return res.status(400).json({ message: 'Valid inventory is required' });
    }
    payload.inventory = Math.floor(payload.inventory);
  }

  const updated = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  if (!updated) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.json(updated);
}

export async function deleteProduct(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid product id' });
  }

  const deleted = await Product.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!deleted) {
    return res.status(404).json({ message: 'Product not found' });
  }

  return res.status(204).send();
}
