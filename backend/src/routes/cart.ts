import { Hono } from 'hono';
import { authenticateToken } from '../middleware/auth';
import {
  addToCartController,
  getCartController,
  removeFromCartController,
  updateCartItemQuantityController,
  clearCartController,
  addMultipleToCartController,
  processCheckoutController
} from '../controllers/addtocartcontroller';

const app = new Hono();

// All cart routes require authentication
app.use('*', authenticateToken);

// GET /api/cart - Get user's cart
app.get('/', getCartController);

// POST /api/cart - Add single item to cart
app.post('/', addToCartController);

// POST /api/cart/add-multiple - Add multiple items to cart
app.post('/add-multiple', addMultipleToCartController);

// POST /api/cart/process-checkout - Process checkout and create order
app.post('/process-checkout', processCheckoutController);

// PUT /api/cart/:productId - Update cart item quantity
app.put('/:productId', updateCartItemQuantityController);

// DELETE /api/cart/:productId - Remove item from cart
app.delete('/:productId', removeFromCartController);

// DELETE /api/cart/clear - Clear entire cart
app.delete('/clear', clearCartController);

export default app;
