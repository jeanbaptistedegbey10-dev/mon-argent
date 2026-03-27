import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Variables Supabase manquantes.')
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,      // Rafraîchit le token automatiquement
    persistSession: true,        // Garde la session dans localStorage
    detectSessionInUrl: true,    // Détecte le token dans l'URL (reset password)
  }
})