import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { db } from '../db';

declare module 'hono' {
  interface ContextVariableMap {
    user: {
      userId: string;
      email: string;
      role: string;
    }
  }
}

export const authenticateToken = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return c.json({
      success: false,
      message: 'Access token required'
    }, 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Get user from database to ensure they still exist
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true }
    });

    if (!user) {
      return c.json({
        success: false,
        message: 'User not found'
      }, 401);
    }

    c.set('user', {
      userId: user.id,
      email: user.email,
      role: user.role
    });

    await next();
  } catch (error) {
    return c.json({
      success: false,
      message: 'Invalid or expired token'
    }, 403);
  }
};

export const requireAdmin = async (c: Context, next: Next) => {
  const user = c.get('user');

  if (!user) {
    return c.json({
      success: false,
      message: 'Authentication required'
    }, 401);
  }

  if (user.role !== 'ADMIN') {
    return c.json({
      success: false,
      message: 'Admin access required'
    }, 403);
  }

  await next();
};
