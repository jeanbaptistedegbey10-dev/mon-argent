import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, X, TrendingUp } from 'lucide-react'
import useFinanceStore from '../../store/useFinanceStore'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

function NotificationItem({ notif, onClose }) {
  const isOver    = notif.type === 'over'
  const isWarning = notif.type === 'warning'

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg
      backdrop-blur-sm animate-slide-in
      ${isOver
        ? 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800'
        : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${isOver
          ? 'bg-red-100 dark:bg-red-900/50'
          : 'bg-amber-100 dark:bg-amber-900/50'
        }`}
      >
        {isOver
          ? <AlertTriangle size={16} className="text-red-600 dark:text-red-400" />
          : <TrendingUp    size={16} className="text-amber-600 dark:text-amber-400" />
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold
          ${isOver
            ? 'text-red-700 dark:text-red-300'
            : 'text-amber-700 dark:text-amber-300'
          }`}
        >
          {isOver ? '⚠️ Budget dépassé !' : '🔔 Budget presque atteint'}
        </p>
        <p className={`text-xs mt-0.5
          ${isOver
            ? 'text-red-600 dark:text-red-400'
            : 'text-amber-600 dark:text-amber-400'
          }`}
        >
          {notif.icon} {notif.name} —{' '}
          {isOver
            ? `Dépassé de ${fmt(notif.spent - notif.limit)} FCFA`
            : `${fmt(notif.spent)} / ${fmt(notif.limit)} FCFA (${notif.pct}%)`
          }
        </p>
      </div>

      <button
        onClick={() => onClose(notif.id)}
        className={`flex-shrink-0 p-1 rounded-lg transition-colors
          ${isOver
            ? 'text-red-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50'
            : 'text-amber-400 hover:text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/50'
          }`}
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function BudgetNotifications() {
  const { budgets, transactions } = useFinanceStore()
  const [notifications, setNotifications] = useState([])
  const [dismissed,     setDismissed]     = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dismissed-notifs') || '[]')
    } catch {
      return []
    }
  })

  const checkBudgets = useCallback(() => {
    const now         = new Date()
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const spentByCategory = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthPrefix))
      .reduce((acc, t) => {
        acc[t.cat] = (acc[t.cat] || 0) + Number(t.amount)
        return acc
      }, {})

    const newNotifs = []

    budgets.forEach(budget => {
      const spent = spentByCategory[budget.name] || 0
      const pct   = budget.limit > 0 ? Math.round((spent / budget.limit) * 100) : 0
      const over  = spent > budget.limit

      const notifId = `${budget.id}-${over ? 'over' : 'warning'}-${monthPrefix}`

      if (dismissed.includes(notifId)) return

      if (over) {
        newNotifs.push({
          id:    notifId,
          type:  'over',
          name:  budget.name,
          icon:  budget.icon,
          spent,
          limit: budget.limit,
          pct,
        })
      } else if (pct >= 80) {
        newNotifs.push({
          id:    notifId,
          type:  'warning',
          name:  budget.name,
          icon:  budget.icon,
          spent,
          limit: budget.limit,
          pct,
        })
      }
    })

    setNotifications(newNotifs)
  }, [budgets, transactions, dismissed])

  // Vérifier à chaque changement de transactions ou budgets
  useEffect(() => {
    checkBudgets()
  }, [checkBudgets])

  const handleClose = (id) => {
    setDismissed(prev => {
      const updated = [...prev, id]
      localStorage.setItem('dismissed-notifs', JSON.stringify(updated))
      return updated
    })
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleCloseAll = () => {
    const ids = notifications.map(n => n.id)
    setDismissed(prev => {
      const updated = [...prev, ...ids]
      localStorage.setItem('dismissed-notifs', JSON.stringify(updated))
      return updated
    })
    setNotifications([])
  }

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">

      {/* Bouton tout fermer si plusieurs */}
      {notifications.length > 1 && (
        <div className="flex justify-end">
          <button
            onClick={handleCloseAll}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 bg-white dark:bg-gray-900 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm transition-colors"
          >
            Tout fermer ({notifications.length})
          </button>
        </div>
      )}

      {notifications.map(notif => (
        <NotificationItem
          key={notif.id}
          notif={notif}
          onClose={handleClose}
        />
      ))}
    </div>
  )
}