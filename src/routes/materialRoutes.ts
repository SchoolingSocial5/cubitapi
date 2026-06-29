import express from 'express';
import {
    getMaterials,
    getMaterial,
    createMaterial,
    updateMaterial,
    deleteMaterial
} from '../controllers/MaterialController';

import { protect } from '../middleware/auth';

const router = express.Router();

router
    .route('/')
    .get(getMaterials)
    .post(protect, createMaterial);

router
    .route('/:id')
    .get(getMaterial)
    .put(protect, updateMaterial)
    .delete(protect, deleteMaterial);

export default router;
