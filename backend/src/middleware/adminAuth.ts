import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export const adminAuth = async (req: any, res: any, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided or invalid format.'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (!decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }

    // Check if admin exists in database
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        fullName: true,
        isFirstLogin: true
      }
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Admin not found.'
      });
    }

    // Add admin info to request object
    req.admin = {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: 'ADMIN'
    };

    next();

  } catch (error) {
    console.error('Admin auth error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.'
    });
  }
};

export const requireAdminAuth = (req: any, res: any, next: NextFunction) => {
  if (!req.admin) {
    return res.status(401).json({
      success: false,
      message: 'Admin authentication required.'
    });
  }
  next();
};


