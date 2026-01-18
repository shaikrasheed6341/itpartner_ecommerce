import { Context } from 'hono';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { db } from '../db';

// Generate 6-digit OTP
const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

export const adminRegister = async (c: Context) => {
  try {
    const body = await c.req.json();
    console.log('Admin registration request:', body);
    const { email, password, fullName } = body;

    // Validate required fields
    if (!email || !password || !fullName) {
      return c.json({
        message: 'Email, password, and full name are required'
      }, 400);
    }

    // Check if admin already exists
    const existingAdmin = await db.admin.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      return c.json({
        message: 'Admin with this email already exists'
      }, 400);
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate OTP
    const otp = generateOTP();

    // Create admin
    const admin = await db.admin.create({
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

    return c.json({
      message: 'Admin registered successfully. Please use the OTP for login.',
      admin: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        otp: admin.otp // In production, send this via email/SMS
      }
    }, 201);

  } catch (error) {
    console.error('Admin registration error:', error);
    return c.json({
      message: 'Internal server error'
    }, 500);
  }
};

export const adminLogin = async (c: Context) => {
  try {
    const { email, password, otp } = await c.req.json();

    // Validate required fields
    if (!email || !password) {
      return c.json({
        message: 'Email and password are required'
      }, 400);
    }

    // Find admin
    const admin = await db.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return c.json({
        success: false,
        error: 'Invalid email or password'
      }, 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return c.json({
        success: false,
        error: 'Invalid email or password'
      }, 401);
    }

    // Check if it's first login - OTP required
    if (admin.isFirstLogin) {
      if (!otp) {
        return c.json({
          success: false,
          error: 'OTP is required for first login',
          requiresOTP: true
        }, 400);
      }

      // Verify OTP for first login
      if (admin.otp !== otp) {
        return c.json({
          success: false,
          error: 'Invalid OTP'
        }, 401);
      }

      // Mark as not first login and clear OTP
      await db.admin.update({
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

    return c.json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: adminData,
        token
      }
    }, 200);

  } catch (error: any) {
    console.error('Admin login error:', error);
    return c.json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: error.stack
    }, 500);
  }
};

export const adminProfile = async (c: Context) => {
  try {
    const adminInfo = c.get('admin'); // Assuming adminAuth middleware sets this? Or if this is manual
    // If this route is protected by adminAuth, we can use c.get('admin').
    // If NOT protected by default, we'd need to parse token again.
    // The original code used (req as any).user.adminId which implies authenticateToken middleware or similar.
    // But route file uses adminAuth middleware which sets req.admin.
    // So c.get('admin') is correct if middleware is used.

    // NOTE: adminAuth uses c.set('admin', ...).

    // However, if the middleware wasn't used, this would fail.
    // Assuming middleware is used.

    const adminId = adminInfo?.id;

    if (!adminId) {
      // Maybe token didn't have it or middleware not used
      return c.json({ message: 'Unauthorized' }, 401);
    }

    const admin = await db.admin.findUnique({
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
      return c.json({
        message: 'Admin not found'
      }, 404);
    }

    return c.json({
      admin
    }, 200);

  } catch (error) {
    console.error('Get admin profile error:', error);
    return c.json({
      message: 'Internal server error'
    }, 500);
  }
};

export const checkLoginRequirements = async (c: Context) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({
        message: 'Email is required'
      }, 400);
    }

    // Find admin
    const admin = await db.admin.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        isFirstLogin: true,
        otp: true
      }
    });

    if (!admin) {
      return c.json({
        success: false,
        error: 'Admin not found'
      }, 404);
    }

    return c.json({
      success: true,
      data: {
        email: admin.email,
        isFirstLogin: admin.isFirstLogin,
        requiresOTP: admin.isFirstLogin,
        otp: admin.isFirstLogin ? admin.otp : null
      }
    }, 200);

  } catch (error) {
    console.error('Check login requirements error:', error);
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500);
  }
};

export const generateNewOTP = async (c: Context) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({
        message: 'Email is required'
      }, 400);
    }

    // Find admin
    const admin = await db.admin.findUnique({
      where: { email }
    });

    if (!admin) {
      return c.json({
        message: 'Admin not found'
      }, 404);
    }

    // Generate new OTP
    const newOTP = generateOTP();

    // Update admin with new OTP
    await db.admin.update({
      where: { id: admin.id },
      data: { otp: newOTP }
    });

    return c.json({
      message: 'New OTP generated successfully',
      otp: newOTP // In production, send this via email/SMS
    }, 200);

  } catch (error) {
    console.error('Generate OTP error:', error);
    return c.json({
      message: 'Internal server error'
    }, 500);
  }
};

// Get all orders for admin
export const getAllOrders = async (c: Context) => {
  try {
    // Get all orders with order items and user details
    const orders = await db.order.findMany({
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
    const formattedOrders = orders.map((order: any) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: parseFloat(order.totalAmount) || 0,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      razorpayOrderId: order.razorpayOrderId,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      orderItems: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: parseFloat(item.price) || 0,
        itemTotal: item.quantity * (parseFloat(item.price) || 0),
        product: item.product
      })),
      user: order.user,
      payments: order.payments,
      summary: {
        totalItems: order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
        itemCount: order.orderItems.length,
        totalAmount: parseFloat(order.totalAmount) || 0
      }
    }));

    return c.json({
      success: true,
      message: "All orders retrieved successfully",
      data: {
        orders: formattedOrders,
        totalOrders: orders.length
      }
    }, 200);

  } catch (error) {
    console.error('Error getting all orders:', error);
    return c.json({
      success: false,
      message: 'Failed to get orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

// Update order status
export const updateOrderStatus = async (c: Context) => {
  try {
    // Check if user is admin - use c.get('admin') instead of req.admin
    const admin = c.get('admin');
    if (!admin || admin.role !== 'ADMIN') {
      return c.json({
        success: false,
        message: 'Admin access required'
      }, 403);
    }

    const orderId = c.req.param('orderId');
    const { status } = await c.req.json();

    // Validate input
    if (!orderId) {
      return c.json({
        success: false,
        message: 'Order ID is required'
      }, 400);
    }

    // Validate against full enum from schema
    if (!status || !['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(status)) {
      return c.json({
        success: false,
        message: 'Valid status is required'
      }, 400);
    }

    // Update order status
    const updatedOrder = await db.order.update({
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

    return c.json({
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
    }, 200);

  } catch (error) {
    console.error('Error updating order status:', error);
    return c.json({
      success: false,
      message: 'Failed to update order status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};