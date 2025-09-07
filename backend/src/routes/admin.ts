import { Router } from 'express';
import { 
  adminRegister, 
  adminLogin, 
  adminProfile, 
  generateNewOTP,
  checkLoginRequirements,
  getAllOrders,
  updateOrderStatus
} from '../controllers/adminController';
import { getAdminProducts } from '../controllers/productController';
import { adminAuth } from '../middleware/adminAuth';



const router = Router();

// Public admin routes
router.post('/register', adminRegister);
router.post('/login', adminLogin);
router.post('/check-login-requirements', checkLoginRequirements);
router.post('/generate-otp', generateNewOTP);

// Public data routes (no auth required)
router.get('/orders', getAllOrders);
router.get('/products', getAdminProducts);

export default router;
