import { supabase } from '../lib/supabaseClient'

const RATE_LIMIT_HOURS = 1
const MAX_GENERATIONS_PER_HOUR = 5

/**
 * Check if user has exceeded the rate limit for test question generation
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} { allowed: boolean, remaining: number, resetTime: Date }
 */
export const checkRateLimit = async (userId) => {
  try {
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString()

    // Count generations in the last hour
    const { data, error, count } = await supabase
      .from('test_question_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('generated_at', oneHourAgo)

    if (error) {
      console.error('Error checking rate limit:', error)
      // On error, allow the request (fail open)
      return {
        allowed: true,
        remaining: MAX_GENERATIONS_PER_HOUR,
        resetTime: null,
        error: error.message
      }
    }

    const generationsCount = count || 0
    const remaining = Math.max(0, MAX_GENERATIONS_PER_HOUR - generationsCount)
    const allowed = generationsCount < MAX_GENERATIONS_PER_HOUR

    // Calculate reset time (1 hour from oldest generation)
    let resetTime = null
    if (!allowed && generationsCount > 0) {
      const { data: oldestGeneration } = await supabase
        .from('test_question_generations')
        .select('generated_at')
        .eq('user_id', userId)
        .gte('generated_at', oneHourAgo)
        .order('generated_at', { ascending: true })
        .limit(1)
        .single()

      if (oldestGeneration) {
        resetTime = new Date(new Date(oldestGeneration.generated_at).getTime() + RATE_LIMIT_HOURS * 60 * 60 * 1000)
      }
    }

    return {
      allowed,
      remaining,
      resetTime,
      current: generationsCount,
      limit: MAX_GENERATIONS_PER_HOUR
    }
  } catch (error) {
    console.error('Unexpected error in checkRateLimit:', error)
    // Fail open
    return {
      allowed: true,
      remaining: MAX_GENERATIONS_PER_HOUR,
      resetTime: null,
      error: error.message
    }
  }
}

/**
 * Record a test question generation
 * @param {string} userId - The user's ID
 * @param {string} pdfName - The PDF file name
 * @returns {Promise<boolean>} Success status
 */
export const recordGeneration = async (userId, pdfName) => {
  try {
    const { error } = await supabase
      .from('test_question_generations')
      .insert({
        user_id: userId,
        pdf_name: pdfName,
        generated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error recording generation:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error in recordGeneration:', error)
    return false
  }
}

/**
 * Get user's generation history for the last hour
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} List of generations
 */
export const getGenerationHistory = async (userId) => {
  try {
    const oneHourAgo = new Date(Date.now() - RATE_LIMIT_HOURS * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('test_question_generations')
      .select('*')
      .eq('user_id', userId)
      .gte('generated_at', oneHourAgo)
      .order('generated_at', { ascending: false })

    if (error) {
      console.error('Error fetching generation history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Unexpected error in getGenerationHistory:', error)
    return []
  }
}

/**
 * Format time until reset
 * @param {Date} resetTime - The reset time
 * @returns {string} Formatted time string
 */
export const formatTimeUntilReset = (resetTime) => {
  if (!resetTime) return ''

  const now = new Date()
  const diff = resetTime - now

  if (diff <= 0) return 'jetzt'

  const minutes = Math.ceil(diff / (60 * 1000))

  if (minutes < 60) {
    return `${minutes} Minute${minutes !== 1 ? 'n' : ''}`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} Stunde${hours !== 1 ? 'n' : ''}`
  }

  return `${hours}h ${remainingMinutes}min`
}
