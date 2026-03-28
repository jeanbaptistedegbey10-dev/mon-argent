import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const useFinanceStore = create((set, get) => ({
  transactions: [],
  accounts:     [],
  categories:   [],
  budgets:      [],
  loading:      false,

  // ── INIT ─────────────────────────────────────────────────────
  init: async () => {
    set({ loading: true })

    // Nettoyer les notifications du mois précédent
    const now         = new Date()
    const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const dismissed   = JSON.parse(localStorage.getItem('dismissed-notifs') || '[]')
    const filtered    = dismissed.filter(id => id.includes(monthPrefix))
    localStorage.setItem('dismissed-notifs', JSON.stringify(filtered))

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return set({ loading: false })

    const [tx, acc, cat, bud] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      supabase.from('accounts').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('categories').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('budgets').select('*').eq('user_id', user.id).order('created_at'),
    ])

    // Première connexion : insérer données par défaut
    if (cat.data?.length === 0 && acc.data?.length === 0) {
      await get().seedDefaultData(user.id)
    }

    set({
      transactions: tx.data  || [],
      accounts:     acc.data || [],
      categories:   cat.data || [],
      budgets:      bud.data || [],
      loading:      false,
    })
  },

  // ── SEED données par défaut ───────────────────────────────────
  seedDefaultData: async (userId) => {
    const defaultCategories = [
      { user_id: userId, name: 'Alimentation', icon: '🛒', color: '#2563EB', bg: '#EFF6FF' },
      { user_id: userId, name: 'Transport',    icon: '🚗', color: '#10B981', bg: '#ECFDF5' },
      { user_id: userId, name: 'Logement',     icon: '🏠', color: '#F59E0B', bg: '#FFFBEB' },
      { user_id: userId, name: 'Loisirs',      icon: '🎭', color: '#EF4444', bg: '#FEF2F2' },
      { user_id: userId, name: 'Salaire',      icon: '💼', color: '#8B5CF6', bg: '#F5F3FF' },
      { user_id: userId, name: 'Santé',        icon: '💊', color: '#EC4899', bg: '#FDF2F8' },
    ]
    const defaultAccounts = [
      { user_id: userId, name: 'Compte principal', type: 'Compte bancaire', icon: '🏦', color: '#2563EB', balance: 0 },
      { user_id: userId, name: 'Espèces',           type: 'Liquide',         icon: '💵', color: '#10B981', balance: 0 },
    ]

    const { data: cats } = await supabase.from('categories').insert(defaultCategories).select()
    const { data: accs } = await supabase.from('accounts').insert(defaultAccounts).select()

    set({ categories: cats || [], accounts: accs || [] })
  },

  // ── TRANSACTIONS ──────────────────────────────────────────────
  addTransaction: async (tx) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('transactions')
      .insert({ ...tx, user_id: user.id })
      .select()
      .single()
    if (error) throw error

    set(state => ({
      transactions: [data, ...state.transactions]
    }))

    // Mettre à jour le solde du compte
    const account = get().accounts.find(a => a.name === tx.account)
    if (account) {
      const delta = tx.type === 'income' ? Number(tx.amount) : -Number(tx.amount)
      await get().updateAccountBalance(account.id, Number(account.balance) + delta)
    }
  },

  deleteTransaction: async (id) => {
    // Récupérer la transaction avant suppression pour inverser le solde
    const tx = get().transactions.find(t => t.id === id)

    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error

    set(state => ({
      transactions: state.transactions.filter(t => t.id !== id)
    }))

    // Inverser l'effet sur le solde du compte
    if (tx) {
      const account = get().accounts.find(a => a.name === tx.account)
      if (account) {
        const delta = tx.type === 'income' ? -Number(tx.amount) : Number(tx.amount)
        await get().updateAccountBalance(account.id, Number(account.balance) + delta)
      }
    }
  },

  updateTransaction: async (id, updated) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updated)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    set(state => ({
      transactions: state.transactions.map(t => t.id === id ? data : t)
    }))
  },

  // ── ACCOUNTS ──────────────────────────────────────────────────
  addAccount: async (account) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('accounts')
      .insert({ ...account, user_id: user.id })
      .select()
      .single()
    if (error) throw error

    set(state => ({
      accounts: [...state.accounts, data]
    }))
  },

  updateAccount: async (id, updated) => {
    const { data, error } = await supabase
      .from('accounts')
      .update(updated)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    set(state => ({
      accounts: state.accounts.map(a => a.id === id ? data : a)
    }))
  },

  updateAccountBalance: async (id, newBalance) => {
    const { data, error } = await supabase
      .from('accounts')
      .update({ balance: newBalance })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    set(state => ({
      accounts: state.accounts.map(a => a.id === id ? data : a)
    }))
  },

  deleteAccount: async (id) => {
    const { error } = await supabase.from('accounts').delete().eq('id', id)
    if (error) throw error

    set(state => ({
      accounts: state.accounts.filter(a => a.id !== id)
    }))
  },

  // ── CATEGORIES ────────────────────────────────────────────────
  addCategory: async (cat) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('categories')
      .insert({ ...cat, user_id: user.id })
      .select()
      .single()
    if (error) throw error

    set(state => ({
      categories: [...state.categories, data]
    }))
  },

  updateCategory: async (id, updated) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updated)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    set(state => ({
      categories: state.categories.map(c => c.id === id ? data : c)
    }))
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error

    set(state => ({
      categories: state.categories.filter(c => c.id !== id)
    }))
  },

  // ── BUDGETS ───────────────────────────────────────────────────
  addBudget: async (budget) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('budgets')
      .insert({ ...budget, user_id: user.id })
      .select()
      .single()
    if (error) throw error

    set(state => ({
      budgets: [...state.budgets, data]
    }))
  },

  updateBudget: async (id, updated) => {
    const { data, error } = await supabase
      .from('budgets')
      .update(updated)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error

    set(state => ({
      budgets: state.budgets.map(b => b.id === id ? data : b)
    }))
  },

  deleteBudget: async (id) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error

    set(state => ({
      budgets: state.budgets.filter(b => b.id !== id)
    }))
  },

  // ── GETTERS ───────────────────────────────────────────────────
  getTotalIncome: () => {
    const { transactions } = get()
    const monthPrefix = new Date().toISOString().slice(0, 7)
    return transactions
      .filter(t => t.type === 'income' && t.date.startsWith(monthPrefix))
      .reduce((s, t) => s + Number(t.amount), 0)
  },

  getTotalExpense: () => {
    const { transactions } = get()
    const monthPrefix = new Date().toISOString().slice(0, 7)
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthPrefix))
      .reduce((s, t) => s + Number(t.amount), 0)
  },

  getTotalBalance: () => {
    const { accounts } = get()
    return accounts.reduce((s, a) => s + Number(a.balance), 0)
  },

  getSpentByCategory: () => {
    const { transactions } = get()
    const monthPrefix = new Date().toISOString().slice(0, 7)
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthPrefix))
      .reduce((acc, t) => {
        acc[t.cat] = (acc[t.cat] || 0) + Number(t.amount)
        return acc
      }, {})
  },
}))

export default useFinanceStore