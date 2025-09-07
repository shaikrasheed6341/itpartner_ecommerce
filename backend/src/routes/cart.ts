import { Router } from 'express';
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

const router = Router();

// All cart routes require authentication
router.use(authenticateToken);

// GET /api/cart - Get user's cart
router.get('/', getCartController);

// POST /api/cart - Add single item to cart
router.post('/', addToCartController);

// POST /api/cart/add-multiple - Add multiple items to cart
router.post('/add-multiple', addMultipleToCartController);

// POST /api/cart/process-checkout - Process checkout and create order
router.post('/process-checkout', processCheckoutController);

// PUT /api/cart/:productId - Update cart item quantity
router.put('/:productId', updateCartItemQuantityController);

// DELETE /api/cart/:productId - Remove item from cart
router.delete('/:productId', removeFromCartController);

// DELETE /api/cart/clear - Clear entire cart
router.delete('/clear', clearCartController);

export default router;
