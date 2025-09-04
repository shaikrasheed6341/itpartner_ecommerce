import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: any;
}

// Add product to cart
export const addToCart = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    // Validate input
    if (!productId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product ID is required' 
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be greater than 0' 
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: 'Product not found' 
      });
    }

    // Always create new cart entry (allow duplicates)
    const cartItem = await prisma.cart.create({
      data: {
        userId: userId,
        productId: productId,
        quantity: quantity
      },
      include: {
        product: true
      }
    });

    // Calculate item total
    const itemTotal = cartItem.quantity * cartItem.product.rate;

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: {
        cartItem: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          itemTotal: itemTotal,
          product: {
            id: cartItem.product.id,
            name: cartItem.product.name,
            brand: cartItem.product.brand,
            image_url: cartItem.product.image_url,
            rate: cartItem.product.rate
          }
        },
        // Current item total only
        currentItemSummary: {
          totalAmount: itemTotal,
          totalItems: cartItem.quantity,
          itemCount: 1
        }
      }
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add item to cart', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Add multiple products to cart
export const addMultipleToCart = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    const userId = req.user.userId;
    const { items } = req.body;

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Items array is required and must not be empty' 
      });
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Product ID is required for each item' 
        });
      }
      if (!item.quantity || item.quantity <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Quantity must be greater than 0 for each item' 
        });
      }
    }

    const results = [];
    const errors = [];

    // Process each item
    for (const item of items) {
      try {
        // Check if product exists
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });

        if (!product) {
          errors.push({
            productId: item.productId,
            error: 'Product not found'
          });
          continue;
        }

        // Always create new cart entry (allow duplicates)
        const cartItem = await prisma.cart.create({
          data: {
            userId: userId,
            productId: item.productId,
            quantity: item.quantity
          },
          include: {
            product: true
          }
        });

        // Calculate item total based on cart quantity
        const itemTotal = cartItem.quantity * cartItem.product.rate;

        results.push({
          productId: item.productId,
          success: true,
          data: {
            cartItem: {
              id: cartItem.id,
              productId: cartItem.productId,
              quantity: cartItem.quantity,
              itemTotal: itemTotal,
              product: {
                id: cartItem.product.id,
                name: cartItem.product.name,
                brand: cartItem.product.brand,
                image_url: cartItem.product.image_url,
                rate: cartItem.product.rate
              }
            }
          }
        });

      } catch (error) {
        errors.push({
          productId: item.productId,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Calculate totals only for current request items (not previous cart)
    let currentRequestTotal = 0;
    let currentRequestItems = 0;

    const currentItemsWithTotals = results.map(result => {
      const itemTotal = result.data.cartItem.itemTotal;
      currentRequestTotal += itemTotal;
      currentRequestItems += result.data.cartItem.quantity;

      return {
        id: result.data.cartItem.id,
        productId: result.data.cartItem.productId,
        quantity: result.data.cartItem.quantity,
        itemTotal: itemTotal,
        product: result.data.cartItem.product
      };
    });

    res.status(201).json({
      success: true,
      message: 'Multiple items processed',
      data: {
        successful: results,
        failed: errors,
        totalProcessed: items.length,
        successfulCount: results.length,
        failedCount: errors.length,
        // Current request totals only
        currentRequestSummary: {
          items: currentItemsWithTotals,
          totalAmount: currentRequestTotal,
          totalItems: currentRequestItems,
          itemCount: currentItemsWithTotals.length
        }
      }
    });

  } catch (error) {
    console.error('Error adding multiple items to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to add items to cart', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Process checkout and calculate order summary
export const processCheckout = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    const userId = req.user.userId;
    const { totalAmount, totalItems } = req.body;

    // Get current cart items from database to ensure accuracy
    const currentCartItems = await prisma.cart.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            image_url: true,
            rate: true,
            quantity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Check if cart is empty
    if (currentCartItems.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty. Please add items to cart before checkout.' 
      });
    }

    // Calculate actual totals from database
    let actualTotalAmount = 0;
    let actualTotalItems = 0;

    const orderItems = currentCartItems.map(item => {
      const itemTotal = item.quantity * item.product.rate;
      actualTotalAmount += itemTotal;
      actualTotalItems += item.quantity;

      return {
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        itemTotal: itemTotal,
        product: item.product
      };
    });

    // Create order summary
    const orderSummary = {
      items: orderItems,
      totalAmount: actualTotalAmount,
      totalItems: actualTotalItems,
      itemCount: currentCartItems.length,
      processedAt: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Checkout processed successfully',
      data: {
        orderSummary: orderSummary,
        // Compare frontend vs backend totals
        totalsComparison: {
          frontendTotal: totalAmount || 0,
          backendTotal: actualTotalAmount,
          frontendItems: totalItems || 0,
          backendItems: actualTotalItems,
          totalsMatch: (totalAmount || 0) === actualTotalAmount && (totalItems || 0) === actualTotalItems
        }
      }
    });

  } catch (error) {
    console.error('Error processing checkout:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process checkout', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Get user's cart with total calculations
export const getUserCart = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    const userId = req.user.userId;

    // Use the utility function to calculate cart totals
    const cartData = await calculateCartTotals(userId);

    res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      data: cartData
    });

  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve cart', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quantity must be greater than 0' 
      });
    }

    // Update cart item
    const cartItem = await prisma.cart.update({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      },
      data: {
        quantity: quantity
      },
      include: {
        product: true
      }
    });

    const itemTotal = cartItem.quantity * cartItem.product.rate;

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: {
        cartItem: {
          id: cartItem.id,
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          itemTotal: itemTotal,
          product: cartItem.product
        }
      }
    });

  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update cart item', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Remove item from cart
export const removeFromCart = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    const userId = req.user.userId;
    const { productId } = req.params;

    // Remove cart item
    await prisma.cart.delete({
      where: {
        userId_productId: {
          userId: userId,
          productId: productId
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart successfully'
    });

  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to remove item from cart', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Clear entire cart
export const clearCart = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please login first.' 
      });
    }

    const userId = req.user.userId;

    // Remove all cart items for the user
    await prisma.cart.deleteMany({
      where: { userId: userId }
    });

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to clear cart', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
  }
};

// Utility function to calculate cart totals - can be imported by other controllers
export const calculateCartTotals = async (userId: string) => {
  try {
    // Get all cart items for the user
    const cartItems = await prisma.cart.findMany({
      where: { userId: userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            image_url: true,
            rate: true,
            quantity: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Consolidate duplicate products by productId
    const consolidatedItems = new Map();
    
    cartItems.forEach(item => {
      const productId = item.productId;
      
      if (consolidatedItems.has(productId)) {
        // Add quantities for same product
        consolidatedItems.get(productId).quantity += item.quantity;
        consolidatedItems.get(productId).itemTotal += (item.quantity * item.product.rate);
      } else {
        // First occurrence of this product
        consolidatedItems.set(productId, {
          id: item.id, // Keep the first cart item ID
          productId: item.productId,
          quantity: item.quantity,
          itemTotal: item.quantity * item.product.rate,
          product: item.product
        });
      }
    });

    // Convert Map to array
    const itemsWithTotals = Array.from(consolidatedItems.values());

    // Calculate totals
    let totalAmount = 0;
    let totalItems = 0;

    itemsWithTotals.forEach(item => {
      totalAmount += item.itemTotal;
      totalItems += item.quantity;
    });

    return {
      items: itemsWithTotals,
      totalAmount: totalAmount,
      totalItems: totalItems,
      itemCount: cartItems.length
    };
  } catch (error) {
    throw new Error(`Failed to calculate cart totals: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
