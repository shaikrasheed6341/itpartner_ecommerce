import { Hono } from 'hono';
import { createOrder, createRazorpayOrder, verifyPayment, getOrderDetails, getUserOrders } from '../controllers/orders/order';
import { authenticateToken } from '../middleware/auth';

const app = new Hono();

// All order routes require authentication
app.use('*', authenticateToken);

// Create order with cart total amount and order items
app.post('/create', createOrder);

// Create Razorpay order for payment
app.post('/razorpay/create', createRazorpayOrder);

// Verify payment
app.post('/razorpay/verify', verifyPayment);

// Get all orders for a user (must come before /:orderId)
app.get('/', getUserOrders);

// Get order details
app.get('/:orderId', getOrderDetails);

export default app;
