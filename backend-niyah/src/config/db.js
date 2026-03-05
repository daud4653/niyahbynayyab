import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDb() {
  await mongoose.connect(env.mongoUri, {
    dbName: process.env.MONGODB_DB || 'niyah',
  });
  // eslint-disable-next-line no-console
  console.log('MongoDB connected');
}
