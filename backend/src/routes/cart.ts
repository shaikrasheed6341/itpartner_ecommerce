import express from 'express';
import { 
  addToCart, 
  addMultipleToCart,
  getUserCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  processCheckout
} from '../controllers/addtocartcontroller';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All cart routes require authentication
router.use(authenticateToken);

// Add item to cart
router.post('/add', addToCart);

// Add multiple items to cart
router.post('/add-multiple', addMultipleToCart);

// Process checkout
router.post('/process-checkout', processCheckout);

// Get user's cart with totals
router.get('/', getUserCart);

// Update cart item quantity
router.put('/update/:productId', updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', removeFromCart);

// Clear entire cart
router.delete('/clear', clearCart);

export default router;
