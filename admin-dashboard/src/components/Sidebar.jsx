import { NavLink } from 'react-router-dom'
import { FiBarChart2, FiFileText, FiMap, FiUser } from 'react-icons/fi'

const linkBase =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition'

export default function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="p-5">
        <div className="text-lg font-semibold text-slate-900">Civic Setu</div>
        <div className="text-xs text-slate-500">Admin Dashboard</div>
      </div>

      <nav className="flex-1 px-3">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`
          }
        >
          <FiBarChart2 /> Dashboard
        </NavLink>
        <NavLink
          to="/reports"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`
          }
        >
          <FiFileText /> Reports
        </NavLink>
        <NavLink
          to="/map"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`
          }
        >
          <FiMap /> Map View
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            }`
          }
        >
          <FiUser /> Profile
        </NavLink>
      </nav>

      <div className="p-4 text-xs text-slate-400">
        API: <span className="font-mono">localhost:5000</span>
      </div>
    </aside>
  )
}

