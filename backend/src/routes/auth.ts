import { Router } from 'express';
import { register, login, getProfile, getAllUsers } from '../controllers/auth';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticateToken, getProfile);

// Admin only routes
router.get('/users', requireAdmin, getAllUsers);

export default router;
