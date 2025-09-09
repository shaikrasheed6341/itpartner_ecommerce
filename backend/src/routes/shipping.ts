import express from 'express';
import { getConfirmedOrders, updateShippingStage, getOrderTracking } from '../controllers/shippingController';
import { adminAuth } from '../middleware/adminAuth';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Test route to debug
router.get('/test', (req, res) => {
  res.json({ message: 'Shipping routes are working!' });
});

// Admin routes - Get confirmed orders
router.get('/orders/confirmed', adminAuth, getConfirmedOrders);

// Admin routes - Update shipping stage (optimized single route)
router.put('/orders/:orderId/stage', adminAuth, updateShippingStage);

// Client routes - Get order tracking (this will conflict with /orders, let's move it)
router.get('/tracking/:orderId', authenticateToken, getOrderTracking);

export default router;
