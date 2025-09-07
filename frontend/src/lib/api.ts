// API Client for Frontend
// This file provides a way to make API calls

const API_BASE_URL = 'http://localhost:5000';

// ============================================================================
// API CLIENT CLASS
// ============================================================================

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Set authorization token
  setAuthToken(token: string) {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Remove authorization token
  removeAuthToken() {
    delete this.defaultHeaders['Authorization'];
  }

  // Generic request method
  private async request(
    endpoint: string,
    options = {}
  ) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('API Response:', { url, status: response.status, data });

      if (!response.ok) {
        throw new ApiError(data.error || 'Request failed', data.details);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error occurred');
    }
  }

  // GET request
  async get(endpoint: string, params) {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint: string, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put(endpoint: string, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// ============================================================================
// CUSTOM API ERROR CLASS
// ============================================================================

class ApiError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ApiError';
    this.details = details;
  }
}

// ============================================================================
// API SERVICE FUNCTIONS
// ============================================================================

// Create API client instance
export const apiClient = new ApiClient();

// Auth API functions
export const authApi = {
  register: (userData) => apiClient.post('/api/auth/register', userData),
  login: (credentials) => apiClient.post('/api/auth/login', credentials),
  getProfile: () => apiClient.get('/api/auth/profile'),
  getAllUsers: (params) => apiClient.get('/api/auth/users', params),
};

// Products API functions
export const productsApi = {
  getAll: (params) => apiClient.get('/api/products', params),
  getById: (id) => apiClient.get(`/api/products/${id}`),
  create: (productData) => apiClient.post('/api/products', productData),
  update: (id, productData) => apiClient.put(`/api/products/${id}`, productData),
  delete: (id) => apiClient.delete(`/api/products/${id}`),
};

// Cart API functions
export const cartApi = {
  get: () => apiClient.get('/api/cart'),
  add: (item) => apiClient.post('/api/cart', item),
  addMultiple: (items) => apiClient.post('/api/cart/multiple', items),
  remove: (productId) => apiClient.delete(`/api/cart/${productId}`),
  clear: () => apiClient.delete('/api/cart/clear'),
};

// Orders API functions
export const ordersApi = {
  getAll: () => apiClient.get('/api/orders'),
  getById: (id) => apiClient.get(`/api/orders/${id}`),
  create: () => apiClient.post('/api/orders/create'),
  createRazorpayOrder: (orderData) => apiClient.post('/api/orders/razorpay/create', orderData),
  verifyRazorpayPayment: (paymentData) => apiClient.post('/api/orders/razorpay/verify', paymentData),
};

// Contact API functions
export const contactApi = {
  submit: (formData) => apiClient.post('/api/contact', formData),
};

// ============================================================================
// HOOKS FOR API CALLS
// ============================================================================

import { useState, useEffect } from 'react';

// Generic hook for API calls
export function useApi(
  apiCall,
  dependencies = []
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.error || 'Request failed');
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    execute();
  }, dependencies);

  return { data, loading, error, refetch: execute };
}

// Hook for form submissions
export function useFormSubmit(
  submitFn
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await submitFn(data);
      if (response.success) {
        setSuccess(true);
        return response;
      } else {
        setError(response.error || 'Submission failed');
        return null;
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error, success };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Handle API errors
export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Format validation errors
export const formatValidationErrors = (errors) => {
  const formatted = {};
  errors.forEach(error => {
    formatted[error.field] = error.message;
  });
  return formatted;
};

// Check if error is validation error
export const isValidationError = (error) => {
  return error instanceof ApiError && error.details !== undefined;
};

// ============================================================================
// EXPORTS
// ============================================================================

export { ApiClient, ApiError };
export default apiClient;
