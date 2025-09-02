import { Router } from 'express';

// Import route modules here
import visitorRoutes from './visitors';
import contactRoutes from './contact';
import productRoutes from './products';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.json({ message: 'IT Partner API Routes' });
});

// Mount route modules here
router.use('/visitors', visitorRoutes);
router.use('/contact', contactRoutes);
router.use('/products', productRoutes);

export default router;
