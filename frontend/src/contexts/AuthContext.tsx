import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { authApi, axiosInstance as api } from '@/lib/api'

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}




interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string, otp?: string) => Promise<{ success: boolean; requiresOTP?: boolean; otp?: string }>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  login: async () => false,
  adminLogin: async () => ({ success: false }),
  register: async () => false,
  logout: () => { },
  loading: false
})

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing token on app load and validate it
  useEffect(() => {
    const validateAndLoadAuth = async () => {
      const savedToken = localStorage.getItem('authToken')
      const savedUser = localStorage.getItem('authUser')

      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          
          // Validate token by checking if it's expired (basic check)
          try {
            // Decode JWT token to check expiration (without verification)
            const tokenParts = savedToken.split('.')
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]))
              const currentTime = Math.floor(Date.now() / 1000)
              
              // Check if token is expired
              if (payload.exp && payload.exp < currentTime) {
                console.log('Token expired, clearing auth')
                localStorage.removeItem('authToken')
                localStorage.removeItem('authUser')
                setLoading(false)
                return
              }
            }
          } catch (tokenError) {
            console.error('Error validating token:', tokenError)
            // If token is malformed, clear it
            localStorage.removeItem('authToken')
            localStorage.removeItem('authUser')
            setLoading(false)
            return
          }

          // Set token and user
          setToken(savedToken)
          setUser(userData)
          
          // Optionally verify token with backend (can be done later if needed)
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
        }
      }
      setLoading(false)
    }

    validateAndLoadAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await authApi.login({ email, password })
      console.log('Login response:', response)

      if (response?.success) {
        setUser(response.data.user)
        setToken(response.data.token)
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('authUser', JSON.stringify(response.data.user))
        console.log('Login successful, user set:', response.data.user)
        return true
      } else {
        console.error('Login failed:', response?.error || response?.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (email: string, password: string, otp?: string) => {
    try {
      setLoading(true)

      // First, check if OTP is required
      try {
        const checkResponse = await api.post('/api/v1/admin/check-login-requirements', { email })
        const checkData = checkResponse.data

        if (checkData?.success && checkData?.data?.requiresOTP && !otp) {
          return {
            success: false,
            requiresOTP: true,
            otp: checkData.data.otp
          }
        }
      } catch (checkError) {
        // If 404/check fails, we just proceed to try actual login which will handle auth errors
        console.log('Requirement check skipped or failed', checkError)
      }

      // Proceed with login
      const response = await api.post('/api/v1/admin/login', { email, password, otp })
      const responseData = response.data

      if (responseData?.success) {
        setUser(responseData.data.admin)
        setToken(responseData.data.token)
        localStorage.setItem('authToken', responseData.data.token)
        localStorage.setItem('authUser', JSON.stringify(responseData.data.admin))
        return { success: true }
      } else {
        console.error('Admin login failed:', responseData?.error || responseData?.message)
        return { success: false }
      }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: any) => {
    try {
      setLoading(true)
      const response = await authApi.register(userData)

      if (response?.success) {
        setUser(response.data.user)
        setToken(response.data.token)
        localStorage.setItem('authToken', response.data.token)
        localStorage.setItem('authUser', JSON.stringify(response.data.user))
        return true
      } else {
        console.error('Registration failed:', response?.error || response?.message)
        return false
      }
    } catch (error) {
      console.error('Registration error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    // Also clear API token
    try {
      const { apiClient } = require('@/lib/api')
      if (apiClient && typeof apiClient.removeAuthToken === 'function') {
        apiClient.removeAuthToken()
      }
    } catch (error) {
      console.error('Error clearing API token:', error)
    }
  }

  const isAuthenticated = !!token && !!user
  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isAdmin,
      login,
      adminLogin,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

