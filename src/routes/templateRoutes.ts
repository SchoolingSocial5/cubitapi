import express from 'express';
import { getTemplates, getTemplate, createTemplate, updateTemplate, deleteTemplate } from '../controllers/templateController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .get(protect, authorize('admin', 'staff'), getTemplates)
    .post(protect, authorize('admin', 'staff'), createTemplate);

router.route('/:id')
    .get(protect, authorize('admin', 'staff'), getTemplate)
    .put(protect, authorize('admin', 'staff'), updateTemplate)
    .delete(protect, authorize('admin', 'staff'), deleteTemplate);

export default router;
