import { Hono } from 'hono';
import authRoutes from './auth';
import productRoutes from './products';
import orderRoutes from './orders';
import adminRoutes from './admin';
import cartRoutes from './cart';
import shippingRoutes from './shipping';

const app = new Hono();

// We need to make sure imported modules are Hono instances
// Assuming we will refactor them to export 'default new Hono()'

app.route('/auth', authRoutes);
app.route('/products', productRoutes);
app.route('/orders', orderRoutes);
app.route('/admin', adminRoutes);
app.route('/cart', cartRoutes);
app.route('/shipping', shippingRoutes);

export default app;
