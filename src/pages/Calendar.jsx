import { useState } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar as CalendarIcon } from 'lucide-react'
import useFinanceStore from '../store/useFinanceStore'
import { PageSkeleton } from '../components/ui/Skeleton'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

const MONTHS    = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const DAYS_SHORT = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
const DAYS_FULL  = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche']

export default function Calendar() {
  const { transactions, loading } = useFinanceStore()

  const today = new Date()
  const [current, setCurrent] = useState({
    month: today.getMonth(),
    year:  today.getFullYear(),
  })
  const [selectedDate, setSelectedDate] = useState(
    today.toISOString().split('T')[0]
  )

  if (loading) return <PageSkeleton lines={6} />

  const prevMonth = () => setCurrent(c =>
    c.month === 0 ? { month: 11, year: c.year - 1 } : { month: c.month - 1, year: c.year }
  )
  const nextMonth = () => setCurrent(c =>
    c.month === 11 ? { month: 0, year: c.year + 1 } : { month: c.month + 1, year: c.year }
  )
  const goToToday = () => {
    setCurrent({ month: today.getMonth(), year: today.getFullYear() })
    setSelectedDate(today.toISOString().split('T')[0])
  }

  const pad              = (n) => String(n).padStart(2, '0')
  const dateKey          = (d) => `${current.year}-${pad(current.month + 1)}-${pad(d)}`
  const isToday          = (d) => dateKey(d) === today.toISOString().split('T')[0]
  const isSelected       = (d) => dateKey(d) === selectedDate
  const isCurrentMonth   = current.month === today.getMonth() && current.year === today.getFullYear()

  const firstDayOfMonth  = new Date(current.year, current.month, 1).getDay()
  const offset           = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth      = new Date(current.year, current.month + 1, 0).getDate()
  const daysInPrevMonth  = new Date(current.year, current.month, 0).getDate()
  const totalCells       = Math.ceil((offset + daysInMonth) / 7) * 7

  const txByDate = transactions.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = { income: 0, expense: 0, list: [] }
    if (tx.type === 'income')  acc[tx.date].income  += Number(tx.amount)
    if (tx.type === 'expense') acc[tx.date].expense += Number(tx.amount)
    acc[tx.date].list.push(tx)
    return acc
  }, {})

  const monthPrefix  = `${current.year}-${pad(current.month + 1)}`
  const monthTx      = transactions.filter(t => t.date.startsWith(monthPrefix))
  const monthIncome  = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
  const monthSavings = Math.max(0, monthIncome - monthExpense)
  const activeDays   = new Set(monthTx.map(t => t.date)).size

  const selectedTx      = selectedDate ? (txByDate[selectedDate]?.list || []) : []
  const selectedIncome  = selectedTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const selectedExpense = selectedTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return ''
    const d   = new Date(dateStr + 'T00:00:00')
    const day = DAYS_FULL[d.getDay() === 0 ? 6 : d.getDay() - 1]
    return `${day} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendrier</h1>
          <p className="text-gray-400 text-sm mt-0.5">Vue mensuelle de vos transactions</p>
        </div>
        <div className="flex items-center gap-2">
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Aujourd'hui
            </button>
          )}
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-gray-800 dark:text-white min-w-[140px] text-center">
            {MONTHS[current.month]} {current.year}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Stats mois */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={14} className="text-emerald-600" />
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Revenus</p>
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">+{fmt(monthIncome)} F</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={14} className="text-red-500" />
            <p className="text-xs text-red-500 font-medium">Dépenses</p>
          </div>
          <p className="text-lg font-bold text-red-500">-{fmt(monthExpense)} F</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon size={14} className="text-blue-600" />
            <p className="text-xs text-blue-600 font-medium">Épargne</p>
          </div>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{fmt(monthSavings)} F</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarIcon size={14} className="text-gray-500" />
            <p className="text-xs text-gray-500 font-medium">Jours actifs</p>
          </div>
          <p className="text-lg font-bold text-gray-700 dark:text-white">
            {activeDays} jour{activeDays > 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Grille */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="grid grid-cols-7 mb-1">
            {DAYS_SHORT.map(d => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: totalCells }).map((_, i) => {
              const dayNum  = i - offset + 1
              const isPrev  = i < offset
              const isNext  = dayNum > daysInMonth
              const isOther = isPrev || isNext

              let displayDay
              let key = null
              if (isPrev)       displayDay = daysInPrevMonth - offset + i + 1
              else if (isNext)  displayDay = dayNum - daysInMonth
              else { displayDay = dayNum; key = dateKey(dayNum) }

              const data       = key ? txByDate[key] : null
              const todayCell  = key && isToday(dayNum)
              const selCell    = key && isSelected(dayNum)
              const hasIncome  = data?.income  > 0
              const hasExpense = data?.expense > 0

              return (
                <button
                  key={i}
                  disabled={isOther}
                  onClick={() => key && setSelectedDate(key)}
                  className={`relative aspect-square flex flex-col items-center justify-start pt-1.5 pb-1 px-1 rounded-lg transition-all text-xs
                    ${isOther
                      ? 'text-gray-200 dark:text-gray-700 cursor-default'
                      : selCell
                        ? 'bg-blue-600 text-white ring-2 ring-blue-300 dark:ring-blue-700'
                        : todayCell
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-200 dark:ring-blue-800'
                          : data
                            ? 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-500'
                    }`}
                >
                  <span className="leading-none">{displayDay}</span>
                  {data && !isOther && (
                    <div className="flex gap-0.5 mt-1">
                      {hasIncome  && <span className={`w-1.5 h-1.5 rounded-full ${selCell ? 'bg-white' : 'bg-emerald-400'}`} />}
                      {hasExpense && <span className={`w-1.5 h-1.5 rounded-full ${selCell ? 'bg-white/70' : 'bg-red-400'}`} />}
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex gap-4 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Revenu</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-red-400" /> Dépense</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-600" /> Aujourd'hui</div>
          </div>
        </div>

        {/* Détail jour */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex flex-col">
          <div className="mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 mb-0.5">Jour sélectionné</p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white capitalize">
              {formatSelectedDate(selectedDate)}
            </p>
          </div>

          {selectedTx.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-2xl mb-3">📅</div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Aucune transaction</p>
              <p className="text-xs text-gray-400 mt-1">Ce jour n'a pas d'activité</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">+{fmt(selectedIncome)} F</p>
                  <p className="text-xs text-gray-400 mt-0.5">Revenus</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-red-500 font-medium">-{fmt(selectedExpense)} F</p>
                  <p className="text-xs text-gray-400 mt-0.5">Dépenses</p>
                </div>
              </div>

              {selectedIncome > 0 && selectedExpense > 0 && (
                <div className={`mb-3 px-3 py-2 rounded-lg text-xs font-medium text-center
                  ${selectedIncome - selectedExpense >= 0
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  }`}
                >
                  Solde du jour : {selectedIncome - selectedExpense >= 0 ? '+' : ''}
                  {fmt(selectedIncome - selectedExpense)} F
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-2">
                {selectedTx
                  .sort((a, b) => (a.type === 'income' ? -1 : 1))
                  .map(tx => (
                    <div key={tx.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0
                        ${tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}
                      >
                        {tx.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 dark:text-white truncate">{tx.name}</p>
                        <p className="text-xs text-gray-400">{tx.cat}</p>
                      </div>
                      <span className={`text-xs font-semibold flex-shrink-0 ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)} F
                      </span>
                    </div>
                  ))
                }
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 text-center">
                <p className="text-xs text-gray-400">
                  {selectedTx.length} transaction{selectedTx.length > 1 ? 's' : ''} ce jour
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}