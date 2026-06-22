import express from 'express';
import { createUser, loginUser, verifyUser, getMe, getUsers, getUser, updateUserStatus, updateProfile, updatePassword, deleteAccount } from '../controllers/userController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.post('/', createUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/verify', protect, verifyUser);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.delete('/account', protect, deleteAccount);

router.get('/', protect, authorize('admin', 'staff'), getUsers);
router.get('/:id', protect, authorize('admin', 'staff'), getUser);
router.put('/:id/verify', protect, authorize('admin', 'staff'), updateUserStatus);

export default router;
