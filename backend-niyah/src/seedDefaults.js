import { randomBytes } from 'crypto';
import { Product } from './models/Product.js';
import { AdminConfig } from './models/AdminConfig.js';
import { hashPassword } from './utils/auth.js';
import { env } from './config/env.js';

const defaultProduct = {
  name: 'The Signature Set',
  tagline: 'Effortless. Elegant. Yours.',
  description:
    'Crafted for women who move through the world with intention, the Signature Set pairs a relaxed-fit kurta with wide-leg trousers in a breathable linen blend. Minimal details, maximum ease.',
  price: 4500,
  inventory: 25,
  currency: 'PKR',
  badge: 'New Arrival',
  image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b5e07?w=800&q=80',
  images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b5e07?w=800&q=80'],
  sizes: ['XS', 'S', 'M', 'L', 'XL'],
  color: 'Ivory & Dust Rose',
  category: 'Coords',
};

function generateOTP() {
  // 16-char URL-safe random string — printed once, never stored in plain text
  return randomBytes(12).toString('base64url').slice(0, 16);
}

export async function seedDefaults() {
  // Seed default product
  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    await Product.create(defaultProduct);
  }

  // Seed admin account — only on first boot when no admin exists
  const adminExists = await AdminConfig.findOne({ username: env.adminUsername });
  if (!adminExists) {
    const otp = generateOTP();
    const passwordHash = await hashPassword(otp);
    await AdminConfig.create({
      username: env.adminUsername,
      passwordHash,
      mustChangePassword: true,
    });

    // Print OTP to console ONCE — this is the only time it will ever appear
    console.log('\n┌─────────────────────────────────────────┐');
    console.log('│          ADMIN ACCOUNT CREATED           │');
    console.log('├─────────────────────────────────────────┤');
    console.log(`│  Username : ${env.adminUsername.padEnd(28)}│`);
    console.log(`│  Password : ${otp.padEnd(28)}│`);
    console.log('│  ⚠  You must change this password        │');
    console.log('│     on first login.                      │');
    console.log('└─────────────────────────────────────────┘\n');
  }
}
