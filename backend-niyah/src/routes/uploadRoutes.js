import { Router } from 'express';
import multer from 'multer';
import { uploadImages } from '../controllers/uploadController.js';
import { requireAdmin } from '../middleware/auth.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

const router = Router();

// POST /api/upload  — accepts up to 10 images at once
router.post('/', requireAdmin, upload.array('images', 10), uploadImages);

export default router;
