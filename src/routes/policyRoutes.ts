import express from 'express';
import { getPolicies, createPolicy, deletePolicy, updatePolicy } from '../controllers/policyController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.route('/')
    .get(getPolicies)
    .post(protect, authorize('admin', 'staff'), createPolicy);

router.route('/:id')
    .put(protect, authorize('admin', 'staff'), updatePolicy)
    .delete(protect, authorize('admin', 'staff'), deletePolicy);

export default router;
