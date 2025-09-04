import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/cart/Cartcontext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Home } from '@/pages/Home'
import { Dashboard } from '@/pages/Dashboard'
import { About } from '@/pages/About'
import { Products } from '@/pages/Products'
import { AddProduct } from '@/pages/AddProduct'
import { Cart } from '@/pages/Cart'
import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { Payment } from '@/pages/Payment'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/add-product" element={<AddProduct />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/payment" element={<Payment />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
