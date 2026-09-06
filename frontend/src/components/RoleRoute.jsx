import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const DASHBOARD_BY_ROLE = {
  student: '/student/dashboard',
  academician: '/academician/dashboard',
  industry: '/company/dashboard',
  company: '/company/dashboard',
  admin: '/admin/dashboard',
}

/**
 * Wrap dashboard route groups with this to restrict them to specific
 * roles. Usage: <Route element={<RoleRoute allow={['student']} />}>
 */
export default function RoleRoute({ allow = [] }) {
  const { role, isAuthenticated } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (!allow.includes(role)) {
    // Signed in, but wrong portal — send them to their own dashboard
    // rather than a dead end.
    const fallback = DASHBOARD_BY_ROLE[role] || '/login'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
