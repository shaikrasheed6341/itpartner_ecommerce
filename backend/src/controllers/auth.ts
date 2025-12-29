import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';

export const register = async (req: any, res: any) => {
  try {
    const userData = req.body;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      const response = {
        success: false,
        error: 'User with this email already exists'
      };
      return res.status(400).json(response);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create user
    const user = await db.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        fullName: userData.fullName,
        phone: userData.phone,
        houseNumber: userData.houseNumber,
        street: userData.street,
        area: userData.area,
        city: userData.city,
        state: userData.state,
        pinCode: userData.pinCode
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
        createdAt: true,
        updatedAt: true
      }
    });

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'USER' },
      secret,
      { expiresIn: '7d' }
    );

    const response = {
      success: true,
      message: 'User registered successfully',
      data: {
        user: { ...user, role: 'USER' },
        token
      }
    };

    res.status(201).json(response);

  } catch (error) {
    console.error('Registration error:', error);
    const response = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    console.log('🔍 Attempting login for:', email);
    // Find user
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      const response = {
        success: false,
        error: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      const response = {
        success: false,
        error: 'Invalid email or password'
      };
      return res.status(401).json(response);
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'USER' },
      secret,
      { expiresIn: '7d' }
    );

    // Return user data (excluding password)
    const userData: any = {
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
      role: 'USER',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const response = {
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Login error:', error);

    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
      const response = {
        success: false,
        error: 'Database connection failed. Please check your database configuration.'
      };
      return res.status(500).json(response);
    }

    const response = {
      success: false,
      error: 'Login failed. Please try again.'
    };
    res.status(500).json(response);
  }
};

export const getProfile = async (req: any, res: any) => {
  try {
    const userId = (req as any).user.userId;

    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      const response = {
        success: false,
        error: 'User not found'
      };
      return res.status(404).json(response);
    }

    // Return user data (excluding password)
    const userData: any = {
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
      role: 'USER',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    const response = {
      success: true,
      data: { user: userData }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Get profile error:', error);
    const response = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

export const updateProfile = async (req: any, res: any) => {
  try {
    const userId = (req as any).user.userId;
    const userData = req.body;

    // Update user
    const user = await db.user.update({
      where: { id: userId },
      data: {
        fullName: userData.fullName,
        phone: userData.phone,
        houseNumber: userData.houseNumber,
        street: userData.street,
        area: userData.area,
        city: userData.city,
        state: userData.state,
        pinCode: userData.pinCode
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
        createdAt: true,
        updatedAt: true
      }
    });

    const response = {
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: { ...user, role: 'USER' }
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Update profile error:', error);
    const response = {
      success: false,
      error: 'Internal server error'
    };
    res.status(500).json(response);
  }
};

// Get all users (Admin only)
export const getAllUsers = async (req: any, res: any) => {
  try {
    const { limit = 50, page = 1, search } = req.query;
    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { fullName: { contains: search as string, mode: 'insensitive' as const } },
        { email: { contains: search as string, mode: 'insensitive' as const } },
        { phone: { contains: search as string, mode: 'insensitive' as const } },
      ],
    } : {};

    const users = await db.user.findMany({
      where: whereClause,
      take: limitNum,
      skip,
      orderBy: {
        createdAt: 'desc',
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
        createdAt: true,
        updatedAt: true
      }
    });

    const totalCount = await db.user.count({
      where: whereClause,
    });

    const response = {
      success: true,
      data: {
        users: users.map((user: any) => ({ ...user, role: 'USER' })),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalCount,
          limit: limitNum,
        },
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Error fetching users:', error);
    const response = {
      success: false,
      error: 'Failed to fetch users'
    };
    res.status(500).json(response);
  }
};
