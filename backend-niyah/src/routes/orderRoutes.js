import { Router } from 'express';
import multer from 'multer';
import { createOrder, listOrders, updateOrderStatus } from '../controllers/orderController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
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
