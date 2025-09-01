import { Router } from 'express';

// Import route modules here
import visitorRoutes from './visitors';
import contactRoutes from './contact';

const router = Router();

// Define routes
router.get('/', (req, res) => {
  res.json({ message: 'IT Partner API Routes' });
});

// Mount route modules here
router.use('/visitors', visitorRoutes);
router.use('/contact', contactRoutes);

export default router;
