import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'

export function accueilDe(user) {
  return user?.role === 'CLIENT' ? '/espace' : '/app'
}

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />
  }
  if (roles && !user) {
    return <p className="p-6 text-sm text-muted-foreground">Chargement…</p>
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={accueilDe(user)} replace />
  }
  return <Outlet />
}
