import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Accounts from './pages/Accounts'
import Budgets from './pages/Budgets'
import Categories from './pages/Categories'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Calendar from './pages/Calendar'
import useAuthStore from './store/useAuthStore'

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Routes protégées */}
        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index                element={<Navigate to="/dashboard" />} />
          <Route path="dashboard"     element={<Dashboard />} />
          <Route path="transactions"  element={<Transactions />} />
          <Route path="calendar"      element={<Calendar />} />
          <Route path="budgets"       element={<Budgets />} />
          <Route path="accounts"      element={<Accounts />} />
          <Route path="categories"    element={<Categories />} />
          <Route path="reports"       element={<Reports />} />
          <Route path="settings"      element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}