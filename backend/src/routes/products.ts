import { Router } from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById,
  updateProduct,
  deleteProduct,
  testProducts
} from '../controllers/productController';
import { adminAuth } from '../middleware/adminAuth';

const router = Router();

// Test route
router.get('/test', testProducts);

// Public routes
// GET /api/products - Get all products
router.get('/', getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', getProductById);

// Admin only routes
// POST /api/products - Create a new product
router.post('/', adminAuth, createProduct);

// PUT /api/products/:id - Update product
router.put('/:id', adminAuth, updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', adminAuth, deleteProduct);

export default router;
