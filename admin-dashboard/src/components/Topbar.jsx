import { useLocation, useNavigate } from 'react-router-dom'
import { FiLogOut } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext.jsx'

function titleForPath(pathname) {
  if (pathname.startsWith('/dashboard')) return 'Dashboard'
  if (pathname.startsWith('/reports')) return 'Reports'
  if (pathname.startsWith('/map')) return 'Map View'
  if (pathname.startsWith('/profile')) return 'Profile'
  return 'Civic Setu'
}

export default function Topbar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 sm:px-6">
        <div>
          <div className="text-sm text-slate-500">Civic Setu</div>
          <div className="text-lg font-semibold text-slate-900">
            {titleForPath(pathname)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-medium text-slate-900">{user?.name}</div>
            <div className="text-xs text-slate-500">{user?.email}</div>
          </div>
          <button
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </header>
  )
}

