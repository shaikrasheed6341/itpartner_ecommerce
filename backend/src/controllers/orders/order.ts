import Razorpay from "razorpay";
import { PrismaClient } from "../../generated/prisma";
import { calculateCartTotals } from "../addtocartcontroller";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

export const checktoken = async (req: any, res: any) => {
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({
            success: false,
            message: "no token provided",
        });
    }
    if(!authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success: false,
            message: "invalid token",
        });
    }
    const token = authHeader.substring(7);
     if(!token){
        return res.status(401).json({
            success: false,
            message: "invalid token",
        });
     }
     
     res.status(200).json({
        success: true,
        message: "Token verified successfully",
        token,
    })
}

// Debug: Check if environment variables are loaded
console.log('=== RAZORPAY CONFIGURATION DEBUG ===');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '***SET***' : 'NOT SET');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All env vars starting with RAZORPAY:', Object.keys(process.env).filter(key => key.startsWith('RAZORPAY')));

// Check if keys are valid
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error('❌ RAZORPAY CREDENTIALS MISSING!');
    console.error('KEY_ID:', process.env.RAZORPAY_KEY_ID);
    console.error('KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
} else {
    console.log('✅ RAZORPAY CREDENTIALS FOUND');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order with cart total amount and order items
export const createOrder = async (req: any, res: any) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login first.' 
            });
        }

        const userId = req.user.userId;

        // Use the imported function to get cart totals instead of recalculating
        const cartData = await calculateCartTotals(userId);

        // Check if cart is empty
        if (cartData.itemCount === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Cart is empty. Please add items to cart before creating order.' 
            });
        }

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create order and order items in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create order in database using the calculated total amount
            const order = await tx.order.create({
                data: {
                    userId: userId,
                    orderNumber: orderNumber,
                    totalAmount: cartData.totalAmount,
                    currency: "INR",
                    status: "PENDING"
                },
            });

            // Create order items for each cart item
            const orderItems = [];
            for (const cartItem of cartData.items) {
                const orderItem = await tx.orderItem.create({
                    data: {
                        orderId: order.id,
                        productId: cartItem.productId,
                        quantity: cartItem.quantity,
                        price: cartItem.product.rate // Store price at time of order
                    },
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
                });
                orderItems.push(orderItem);
            }

            return { order, orderItems };
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                order: {
                    id: result.order.id,
                    orderNumber: result.order.orderNumber,
                    totalAmount: result.order.totalAmount,
                    currency: result.order.currency,
                    status: result.order.status,
                    createdAt: result.order.createdAt
                },
                orderItems: result.orderItems.map(item => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                    itemTotal: item.quantity * item.price,
                    product: item.product
                })),
                orderSummary: {
                    items: cartData.items,
                    totalAmount: cartData.totalAmount,
                    totalItems: cartData.totalItems,
                    itemCount: cartData.itemCount
                }
            }
        });

    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create order', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Create Razorpay order for payment
export const createRazorpayOrder = async (req: any, res: any) => {
    try {
        console.log('=== createRazorpayOrder called ===');
        console.log('RAZORPAY_KEY_ID at runtime:', process.env.RAZORPAY_KEY_ID);
        console.log('RAZORPAY_KEY_SECRET at runtime:', process.env.RAZORPAY_KEY_SECRET ? '***SET***' : 'NOT SET');
        
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
            console.log('❌ Authentication failed - no user or userId');
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login first.' 
            });
        }

        const userId = req.user.userId;
        const { orderId } = req.body;

        // Validate input
        if (!orderId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order ID is required' 
            });
        }

        // Get order from database
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId
            }
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Create Razorpay order
        console.log('About to create Razorpay order with:');
        console.log('- Amount:', Math.round(order.totalAmount * 100));
        console.log('- Currency:', order.currency);
        console.log('- Receipt:', order.orderNumber);
        console.log('- Using Razorpay KEY_ID:', process.env.RAZORPAY_KEY_ID);
        
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(order.totalAmount * 100), // Convert to paise
            currency: order.currency,
            receipt: order.orderNumber,
            notes: {
                orderId: order.id,
                userId: userId
            }
        });

        // Update order with Razorpay order ID
        await prisma.order.update({
            where: { id: orderId },
            data: {
                razorpayOrderId: razorpayOrder.id
            }
        });

        res.status(200).json({
            success: true,
            message: "Razorpay order created successfully",
            data: {
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                receipt: razorpayOrder.receipt,
                key_id: process.env.RAZORPAY_KEY_ID
            }
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to create Razorpay order', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Verify payment
export const verifyPayment = async (req: any, res: any) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login first.' 
            });
        }

        const userId = req.user.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        // Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment verification parameters are required' 
            });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment signature' 
            });
        }

        // Get order from database
        const order = await prisma.order.findFirst({
            where: {
                razorpayOrderId: razorpay_order_id,
                userId: userId
            }
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                orderId: order.id,
                userId: userId,
                paymentMethod: "RAZORPAY",
                amount: order.totalAmount,
                status: "SUCCESS",
                providerPaymentId: razorpay_payment_id
            }
        });

        // Update order status
        await prisma.order.update({
            where: { id: order.id },
            data: {
                status: "CONFIRMED",
                paymentMethod: "RAZORPAY"
            }
        });

        // Clear cart after successful payment
        await prisma.cart.deleteMany({
            where: { userId: userId }
        });

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            data: {
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: "CONFIRMED",
                    totalAmount: order.totalAmount
                },
                payment: {
                    id: payment.id,
                    amount: payment.amount,
                    status: payment.status,
                    providerPaymentId: payment.providerPaymentId
                }
            }
        });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to verify payment', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Get order details with order items (for admin and user)
export const getOrderDetails = async (req: any, res: any) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login first.' 
            });
        }

        const userId = req.user.userId;
        const { orderId } = req.params;

        // Validate input
        if (!orderId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Order ID is required' 
            });
        }

        // Get order with order items and product details
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                userId: userId
            },
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
            }
        });

        if (!order) {
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found' 
            });
        }

        // Format order items with totals
        const formattedOrderItems = order.orderItems.map(item => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            itemTotal: item.quantity * item.price,
            product: item.product
        }));

        res.status(200).json({
            success: true,
            message: "Order details retrieved successfully",
            data: {
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    totalAmount: order.totalAmount,
                    currency: order.currency,
                    paymentMethod: order.paymentMethod,
                    razorpayOrderId: order.razorpayOrderId,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                },
                orderItems: formattedOrderItems,
                customer: order.user,
                payments: order.payments,
                summary: {
                    totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
                    itemCount: order.orderItems.length,
                    totalAmount: order.totalAmount
                }
            }
        });

    } catch (error) {
        console.error('Error getting order details:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get order details', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};

// Get all orders for a user
export const getUserOrders = async (req: any, res: any) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Please login first.' 
            });
        }

        const userId = req.user.userId;

        // Get all orders for the user with order items
        const orders = await prisma.order.findMany({
            where: {
                userId: userId
            },
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
                payments: {
                    select: {
                        id: true,
                        amount: true,
                        status: true,
                        paymentMethod: true,
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
            payments: order.payments,
            summary: {
                totalItems: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
                itemCount: order.orderItems.length
            }
        }));

        res.status(200).json({
            success: true,
            message: "User orders retrieved successfully",
            data: {
                orders: formattedOrders,
                totalOrders: orders.length
            }
        });

    } catch (error) {
        console.error('Error getting user orders:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to get user orders', 
            error: error instanceof Error ? error.message : 'Unknown error' 
        });
    }
};