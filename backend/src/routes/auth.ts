import { Hono } from 'hono';
import { register, login, getProfile, getAllUsers } from '../controllers/auth';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const app = new Hono();

// Public routes
app.post('/register', register);
app.post('/login', login);

// Protected routes
app.get('/profile', authenticateToken, getProfile);

// Public routes for user data (or maybe admin?? Original code didn't have requireAdmin but comment said Admin only?)
// The original code: router.get('/users', getAllUsers);
// The controller comment: // Get all users (Admin only)
// But it wasn't using requireAdmin. I will keep it as is, but maybe the user meant to add it.
app.get('/users', getAllUsers);

export default app;
