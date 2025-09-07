import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
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
import { AdminDashboard } from '@/pages/AdminDashboard'
import { AdminLogin } from '@/pages/AdminLogin'
import { AdminProducts } from '@/pages/AdminProducts'
import PaymentSuccess from '@/pages/PaymentSuccess'
import { Orders } from '@/pages/Orders'
import { AdminOrders } from '@/pages/AdminOrders'
import { AdminUsers } from '@/pages/AdminUsers'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-background">
      {!isAdminRoute && <Header />}
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
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/users" element={<AdminUsers />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
