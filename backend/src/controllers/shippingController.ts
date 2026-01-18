import { Context } from 'hono';
import { db } from '../db';

// Get all confirmed orders for admin
export const getConfirmedOrders = async (c: Context) => {
  try {
    // Check if user is admin
    const admin = c.get('admin');
    if (!admin || admin.role !== 'ADMIN') {
      return c.json({
        success: false,
        message: 'Admin access required'
      }, 403);
    }

    const orders = await db.order.findMany({
      where: {
        status: {
          in: ['CONFIRMED', 'PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY']
        }
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
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return c.json({
      success: true,
      message: "Confirmed orders retrieved successfully",
      data: {
        orders: orders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          paymentMethod: order.paymentMethod,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          summary: {
            totalItems: order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
            totalAmount: order.totalAmount
          },
          orderItems: order.orderItems,
          user: order.user,
          payments: order.payments,
          // Shipping tracking info
          trackingNumber: order.trackingNumber,
          carrierName: order.carrierName,
          estimatedDelivery: order.estimatedDelivery,
          deliveryNotes: order.deliveryNotes,
          // Stage timestamps
          orderPlacedAt: order.orderPlacedAt,
          processingAt: order.processingAt,
          packedAt: order.packedAt,
          shippedAt: order.shippedAt,
          inTransitAt: order.inTransitAt,
          outForDeliveryAt: order.outForDeliveryAt,
          deliveredAt: order.deliveredAt
        }))
      }
    }, 200);

  } catch (error) {
    console.error('Error fetching confirmed orders:', error);
    return c.json({
      success: false,
      message: 'Failed to fetch confirmed orders',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

// Optimized route to update order shipping stage
export const updateShippingStage = async (c: Context) => {
  try {
    // Check if user is admin
    const admin = c.get('admin');
    if (!admin || admin.role !== 'ADMIN') {
      return c.json({
        success: false,
        message: 'Admin access required'
      }, 403);
    }

    const orderId = c.req.param('orderId');
    const { stage, trackingNumber, carrierName, estimatedDelivery, notes } = await c.req.json();

    // Validate input
    if (!orderId || !stage) {
      return c.json({
        success: false,
        message: 'Order ID and stage are required'
      }, 400);
    }

    // Valid stages in correct order
    const validStages = ['PACKED', 'SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    if (!validStages.includes(stage)) {
      return c.json({
        success: false,
        message: 'Invalid stage. Valid stages: PACKED, SHIPPED, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED'
      }, 400);
    }

    // Get current order
    const currentOrder = await db.order.findUnique({
      where: { id: orderId }
    });

    if (!currentOrder) {
      return c.json({
        success: false,
        message: 'Order not found'
      }, 404);
    }

    // Check if order can be updated to this stage
    const currentStageIndex = validStages.indexOf(currentOrder.status);
    const newStageIndex = validStages.indexOf(stage);

    if (currentStageIndex >= newStageIndex) {
      return c.json({
        success: false,
        message: `Order is already at or past ${stage} stage`
      }, 400);
    }

    // Prepare update data
    const updateData: any = {
      status: stage,
      updatedAt: new Date()
    };

    // Set timestamp for the current stage
    switch (stage) {
      case 'PACKED':
        updateData.packedAt = new Date();
        break;
      case 'SHIPPED':
        updateData.shippedAt = new Date();
        break;
      case 'IN_TRANSIT':
        updateData.inTransitAt = new Date();
        break;
      case 'OUT_FOR_DELIVERY':
        updateData.outForDeliveryAt = new Date();
        break;
      case 'DELIVERED':
        updateData.deliveredAt = new Date();
        break;
    }

    // Add shipping details if provided
    if (trackingNumber) updateData.trackingNumber = trackingNumber;
    if (carrierName) updateData.carrierName = carrierName;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);
    if (notes) updateData.deliveryNotes = notes;

    // Update order
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: updateData,
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
      message: `Order ${stage.toLowerCase()} successfully`,
      data: {
        order: {
          id: updatedOrder.id,
          orderNumber: updatedOrder.orderNumber,
          status: updatedOrder.status,
          trackingNumber: updatedOrder.trackingNumber,
          carrierName: updatedOrder.carrierName,
          estimatedDelivery: updatedOrder.estimatedDelivery,
          deliveryNotes: updatedOrder.deliveryNotes,
          updatedAt: updatedOrder.updatedAt,
          // Stage timestamps
          packedAt: updatedOrder.packedAt,
          shippedAt: updatedOrder.shippedAt,
          inTransitAt: updatedOrder.inTransitAt,
          outForDeliveryAt: updatedOrder.outForDeliveryAt,
          deliveredAt: updatedOrder.deliveredAt
        }
      }
    }, 200);

  } catch (error) {
    console.error('Error updating shipping stage:', error);
    return c.json({
      success: false,
      message: 'Failed to update shipping stage',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};

// Get order tracking details for client
export const getOrderTracking = async (c: Context) => {
  try {
    const orderId = c.req.param('orderId');
    const user = c.get('user');
    const userId = user?.userId; // Note: auth middleware sets 'userId' in user object

    if (!userId) {
      return c.json({
        success: false,
        message: 'Authentication required'
      }, 401);
    }

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
        }
      }
    });

    if (!order) {
      return c.json({
        success: false,
        message: 'Order not found'
      }, 404);
    }

    // Create tracking stages in correct order
    const trackingStages = [
      {
        stage: 'CONFIRMED',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed and payment received',
        completed: true,
        timestamp: order.createdAt
      },
      {
        stage: 'PACKED',
        title: 'Order Packed',
        description: 'Your order has been packed and ready for shipping',
        completed: order.status !== 'CONFIRMED' && order.packedAt !== null,
        timestamp: order.packedAt
      },
      {
        stage: 'SHIPPED',
        title: 'Order Shipped',
        description: 'Your order has been shipped',
        completed: ['SHIPPED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        timestamp: order.shippedAt
      },
      {
        stage: 'IN_TRANSIT',
        title: 'In Transit',
        description: 'Your order is on the way to you',
        completed: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        timestamp: order.inTransitAt
      },
      {
        stage: 'OUT_FOR_DELIVERY',
        title: 'Out for Delivery',
        description: 'Your order is out for delivery',
        completed: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.status),
        timestamp: order.outForDeliveryAt
      },
      {
        stage: 'DELIVERED',
        title: 'Delivered',
        description: 'Your order has been delivered',
        completed: order.status === 'DELIVERED',
        timestamp: order.deliveredAt
      }
    ];

    return c.json({
      success: true,
      message: "Order tracking retrieved successfully",
      data: {
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          currency: order.currency,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          trackingNumber: order.trackingNumber,
          carrierName: order.carrierName,
          estimatedDelivery: order.estimatedDelivery,
          deliveryNotes: order.deliveryNotes,
          orderItems: order.orderItems,
          user: order.user,
          trackingStages: trackingStages
        }
      }
    }, 200);

  } catch (error) {
    console.error('Error fetching order tracking:', error);
    return c.json({
      success: false,
      message: 'Failed to fetch order tracking',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
};
