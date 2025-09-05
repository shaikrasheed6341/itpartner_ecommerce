import { Router } from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController';
import { requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes
// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// Admin only routes
// POST /api/products - Create a new product
router.post('/', requireAdmin, createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', requireAdmin, updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
