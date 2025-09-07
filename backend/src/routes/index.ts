import { Router } from 'express';
import authRoutes from './auth';
import productRoutes from './products';
import orderRoutes from './orders';
import adminRoutes from './admin';
import cartRoutes from './cart';

const router = Router();

// Mount route modules
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);
router.use('/cart', cartRoutes);

export default router;
