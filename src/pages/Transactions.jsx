import { useState } from 'react'
import { Plus, Search, Trash2, Pencil, X, Check } from 'lucide-react'
import useFinanceStore from '../store/useFinanceStore'
import { TransactionsSkeleton } from '../components/ui/Skeleton'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

const formatDate = (d) =>
  new Date(d + 'T00:00:00').toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })

function TransactionModal({ onClose, existing }) {
  const { addTransaction, updateTransaction, categories, accounts } = useFinanceStore()

  const [form, setForm] = useState({
    type:    existing?.type    || 'expense',
    name:    existing?.name    || '',
    amount:  existing?.amount  || '',
    cat:     existing?.cat     || 'Alimentation',
    account: existing?.account || 'Compte principal',
    date:    existing?.date    || new Date().toISOString().split('T')[0],
    note:    existing?.note    || '',
  })
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())
      return setError('Veuillez saisir un libellé.')
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      return setError('Veuillez saisir un montant valide.')

    setSaving(true)
    try {
      const catObj  = categories.find(c => c.name === form.cat) || { icon: '💰' }
      const payload = { ...form, amount: Number(form.amount), icon: catObj.icon }
      if (existing) {
        await updateTransaction(existing.id, payload)
      } else {
        await addTransaction(payload)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const types = [
    { value: 'expense',  label: '↙ Dépense',  active: 'bg-red-50 text-red-600 border-red-200' },
    { value: 'income',   label: '↗ Revenu',   active: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { value: 'transfer', label: '⇄ Virement', active: 'bg-blue-50 text-blue-600 border-blue-200' },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
            {existing ? 'Modifier la transaction' : 'Nouvelle transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Type */}
          <div className="flex gap-2">
            {types.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, type: t.value })}
                className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-all
                  ${form.type === t.value
                    ? t.active
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Montant */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Montant (FCFA)
            </label>
            <input
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              min="0"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Libellé */}
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Libellé
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Courses au marché"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Catégorie + Compte */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Catégorie
              </label>
              <select
                value={form.cat}
                onChange={(e) => setForm({ ...form, cat: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Compte
              </label>
              <select
                value={form.account}
                onChange={(e) => setForm({ ...form, account: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.name}>{a.icon} {a.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date + Note */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                Note (optionnel)
              </label>
              <input
                type="text"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Remarque..."
                className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
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
              {existing ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TxRow({ tx, onEdit, onDelete }) {
  const isIncome = tx.type === 'income'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 group">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0
        ${isIncome ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
        {tx.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{tx.name}</p>
        <p className="text-xs text-gray-400">{tx.cat} · {tx.account}</p>
      </div>
      {tx.note && (
        <p className="text-xs text-gray-400 italic hidden md:block max-w-[120px] truncate">
          {tx.note}
        </p>
      )}
      <span className={`text-sm font-semibold flex-shrink-0
        ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
        {isIncome ? '+' : '-'}{fmt(tx.amount)} F
      </span>
      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit(tx)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(tx.id)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Transactions() {
  const { transactions, deleteTransaction, loading } = useFinanceStore()
  const [showModal,  setShowModal]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [search,     setSearch]     = useState('')
  const [filter,     setFilter]     = useState('all')

  if (loading) return <TransactionsSkeleton />

  const filters = [
    { key: 'all',          label: 'Tout' },
    { key: 'income',       label: '↗ Revenus' },
    { key: 'expense',      label: '↙ Dépenses' },
    { key: 'Alimentation', label: '🛒 Alimentation' },
    { key: 'Transport',    label: '🚗 Transport' },
    { key: 'Loisirs',      label: '🎭 Loisirs' },
    { key: 'Logement',     label: '🏠 Logement' },
  ]

  const filtered = transactions.filter(tx => {
    const matchSearch = tx.name.toLowerCase().includes(search.toLowerCase()) ||
                        tx.cat.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all'     ? true :
      filter === 'income'  ? tx.type === 'income' :
      filter === 'expense' ? tx.type === 'expense' :
                             tx.cat === filter
    return matchSearch && matchFilter
  })

  const grouped = filtered.reduce((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = []
    acc[tx.date].push(tx)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b) - new Date(a))

  const totalFiltered = filtered.reduce((sum, tx) =>
    tx.type === 'income' ? sum + Number(tx.amount) : sum - Number(tx.amount), 0)

  const handleEdit  = (tx) => { setEditTarget(tx); setShowModal(true) }
  const handleClose = ()   => { setShowModal(false); setEditTarget(null) }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-400 text-sm mt-0.5">{filtered.length} transaction(s) trouvée(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {/* Recherche */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher une transaction..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
        />
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all
              ${filter === f.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-blue-300'
              }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Solde filtré */}
      {filtered.length > 0 && (
        <div className={`mb-4 px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-between
          ${totalFiltered >= 0
            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
          }`}
        >
          <span>Solde sur la sélection</span>
          <span>{totalFiltered >= 0 ? '+' : ''}{fmt(totalFiltered)} FCFA</span>
        </div>
      )}

      {/* Liste */}
      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 text-sm">Aucune transaction trouvée.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-3 text-blue-600 text-sm font-medium hover:underline"
          >
            Ajouter une transaction
          </button>
        </div>
      ) : (
        sortedDates.map(date => (
          <div key={date} className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {formatDate(date)}
            </p>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 px-4">
              {grouped[date].map(tx => (
                <TxRow
                  key={tx.id}
                  tx={tx}
                  onEdit={handleEdit}
                  onDelete={deleteTransaction}
                />
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && <TransactionModal onClose={handleClose} existing={editTarget} />}
    </div>
  )
}