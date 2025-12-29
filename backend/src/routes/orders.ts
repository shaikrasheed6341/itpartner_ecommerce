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

// Get all orders for a user (must come before /:orderId to avoid route conflicts)
router.get('/', authenticateToken, getUserOrders);

// Get order details with order items
router.get('/:orderId', authenticateToken, getOrderDetails);

export default router;
