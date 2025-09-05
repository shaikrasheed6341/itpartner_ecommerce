import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface AdminRegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

interface AdminLoginRequest {
  email: string;
  password: string;
  otp: string;
}

// Generate 6-digit OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const adminRegister = async (req: Request, res: Response) => {
  try {
    console.log('Admin registration request:', req.body);
    const { email, password, fullName }: AdminRegisterRequest = req.body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return res.status(400).json({
        message: 'Email, password, and full name are required'
      });
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return res.status(400).json({
        message: 'Admin with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        otp
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        otp: true,
        createdAt: true
      }
    });

    res.status(201).json({
      message: 'Admin registered successfully. Please use the OTP for login.',
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        otp: admin.otp // In production, send this via email/SMS
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password, otp }: AdminLoginRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Check if it's first login - OTP required
    if (admin.isFirstLogin) {
      if (!otp) {
        return res.status(400).json({
          message: 'OTP is required for first login',
          requiresOTP: true
        });
      }

      // Verify OTP for first login
      if (admin.otp !== otp) {
        return res.status(401).json({
          message: 'Invalid OTP'
        });
      }

      // Mark as not first login and clear OTP
      await prisma.admin.update({
        where: { id: admin.id },
        data: { 
          otp: null,
          isFirstLogin: false 
        }
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        email: admin.email, 
        role: 'ADMIN',
        type: 'admin'
      },
      secret,
      { expiresIn: '7d' }
    );

    // Return admin data (excluding password and OTP)
    const adminData = {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: 'ADMIN',
      isFirstLogin: admin.isFirstLogin
    };

    res.status(200).json({
      message: 'Admin login successful',
      admin: adminData,
      token
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const adminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = (req as any).user.adminId;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      admin
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const checkLoginRequirements = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isFirstLogin: true,
        otp: true
      }
    });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      email: admin.email,
      isFirstLogin: admin.isFirstLogin,
      requiresOTP: admin.isFirstLogin,
      otp: admin.isFirstLogin ? admin.otp : null // Only return OTP if first login
    });

  } catch (error) {
    console.error('Check login requirements error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const generateNewOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email is required'
      });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return res.status(404).json({
        message: 'Admin not found'
      });
    }

    // Generate new OTP
    const newOTP = generateOTP();

    // Update admin with new OTP
    await prisma.admin.update({
      where: { id: admin.id },
      data: { otp: newOTP }
    });

    res.status(200).json({
      message: 'New OTP generated successfully',
      otp: newOTP // In production, send this via email/SMS
    });

  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
