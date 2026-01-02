import { createClient } from '@supabase/supabase-js'

// Use runtime env vars (window.ENV) in production, fallback to import.meta.env in development
const getEnvVar = (key) => {
  // Try window.ENV first (production runtime injection)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    return window.ENV[key]
  }
  // Fallback to import.meta.env (development)
  return import.meta.env[key]
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file or Docker environment.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const BUCKET_NAME = getEnvVar('VITE_SUPABASE_BUCKET_NAME') || 'fulldocs'
