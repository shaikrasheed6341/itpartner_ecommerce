import { Hono } from 'hono';
import { getConfirmedOrders, updateShippingStage, getOrderTracking } from '../controllers/shippingController';
import { adminAuth } from '../middleware/adminAuth';
import { authenticateToken } from '../middleware/auth';

const app = new Hono();

app.get('/test', (c) => c.json({ message: 'Shipping routes are working!' }));

// Admin routes
app.get('/orders/confirmed', adminAuth, getConfirmedOrders);
app.put('/orders/:orderId/stage', adminAuth, updateShippingStage);

// Client routes
app.get('/tracking/:orderId', authenticateToken, getOrderTracking);

export default app;
