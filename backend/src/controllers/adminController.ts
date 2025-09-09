import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

// Generate 6-digit OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const adminRegister = async (req: any, res: any) => {
  try {
    console.log('Admin registration request:', req.body);
    const { email, password, fullName } = req.body;

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

export const adminLogin = async (req: any, res: any) => {
  try {
    const { email, password, otp } = req.body;

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
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Check if it's first login - OTP required
    if (admin.isFirstLogin) {
      if (!otp) {
        return res.status(400).json({
          success: false,
          error: 'OTP is required for first login',
          requiresOTP: true
        });
      }

      // Verify OTP for first login
      if (admin.otp !== otp) {
        return res.status(401).json({
          success: false,
          error: 'Invalid OTP'
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
      success: true,
      message: 'Admin login successful',
      data: {
        admin: adminData,
        token
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const adminProfile = async (req: any, res: any) => {
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

export const checkLoginRequirements = async (req: any, res: any) => {
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
        success: false,
        error: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: admin.email,
        isFirstLogin: admin.isFirstLogin,
        requiresOTP: admin.isFirstLogin,
        otp: admin.isFirstLogin ? admin.otp : null
      }
    });

  } catch (error) {
    console.error('Check login requirements error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

export const generateNewOTP = async (req: any, res: any) => {
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

// Get all orders for admin
export const getAllOrders = async (req: any, res: any) => {
  try {
    // Get all orders with order items and user details
    const orders = await prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                image_url: true,
                rate: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            houseNumber: true,
            street: true,
            area: true,
            city: true,
            state: true,
            pinCode: true
          }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            providerPaymentId: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format orders with order items
    const formattedOrders = orders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      razorpayOrderId: order.razorpayOrderId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        itemTotal: item.quantity * item.price,
        product: item.product
      })),
      user: order.user,
      payments: order.payments,
      summary: {
        totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
        itemCount: order.orderItems.length,
        totalAmount: order.totalAmount
      }
    }));

    res.status(200).json({
      success: true,
      message: "All orders retrieved successfully",
      data: {
        orders: formattedOrders,
        totalOrders: orders.length
      }
    });

  } catch (error) {
    console.error('Error getting all orders:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get orders', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Update order status
export const updateOrderStatus = async (req: any, res: any) => {
  try {
    // Check if user is admin - use req.admin instead of req.user
    if (!req.admin || req.admin.role !== 'ADMIN') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }

    const { orderId } = req.params;
    const { status } = req.body;

    // Validate input
    if (!orderId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order ID is required' 
      });
    }

    if (!status || !['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid status is required' 
      });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                image_url: true,
                rate: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            houseNumber: true,
            street: true,
            area: true,
            city: true,
            state: true,
            pinCode: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: {
        order: {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          totalAmount: updatedOrder.totalAmount,
          updatedAt: updatedOrder.updatedAt
        }
      }
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update order status', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Ship order
// Note: shipOrder function moved to shippingController.ts for better organization
// Use updateShippingStage from shippingController instead