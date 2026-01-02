import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Eye,
  EyeOff,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  MapPin,
  Home,
  Building2,
  Map
} from 'lucide-react'

export function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    houseNumber: '',
    street: '',
    area: '',
    city: '',
    state: '',
    pinCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { register, isAuthenticated, isAdmin, loading: authLoading } = useAuth()
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
        // Regular user - redirect to home
        navigate('/', { replace: true })
      }
    }
  }, [isAuthenticated, isAdmin, authLoading, navigate])

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

  // Don't render register form if already authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validation
    if (!formData.email || !formData.password || !formData.fullName || !formData.phone ||
      !formData.houseNumber || !formData.street || !formData.area || !formData.city ||
      !formData.state || !formData.pinCode) {
      setError('Please fill in all fields')
      setIsLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    const userData = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone,
      houseNumber: formData.houseNumber,
      street: formData.street,
      area: formData.area,
      city: formData.city,
      state: formData.state,
      pinCode: formData.pinCode
    }

    const success = await register(userData)

    if (success) {
      // Redirect to the intended page or payment page
      navigate(from === '/' ? '/payment' : from, { replace: true })
    } else {
      setError('Registration failed. Please try again.')
    }

    setIsLoading(false)
  }

  const InputField = ({
    icon: Icon,
    label,
    ...props
  }: {
    icon: any,
    label: string
  } & React.InputHTMLAttributes<HTMLInputElement>
  ) => (
    <div className="relative group">
      <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          {...props}
          className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 sm:text-sm"
        />
      </div>
    </div>
  )

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
                  <h1 className="text-3xl font-bold mb-4">Welcome!</h1>
                  <p className="text-indigo-100">
                    Join our community today. Create an account to start shopping and tracking your orders easily.
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
                  <p className="text-sm text-indigo-200">Already have an account?</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-2 w-full py-2 px-4 bg-white/20 hover:bg-white/10 border border-white/30 rounded-lg font-medium transition-all text-center backdrop-blur-sm"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            <div className="md:col-span-3 p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                <p className="mt-1 text-sm text-gray-500">Please fill in your details to register.</p>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                    <div className="mr-2 mt-0.5">⚠️</div>
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Personal Info Group */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <InputField
                          icon={User}
                          label="Full Name"
                          name="fullName"
                          type="text"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <InputField
                          icon={Mail}
                          label="Email Address"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <InputField
                          icon={Phone}
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                        />
                      </div>
                      <div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Password</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                              name="password"
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={formData.password}
                              onChange={handleChange}
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
                      <div>
                        <div className="relative group">
                          <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Confirm</label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                            </div>
                            <input
                              name="confirmPassword"
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all duration-200 sm:text-sm"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                              ) : (
                                <Eye className="h-5 w-5 text-gray-400 hover:text-indigo-500 cursor-pointer transition-colors" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                  </div>

                  {/* Address Info Group */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" /> Address Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      <InputField
                        icon={Home}
                        label="House No"
                        name="houseNumber"
                        type="text"
                        required
                        value={formData.houseNumber}
                        onChange={handleChange}
                        placeholder="A-123"
                      />

                      <InputField
                        icon={Building2}
                        label="Street"
                        name="street"
                        type="text"
                        required
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Main Street"
                      />

                      <InputField
                        icon={Map}
                        label="Area"
                        name="area"
                        type="text"
                        required
                        value={formData.area}
                        onChange={handleChange}
                        placeholder="Downtown"
                      />

                      <InputField
                        icon={MapPin}
                        label="PIN Code"
                        name="pinCode"
                        type="text"
                        required
                        value={formData.pinCode}
                        onChange={handleChange}
                        placeholder="500001"
                      />

                      <InputField
                        icon={Building2}
                        label="City"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Hyderabad"
                      />

                      <InputField
                        icon={Map}
                        label="State"
                        name="state"
                        type="text"
                        required
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Telangana"
                      />

                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-medium text-white bg-gradient-to-r from-zinc-800 via-violet-600 to-zinc-900"
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>

                <div className="md:hidden text-center mt-4 space-y-2">
                  <p className="text-sm text-gray-600">Already have an account?</p>
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    Sign in instead
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
