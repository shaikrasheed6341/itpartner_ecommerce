import { createContext, useContext, useState, useCallback } from "react"

const CartContext = createContext({
  cart: {
    items: [] as any[],
    totalItems: 0,
    totalAmount: 0
  },
  addToCart: async (_item: any) => {},
  addMultipleToCart: async (_items: any) => ({ success: false, message: '', data: null }),
  processCheckout: async () => ({ success: false, message: '', data: { orderSummary: null } }),
  fetchUserCart: async () => {},
  removeFromCart: (_id: any) => {},
  updateQuantity: (_id: any, _quantity: any) => {},
  clearCart: () => {},
  loading: false
})

export function CartProvider({ children }: any) {
  const [cart, setCart] = useState({
    items: [] as any[],
    totalItems: 0,
    totalAmount: 0
  })
  const [loading] = useState(false)

  const addToCart = async (item: any) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        // If not authenticated, just update local state
        setCart(prevCart => {
          // Generate a unique ID for the cart item
          const uniqueId = `${item.id}-${Date.now()}-${Math.random()}`
          
          // If item exists with same productId, increase quantity
          const existingItem = prevCart.items.find(cartItem => cartItem.productId === item.id)
          
          if (existingItem) {
            // If item exists, increase quantity
            const updatedItems = prevCart.items.map(cartItem =>
              cartItem.productId === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
            
            return {
              ...prevCart,
              items: updatedItems,
              totalItems: prevCart.totalItems + 1,
              totalAmount: prevCart.totalAmount + item.rate
            }
          } else {
            // If item does not exist, add new item with quantity 1
            const newItem = { 
              ...item, 
              id: uniqueId,
              productId: item.id,
              quantity: 1 
            }
            
            return {
              ...prevCart,
              items: [...prevCart.items, newItem],
              totalItems: prevCart.totalItems + 1,
              totalAmount: prevCart.totalAmount + item.rate
            }
          }
        })
        return
      }

      // If authenticated, call server API
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: 1
        })
      })

      const result = await response.json()
      console.log('Add to cart response:', result)

      if (result.success) {
        // Update local state with server response
        setCart(prevCart => {
          // Generate a unique ID for the cart item
          const uniqueId = `${item.id}-${Date.now()}-${Math.random()}`
          
          // If item exists with same productId, increase quantity
          const existingItem = prevCart.items.find(cartItem => cartItem.productId === item.id)
          
          if (existingItem) {
            // If item exists, increase quantity
            const updatedItems = prevCart.items.map(cartItem =>
              cartItem.productId === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
            
            return {
              ...prevCart,
              items: updatedItems,
              totalItems: prevCart.totalItems + 1,
              totalAmount: prevCart.totalAmount + item.rate
            }
          } else {
            // If item does not exist, add new item with quantity 1
            const newItem = { 
              ...item, 
              id: uniqueId,
              productId: item.id,
              quantity: 1 
            }
            
            return {
              ...prevCart,
              items: [...prevCart.items, newItem],
              totalItems: prevCart.totalItems + 1,
              totalAmount: prevCart.totalAmount + item.rate
            }
          }
        })
      } else {
        console.error('Failed to add item to cart:', result.error)
      }
    } catch (error) {
      console.error('Error adding item to cart:', error)
      // Fallback to local state update
      setCart(prevCart => {
        // Generate a unique ID for the cart item
        const uniqueId = `${item.id}-${Date.now()}-${Math.random()}`
        
        // If item exists with same productId, increase quantity
        const existingItem = prevCart.items.find(cartItem => cartItem.productId === item.id)
        
        if (existingItem) {
          // If item exists, increase quantity
          const updatedItems = prevCart.items.map(cartItem =>
            cartItem.productId === item.id
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          )
          
          return {
            ...prevCart,
            items: updatedItems,
            totalItems: prevCart.totalItems + 1,
            totalAmount: prevCart.totalAmount + item.rate
          }
        } else {
          // If item does not exist, add new item with quantity 1
          const newItem = { 
            ...item, 
            id: uniqueId,
            productId: item.id,
            quantity: 1 
          }
          
          return {
            ...prevCart,
            items: [...prevCart.items, newItem],
            totalItems: prevCart.totalItems + 1,
            totalAmount: prevCart.totalAmount + item.rate
          }
        }
      })
    }
  }

  const removeFromCart = (id: any) => {
    setCart(prevCart => {
      const itemToRemove = prevCart.items.find(item => item.id === id)
      if (!itemToRemove) return prevCart
      
      return {
        ...prevCart,
        items: prevCart.items.filter(item => item.id !== id),
        totalItems: prevCart.totalItems - itemToRemove.quantity,
        totalAmount: prevCart.totalAmount - (itemToRemove.rate * itemToRemove.quantity)
      }
    })
  }

  const updateQuantity = (id: any, quantity: any) => {
    setCart(prevCart => {
      const item = prevCart.items.find(item => item.id === id)
      
      if (!item) return prevCart
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return {
          ...prevCart,
          items: prevCart.items.filter(item => item.id !== id),
          totalItems: prevCart.totalItems - item.quantity,
          totalAmount: prevCart.totalAmount - (item.rate * item.quantity)
        }
      }
      
      const quantityDifference = quantity - item.quantity
      const updatedItems = prevCart.items.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
      
      return {
        ...prevCart,
        items: updatedItems,
        totalItems: prevCart.totalItems + quantityDifference,
        totalAmount: prevCart.totalAmount + (item.rate * quantityDifference)
      }
    })
  }

  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalAmount: 0
    })
  }

  const addMultipleToCart = async (items: any) => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('http://localhost:5000/api/cart/add-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ items })
      })

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Error adding multiple items to cart:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add items to cart'
      }
    }
  }

  const processCheckout = async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('http://localhost:5000/api/cart/process-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          totalAmount: cart.totalAmount,
          totalItems: cart.totalItems
        })
      })

      const result = await response.json()
      console.log('Process checkout response:', result) // Debug log
      return result
    } catch (error) {
      console.error('Error processing checkout:', error)
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to process checkout'
      }
    }
  }

  const fetchUserCart = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      console.log('Fetch user cart response:', result) // Debug log

      if (result.success && result.data) {
        // Convert backend cart items to frontend format
        const backendItems = result.data.items.map((item: any) => ({
          id: item.id, // Use cart item's unique ID, not productId
          productId: item.productId, // Keep productId for reference
          name: item.product.name,
          brand: item.product.brand,
          image_url: item.product.image_url,
          rate: item.product.rate,
          quantity: item.quantity
        }))

        // Update frontend cart with backend data
        setCart({
          items: backendItems,
          totalItems: result.data.totalItems,
          totalAmount: result.data.totalAmount
        })
      }
    } catch (error) {
      console.error('Error fetching user cart:', error)
    }
  }, [])

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      addMultipleToCart,
      processCheckout,
      fetchUserCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      loading
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
