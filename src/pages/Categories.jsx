import { useState } from 'react'
import { Plus, X, Check, Pencil, Trash2 } from 'lucide-react'
import useFinanceStore from '../store/useFinanceStore'

const ICONS = ['🛒','🚗','🏠','🎭','💼','💊','✈️','🎓','💡','📱','🐾','🎮','🍽️','👗','🏋️','💈','🎁','🏖️']
const COLORS = ['#2563EB','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16','#F97316','#6366F1']

function CategoryModal({ onClose, existing }) {
  const [form, setForm] = useState({
    name:  existing?.name  || '',
    icon:  existing?.icon  || '💰',
    color: existing?.color || '#2563EB',
    bg:    existing?.bg    || '#EFF6FF',
  })
  const [error, setError] = useState('')

  const handleColorSelect = (color) => {
    // Générer automatiquement le bg depuis la couleur
    setForm({ ...form, color, bg: color + '18' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return setError('Veuillez saisir un nom.')

    const store = useFinanceStore.getState()
    if (existing) {
      store.updateCategory(existing.id, form)
    } else {
      store.addCategory(form)
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
            {existing ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
          </h2>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Aperçu */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: form.color + '20' }}
            >
              {form.icon}
            </div>
            <span className="font-medium text-gray-700">{form.name || 'Nom de la catégorie'}</span>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Alimentation"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Icônes */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Icône</label>
            <div className="flex gap-2 flex-wrap">
              {ICONS.map(icon => (
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

          {/* Couleurs */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Couleur</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all
                    ${form.color === color ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
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

export default function Categories() {
  const { categories, deleteCategory } = useFinanceStore()
  const [showModal, setShowModal]   = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  const handleEdit  = (c) => { setEditTarget(c); setShowModal(true) }
  const handleClose = () =>  { setShowModal(false); setEditTarget(null) }

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Catégories</h1>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">{categories.length} catégorie(s)</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 divide-y divide-gray-50">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-3">Aucune catégorie.</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              Créer une catégorie
            </button>
          </div>
        ) : (
          categories.map(cat => (
            <div
              key={cat.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: cat.color + '20' }}
              >
                {cat.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{cat.name}</p>
              </div>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(cat)}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="p-1.5 rounded-lg text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && <CategoryModal onClose={handleClose} existing={editTarget} />}
    </div>
  )
}