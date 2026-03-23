import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { booting, isAuthenticated, isAdmin } = useAuth()
  const location = useLocation()

  if (booting) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="rounded-xl bg-white shadow p-6 text-sm text-slate-600">
          Loading…
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
          <div className="text-lg font-semibold text-slate-900">
            Admin access required
          </div>
          <div className="mt-2 text-sm text-slate-600">
            This account is not an admin account. Please login with an admin user.
          </div>
          <div className="mt-4">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return children
}

