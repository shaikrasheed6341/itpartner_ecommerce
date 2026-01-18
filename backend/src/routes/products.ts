import { Hono } from 'hono';
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

const app = new Hono();

// Test route
app.get('/test', testProducts);

// Public routes
app.get('/', getAllProducts);
app.get('/:id', getProductById);

// Admin only routes
app.post('/', adminAuth, createProduct);
app.post('/bulk', adminAuth, bulkCreateProducts);
app.post('/import', adminAuth, importProducts); // File handling logic is now inside controller
app.put('/:id', adminAuth, updateProduct);
app.delete('/:id', adminAuth, deleteProduct);

export default app;
