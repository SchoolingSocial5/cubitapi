import express from 'express';
import { getPresignedUrl, deleteObject } from '../controllers/uploadController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.post('/presigned-url', protect, getPresignedUrl);
router.delete('/', protect, deleteObject);

export default router;
