import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />
  }
  return <Outlet />
}
