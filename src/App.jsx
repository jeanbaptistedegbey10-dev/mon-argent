import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Accounts from './pages/Accounts'
import Budgets from './pages/Budgets'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Calendar from './pages/Calendar'
import useAuthStore from './store/useAuthStore'
import { supabase } from './lib/supabase'
import NotFound from './pages/NotFound'

// Composant qui surveille la session en continu
function SessionWatcher() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        useAuthStore.setState({ user: null, isAuthenticated: false, loading: false })
        navigate('/login', { replace: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [navigate])

  return null
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuthStore()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="flex flex-col items-center gap-3">
        <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <p className="text-sm text-gray-400">Chargement...</p>
      </div>
    </div>
  )

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <SessionWatcher />
      <Routes>
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index                element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="transactions"  element={<Transactions />} />
          <Route path="calendar"      element={<Calendar />} />
          <Route path="budgets"       element={<Budgets />} />
          <Route path="accounts"      element={<Accounts />} />
          <Route path="categories"    element={<Categories />} />
          <Route path="reports"       element={<Reports />} />
          <Route path="settings"      element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Page 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 gap-4">
            <p className="text-6xl font-bold text-gray-200 dark:text-gray-800">404</p>
            <p className="text-gray-500 text-sm">Page introuvable</p>
            <Navigate to="/dashboard" replace />
          </div>
        } />
      </Routes>
    </BrowserRouter>
  )
}