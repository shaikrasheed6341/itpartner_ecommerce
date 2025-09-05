import { Router } from 'express';
import { 
  adminRegister, 
  adminLogin, 
  adminProfile, 
  generateNewOTP,
  checkLoginRequirements
} from '../controllers/adminController';
import { authenticateAdmin } from '../middleware/adminAuth';

const router = Router();

// Public admin routes
router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.post('/check-login-requirements', checkLoginRequirements);
router.post('/generate-otp', generateNewOTP);

// Protected admin routes
router.get('/profile', authenticateAdmin, adminProfile);

export default router;
