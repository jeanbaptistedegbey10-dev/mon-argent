import { useState } from 'react'
import { User, Lock, Bell, Moon, Globe, Shield, LogOut, Check } from 'lucide-react'
import useAuthStore from '../store/useAuthStore'
import { useNavigate } from 'react-router-dom'

const CURRENCIES = ['FCFA', 'EUR', 'USD', 'GBP', 'MAD', 'XOF']

export default function Settings() {
  const { user, logout, login } = useAuthStore()
  const navigate = useNavigate()

  const [name,      setName]      = useState(user?.name  || '')
  const [email,     setEmail]     = useState(user?.email || '')
  const [currency,  setCurrency]  = useState('FCFA')
  const [darkMode, setDarkMode] = useState(
  document.documentElement.classList.contains('dark'))  
  const [notifs,    setNotifs]    = useState(true)
  const [saved,     setSaved]     = useState(false)

  const handleSaveProfile = (e) => {
    e.preventDefault()
    login({ name, email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleDarkMode = (val) => {
  setDarkMode(val)
  if (val) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

  const Toggle = ({ value, onChange }) => (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0
        ${value ? 'bg-blue-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white dark:bg-gray-900 rounded-full shadow transition-all
        ${value ? 'left-5' : 'left-0.5'}`}
      />
    </button>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">Gérez votre compte et vos préférences</p>
      </div>

      {/* Profil */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Profil
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              {name.slice(0, 2).toUpperCase() || 'ME'}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{name || 'Votre nom'}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">{email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom complet</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              {saved ? <><Check size={14} /> Sauvegardé !</> : 'Sauvegarder'}
            </button>
          </form>
        </div>
      </section>

      {/* Préférences */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Préférences
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-50">

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Moon size={15} className="text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Mode sombre</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Activer le thème sombre</p>
              </div>
            </div>
            <Toggle value={darkMode} onChange={handleDarkMode} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <Bell size={15} className="text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Notifications</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Alertes de dépassement de budget</p>
              </div>
            </div>
            <Toggle value={notifs} onChange={setNotifs} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Globe size={15} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Devise</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Devise d'affichage</p>
              </div>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="text-sm border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900"
            >
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
          Sécurité
        </h2>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-50">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <Shield size={15} className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">Changer le mot de passe</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Dernière modification il y a 30 jours</p>
              </div>
            </div>
            <button onClick={() => navigate('/forgot-password')} className="text-xs text-blue-600 font-medium hover:underline">
                  Modifier
            </button>
          </div>
        </div>
      </section>

      {/* Déconnexion */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
      >
        <LogOut size={16} />
        Se déconnecter
      </button>
    </div>
  )
}