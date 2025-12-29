import { db } from "../db";
export const calculateCartTotals = async (userId: string) => {
  try {
    console.log('calculateCartTotals called', { userId });

    // Get all cart items for the user with product details
    const cartItems = await db.cart.findMany({
      where: {
        userId: userId
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

    console.log('calculateCartTotals: fetched items count', cartItems.length);

    // Calculate totals safely and collect warnings
    let totalAmount = 0;
    let totalItems = 0;
    const warnings: any[] = [];

    const items = cartItems.map((item: any) => {
      // Guard against missing product (deleted or inconsistent data)
      if (!item.product) {
        warnings.push({ id: item.id, productId: item.productId, reason: 'Product not found (possibly deleted)' });
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity || 0,
          product: null
        };
      }

      const quantity = Number(item.quantity) || 0;
      const rate = Number(item.product.rate) || 0;

      const itemTotal = quantity * rate;
      totalAmount += itemTotal;
      totalItems += quantity;

      return {
        id: item.id,
        productId: item.productId,
        quantity,
        product: item.product
      };
    });

    return {
      items,
      totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
      totalItems,
      itemCount: items.length,
      warnings
    };

  } catch (error) {
    console.error('Error calculating cart totals:', error);
    throw new Error('Failed to calculate cart totals: ' + (error instanceof Error ? error.message : String(error)));
  }
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  try {
    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Check if item already exists in cart
    const existingCartItem = await db.cart.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    if (existingCartItem) {
      // Update quantity
      const updatedCartItem = await db.cart.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
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

      return updatedCartItem;
    } else {
      // Create new cart item
      const newCartItem = await db.cart.create({
        data: {
          userId: userId,
          productId: productId,
          quantity: quantity
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

      return newCartItem;
    }

  } catch (error) {
    console.error('Error adding to cart:', error);
    // Preserve original error message for better debugging
    throw new Error(error instanceof Error ? error.message : String(error));
  }
};

export const removeFromCart = async (userId: string, cartItemId: string) => {
  try {
    const deletedItem = await db.cart.delete({
      where: {
        id: cartItemId,
        userId: userId
      }
    });

    return deletedItem;

  } catch (error) {
    console.error('Error removing from cart:', error);
    throw new Error('Failed to remove item from cart');
  }
};

export const updateCartQuantity = async (userId: string, cartItemId: string, quantity: number) => {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return await removeFromCart(userId, cartItemId);
    }

    const updatedItem = await db.cart.update({
      where: {
        id: cartItemId,
        userId: userId
      },
      data: { quantity },
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

    return updatedItem;

  } catch (error) {
    console.error('Error updating cart quantity:', error);
    throw new Error('Failed to update cart quantity');
  }
};

export const clearCart = async (userId: string) => {
  try {
    const result = await db.cart.deleteMany({
      where: { userId: userId }
    });

    return result;

  } catch (error) {
    console.error('Error clearing cart:', error);
    throw new Error('Failed to clear cart');
  }
};

// Express controller functions
export const addToCartController = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;

    const result = await addToCart(userId, productId, quantity);
    
    res.json({
      success: true,
      message: 'Item added to cart successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in addToCartController:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message || 'Failed to add item to cart'
    });
  }
};

export const getCartController = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const result = await calculateCartTotals(userId);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in getCartController:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message || 'Failed to get cart'
    });
  }
};

export const removeFromCartController = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;

    // Find the cart item by productId
    const cartItem = await db.cart.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    const result = await removeFromCart(userId, cartItem.id);
    
    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in removeFromCartController:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message || 'Failed to remove item from cart'
    });
  }
};

export const updateCartItemQuantityController = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.params;
    const { quantity } = req.body;

    // Find the cart item by productId
    const cartItem = await db.cart.findFirst({
      where: {
        userId: userId,
        productId: productId
      }
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    const result = await updateCartQuantity(userId, cartItem.id, quantity);
    
    res.json({
      success: true,
      message: 'Cart item quantity updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in updateCartItemQuantityController:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message || 'Failed to update cart item quantity'
    });
  }
};

export const clearCartController = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const result = await clearCart(userId);
    
    res.json({
      success: true,
      message: 'Cart cleared successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in clearCartController:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message || 'Failed to clear cart'
    });
  }
};

export const addMultipleToCartController = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const { items } = req.body;

    console.log('addMultipleToCartController called', { userId, items });

    if (!userId) {
      console.error('addMultipleToCartController: missing userId');
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      });
    }

    const added: any[] = [];
    const errors: any[] = [];

    for (const item of items) {
      const { productId, quantity = 1 } = item;
      try {
        console.log('Adding to cart', { userId, productId, quantity });
        const result = await addToCart(userId, productId, quantity);
        console.log('Added to cart result', { id: result?.id, productId: result?.productId });
        added.push(result);
      } catch (err: any) {
        console.error('Error adding item to cart', { item, err: err?.message || err });
        errors.push({ item, error: err?.message || String(err) });
      }
    }

    const finalResult = await calculateCartTotals(userId);
    
    res.json({
      success: errors.length === 0,
      message: errors.length === 0 ? 'Multiple items added to cart successfully' : 'Some items failed to add to cart',
      data: {
        cart: finalResult,
        added,
        errors
      }
    });
  } catch (error) {
    console.error('Error in addMultipleToCartController:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message || 'Failed to add multiple items to cart'
    });
  }
};

export const processCheckoutController = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const { totalAmount, totalItems } = req.body;

    // Get current cart items
    const cartItems = await db.cart.findMany({
      where: { userId: userId },
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

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Create order
    const order = await db.order.create({
      data: {
        userId: userId,
        orderNumber: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'PENDING',
        totalAmount: totalAmount,
        currency: 'INR',
        orderItems: {
          create: cartItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.rate
          }))
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
        }
      }
    });

    // Clear the cart after successful order creation
    await clearCart(userId);

    // Prepare order summary
    const orderSummary = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      totalItems: order.orderItems.length,
      itemCount: order.orderItems.reduce((sum: number, item: any) => sum + item.quantity, 0),
      items: order.orderItems.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: item.product
      })),


      status: order.status,
      createdAt: order.createdAt
    };

    res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderSummary: orderSummary
      }
    });
  } catch (error) {
    console.error('Error in processCheckoutController:', error);
    res.status(500).json({
      success: false,
      error: (error as any).message || 'Failed to process checkout'
    });
  }
};


