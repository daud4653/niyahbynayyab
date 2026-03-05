import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const ALLOWED_STATUS = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'];

function normalizeCustomer(customer = {}) {
  return {
    firstName: String(customer.firstName || '').trim(),
    lastName: String(customer.lastName || '').trim(),
    email: String(customer.email || '').trim().toLowerCase(),
    phone: String(customer.phone || '').trim(),
    address: String(customer.address || '').trim(),
    city: String(customer.city || '').trim(),
    notes: String(customer.notes || '').trim(),
  };
}

function normalizeItems(items = []) {
  return items.map((item) => {
    const rawUnitPrice = typeof item.unitPrice === 'number'
      ? item.unitPrice
      : Number(String(item.unitPrice || '').replace(/,/g, ''));

    return {
      productId: mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : undefined,
      name: String(item.name || '').trim(),
      image: String(item.image || '').trim(),
      size: item.size ? String(item.size).trim() : null,
      qty: Number(item.qty) || 0,
      unitPrice: Number.isFinite(rawUnitPrice) ? rawUnitPrice : NaN,
      currency: String(item.currency || 'PKR').trim(),
    };
  });
}

function calculateTotals(items = []) {
  return items.reduce(
    (acc, item) => {
      acc.subtotal += item.unitPrice * item.qty;
      return acc;
    },
    { subtotal: 0 }
  );
}

export async function createOrder(req, res) {
  let rawCustomer = req.body?.customer;
  let rawItems = req.body?.items;
  const paymentMethod = String(req.body?.paymentMethod || '').trim();

  if (typeof rawCustomer === 'string') {
    try {
      rawCustomer = JSON.parse(rawCustomer);
    } catch {
      return res.status(400).json({ message: 'Invalid customer payload' });
    }
  }

  if (typeof rawItems === 'string') {
    try {
      rawItems = JSON.parse(rawItems);
    } catch {
      return res.status(400).json({ message: 'Invalid items payload' });
    }
  }

  const customer = normalizeCustomer(rawCustomer);
  const items = normalizeItems(Array.isArray(rawItems) ? rawItems : []);

  if (!paymentMethod || !['bank_transfer', 'wallet_transfer'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Invalid payment method' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Payment proof screenshot is required' });
  }

  const paymentProofUrl = `/uploads/payments/${req.file.filename}`;

  if (!customer.firstName || !customer.lastName || !customer.email || !customer.phone || !customer.address || !customer.city) {
    return res.status(400).json({ message: 'All required customer fields must be provided' });
  }

  if (!/\S+@\S+\.\S+/.test(customer.email)) {
    return res.status(400).json({ message: 'Invalid email address' });
  }

  if (!items.length) {
    return res.status(400).json({ message: 'At least one order item is required' });
  }

  for (const item of items) {
    if (!item.name || item.qty < 1 || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
      return res.status(400).json({ message: 'Invalid order items payload' });
    }
  }

  const productQty = new Map();
  for (const item of items) {
    if (!item.productId) continue;
    const key = String(item.productId);
    productQty.set(key, (productQty.get(key) || 0) + item.qty);
  }

  const { subtotal } = calculateTotals(items);
  const shipping = subtotal >= 5000 ? 0 : 300;
  const total = subtotal + shipping;
  const currency = items[0]?.currency || 'PKR';

  const session = await mongoose.startSession();
  try {
    let createdOrder;

    await session.withTransaction(async () => {
      for (const [productId, qty] of productQty.entries()) {
        const product = await Product.findById(productId).session(session);
        if (!product || !product.isActive) {
          const err = new Error('One or more products are no longer available.');
          err.status = 400;
          throw err;
        }

        if (typeof product.inventory === 'number') {
          const updated = await Product.findOneAndUpdate(
            { _id: productId, isActive: true, inventory: { $gte: qty } },
            { $inc: { inventory: -qty } },
            { new: true, session }
          );

          if (!updated) {
            const err = new Error(`Not enough inventory for "${product.name}".`);
            err.status = 400;
            throw err;
          }
        }
      }

      const orders = await Order.create(
        [
          {
            customer,
            items,
            subtotal,
            shipping,
            total,
            currency,
            payment: {
              method: paymentMethod,
              proofUrl: paymentProofUrl,
              status: 'submitted',
              submittedAt: new Date(),
            },
          },
        ],
        { session }
      );
      createdOrder = orders[0];
    });

    return res.status(201).json({
      id: createdOrder._id,
      status: createdOrder.status,
      createdAt: createdOrder.createdAt,
      total: createdOrder.total,
      currency: createdOrder.currency,
    });
  } catch (error) {
    const status = typeof error?.status === 'number' ? error.status : 500;
    return res.status(status).json({ message: error?.message || 'Order placement failed' });
  } finally {
    session.endSession();
  }
}

export async function listOrders(_req, res) {
  const { status, q } = _req.query || {};
  const query = {};

  if (status && ALLOWED_STATUS.includes(String(status))) {
    query.status = String(status);
  }

  if (q && String(q).trim()) {
    const search = String(q).trim();
    const regex = new RegExp(search, 'i');
    const or = [
      { 'customer.firstName': regex },
      { 'customer.lastName': regex },
      { 'customer.email': regex },
      { 'customer.phone': regex },
      { 'items.name': regex },
    ];

    if (mongoose.Types.ObjectId.isValid(search)) {
      or.push({ _id: new mongoose.Types.ObjectId(search) });
    }

    query.$or = or;
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  return res.json(orders);
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid order id' });
  }

  if (!status || !ALLOWED_STATUS.includes(String(status))) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  const updated = await Order.findByIdAndUpdate(
    id,
    { status: String(status) },
    { new: true, runValidators: true }
  );

  if (!updated) {
    return res.status(404).json({ message: 'Order not found' });
  }

  return res.json(updated);
}
