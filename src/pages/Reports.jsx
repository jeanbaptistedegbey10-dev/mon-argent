import { useState } from 'react'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import useFinanceStore from '../store/useFinanceStore'
import useAuthStore from '../store/useAuthStore'
import { exportFinancialReport } from '../lib/exportPDF'
import { PageSkeleton } from '../components/ui/Skeleton'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

const PERIODS = [
  { label: 'Ce mois',     months: 1  },
  { label: '3 mois',      months: 3  },
  { label: '6 mois',      months: 6  },
  { label: 'Cette année', months: 12 },
]

function getMonthsData(transactions, nbMonths) {
  const now = new Date()
  return Array.from({ length: nbMonths }, (_, i) => {
    const date   = new Date(now.getFullYear(), now.getMonth() - (nbMonths - 1 - i), 1)
    const prefix = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const label  = date.toLocaleDateString('fr-FR', {
      month: 'short',
      year: nbMonths > 6 ? '2-digit' : undefined
    })
    const monthTx  = transactions.filter(t => t.date.startsWith(prefix))
    const revenus  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
    const depenses = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
    const epargne  = Math.max(0, revenus - depenses)
    return { mois: label, revenus, depenses, epargne }
  })
}

function getPeriodTransactions(transactions, nbMonths) {
  const now    = new Date()
  const cutoff = new Date(now.getFullYear(), now.getMonth() - nbMonths + 1, 1)
  return transactions.filter(t => new Date(t.date + 'T00:00:00') >= cutoff)
}

function getCatData(transactions, categories) {
  const expenses = transactions.filter(t => t.type === 'expense')
  const total    = expenses.reduce((s, t) => s + Number(t.amount), 0)
  if (total === 0) return []
  const grouped = expenses.reduce((acc, t) => {
    acc[t.cat] = (acc[t.cat] || 0) + Number(t.amount)
    return acc
  }, {})
  return Object.entries(grouped)
    .map(([name, value]) => {
      const cat = categories.find(c => c.name === name)
      return { name, value, color: cat?.color || '#9CA3AF', icon: cat?.icon || '💰', pct: Math.round((value / total) * 100) }
    })
    .sort((a, b) => b.value - a.value)
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name} : {fmt(p.value)} F</p>
      ))}
    </div>
  )
}

export default function Reports() {
  const { transactions, categories, accounts, budgets, loading } = useFinanceStore()
  const { user } = useAuthStore()
  const [periodIdx, setPeriodIdx] = useState(0)
  const [exporting, setExporting] = useState(false)

  if (loading) return <PageSkeleton lines={5} />

  const period   = PERIODS[periodIdx]
  const periodTx = getPeriodTransactions(transactions, period.months)

  const totalIncome  = periodTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = periodTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const savings      = Math.max(0, totalIncome - totalExpense)
  const savingsRate  = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0

  const monthlyData = getMonthsData(transactions, period.months)
  const catData     = getCatData(periodTx, categories)
  const isEmpty     = periodTx.length === 0

  const handleExportPDF = async () => {
    setExporting(true)
    try {
      await exportFinancialReport({ transactions, accounts, budgets, user, period: period.label })
    } catch (err) {
      console.error('Erreur export PDF:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports</h1>
          <p className="text-gray-400 text-sm mt-0.5">Analyse de vos finances</p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={exporting || isEmpty}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          {exporting ? (
            <>
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Génération...
            </>
          ) : <><Download size={16} /> Exporter PDF</>}
        </button>
      </div>

      {/* Période */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {PERIODS.map((p, i) => (
          <button
            key={p.label}
            onClick={() => setPeriodIdx(i)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all
              ${periodIdx === i
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total revenus',  value: `+${fmt(totalIncome)} F`,  color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Total dépenses', value: `-${fmt(totalExpense)} F`, color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Épargne nette',  value: `${fmt(savings)} F`,       color: 'text-blue-600',    bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: "Taux d'épargne", value: `${savingsRate}%`,          color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{k.label}</p>
            <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-gray-400 mt-1">{period.label}</p>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-16 text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Aucune donnée sur cette période</p>
          <p className="text-gray-400 text-sm mt-1">Ajoutez des transactions pour voir vos rapports</p>
        </div>
      ) : (
        <>
          {/* Revenus vs Dépenses */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white">Revenus vs Dépenses</h2>
              <div className="flex gap-3">
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Revenus</span>
                <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Dépenses</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : `${Math.round(v/1000)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenus"  name="Revenus"  fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="depenses" name="Dépenses" fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Donut + Ligne */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Dépenses par catégorie</h2>
              {catData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Aucune dépense sur cette période.</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                        {catData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => [`${fmt(v)} F`, '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {catData.map(c => (
                      <div key={c.name} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                        <span className="flex-1 text-gray-600 dark:text-gray-400">{c.icon} {c.name}</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">{fmt(c.value)} F</span>
                        <span className="text-gray-400 w-8 text-right">{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">Évolution de l'épargne</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => v === 0 ? '0' : `${Math.round(v/1000)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="epargne" name="Épargne" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top dépenses */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-white mb-4">
              Top dépenses — {period.label}
            </h2>
            <div className="space-y-2">
              {periodTx
                .filter(t => t.type === 'expense')
                .sort((a, b) => Number(b.amount) - Number(a.amount))
                .slice(0, 5)
                .map(tx => (
                  <div key={tx.id} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <span className="text-lg flex-shrink-0">{tx.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{tx.name}</p>
                      <p className="text-xs text-gray-400">{tx.cat} · {new Date(tx.date + 'T00:00:00').toLocaleDateString('fr-FR')}</p>
                    </div>
                    <span className="text-sm font-semibold text-red-500 flex-shrink-0">
                      -{fmt(tx.amount)} F
                    </span>
                  </div>
                ))
              }
              {periodTx.filter(t => t.type === 'expense').length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucune dépense sur cette période.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}