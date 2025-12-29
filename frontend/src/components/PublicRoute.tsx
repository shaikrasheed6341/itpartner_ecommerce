import { ReactNode, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface PublicRouteProps {
  children: ReactNode
  adminOnly?: boolean // If true, only accessible when NOT logged in or when admin
  userOnly?: boolean // If true, only accessible when NOT logged in or when user (not admin)
}

export function PublicRoute({ children, adminOnly = false, userOnly = false }: PublicRouteProps) {
  const { isAuthenticated, isAdmin, loading } = useAuth()
  const location = useLocation()

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // If authenticated and trying to access login/register, redirect appropriately
  if (isAuthenticated) {
    // If admin trying to access admin login, redirect to admin dashboard
    if (adminOnly && isAdmin) {
      return <Navigate to="/admin" replace />
    }
    // If user trying to access user login, redirect to home
    if (userOnly && !isAdmin) {
      return <Navigate to="/" replace />
    }
    // If admin trying to access user login, redirect to admin
    if (userOnly && isAdmin) {
      return <Navigate to="/admin" replace />
    }
    // If user trying to access admin login, redirect to home
    if (adminOnly && !isAdmin) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

