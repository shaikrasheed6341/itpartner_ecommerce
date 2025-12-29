import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
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

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={requireAdmin ? '/admin/login' : '/login'} state={{ from: location }} replace />
  }

  // If admin route but user is not admin, redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />
  }

  // If user route but user is admin, redirect to admin dashboard
  if (!requireAdmin && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}

