import { Link } from 'react-router-dom'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import useFinanceStore from '../store/useFinanceStore'
import useAuthStore from '../store/useAuthStore'
import { DashboardSkeleton } from '../components/ui/Skeleton'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

// ── Calcul des 6 derniers mois ────────────────────────────────
function getLast6Months(transactions) {
  const months = []
  const now = new Date()

  for (let i = 5; i >= 0; i--) {
    const date  = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const year  = date.getFullYear()
    const month = date.getMonth()
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    const label  = date.toLocaleDateString('fr-FR', { month: 'short' })

    const monthTx = transactions.filter(t => t.date.startsWith(prefix))

    const revenus  = monthTx
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + Number(t.amount), 0)

    const depenses = monthTx
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + Number(t.amount), 0)

    months.push({ mois: label, revenus, depenses })
  }
  return months
}

// ── Répartition dépenses par catégorie ────────────────────────
function getDonutData(transactions, categories) {
  const now         = new Date()
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date.startsWith(monthPrefix)
  )

  const total = monthExpenses.reduce((s, t) => s + Number(t.amount), 0)
  if (total === 0) return []

  const grouped = monthExpenses.reduce((acc, t) => {
    acc[t.cat] = (acc[t.cat] || 0) + Number(t.amount)
    return acc
  }, {})

  return Object.entries(grouped)
    .map(([name, value]) => {
      const cat   = categories.find(c => c.name === name)
      const color = cat?.color || '#9CA3AF'
      const pct   = Math.round((value / total) * 100)
      return { name, value, color, pct }
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}

// ── Composants ────────────────────────────────────────────────
function StatCard({ icon: Icon, iconBg, iconColor, label, value, change, changeType }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="text-xs text-gray-400 font-medium mb-1">{label}</p>
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
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0
        ${isIncome ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        {tx.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{tx.name}</p>
        <p className="text-xs text-gray-400">{tx.cat} · {tx.account}</p>
      </div>
      <span className={`text-sm font-semibold flex-shrink-0
        ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{fmt(tx.amount)} F
      </span>
    </div>
  )
}

// ── Tooltip personnalisé ──────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name} : {fmt(p.value)} F
        </p>
      ))}
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function Dashboard() {
  const { transactions, getTotalBalance, categories, loading } = useFinanceStore()
  const { user } = useAuthStore()

  // Stats mois en cours
  const now         = new Date()
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthlyTx = transactions.filter(t => t.date.startsWith(monthPrefix))

  const totalIncome  = monthlyTx
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalExpense = monthlyTx
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0)

  const totalBalance = getTotalBalance()
  const savings      = Math.max(0, totalIncome - totalExpense)
  const savingsRate  = totalIncome > 0
    ? ((savings / totalIncome) * 100).toFixed(1)
    : 0

  // Graphiques
  const monthlyData = getLast6Months(transactions)
  const donutData   = getDonutData(transactions, categories)

  const recentTx = transactions.slice(0, 5)

  if (loading) return <DashboardSkeleton />

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bonjour, {user?.name?.split(' ')[0] || 'vous'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {now.toLocaleDateString('fr-FR', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </p>
        </div>
        <Link
          to="/transactions"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Ajouter
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Wallet}
          iconBg="bg-blue-50 dark:bg-blue-900/20"
          iconColor="text-blue-600"
          label="Solde total"
          value={`${fmt(totalBalance)} F`}
          change="Tous comptes confondus"
          changeType="up"
        />
        <StatCard
          icon={TrendingUp}
          iconBg="bg-emerald-50 dark:bg-emerald-900/20"
          iconColor="text-emerald-600"
          label="Revenus ce mois"
          value={`${fmt(totalIncome)} F`}
          change={totalIncome === 0 ? 'Aucun revenu' : `${monthlyTx.filter(t => t.type === 'income').length} transaction(s)`}
          changeType="up"
        />
        <StatCard
          icon={TrendingDown}
          iconBg="bg-red-50 dark:bg-red-900/20"
          iconColor="text-red-500"
          label="Dépenses ce mois"
          value={`${fmt(totalExpense)} F`}
          change={totalExpense === 0 ? 'Aucune dépense' : `${monthlyTx.filter(t => t.type === 'expense').length} transaction(s)`}
          changeType="down"
        />
        <StatCard
          icon={PiggyBank}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          iconColor="text-amber-500"
          label="Épargne nette"
          value={`${fmt(savings)} F`}
          change={totalIncome === 0 ? 'Aucun revenu ce mois' : `${savingsRate}% du revenu`}
          changeType="up"
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

        {/* Area Chart — 6 derniers mois */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
              Évolution des 6 derniers mois
            </h2>
            <div className="flex gap-3">
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Revenus
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-400" /> Dépenses
              </span>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
              Ajoutez des transactions pour voir le graphique
            </div>
          ) : (
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
                <XAxis
                  dataKey="mois"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v === 0 ? '0' : `${Math.round(v/1000)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenus"
                  name="Revenus"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorRevenus)"
                />
                <Area
                  type="monotone"
                  dataKey="depenses"
                  name="Dépenses"
                  stroke="#EF4444"
                  strokeWidth={2}
                  fill="url(#colorDepenses)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Donut — répartition dépenses mois en cours */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-1">
            Dépenses ce mois
          </h2>
          <p className="text-xs text-gray-400 mb-4">Par catégorie</p>

          {donutData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <p className="text-sm text-gray-400">Aucune dépense ce mois</p>
            </div>
          ) : (
            <>
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
                  <Tooltip
                    formatter={(v) => [`${fmt(v)} F`, '']}
                    contentStyle={{
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                        style={{ background: d.color }}
                      />
                      <span className="text-gray-600 dark:text-gray-400 truncate">{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-gray-500 dark:text-gray-400">{fmt(d.value)} F</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300 w-8 text-right">
                        {d.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Transactions récentes */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
            Transactions récentes
          </h2>
          <Link
            to="/transactions"
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Voir tout →
          </Link>
        </div>
        {recentTx.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            Aucune transaction pour le moment.
          </p>
        ) : (
          recentTx.map(tx => <TransactionItem key={tx.id} tx={tx} />)
        )}
      </div>

    </div>
  )
}