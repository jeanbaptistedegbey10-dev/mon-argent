import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import useFinanceStore from '../store/useFinanceStore'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

const MONTHS = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

export default function Calendar() {
  const { transactions } = useFinanceStore()
  const today = new Date()

  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year:  today.getFullYear(),
  })
  const [selectedDate, setSelectedDate] = useState(null)

  const prevMonth = () => setCurrent(c => {
    if (c.month === 0) return { month: 11, year: c.year - 1 }
    return { month: c.month - 1, year: c.year }
  })

  const nextMonth = () => setCurrent(c => {
    if (c.month === 11) return { month: 0, year: c.year + 1 }
    return { month: c.month + 1, year: c.year }
  })

  // Premier jour du mois (0=dim → convertir en lundi=0)
  const firstDay = new Date(current.year, current.month, 1).getDay()
  const offset   = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth   = new Date(current.year, current.month + 1, 0).getDate()
  const daysInPrevMonth = new Date(current.year, current.month, 0).getDate()

  // Indexer les transactions par date
  const txByDate = transactions.reduce((acc, tx) => {
    const d = tx.date
    if (!acc[d]) acc[d] = { income: 0, expense: 0, list: [] }
    if (tx.type === 'income')  acc[d].income  += tx.amount
    if (tx.type === 'expense') acc[d].expense += tx.amount
    acc[d].list.push(tx)
    return acc
  }, {})

  const pad = (n) => String(n).padStart(2, '0')
  const dateKey = (d) => `${current.year}-${pad(current.month + 1)}-${pad(d)}`

  const isToday = (d) =>
    d === today.getDate() &&
    current.month === today.getMonth() &&
    current.year  === today.getFullYear()

  const selectedTx = selectedDate ? (txByDate[selectedDate]?.list || []) : []
  const selectedIncome  = selectedTx.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const selectedExpense = selectedTx.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)

  // Stats du mois
  const monthPrefix = `${current.year}-${pad(current.month + 1)}`
  const monthTx = transactions.filter(t => t.date.startsWith(monthPrefix))
  const monthIncome  = monthTx.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0)
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0)

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendrier</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">Vue mensuelle de vos transactions</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-800 min-w-[130px] text-center">
            {MONTHS[current.month]} {current.year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats du mois */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Revenus du mois</p>
          <p className="text-lg font-bold text-emerald-500">+{fmt(monthIncome)} F</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Dépenses du mois</p>
          <p className="text-lg font-bold text-red-500">-{fmt(monthExpense)} F</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">Solde du mois</p>
          <p className={`text-lg font-bold ${monthIncome - monthExpense >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {fmt(monthIncome - monthExpense)} F
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Calendrier */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">

          {/* Noms des jours */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Cases jours */}
          <div className="grid grid-cols-7 gap-1">

            {/* Jours du mois précédent */}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`prev-${i}`} className="aspect-square flex items-start justify-end p-1.5 rounded-lg">
                <span className="text-xs text-gray-200">
                  {daysInPrevMonth - offset + i + 1}
                </span>
              </div>
            ))}

            {/* Jours du mois */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day  = i + 1
              const key  = dateKey(day)
              const data = txByDate[key]
              const isSelected = selectedDate === key

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(isSelected ? null : key)}
                  className={`aspect-square flex flex-col items-center justify-start p-1 rounded-lg transition-all text-xs
                    ${isSelected    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                    : isToday(day)  ? 'bg-blue-50 text-blue-600 font-bold'
                    :                 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <span className="font-medium leading-none mb-1">{day}</span>
                  {data && (
                    <div className="flex gap-0.5 justify-center flex-wrap">
                      {data.income  > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-gray-900' : 'bg-emerald-400'}`} />}
                      {data.expense > 0 && <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white dark:bg-gray-900/70' : 'bg-red-400'}`} />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Légende */}
          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Revenu
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Dépense
            </div>
          </div>
        </div>

        {/* Détail jour sélectionné */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          {!selectedDate ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl mb-3">📅</div>
              <p className="text-sm font-medium text-gray-600">Sélectionnez un jour</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Cliquez sur une date pour voir les transactions</p>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                  weekday: 'long', day: 'numeric', month: 'long'
                })}
              </h3>

              {selectedTx.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">
                  Aucune transaction ce jour.
                </p>
              ) : (
                <>
                  {/* Résumé */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-emerald-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-emerald-600 font-medium">+{fmt(selectedIncome)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Revenus</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <p className="text-xs text-red-500 font-medium">-{fmt(selectedExpense)}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">Dépenses</p>
                    </div>
                  </div>

                  {/* Liste */}
                  <div className="space-y-2">
                    {selectedTx.map(tx => (
                      <div key={tx.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-base">{tx.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{tx.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">{tx.cat}</p>
                        </div>
                        <span className={`text-xs font-semibold flex-shrink-0
                          ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}