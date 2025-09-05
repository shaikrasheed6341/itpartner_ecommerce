import { Link } from 'react-router-dom'
import { Moon, Sun, Menu, X, Shield, ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react'
import { useTheme } from './theme-provider'
import { useCart } from '@/cart/Cartcontext'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'

export function Header() {
  const { theme, setTheme } = useTheme()
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Safely get cart context
  let cart = { totalItems: 0 }
  try {
    const cartContext = useCart()
    cart = cartContext.cart
  } catch (error) {
    // Cart context not available, use default values
    console.warn('Cart context not available:', error)
  }

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo and Company Name - Left Side */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <img 
                src="/logo.jpg" 
                alt="IT Partner Logo" 
                className="h-8 w-8 object-cover rounded"
              />
            </div>
            <span className="font-bold text-xl text-zinc-800 dark:text-zinc-200"> 
             <span className='text-blue-600'>I</span><span className='text-zinc-800 dark:text-zinc-200'>T</span> <span className='text-zinc-800 dark:text-zinc-200'>P</span><span className='text-blue-600 '>A</span><span className='text-zinc-800 dark:text-zinc-200'>R</span><span className='text-blue-600'>T</span><span className='text-zinc-800 dark:text-zinc-200'>N</span><span className='text-blue-600'>E</span><span className='text-zinc-800 dark:text-zinc-200'>R</span>
            </span>
          </div>
        </div>
        
        {/* Navigation - Right Side */}
        <div className="flex items-center space-x-6">
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              to="/"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
            >
              Services
            </Link>
            <Link
              to="/products"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
            >
              Buy
            </Link>
            <Link
              to="/about"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
            >
              About Us
            </Link>
          </nav>
          
          {/* Cart Icon */}
          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 w-10"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </span>
            )}
          </Link>
          
          {/* Authentication */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400 hidden sm:block">
                Hi, {user?.fullName?.split(' ')[0]}
              </span>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 px-3"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 px-3"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              {/* Login Dropdown Button */}
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 px-3"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Login</span>
                <span className="sm:hidden">Login</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>
              
              {/* Dropdown Menu */}
              {isLoginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-md shadow-lg border border-zinc-200 dark:border-zinc-700 z-50">
                  <div className="py-1">
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Login as User
                    </Link>
                    <Link
                      to="/admin/login"
                      className="flex items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    >
                      <Shield className="h-4 w-4 mr-3" />
                      Login as Admin
                    </Link>
                    <div className="border-t border-zinc-200 dark:border-zinc-700 my-1"></div>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Register
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 w-10"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
          
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 h-10 w-10 md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="container py-4 space-y-4">
            <Link
              to="/"
              className="block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              to="/products"
              className="block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              Buy
            </Link>
            <Link
              to="/about"
              className="block py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/cart"
              className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
              onClick={() => setIsMenuOpen(false)}
            >
              <ShoppingCart className="h-4 w-4" />
              Cart ({cart.totalItems})
            </Link>
            {isAuthenticated ? (
              <>
                <div className="py-2 text-sm text-zinc-600 dark:text-zinc-400">
                  Hi, {user?.fullName?.split(' ')[0]}
                </div>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400 w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <div className="py-2 text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  Are you an admin?
                </div>
                <Link
                  to="/login"
                  className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Login as User
                </Link>
                <Link
                  to="/admin/login"
                  className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Login as Admin
                </Link>
                <div className="border-t border-zinc-200 dark:border-zinc-700 my-2"></div>
                <Link
                  to="/register"
                  className="flex items-center gap-2 py-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
