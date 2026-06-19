import express from 'express';
import { toggleBookmark, getMyBookmarks } from '../controllers/bookmarkController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect); // All bookmark routes require authentication

router.route('/')
    .get(getMyBookmarks);

router.route('/:propertyId')
    .post(toggleBookmark);

export default router;
