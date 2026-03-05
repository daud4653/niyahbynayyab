import { Router } from 'express';
import { loginAdmin, changePassword } from '../controllers/adminController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/login', loginAdmin);
router.post('/change-password', requireAdmin, changePassword);

export default router;
