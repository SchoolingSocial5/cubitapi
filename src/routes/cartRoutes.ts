import express from 'express';
import { getCart, syncCart } from '../controllers/cartController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/sync', protect, syncCart);

export default router;
