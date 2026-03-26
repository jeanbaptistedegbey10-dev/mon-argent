import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, Plus
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import useFinanceStore from '../store/useFinanceStore'
import useAuthStore from '../store/useAuthStore'

const monthlyData = [
  { mois: 'Oct', revenus: 290000, depenses: 220000 },
  { mois: 'Nov', revenus: 315000, depenses: 260000 },
  { mois: 'Déc', revenus: 380000, depenses: 310000 },
  { mois: 'Jan', revenus: 280000, depenses: 200000 },
  { mois: 'Fév', revenus: 310000, depenses: 250000 },
  { mois: 'Mar', revenus: 365000, depenses: 318000 },
]

const donutData = [
  { name: 'Alimentation', value: 35, color: '#2563EB' },
  { name: 'Transport',    value: 20, color: '#10B981' },
  { name: 'Logement',     value: 28, color: '#F59E0B' },
  { name: 'Autres',       value: 17, color: '#EF4444' },
]

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)



function StatCard({ icon: Icon, iconBg, iconColor, label, value, change, changeType }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      {change && (
        <p className={`text-xs mt-1 font-medium ${changeType === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
          {changeType === 'up' ? '↑' : '↓'} {change}
        </p>
      )}
    </div>
  )
}

function TransactionItem({ tx }) {
  const isIncome = tx.type === 'income'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 ${isIncome ? 'bg-emerald-50' : 'bg-red-50'}`}>
        {tx.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{tx.name}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{tx.cat} · {tx.account}</p>
      </div>
      <span className={`text-sm font-semibold flex-shrink-0 ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{fmt(tx.amount)} F
      </span>
    </div>
  )
}

export default function Dashboard() {
  const { transactions, getTotalIncome, getTotalExpense, getTotalBalance, loading } = useFinanceStore()

if (loading) return (
  <div className="flex items-center justify-center h-full">
    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  </div>
)
  const { user } = useAuthStore()

  const totalBalance = getTotalBalance()
  const totalIncome  = getTotalIncome()
  const totalExpense = getTotalExpense()
  const savings      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0

  const recentTx = transactions.slice(0, 5)

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour, {user?.name?.split(' ')[0] || 'vous'} 👋
          </h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link
          to="/transactions"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Ajouter
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Wallet}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          label="Solde total"
          value={`${fmt(totalBalance)} F`}
          change="8.2% ce mois"
          changeType="up"
        />
        <StatCard
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          label="Revenus"
          value={`${fmt(totalIncome)} F`}
          change="12% vs mois dernier"
          changeType="up"
        />
        <StatCard
          icon={TrendingDown}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          label="Dépenses"
          value={`${fmt(totalExpense)} F`}
          change="4.5% vs mois dernier"
          changeType="down"
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-amber-50"
          iconColor="text-amber-500"
          label="Épargne nette"
          value={`${fmt(savings)} F`}
          change={`${savingsRate}% du revenu`}
          changeType="up"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Évolution mensuelle</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10B981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip
                formatter={(value) => [`${fmt(value)} F`, '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenus"  stroke="#10B981" strokeWidth={2} fill="url(#colorRevenus)"  name="Revenus" />
              <Area type="monotone" dataKey="depenses" stroke="#EF4444" strokeWidth={2} fill="url(#colorDepenses)" name="Dépenses" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Donut Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Répartition dépenses</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {donutData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {donutData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
                <span className="font-medium text-gray-700">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">Transactions récentes</h2>
          <Link to="/transactions" className="text-xs text-blue-600 hover:underline font-medium">
            Voir tout →
          </Link>
        </div>
        {recentTx.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">Aucune transaction pour le moment.</p>
        ) : (
          recentTx.map(tx => <TransactionItem key={tx.id} tx={tx} />)
        )}
      </div>

    </div>
  )
}