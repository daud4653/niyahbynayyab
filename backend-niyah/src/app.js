import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import adminRoutes from './routes/adminRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import { env } from './config/env.js';

export function createApp() {
  const app = express();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const allowedOrigins = new Set([env.clientUrl, ...env.clientUrls]);

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) return callback(null, true);

        // Allow all localhost origins in development.
        if (env.nodeEnv !== 'production' && /^https?:\/\/localhost:\d+$/.test(origin)) {
          return callback(null, true);
        }

        if (allowedOrigins.has(origin)) {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
    })
  );
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'niyah-api' });
  });

  app.use('/uploads', express.static(uploadsDir));

  app.use('/api/admin', adminRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/upload', uploadRoutes);

  app.use((err, _req, res, _next) => {
    // eslint-disable-next-line no-console
    console.error(err);
    const status =
      Number(err?.statusCode) ||
      Number(err?.status) ||
      (err?.name === 'MulterError' ? 400 : 500);

    const message = status >= 500 ? 'Internal server error' : (err?.message || 'Request failed');
    res.status(status).json({ message });
  });

  return app;
}
