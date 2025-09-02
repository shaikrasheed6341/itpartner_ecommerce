import { createContext, useContext, useState, ReactNode } from "react"

interface CartItem {
  id: string
  name: string
  brand: string
  image_url?: string
  rate: number
  quantity: number
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalAmount: number
}

interface CartContextType {
  cart: CartState
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalAmount: 0
  })

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setCart(prevCart => {
      const existingItem = prevCart.items.find(cartItem => cartItem.id === item.id)
      
      if (existingItem) {
        // If item exists, increase quantity
        const updatedItems = prevCart.items.map(cartItem =>
          cartItem.id === item.id
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
        const newItem = { ...item, quantity: 1 }
        
        return {
          ...prevCart,
          items: [...prevCart.items, newItem],
          totalItems: prevCart.totalItems + 1,
          totalAmount: prevCart.totalAmount + item.rate
        }
      }
    })
  }

  const removeFromCart = (id: string) => {
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

  const updateQuantity = (id: string, quantity: number) => {
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

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart
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
