import { Context } from 'hono';
import Razorpay from "razorpay";
import { calculateCartTotals } from "../addtocartcontroller";
import { db } from "../../db";
import crypto from 'crypto';

// Check if keys are valid
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    // console.warn/throw might be better handled, but for now throwing is ok as per original
    // throw new Error('RAZORPAY CREDENTIALS MISSING!');
    // To allow build without env vars, maybe just log error 
    console.error('RAZORPAY CREDENTIALS MISSING!');
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
});

// Create order with cart total amount and order items
export const createOrder = async (c: Context) => {
    try {
        const user = c.get('user');
        if (!user || !user.userId) {
            return c.json({
                success: false,
                message: 'Authentication required. Please login first.'
            }, 401);
        }

        const userId = user.userId;

        // Use the imported function to get cart totals instead of recalculating
        const cartData = await calculateCartTotals(userId);

        // Check if cart is empty
        if (cartData.itemCount === 0) {
            return c.json({
                success: false,
                message: 'Cart is empty. Please add items to cart before creating order.'
            }, 400);
        }

        // Generate unique order number
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Create order and order items in a transaction
        const result = await db.$transaction(async (tx: any) => {
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
            // Note: tx.orderItem might need to be db.orderItem if tx doesn't have it exposed 
            // depending on Drizzle/Prisma setup. Assuming tx works as per original code.
            const orderItems: any[] = [];
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

        return c.json({
            success: true,
            message: "Order created successfully",
            data: {
                order: {
                    id: result.order.id,
                    orderNumber: result.order.orderNumber,
                    totalAmount: parseFloat(result.order.totalAmount) || 0,
                    currency: result.order.currency,
                    status: result.order.status,
                    createdAt: result.order.createdAt
                },
                orderItems: result.orderItems.map((item: any) => ({
                    id: item.id,
                    productId: item.productId,
                    quantity: item.quantity,
                    price: parseFloat(item.price) || 0,
                    itemTotal: item.quantity * (parseFloat(item.price) || 0),
                    product: item.product
                })),
                orderSummary: {
                    items: cartData.items,
                    totalAmount: cartData.totalAmount,
                    totalItems: cartData.totalItems,
                    itemCount: cartData.itemCount
                }
            }
        }, 201);

    } catch (error) {
        console.error('Error creating order:', error);
        return c.json({
            success: false,
            message: 'Failed to create order',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};

// Create Razorpay order for payment
export const createRazorpayOrder = async (c: Context) => {
    try {
        console.log('=== createRazorpayOrder called ===');
        console.log('RAZORPAY_KEY_ID at runtime:', process.env.RAZORPAY_KEY_ID);

        const user = c.get('user');
        if (!user || !user.userId) {
            return c.json({
                success: false,
                message: 'Authentication required. Please login first.'
            }, 401);
        }

        const userId = user.userId;
        const { orderId } = await c.req.json();

        // Validate input
        if (!orderId) {
            return c.json({
                success: false,
                message: 'Order ID is required'
            }, 400);
        }

        // Get order from database
        const order = await db.order.findFirst({
            where: {
                id: orderId,
                userId: userId
            }
        });

        if (!order) {
            return c.json({
                success: false,
                message: 'Order not found'
            }, 404);
        }

        // Create Razorpay order
        const orderAmount = parseFloat(order.totalAmount) || 0;

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(orderAmount * 100), // Convert to paise
            currency: order.currency,
            receipt: order.orderNumber,
            notes: {
                orderId: order.id,
                userId: userId
            }
        });

        // Update order with Razorpay order ID
        await db.order.update({
            where: { id: orderId },
            data: {
                razorpayOrderId: razorpayOrder.id
            }
        });

        return c.json({
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
        return c.json({
            success: false,
            message: 'Failed to create Razorpay order',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};

// Verify payment
export const verifyPayment = async (c: Context) => {
    try {
        const user = c.get('user');
        if (!user || !user.userId) {
            return c.json({
                success: false,
                message: 'Authentication required. Please login first.'
            }, 401);
        }

        const userId = user.userId;
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await c.req.json();

        // Validate input
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return c.json({
                success: false,
                message: 'Payment verification parameters are required'
            }, 400);
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return c.json({
                success: false,
                message: 'Invalid payment signature'
            }, 400);
        }

        // Get order from database
        const order = await db.order.findFirst({
            where: {
                razorpayOrderId: razorpay_order_id,
                userId: userId
            }
        });

        if (!order) {
            return c.json({
                success: false,
                message: 'Order not found'
            }, 404);
        }

        // Create payment record
        const orderAmount = parseFloat(order.totalAmount) || 0;
        const payment = await db.payment.create({
            data: {
                orderId: order.id,
                userId: userId,
                paymentMethod: "RAZORPAY",
                amount: orderAmount,
                status: "SUCCESS",
                providerPaymentId: razorpay_payment_id
            }
        });

        // Update order status
        await db.order.update({
            where: { id: order.id },
            data: {
                status: "CONFIRMED",
                paymentMethod: "RAZORPAY"
            }
        });

        // Clear cart after successful payment
        await db.cart.deleteMany({
            where: { userId: userId }
        });

        return c.json({
            success: true,
            message: "Payment verified successfully",
            data: {
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: "CONFIRMED",
                    totalAmount: orderAmount
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
        return c.json({
            success: false,
            message: 'Failed to verify payment',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};

// Get order details with order items (for admin and user)
export const getOrderDetails = async (c: Context) => {
    try {
        const user = c.get('user');
        if (!user || !user.userId) {
            return c.json({
                success: false,
                message: 'Authentication required. Please login first.'
            }, 401);
        }

        const userId = user.userId;
        const orderId = c.req.param('orderId');

        // Validate input
        if (!orderId) {
            return c.json({
                success: false,
                message: 'Order ID is required'
            }, 400);
        }

        // Get order with order items and product details
        const order = await db.order.findFirst({
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
            return c.json({
                success: false,
                message: 'Order not found'
            }, 404);
        }

        // Format order items with totals
        const formattedOrderItems = order.orderItems.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            price: parseFloat(item.price) || 0,
            itemTotal: item.quantity * (parseFloat(item.price) || 0),
            product: item.product
        }));

        const summary = {
            totalItems: order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
            itemCount: order.orderItems.length,
            totalAmount: parseFloat(order.totalAmount) || 0
        };

        return c.json({
            success: true,
            message: "Order details retrieved successfully",
            data: {
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    status: order.status,
                    totalAmount: parseFloat(order.totalAmount) || 0,
                    currency: order.currency,
                    paymentMethod: order.paymentMethod,
                    razorpayOrderId: order.razorpayOrderId,
                    createdAt: order.createdAt,
                    updatedAt: order.updatedAt
                },
                orderItems: formattedOrderItems,
                customer: order.user,
                payments: order.payments,
                summary
            }
        });

    } catch (error) {
        console.error('Error getting order details:', error);
        return c.json({
            success: false,
            message: 'Failed to get order details',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};

// Get all orders for a user
export const getUserOrders = async (c: Context) => {
    try {
        const user = c.get('user');
        if (!user || !user.userId) {
            return c.json({
                success: false,
                message: 'Authentication required. Please login first.'
            }, 401);
        }

        const userId = user.userId;

        // Get all orders for the user with order items
        const orders = await db.order.findMany({
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
        const formattedOrders = orders.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: parseFloat(order.totalAmount) || 0,
            currency: order.currency,
            paymentMethod: order.paymentMethod,
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
            payments: order.payments,
            summary: {
                totalItems: order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
                itemCount: order.orderItems.length
            }
        }));

        return c.json({
            success: true,
            message: "User orders retrieved successfully",
            data: {
                orders: formattedOrders,
                totalOrders: orders.length
            }
        });

    } catch (error) {
        console.error('Error getting user orders:', error);
        return c.json({
            success: false,
            message: 'Failed to get user orders',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
    }
};