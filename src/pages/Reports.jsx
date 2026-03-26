import { useState } from 'react'
import { Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  LineChart, Line, Legend
} from 'recharts'
import useFinanceStore from '../store/useFinanceStore'

const fmt  = (n) => new Intl.NumberFormat('fr-FR').format(n)
const PERIODS = ['Ce mois', '3 mois', '6 mois', 'Cette année']

const monthlyData = [
  { mois: 'Oct', revenus: 290000, depenses: 220000 },
  { mois: 'Nov', revenus: 315000, depenses: 260000 },
  { mois: 'Déc', revenus: 380000, depenses: 310000 },
  { mois: 'Jan', revenus: 280000, depenses: 200000 },
  { mois: 'Fév', revenus: 310000, depenses: 250000 },
  { mois: 'Mar', revenus: 365000, depenses: 318000 },
]

export default function Reports() {
  const { transactions, categories } = useFinanceStore()
  const [period, setPeriod] = useState('Ce mois')

  const totalIncome  = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)
  const savings      = totalIncome - totalExpense
  const savingsRate  = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : 0

  // Dépenses par catégorie
  const catData = categories.map(cat => {
    const total = transactions
      .filter(t => t.type === 'expense' && t.cat === cat.name)
      .reduce((s, t) => s + t.amount, 0)
    return { name: cat.name, value: total, color: cat.color, icon: cat.icon }
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value)

  const totalCatExpense = catData.reduce((s, c) => s + c.value, 0)

  const handleExportPDF = () => {
    window.print()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rapports</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">Analyse détaillée de vos finances</p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Download size={16} />
          Exporter PDF
        </button>
      </div>

      {/* Période */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all
              ${period === p
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-900 text-gray-500 border-gray-200 dark:border-gray-800 hover:border-blue-300'
              }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total revenus',   value: `+${fmt(totalIncome)} F`,  color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Total dépenses',  value: `-${fmt(totalExpense)} F`, color: 'text-red-500',     bg: 'bg-red-50' },
          { label: 'Épargne nette',   value: `${fmt(savings)} F`,       color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Taux d\'épargne', value: `${savingsRate}%`,          color: 'text-amber-500',   bg: 'bg-amber-50' },
        ].map(k => (
          <div key={k.label} className={`${k.bg} rounded-xl p-4`}>
            <p className="text-xs text-gray-500 mb-1">{k.label}</p>
            <p className={`text-lg font-bold ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Revenus vs Dépenses */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-4">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Revenus vs Dépenses</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="mois" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
            <Tooltip
              formatter={(v) => [`${fmt(v)} F`, '']}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
            />
            <Bar dataKey="revenus"  name="Revenus"  fill="#10B981" radius={[4,4,0,0]} />
            <Bar dataKey="depenses" name="Dépenses" fill="#EF4444" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        {/* Légende custom */}
        <div className="flex gap-4 justify-center mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" /> Revenus
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded-sm bg-red-500" /> Dépenses
          </div>
        </div>
      </div>

      {/* Dépenses par catégorie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

        {/* Donut */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Répartition par catégorie</h2>
          {catData.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">Aucune dépense enregistrée.</p>
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
                    <span className="flex-1 text-gray-600">{c.icon} {c.name}</span>
                    <span className="font-medium text-gray-700">{fmt(c.value)} F</span>
                    <span className="text-gray-400 dark:text-gray-500">
                      {totalCatExpense > 0 ? Math.round((c.value / totalCatExpense) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Évolution épargne */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h2 className="text-sm font-semibold text-gray-800 mb-4">Évolution de l'épargne</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData.map(d => ({
              ...d,
              epargne: d.revenus - d.depenses
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}k`} />
              <Tooltip formatter={(v) => [`${fmt(v)} F`, 'Épargne']} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
              <Line type="monotone" dataKey="epargne" stroke="#2563EB" strokeWidth={2.5} dot={{ fill: '#2563EB', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top dépenses */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4">Top transactions</h2>
        <div className="space-y-2">
          {transactions
            .filter(t => t.type === 'expense')
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map(tx => (
              <div key={tx.id} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                <span className="text-lg">{tx.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{tx.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{tx.cat} · {tx.date}</p>
                </div>
                <span className="text-sm font-semibold text-red-500 flex-shrink-0">
                  -{fmt(tx.amount)} F
                </span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}