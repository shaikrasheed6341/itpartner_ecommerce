import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db';

export const register = async (c: Context) => {
  try {
    const userData = await c.req.json();

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return c.json({
        success: false,
        error: 'User with this email already exists'
      }, 400);
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

    return c.json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: { ...user, role: 'USER' },
        token
      }
    }, 201);

  } catch (error) {
    console.error('Registration error:', error);
    return c.json({
      success: false,
      
      error: 'Internal server error'
    }, 500);
  }
};

export const login = async (c: Context) => {
  try {
    const { email, password } = await c.req.json();

    console.log('🔍 Attempting login for:', email);
    // Find user
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return c.json({
        success: false,
        error: 'Invalid email or password'
      }, 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return c.json({
        success: false,
        error: 'Invalid email or password'
      }, 401);
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

    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    }, 200);

  } catch (error) {
    console.error('Login error:', error);

    // Check if it's a database connection error
    if (error instanceof Error && error.message.includes('Can\'t reach database server')) {
      return c.json({
        success: false,
        error: 'Database connection failed. Please check your database configuration.'
      }, 500);
    }

    return c.json({
      success: false,
      error: 'Login failed. Please try again.'
    }, 500);
  }
};

export const getProfile = async (c: Context) => {
  try {
    const userContext = c.get('user');
    const userId = userContext.userId;

    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
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

    return c.json({
      success: true,
      data: { user: userData }
    }, 200);

  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
};

export const updateProfile = async (c: Context) => {
  try {
    const userContext = c.get('user');
    const userId = userContext.userId;
    const userData = await c.req.json();

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

    return c.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: { ...user, role: 'USER' }
      }
    }, 200);

  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
};

// Get all users (Admin only)
export const getAllUsers = async (c: Context) => {
  try {
    const limit = c.req.query('limit') || '50';
    const page = c.req.query('page') || '1';
    const search = c.req.query('search');

    const limitNum = parseInt(limit);
    const pageNum = parseInt(page);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { fullName: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } },
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

    return c.json({
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
    }, 200);

  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch users'
    }, 500);
  }
};
