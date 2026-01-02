import { createClient } from '@supabase/supabase-js'

// Use runtime env vars (window.ENV) in production, fallback to import.meta.env in development
const getEnvVar = (key) => {
  // In development, prefer import.meta.env over window.ENV
  // In production (Docker), import.meta.env will be undefined, so window.ENV is used
  const devValue = import.meta.env[key]

  // If dev value exists and is not a placeholder, use it
  if (devValue && !devValue.includes('PLACEHOLDER')) {
    return devValue
  }

  // Otherwise try window.ENV (production runtime injection)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    const runtimeValue = window.ENV[key]
    // Don't use placeholder values
    if (!runtimeValue.includes('PLACEHOLDER')) {
      return runtimeValue
    }
  }

  // Final fallback
  return devValue
}

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL')
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY')

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file or Docker environment.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const BUCKET_NAME = getEnvVar('VITE_SUPABASE_BUCKET_NAME') || 'fulldocs'
