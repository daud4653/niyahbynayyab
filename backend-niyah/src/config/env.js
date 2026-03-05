import dotenv from 'dotenv';

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5050),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  clientUrls: (process.env.CLIENT_URLS || '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean),
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey:    process.env.CLOUDINARY_API_KEY    || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
};

if (!env.mongoUri) {
  throw new Error('Missing MONGODB_URI in environment variables.');
}
