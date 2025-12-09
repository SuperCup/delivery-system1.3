import { Navigate } from 'react-router-dom'
import { AuthService } from '../../services/auth-service'

interface ProtectedRouteProps {
  children: React.ReactElement
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  return children
}
