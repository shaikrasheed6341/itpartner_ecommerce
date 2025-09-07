import { Router } from 'express';
import { createOrder, createRazorpayOrder, verifyPayment, getOrderDetails, getUserOrders } from '../controllers/orders/order';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Create order with cart total amount and order items
router.post('/create', authenticateToken, createOrder);

// Create Razorpay order for payment
router.post('/razorpay/create', authenticateToken, createRazorpayOrder);

// Verify payment
router.post('/razorpay/verify', authenticateToken, verifyPayment);

// Get order details with order items
router.get('/:orderId', authenticateToken, getOrderDetails);

// Get all orders for a user
router.get('/', authenticateToken, getUserOrders);

export default router;
