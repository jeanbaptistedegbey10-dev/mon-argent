import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, Calendar,
  PiggyBank, Wallet, Tag, BarChart2, Settings,
  LogOut, X
} from 'lucide-react'
import useAuthStore from '../../store/useAuthStore'

const navItems = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight,   label: 'Transactions' },
  { to: '/calendar',     icon: Calendar,         label: 'Calendrier' },
  { to: '/budgets',      icon: PiggyBank,        label: 'Budgets' },
  { to: '/accounts',     icon: Wallet,           label: 'Comptes' },
  { to: '/categories',   icon: Tag,              label: 'Catégories' },
  { to: '/reports',      icon: BarChart2,        label: 'Rapports' },
  { to: '/settings',     icon: Settings,         label: 'Paramètres' },
]

export default function Sidebar({ onClose }) {
  const { logout, user } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col py-6">

      {/* Logo + bouton fermer mobile */}
      <div className="px-6 pb-6 border-b border-gray-100 dark:border-gray-800 mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-blue-600 leading-tight">
            Gérer<br />mon argent
          </h1>
          <p className="text-xs text-gray-400 mt-1">Finances personnelles</p>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mt-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="px-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-xs flex-shrink-0">
            {user?.name?.slice(0, 2).toUpperCase() || 'ME'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
              {user?.name || 'Utilisateur'}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}