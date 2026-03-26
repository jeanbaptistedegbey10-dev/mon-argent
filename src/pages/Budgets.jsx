import { useState } from 'react'
import { Plus, X, Check, Pencil, Trash2, AlertTriangle, TrendingUp } from 'lucide-react'
import useFinanceStore from '../store/useFinanceStore'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

// ── Modal ─────────────────────────────────────────────────────
function BudgetModal({ onClose, existing }) {
  const { categories } = useFinanceStore()

  const [form, setForm] = useState({
    name:  existing?.name  || '',
    limit: existing?.limit || '',
    icon:  existing?.icon  || '💰',
    color: existing?.color || '#2563EB',
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const handleCatSelect = (cat) => {
    setForm({ ...form, name: cat.name, icon: cat.icon, color: cat.color })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Choisissez une catégorie.')
    if (!form.limit || Number(form.limit) <= 0)
      return setError('Veuillez saisir un montant limite valide.')

    setSaving(true)
    try {
      const store = useFinanceStore.getState()
      if (existing) {
        await store.updateBudget(existing.id, {
          ...form, limit: Number(form.limit)
        })
      } else {
        await store.addBudget({
          ...form,
          limit: Number(form.limit),
          spent: 0,
        })
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            {existing ? 'Modifier le budget' : 'Nouveau budget'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Sélection catégorie */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
              Catégorie
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCatSelect(cat)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all
                    ${form.name === cat.name
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Montant limite */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Limite mensuelle (FCFA)
            </label>
            <input
              type="number"
              name="limit"
              value={form.limit}
              onChange={(e) => setForm({ ...form, limit: e.target.value })}
              placeholder="Ex: 80000"
              min="0"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Aperçu */}
          {form.name && form.limit && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {form.icon} {form.name}
                </span>
                <span className="text-gray-400">0 / {fmt(Number(form.limit))} FCFA</span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                <div className="h-full w-0 bg-blue-500 rounded-full" />
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
              ) : <Check size={15} />}
              {existing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Carte Budget ──────────────────────────────────────────────
function BudgetCard({ budget, spent, onEdit, onDelete }) {
  const pct     = budget.limit > 0 ? Math.min(100, Math.round((spent / budget.limit) * 100)) : 0
  const over    = spent > budget.limit
  const warning = pct >= 80 && !over
  const remain  = budget.limit - spent

  const barColor   = over ? '#EF4444' : warning ? '#F59E0B' : '#10B981'
  const statusBg   = over
    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
    : warning
      ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
            style={{ background: budget.color + '20' }}
          >
            {budget.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">{budget.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">Budget mensuel</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(budget.id)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Montants — spent calculé dynamiquement */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">{fmt(spent)}</span>
          <span className="text-sm text-gray-400 ml-1">/ {fmt(budget.limit)} FCFA</span>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusBg}`}>
          {pct}%
        </span>
      </div>

      {/* Barre */}
      <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>

      {/* Statut */}
      <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg ${statusBg}`}>
        {over ? (
          <><AlertTriangle size={12} /> Dépassé de {fmt(spent - budget.limit)} FCFA</>
        ) : warning ? (
          <><AlertTriangle size={12} /> Attention — {fmt(remain)} FCFA restants</>
        ) : (
          <><TrendingUp size={12} /> {fmt(remain)} FCFA restants ce mois</>
        )}
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function Budgets() {
  const { budgets, deleteBudget, getSpentByCategory } = useFinanceStore()
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  // Dépenses calculées depuis les vraies transactions
  const spentByCategory = getSpentByCategory()

  const handleEdit  = (b) => { setEditTarget(b); setShowModal(true) }
  const handleClose = () =>  { setShowModal(false); setEditTarget(null) }

  const totalBudget = budgets.reduce((s, b) => s + Number(b.limit), 0)
  const totalSpent  = budgets.reduce((s, b) => s + (spentByCategory[b.name] || 0), 0)
  const globalPct   = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h1>
          <p className="text-gray-400 text-sm mt-0.5">Suivez vos limites de dépenses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nouveau budget
        </button>
      </div>

      {/* Résumé global */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-gray-400 font-medium">Budget global du mois</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">
              {fmt(totalSpent)}
              <span className="text-sm text-gray-400 font-normal ml-1">
                / {fmt(totalBudget)} FCFA
              </span>
            </p>
          </div>
          <span className={`text-sm font-bold px-3 py-1 rounded-full
            ${globalPct >= 100 ? 'bg-red-50 text-red-600'
            : globalPct >= 80  ? 'bg-amber-50 text-amber-600'
            :                    'bg-emerald-50 text-emerald-600'}`}>
            {globalPct}% utilisé
          </span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${Math.min(100, globalPct)}%`,
              background: globalPct >= 100 ? '#EF4444' : globalPct >= 80 ? '#F59E0B' : '#10B981'
            }}
          />
        </div>
      </div>

      {/* Grille budgets */}
      {budgets.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-sm mb-3">Aucun budget configuré.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Créer votre premier budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map(b => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={spentByCategory[b.name] || 0}
              onEdit={handleEdit}
              onDelete={deleteBudget}
            />
          ))}
        </div>
      )}

      {showModal && <BudgetModal onClose={handleClose} existing={editTarget} />}
    </div>
  )
}