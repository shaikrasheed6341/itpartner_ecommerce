import { Router } from 'express';
import { 
  createProduct, 
  getAllProducts, 
  getProductById,
  updateProduct,
  deleteProduct,
  testProducts,
  bulkCreateProducts,
  importProducts
} from '../controllers/productController';
import { adminAuth } from '../middleware/adminAuth';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

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

// POST /api/products/bulk - Bulk create products (admin only). Accepts { products: [...] } or { count: n }
router.post('/bulk', adminAuth, bulkCreateProducts);

// POST /api/products/import - Import products from CSV or JSON file (admin only)
// Use multipart/form-data with key 'file' (CSV with headers: name,brand,image_url,quantity,rate) or a JSON file/array
router.post('/import', adminAuth, upload.single('file'), importProducts);

// PUT /api/products/:id - Update product
router.put('/:id', adminAuth, updateProduct);

// DELETE /api/products/:id - Delete product
router.delete('/:id', adminAuth, deleteProduct);

export default router;
