import { Request, Response } from "express";
import Razorpay from "razorpay";
import { PrismaClient } from "../../generated/prisma";
import { calculateCartTotals } from "../addtocartcontroller";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
    user?: any;
}

export const checktoken = async (req: AuthRequest, res: Response) => {
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

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order with cart total amount
export const createOrder = async (req: AuthRequest, res: Response) => {
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

        // Create order in database using the calculated total amount
        const order = await prisma.order.create({
            data: {
                userId: userId,
                orderNumber: orderNumber,
                totalAmount: cartData.totalAmount,
                currency: "INR",
                status: "PENDING"
            },
        });

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: {
                order: {
                    id: order.id,
                    orderNumber: order.orderNumber,
                    totalAmount: order.totalAmount,
                    currency: order.currency,
                    status: order.status,
                    createdAt: order.createdAt
                },
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
export const createRazorpayOrder = async (req: AuthRequest, res: Response) => {
    try {
        // Check if user is authenticated
        if (!req.user || !req.user.userId) {
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
export const verifyPayment = async (req: AuthRequest, res: Response) => {
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