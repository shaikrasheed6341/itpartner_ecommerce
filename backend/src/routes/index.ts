import { Router } from 'express';

// Import route modules here
import visitorRoutes from './visitors';
import contactRoutes from './contact';
import productRoutes from './products';
import authRoutes from './auth';
import cartRoutes from './cart';
import orderRoutes from './orders';
import adminRoutes from './admin';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.json({ message: 'IT Partner API Routes' });
});

// Mount route modules here
router.use('/visitors', visitorRoutes);
router.use('/contact', contactRoutes);
router.use('/products', productRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;
