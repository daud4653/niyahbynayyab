import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createOrder, listOrders, updateOrderStatus } from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.join(__dirname, '..', '..', 'uploads', 'payments');

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    fs.mkdirSync(uploadRoot, { recursive: true });
    cb(null, uploadRoot);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname || '').slice(0, 10) || '';
    const safeExt = ext && /^[.\w-]+$/.test(ext) ? ext : '';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      cb(null, true);
      return;
    }
    const err = new Error('Payment proof must be an image file.');
    err.status = 400;
    cb(err);
  },
});

router.post('/', upload.single('paymentProof'), createOrder);
router.get('/', requireAdmin, listOrders);
router.patch('/:id/status', requireAdmin, updateOrderStatus);

export default router;
