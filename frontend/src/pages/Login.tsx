import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  MapPin,
  Building2
} from 'lucide-react'
import { InputField } from '@/components/InputField'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, isAuthenticated, isAdmin, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (authLoading) return // Wait for auth to load

    if (isAuthenticated) {
      // If user is admin, redirect to admin dashboard
      if (isAdmin) {
        navigate('/admin', { replace: true })
      } else {
        // Regular user - redirect to home or intended destination
        const from = location.state?.from?.pathname || '/'
        navigate(from, { replace: true })
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate, location])

  // Get the intended destination from location state, or default to '/'
  const from = location.state?.from?.pathname || '/'

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!email || !password) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    try {
      console.log('Attempting login with:', { email })
      await login(email, password)
      console.log('Login successful, navigating to:', from === '/' ? '/' : from)
      // Redirect to the intended page or home page
      navigate(from === '/' ? '/' : from, { replace: true })
    } catch (error) {
      console.error('Login failed:', error)
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-5 h-full">

            {/* Left Side - Decorative */}
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-zinc-900  via-violet-800  to-zinc-700 p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full  bg-cover bg-center opacity-10 mix-blend-overlay"></div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
                  <p className="text-indigo-100">
                    Sign in to continue to your personal dashboard and manage your orders.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-indigo-100">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <User className="h-5 w-5" />
                    </div>
                    <span>Personal Dashboard</span>
                  </div>
                  <div className="flex items-center space-x-3 text-indigo-100">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span>Track Orders</span>
                  </div>
                  <div className="flex items-center space-x-3 text-indigo-100">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <span>Fast Delivery</span>
                  </div>
                </div>
                <div className="pt-8">
                  <p className="text-sm text-indigo-200">Don't have an account?</p>
                  <button
                    onClick={() => navigate('/register')}
                    className="mt-2 w-full py-2 px-4 bg-white/20 hover:bg-white/10 border border-white/30 rounded-lg font-medium transition-all text-center backdrop-blur-sm"
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                <p className="mt-1 text-sm text-gray-500">Please enter your credentials to access your account.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                    <div className="mr-2 mt-0.5">⚠️</div>
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  <InputField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />

                  <div>
                    <div className="relative group">
                      <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 sm:text-sm"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-zinc-800 via-violet-600 to-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-600 transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Signing in...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>

                <div className="md:hidden text-center mt-4 space-y-2">
                  <p className="text-sm text-gray-600">Don't have an account?</p>
                  <button
                    type="button"
                    onClick={() => navigate('/register')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Create Account
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
