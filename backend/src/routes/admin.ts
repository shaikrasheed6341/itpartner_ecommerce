import { Hono } from 'hono';
import {
  adminRegister,
  adminLogin,
  checkLoginRequirements,
  generateNewOTP,
  getAllOrders,
  updateOrderStatus
} from '../controllers/adminController';
import { getConfirmedOrders } from '../controllers/shippingController';
import { getAdminProducts } from '../controllers/productController';
import { adminAuth } from '../middleware/adminAuth';

const app = new Hono();

// Public admin routes
app.post('/register', adminRegister);
app.post('/login', adminLogin);
app.post('/check-login-requirements', checkLoginRequirements);
app.post('/generate-otp', generateNewOTP);

// Public data routes (wait, are they public? Original code said yes, but implementation might expect admin??)
// Original: router.get('/orders', getAllOrders);
// getAllOrders implementation does NOT check for admin. So it's effectively public??
// The original comment said "Public data routes (no auth required)".
// That sounds dangerous but I will keep parity.
app.get('/orders', getAllOrders);

app.get('/orders/confirmed', adminAuth, getConfirmedOrders);
app.get('/products', getAdminProducts);

// Protected admin routes
app.put('/orders/:orderId/status', adminAuth, updateOrderStatus);

export default app;
