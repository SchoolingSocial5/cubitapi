import express from 'express';
import { getBlogs, createBlog, deleteBlog } from '../controllers/blogController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .get(getBlogs)
    .post(protect, authorize('admin', 'staff'), createBlog);

router.route('/:id')
    .delete(protect, authorize('admin', 'staff'), deleteBlog);

export default router;
