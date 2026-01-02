import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { CartProvider } from '@/cart/Cartcontext'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicRoute } from '@/components/PublicRoute'
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
import { AdminShipping } from '@/pages/AdminShipping'

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-background">
      {!isAdminRoute && <Header />}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/dashboard" element={<Dashboard />} />

          
          {/* Public Auth Routes - redirect if already logged in */}
          <Route path="/login" element={<PublicRoute userOnly><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute userOnly><Register /></PublicRoute>} />
          <Route path="/admin/login" element={<PublicRoute adminOnly><AdminLogin /></PublicRoute>} />
          
          {/* Protected User Routes */}
          <Route path="/add-product" element={<ProtectedRoute><AddProduct /></ProtectedRoute>} />
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsers /></ProtectedRoute>} />
          <Route path="/admin/shipping/:orderId" element={<ProtectedRoute requireAdmin><AdminShipping /></ProtectedRoute>} />
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
