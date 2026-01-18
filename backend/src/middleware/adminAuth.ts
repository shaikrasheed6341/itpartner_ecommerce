import { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { db } from '../db';

declare module 'hono' {
  interface ContextVariableMap {
    admin: {
      id: string;
      email: string;
      fullName: string;
      role: string;
    }
  }
}

export const adminAuth = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      message: 'Access denied. No token provided or invalid format.'
    }, 401);
  }

  const token = authHeader.substring(7);

  if (!token) {
    return c.json({
      success: false,
      message: 'Access denied. No token provided.'
    }, 401);
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    if (!decoded.adminId) {
      return c.json({
        success: false,
        message: 'Access denied. Invalid token.'
      }, 401);
    }

    // Check if admin exists in database
    const admin = await db.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isFirstLogin: true
      }
    });

    if (!admin) {
      return c.json({
        success: false,
        message: 'Access denied. Admin not found.'
      }, 401);
    }

    // Add admin info to context
    c.set('admin', {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: 'ADMIN'
    });

    await next();

  } catch (error) {
    console.error('Admin auth error:', error);

    if (error instanceof jwt.JsonWebTokenError) {
      return c.json({
        success: false,
        message: 'Access denied. Invalid token.'
      }, 401);
    }

    return c.json({
      success: false,
      message: 'Internal server error during authentication.'
    }, 500);
  }
};

export const requireAdminAuth = (c: Context, next: Next) => {
  const admin = c.get('admin');
  if (!admin) {
    return c.json({
      success: false,
      message: 'Admin authentication required.'
    }, 401);
  }
  return next();
};
