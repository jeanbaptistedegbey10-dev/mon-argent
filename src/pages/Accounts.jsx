import { useState } from 'react'
import { Plus, X, Check, Pencil, Trash2, ArrowLeftRight } from 'lucide-react'
import useFinanceStore from '../store/useFinanceStore'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n)

const ACCOUNT_TYPES = ['Compte bancaire', 'Espèces', 'Carte de crédit', 'Épargne', 'Investissement']
const ACCOUNT_ICONS = ['🏦', '💵', '💳', '🏧', '📈', '💰', '🪙']
const ACCOUNT_COLORS = ['#2563EB', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4']

// ── Modal ─────────────────────────────────────────────────────
function AccountModal({ onClose, existing }) {
  const [form, setForm] = useState({
    name:    existing?.name    || '',
    type:    existing?.type    || 'Compte bancaire',
    icon:    existing?.icon    || '🏦',
    color:   existing?.color   || '#2563EB',
    balance: existing?.balance || '',
  })
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Veuillez saisir un nom de compte.')
    if (form.balance === '') return setError('Veuillez saisir un solde initial.')

    const store = useFinanceStore.getState()
    if (existing) {
      store.updateAccount(existing.id, { ...form, balance: Number(form.balance) })
    } else {
      store.addAccount({ ...form, balance: Number(form.balance) })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {existing ? 'Modifier le compte' : 'Nouveau compte'}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Nom */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom du compte</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Compte CCP"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type de compte</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-900"
            >
              {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          {/* Icône */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Icône</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setForm({ ...form, icon })}
                  className={`w-10 h-10 rounded-lg text-xl border-2 transition-all
                    ${form.icon === icon
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                    }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Couleur */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all
                    ${form.color === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>

          {/* Solde */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              {existing ? 'Solde actuel (FCFA)' : 'Solde initial (FCFA)'}
            </label>
            <input
              type="number"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
              placeholder="Ex: 150000"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

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
              className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check size={15} />
              {existing ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Carte compte ──────────────────────────────────────────────
function AccountCard({ account, onEdit, onDelete }) {
  const isNegative = account.balance < 0
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: account.color + '18' }}
          >
            {account.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{account.name}</p>
            <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 inline-block">
              {account.type}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(account)}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-2">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">Solde disponible</p>
        <p className={`text-2xl font-bold ${isNegative ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
          {isNegative ? '-' : ''}{fmt(Math.abs(account.balance))}
          <span className="text-sm font-normal text-gray-400 dark:text-gray-500 ml-1">FCFA</span>
        </p>
      </div>

      {/* Barre colorée en bas */}
      <div
        className="h-1 rounded-full mt-4"
        style={{ background: account.color + '40' }}
      >
        <div className="h-full w-2/3 rounded-full" style={{ background: account.color }} />
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function Accounts() {
  const { accounts, deleteAccount } = useFinanceStore()
  const [showModal, setShowModal]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  const handleEdit = (a) => { setEditTarget(a); setShowModal(true) }
  const handleClose = () => { setShowModal(false); setEditTarget(null) }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Mes comptes</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">{accounts.length} compte(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nouveau compte
        </button>
      </div>

      {/* Solde consolidé */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 mb-6 text-white">
        <div className="flex items-center gap-2 mb-1">
          <ArrowLeftRight size={16} className="opacity-70" />
          <p className="text-sm opacity-80">Solde consolidé</p>
        </div>
        <p className="text-3xl font-bold">{fmt(totalBalance)} FCFA</p>
        <p className="text-sm opacity-70 mt-1">{accounts.length} compte(s) au total</p>
      </div>

      {/* Grille */}
      {accounts.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">Aucun compte configuré.</p>
          <button
            onClick={() => setShowModal(true)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Créer votre premier compte
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(a => (
            <AccountCard
              key={a.id}
              account={a}
              onEdit={handleEdit}
              onDelete={deleteAccount}
            />
          ))}
        </div>
      )}

      {showModal && <AccountModal onClose={handleClose} existing={editTarget} />}
    </div>
  )
}