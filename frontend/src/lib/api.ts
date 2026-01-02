import axios from 'axios'
import { useState, useEffect } from 'react'

// Base URL for API - allow overriding via Vite env
const API_BASE_URL = (import.meta.env?.VITE_API_BASE as string) || 'http://localhost:5000'

// Log API base URL in development
if (import.meta.env.DEV) {
  console.log('🔗 API Base URL:', API_BASE_URL)
}

// Create axios instance
export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// ============================================================================
// CUSTOM API ERROR CLASS
// ============================================================================

class ApiError extends Error {
  details: any
  constructor(message: string, details?: any) {
    super(message)
    this.name = 'ApiError'
    this.details = details
  }
}

// ============================================================================
// API CLIENT CLASS (uses axios)
// ============================================================================

class ApiClient {
  private axios = axiosInstance

  // Set authorization token
  setAuthToken(token: string) {
    this.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  // Remove authorization token
  removeAuthToken() {
    delete this.axios.defaults.headers.common['Authorization']
  }

  private async request(endpoint: string, options: { method?: string; data?: any; params?: any; headers?: any } = {}) {
    try {
      const response = await this.axios.request({
        url: endpoint,
        method: options.method || 'GET',
        data: options.data,
        params: options.params,
        headers: options.headers,
      })

      // Assume backend responds with an object that may include `success` and `data`
      return response.data
    } catch (err: any) {
      // Handle 401 Unauthorized - token expired or invalid
      if (err.response?.status === 401) {
        // Clear auth and redirect to login
        const token = localStorage.getItem('authToken')
        if (token) {
          localStorage.removeItem('authToken')
          localStorage.removeItem('authUser')
          // Trigger page reload to reset auth state
          if (window.location.pathname.startsWith('/admin')) {
            window.location.href = '/admin/login'
          } else {
            window.location.href = '/login'
          }
        }
      }
      // Normalize axios error
      if (err.response && err.response.data) {
        const data = err.response.data
        throw new ApiError(data.error || data.message || 'Request failed', data.details || data)
      }
      // Handle connection errors - check multiple possible error indicators
      const errorMessage = err.message || ''
      const errorCode = err.code || ''
      const isConnectionError = 
        errorCode === 'ECONNREFUSED' || 
        errorCode === 'ERR_CONNECTION_REFUSED' ||
        errorMessage.includes('ERR_CONNECTION_REFUSED') ||
        errorMessage.includes('Network Error') ||
        errorMessage.includes('Failed to fetch') ||
        (err.request && !err.response) // Axios request was made but no response received
      
      if (isConnectionError) {
        throw new ApiError('Cannot connect to backend server. Please make sure the backend server is running on http://localhost:5000', err)
      }
      throw new ApiError(err.message || 'Network error occurred', err)
    }
  }

  async get(endpoint: string, params?: any) {
    return this.request(endpoint, { method: 'GET', params })
  }

  async post(endpoint: string, data?: any) {
    return this.request(endpoint, { method: 'POST', data })
  }

  async put(endpoint: string, data?: any) {
    return this.request(endpoint, { method: 'PUT', data })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
export const apiClient = new ApiClient()

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

// Auth API functions (match backend routes used in the frontend)
export const authApi = {
  register: (userData: any) => apiClient.post('/api/v1/auth/register', userData),
  login: (credentials: any) => apiClient.post('/api/v1/auth/login', credentials),
  getProfile: () => apiClient.get('/api/v1/auth/profile'),
  updateProfile: (userData: any) => apiClient.put('/api/v1/auth/profile', userData),
  getAllUsers: (params?: any) => apiClient.get('/api/v1/auth/users', params),
}

// Products API functions
export const productsApi = {
  getAll: (params?: any) => apiClient.get('/api/v1/products', params),
  getById: (id: string) => apiClient.get(`/api/v1/products/${id}`),
  create: (productData: any) => apiClient.post('/api/v1/products', productData),
  update: (id: string, productData: any) => apiClient.put(`/api/v1/products/${id}`, productData),
  delete: (id: string) => apiClient.delete(`/api/v1/products/${id}`),
}

// Cart API functions
export const cartApi = {
  get: () => apiClient.get('/api/v1/cart'),
  add: (item: any) => apiClient.post('/api/v1/cart', item),
  addMultiple: (items: any) => apiClient.post('/api/v1/cart/add-multiple', { items }),
  remove: (productId: string) => apiClient.delete(`/api/v1/cart/${productId}`),
  clear: () => apiClient.delete('/api/v1/cart/clear'),
}

// Orders API functions
export const ordersApi = {
  getAll: () => apiClient.get('/api/v1/admin/orders'),
  getUserOrders: () => apiClient.get('/api/v1/orders'),
  getById: (id: string) => apiClient.get(`/api/v1/orders/${id}`),
  create: () => apiClient.post('/api/v1/orders/create'),
  createRazorpayOrder: (orderData: any) => apiClient.post('/api/v1/orders/razorpay/create', orderData),
  verifyRazorpayPayment: (paymentData: any) => apiClient.post('/api/v1/orders/razorpay/verify', paymentData),
  updateStatus: (orderId: string, status: string) => apiClient.put(`/api/v1/admin/orders/${orderId}/status`, { status }),
}

// Contact API functions
export const contactApi = {
  submit: (formData: any) => apiClient.post('/api/v1/contact/submit', formData),
}

// ============================================================================
// HOOKS FOR API CALLS
// ============================================================================

// Generic hook for API calls
export function useApi(apiCall: () => Promise<any>, dependencies: any[] = []) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)

  const execute = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiCall()
      if (response?.success) {
        setData(response.data || null)
      } else if (response?.data !== undefined) {
        // backend may return raw data
        setData(response.data ?? response)
      } else {
        setError(response?.error || 'Request failed')
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    execute()
  }, dependencies)

  return { data, loading, error, refetch: execute }
}

// Hook for form submissions
export function useFormSubmit(submitFn: (d: any) => Promise<any>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>(null)
  const [success, setSuccess] = useState(false)

  const submit = async (data: any) => {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await submitFn(data)
      if (response?.success) {
        setSuccess(true)
        return response
      } else {
        setError(response?.error || 'Submission failed')
        return null
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('An unexpected error occurred')
      }
      return null
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, error, success }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Handle API errors
export const handleApiError = (error: any) => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error?.response?.data?.error) {
    return error.response.data.error
  }
  if (error?.message) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// Format validation errors
export const formatValidationErrors = (errors: any[]) => {
  const formatted: Record<string, string> = {}
  errors.forEach(error => {
    formatted[error.field] = error.message
  })
  return formatted
}

// Check if error is validation error
export const isValidationError = (error: any) => {
  return error instanceof ApiError && error.details !== undefined
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ApiClient, ApiError }
export default axiosInstance
