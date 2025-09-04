import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pinCode: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      fullName,
      phone,
      houseNumber,
      street,
      area,
      city,
      state,
      pinCode
    }: RegisterRequest = req.body;

    // Validate required fields
    if (!email || !password || !fullName || !phone || !houseNumber || !street || !area || !city || !state || !pinCode) {
      return res.status(400).json({
        message: 'All fields are required'
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phone,
        houseNumber,
        street,
        area,
        city,
        state,
        pinCode
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        houseNumber: true,
        street: true,
        area: true,
        city: true,
        state: true,
        pinCode: true,

      }
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      secret,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      houseNumber: user.houseNumber,
      street: user.street,
      area: user.area,
      city: user.city,
      state: user.state,
      pinCode: user.pinCode,
      
    };

    res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        houseNumber: true,
        street: true,
        area: true,
        city: true,
        state: true,
        pinCode: true,
        
        
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};
