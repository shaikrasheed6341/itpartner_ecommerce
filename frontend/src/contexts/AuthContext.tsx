import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface User {
  id: string
  email: string
  fullName: string
  phone: string
  houseNumber: string
  street: string
  area: string
  city: string
  state: string
  pinCode: string
  role: 'ADMIN' | 'USER'
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<boolean>
  adminLogin: (email: string, password: string, otp?: string) => Promise<{ success: boolean; requiresOTP?: boolean; otp?: string }>
  register: (userData: RegisterData) => Promise<boolean>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  phone: string
  houseNumber: string
  street: string
  area: string
  city: string
  state: string
  pinCode: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing token on app load
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('authUser')
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user data:', error)
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('authUser', JSON.stringify(data.user))
        return true
      } else {
        console.error('Login failed:', data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (email: string, password: string, otp?: string): Promise<{ success: boolean; requiresOTP?: boolean; otp?: string }> => {
    try {
      setLoading(true)
      
      // First, check if OTP is required
      const checkResponse = await fetch('http://localhost:5000/api/admin/check-login-requirements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const checkData = await checkResponse.json()

      if (!checkResponse.ok) {
        return { success: false }
      }

      // If OTP is required but not provided, return the OTP
      if (checkData.requiresOTP && !otp) {
        return { 
          success: false, 
          requiresOTP: true, 
          otp: checkData.otp 
        }
      }

      // Proceed with login
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, otp })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.admin)
        setToken(data.token)
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('authUser', JSON.stringify(data.admin))
        return { success: true }
      } else {
        console.error('Admin login failed:', data.message)
        return { success: false }
      }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setToken(data.token)
        localStorage.setItem('authToken', data.token)
        localStorage.setItem('authUser', JSON.stringify(data.user))
        return true
      } else {
        console.error('Registration failed:', data.message)
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
