import { createContext, useContext, useState, useEffect, ReactNode } from "react"

const AuthContext = createContext({
  user: null as any,
  token: null as any,
  isAuthenticated: false,
  isAdmin: false,
  login: async (email: any, password: any) => false,
  adminLogin: async (email: any, password: any, otp?: any) => ({ success: false }),
  register: async (userData: any) => false,
  logout: () => {},
  loading: false
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
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

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      console.log('Login response:', data)

      if (response.ok) {
        setUser(data.data.user)
        setToken(data.data.token)
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('authUser', JSON.stringify(data.data.user))
        console.log('Login successful, user set:', data.data.user)
        return true
      } else {
        console.error('Login failed:', data.error || data.message)
        return false
      }
    } catch (error) {
      console.error('Login error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const adminLogin = async (email, password, otp) => {
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
      if (checkData.data && checkData.data.requiresOTP && !otp) {
        return { 
          success: false, 
          requiresOTP: true, 
          otp: checkData.data.otp 
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
        setUser(data.data.admin)
        setToken(data.data.token)
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('authUser', JSON.stringify(data.data.admin))
        return { success: true }
      } else {
        console.error('Admin login failed:', data.error || data.message)
        return { success: false }
      }
    } catch (error) {
      console.error('Admin login error:', error)
      return { success: false }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.data.user)
        setToken(data.data.token)
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('authUser', JSON.stringify(data.data.user))
        return true
      } else {
        console.error('Registration failed:', data.error || data.message)
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
