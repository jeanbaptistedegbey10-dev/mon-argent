import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useFinanceStore = create(
  persist(
    (set, get) => ({
      transactions: [
        { id: 1, name: 'Salaire Mars', cat: 'Salaire', icon: '💼', type: 'income',  amount: 320000, date: '2025-03-25', account: 'Compte principal', note: '' },
        { id: 2, name: 'Courses Marché', cat: 'Alimentation', icon: '🛒', type: 'expense', amount: 24500, date: '2025-03-25', account: 'Espèces', note: '' },
        { id: 3, name: 'Abonnement Bus', cat: 'Transport', icon: '🚌', type: 'expense', amount: 12000, date: '2025-03-24', account: 'Compte principal', note: '' },
        { id: 4, name: 'Restaurant',     cat: 'Loisirs', icon: '🍽️', type: 'expense', amount: 18500, date: '2025-03-23', account: 'Carte crédit', note: '' },
        { id: 5, name: 'Loyer',          cat: 'Logement', icon: '🏠', type: 'expense', amount: 85000, date: '2025-03-22', account: 'Compte principal', note: '' },
        { id: 6, name: 'Freelance Web',  cat: 'Salaire', icon: '💻', type: 'income',  amount: 45000, date: '2025-03-20', account: 'Compte principal', note: '' },
      ],

      accounts: [
        { id: 1, name: 'Compte principal', type: 'Compte bancaire', icon: '🏦', balance: 287500, color: '#2563EB' },
        { id: 2, name: 'Espèces',          type: 'Liquide',         icon: '💵', balance: 42000,  color: '#10B981' },
        { id: 3, name: 'Carte crédit',     type: 'Carte de crédit', icon: '💳', balance: -15050, color: '#EF4444' },
      ],

      categories: [
        { id: 1, name: 'Alimentation', icon: '🛒', color: '#2563EB', bg: '#EFF6FF' },
        { id: 2, name: 'Transport',    icon: '🚗', color: '#10B981', bg: '#ECFDF5' },
        { id: 3, name: 'Logement',     icon: '🏠', color: '#F59E0B', bg: '#FFFBEB' },
        { id: 4, name: 'Loisirs',      icon: '🎭', color: '#EF4444', bg: '#FEF2F2' },
        { id: 5, name: 'Salaire',      icon: '💼', color: '#8B5CF6', bg: '#F5F3FF' },
        { id: 6, name: 'Santé',        icon: '💊', color: '#EC4899', bg: '#FDF2F8' },
      ],

      budgets: [
        { id: 1, name: 'Alimentation', icon: '🛒', color: '#2563EB', spent: 55500,  limit: 80000 },
        { id: 2, name: 'Transport',    icon: '🚗', color: '#10B981', spent: 34000,  limit: 30000 },
        { id: 3, name: 'Logement',     icon: '🏠', color: '#F59E0B', spent: 85000,  limit: 90000 },
        { id: 4, name: 'Loisirs',      icon: '🎭', color: '#EF4444', spent: 23000,  limit: 28000 },
        { id: 5, name: 'Santé',        icon: '💊', color: '#EC4899', spent: 8200,   limit: 20000 },
      ],

      // --- Actions Transactions ---
      addTransaction: (tx) => set((state) => ({
        transactions: [{ ...tx, id: Date.now() }, ...state.transactions]
      })),

      deleteTransaction: (id) => set((state) => ({
        transactions: state.transactions.filter(t => t.id !== id)
      })),

      updateTransaction: (id, updated) => set((state) => ({
        transactions: state.transactions.map(t => t.id === id ? { ...t, ...updated } : t)
      })),

      // --- Getters calculés ---
      getTotalIncome: () => {
        const { transactions } = get()
        return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
      },

      getTotalExpense: () => {
        const { transactions } = get()
        return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      },

      getTotalBalance: () => {
        const { accounts } = get()
        return accounts.reduce((sum, a) => sum + a.balance, 0)
      },

      // --- Actions Budgets ---
addBudget: (budget) => set((state) => ({
  budgets: [...state.budgets, { ...budget, id: Date.now() }]
})),

updateBudget: (id, updated) => set((state) => ({
  budgets: state.budgets.map(b => b.id === id ? { ...b, ...updated } : b)
})),

deleteBudget: (id) => set((state) => ({
  budgets: state.budgets.filter(b => b.id !== id)
})),

      // --- Actions Accounts ---
addAccount: (account) => set((state) => ({
  accounts: [...state.accounts, { ...account, id: Date.now() }]
})),

updateAccount: (id, updated) => set((state) => ({
  accounts: state.accounts.map(a => a.id === id ? { ...a, ...updated } : a)
})),

deleteAccount: (id) => set((state) => ({
  accounts: state.accounts.filter(a => a.id !== id)
})),

// --- Actions Categories ---
addCategory: (cat) => set((state) => ({
  categories: [...state.categories, { ...cat, id: Date.now() }]
})),

updateCategory: (id, updated) => set((state) => ({
  categories: state.categories.map(c => c.id === id ? { ...c, ...updated } : c)
})),

deleteCategory: (id) => set((state) => ({
  categories: state.categories.filter(c => c.id !== id)
})),


    }),
    { name: 'finance-storage' }
  )

  
)

export default useFinanceStore

