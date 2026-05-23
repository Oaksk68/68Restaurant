import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'

interface Props {
  allowedRoles: Array<'owner' | 'waiter' | 'chef'>
}

export default function ProtectedRoute({ allowedRoles }: Props) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/staff/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/staff/orders" replace />
  }

  return <Outlet />
}
