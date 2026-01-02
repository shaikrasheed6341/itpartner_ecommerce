import { Link } from 'react-router-dom'
import { Menu, X, Shield, ShoppingCart, User, LogOut, ChevronDown, Phone, MapPin } from 'lucide-react'
import { useCart } from '@/cart/Cartcontext'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'

export function Header() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Profile form state
  const [profileData, setProfileData] = useState<any>({
    fullName: '',
    email: '',
    phone: '',
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pinCode: ''
  })

  // Refs for closing dropdowns when clicking outside
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  // Initialize profile data when user is available or changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        houseNumber: user.houseNumber || '',
        street: user.street || '',
        area: user.area || '',
        city: user.city || '',
        state: user.state || '',
        pinCode: user.pinCode || ''
      })
    }
  }, [user])

  // Safely get cart context
  let cart = { totalItems: 0 }
  try {
    const cartContext = useCart()
    cart = cartContext.cart
  } catch (error) {
    console.warn('Cart context not available:', error)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Login dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false)
      }

      // Profile dropdown
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        // If viewing (not editing), close it. If editing, maybe keep open to avoid data loss?
        // User behavior usually expects close on outside click.
        // Let's allow closing. Data in local state persists while component mounted? 
        // No, if isProfileOpen becomes false, it might unmount. 
        // Actually the div is conditional {isProfileOpen && ...}. So state is lost if unmounted.
        // For better UX during editing, we might want to check !isEditing.
        if (!isEditing) {
          setIsProfileOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isEditing])

  return (
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-violet-50 to-violet-100 backdrop-blur supports-[backdrop-filter]:bg-background/60 text-zinc-800">
      <div className="container flex h-16 items-center justify-between">

        {/* Left: Logo */}
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-1 ml-2 bg-zinc-100 rounded-2xl">
              <img
                src="/logo.jpg"
                alt="IT Partner Logo"
                className="h-6 w-6 object-cover rounded"
              />
            </div>
            <span className="font-bold text-xl text-zinc-800">
              ITPARTNER
            </span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex space-x-6 text-sm font-medium">
            <Link to="/" className="transition-colors hover:text-violet-800">Home</Link>
            <Link to="/dashboard" className="transition-colors hover:text-violet-800">Services</Link>
            <Link to="/about" className="transition-colors hover:text-violet-800">About</Link>
            <Link to="/products" className="transition-colors hover:text-violet-800">Buy</Link>
            <Link to="/orders" className="transition-colors hover:text-violet-800">Orders</Link>
          </nav>

          <Link
            to="/cart"
            className="relative inline-flex items-center justify-center rounded-md text-sm font-medium hover:text-violet-800 transition-colors h-10 w-10"
          >
            <ShoppingCart className="h-5 w-5" />
            {cart.totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                {cart.totalItems > 99 ? '99+' : cart.totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Right: User Actions */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">

              {/* Profile Dropdown Container */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen)
                    // Reset editing state when opening/closing?
                    if (!isProfileOpen) setIsEditing(false)
                  }}
                  className={`p-2 rounded-full border transition-all ${isProfileOpen ? 'bg-violet-100 border-violet-200 ring-2 ring-violet-200' : 'bg-transparent border-transparent hover:bg-violet-50 hover:border-violet-100'}`}
                  title="View Profile"
                >
                  <User className={`h-5 w-5 ${isProfileOpen ? 'text-violet-700' : 'text-zinc-600'}`} />
                </button>

                {/* Profile Modal / Popup */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-zinc-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                    {/* Header Background Pattern */}
                    <div className="h-16 bg-gradient-to-r from-violet-100 to-blue-50"></div>

                    <div className="px-5 pb-5 -mt-8">
                      {/* Avatar & Edit Action */}
                      <div className="flex justify-between items-end mb-3">
                        <div className="h-16 w-16 rounded-full bg-white p-1 shadow-sm">
                          <div className="h-full w-full rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold text-xl border border-zinc-100">
                            {profileData.fullName?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        </div>

                      </div>

                      {/* Main Content */}
                      {/* BUSINESS CARD VIEW */}
                      <div>
                        <h4 className="font-bold text-zinc-900 text-base">{profileData.fullName || 'User'}</h4>
                        <p className="text-xs text-zinc-500 mb-4">{profileData.email}</p>

                        <div className="space-y-2 border-t border-zinc-100 pt-3">
                          <div className="flex items-start gap-2 text-sm text-zinc-600">
                            <Phone className="h-3.5 w-3.5 text-zinc-400 mt-0.5" />
                            <span className="text-xs">{profileData.phone || 'No phone added'}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm text-zinc-600">
                            <MapPin className="h-3.5 w-3.5 text-zinc-400 mt-0.5" />
                            <span className="text-xs leading-relaxed">
                              {[
                                profileData.houseNumber,
                                profileData.street,
                                profileData.city,
                                profileData.state,
                                profileData.pinCode
                              ].filter(Boolean).join(', ') || 'No address added'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-zinc-100 flex gap-2">
                        {isAdmin && (
                          <Link
                            to="/admin"
                            className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded transition-colors"
                          >
                            <Shield className="h-3 w-3" /> Admin
                          </Link>
                        )}

                      </div>
                    </div>
                  </div>
                )}
              </div>

              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 h-10 px-3"
                  title="Admin Dashboard"
                >
                  <Shield className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Admin</span>
                </Link>
              )}
              <button
                onClick={logout}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600 h-10 px-3"
                title="Logout"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 h-10 px-3"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Login</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </button>

              {isLoginDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-zinc-200 z-50">
                  <div className="py-1">
                    <Link
                      to="/login"
                      className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
                      onClick={() => setIsLoginDropdownOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Login
                    </Link>
                    <div className="border-t border-zinc-200 my-1"></div>
                    <Link
                      to="/register"
                      className="flex items-center px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
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

          {/* Mobile Menu Toggle */}
          <button
            onClick={toggleMenu}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-zinc-100 h-10 w-10 md:hidden"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-zinc-200">
          <div className="container py-4 space-y-4">
            <Link to="/" className="block py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/about" className="block py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>About</Link>
            <Link to="/dashboard" className="block py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>Services</Link>
            <Link to="/products" className="block py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>Buy</Link>
            <Link to="/orders" className="block py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>Orders</Link>

            <Link to="/cart" className="flex items-center gap-2 py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart className="h-4 w-4" /> Cart ({cart.totalItems})
            </Link>

            {isAuthenticated ? (
              <>
                <div className="border-t border-zinc-100 my-2 pt-2">
                  <div className="flex items-center gap-2 py-2">
                    <User className="h-4 w-4 text-zinc-400" />
                    <span className="text-sm font-medium text-zinc-800">{user?.fullName}</span>
                  </div>
                  {/* Note: Profile editing on mobile menu not fully implemented in this quick view, simpler to keep desktop focus for now */}
                </div>

                <button
                  onClick={() => { logout(); setIsMenuOpen(false) }}
                  className="flex items-center gap-2 py-2 text-sm font-medium text-red-500 w-full text-left"
                >
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>
                  <User className="h-4 w-4" /> Login
                </Link>
                <Link to="/register" className="flex items-center gap-2 py-2 text-sm font-medium text-zinc-600" onClick={() => setIsMenuOpen(false)}>
                  <User className="h-4 w-4" /> Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
