import { Router } from 'express';
import { createOrder, createRazorpayOrder, verifyPayment } from '../controllers/orders/order';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Create order with cart total amount
router.post('/create', authenticateToken, createOrder);

// Create Razorpay order for payment
router.post('/razorpay/create', authenticateToken, createRazorpayOrder);

// Verify payment
router.post('/razorpay/verify', authenticateToken, verifyPayment);

export default router;
