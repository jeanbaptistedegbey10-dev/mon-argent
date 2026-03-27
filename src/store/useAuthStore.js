import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import useFinanceStore from './useFinanceStore'

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  init: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        set({ user: profile, isAuthenticated: true, loading: false })
        await useFinanceStore.getState().init()
      } else {
        set({ user: null, isAuthenticated: false, loading: false })
      }
    } catch (err) {
      console.error('Init error:', err)
      set({ user: null, isAuthenticated: false, loading: false })
    }

    // Écouter TOUS les changements de session
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event)

      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        set({ user: null, isAuthenticated: false, loading: false })
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            set({ user: profile, isAuthenticated: true, loading: false })
            await useFinanceStore.getState().init()
          } catch (err) {
            console.error('Profile fetch error:', err)
            set({ user: null, isAuthenticated: false, loading: false })
          }
        }
      }

      if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false, loading: false })
        useFinanceStore.setState({
          transactions: [],
          accounts: [],
          categories: [],
          budgets: [],
        })
      }
    })
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  register: async (name, email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    })
    if (error) throw error
    return data
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, isAuthenticated: false })
    useFinanceStore.setState({
      transactions: [],
      accounts: [],
      categories: [],
      budgets: [],
    })
  },

  updateProfile: async (updates) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    set({ user: data })
  }
}))

export default useAuthStore