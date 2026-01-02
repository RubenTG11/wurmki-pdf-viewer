import { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database with timeout
  const fetchUserProfile = async (userId) => {
    if (!userId) {
      setUserProfile(null)
      return
    }

    console.log('👤 Fetching profile for user:', userId)

    try {
      // Add timeout to prevent hanging (3 seconds is genug)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      )

      const fetchPromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise])

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        setUserProfile(null)
        return
      }

      console.log('✅ Profile fetched successfully:', data)
      setUserProfile(data)
    } catch (error) {
      console.error('❌ Exception fetching user profile:', error)
      console.error('Exception details:', error.message)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)

      // Schnell loading auf false setzen für Session-Check
      setLoading(false)

      // Profil asynchron im Hintergrund laden (nicht blockierend)
      if (session?.user) {
        fetchUserProfile(session.user.id).catch(err => {
          console.error('⚠️ Background profile fetch failed:', err)
        })
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        // Profil asynchron laden (nicht blockierend)
        fetchUserProfile(session.user.id).catch(err => {
          console.error('⚠️ Profile fetch failed on auth change:', err)
        })
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signIn = async (email, password) => {
    console.log('🔑 AuthContext signIn called with:', email)
    try {
      console.log('📡 Calling supabase.auth.signInWithPassword...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('🔑 Supabase signInWithPassword response:', { data, error })

      if (error) {
        console.error('❌ Auth error:', error)
        console.error('❌ Error details:', JSON.stringify(error, null, 2))
        return { data, error }
      }

      if (data?.user) {
        console.log('✅ User authenticated successfully!')
        console.log('⏭️ SKIPPING profile fetch for debugging...')
        // TEMPORARILY skip profile fetch to test if auth works
        // try {
        //   await fetchUserProfile(data.user.id)
        // } catch (profileError) {
        //   console.error('⚠️ Profile fetch failed but login succeeded:', profileError)
        // }
      }

      console.log('✅ signIn completed successfully')
      return { data, error }
    } catch (err) {
      console.error('❌ Exception in signIn:', err)
      console.error('❌ Exception stack:', err.stack)
      return { data: null, error: err }
    }
  }

  const signOut = async () => {
    console.log('🚪 Signing out...')
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('❌ Sign out error:', error)
        return { error }
      }

      // Manuell State zurücksetzen (für sofortige UI-Aktualisierung)
      setUser(null)
      setSession(null)
      setUserProfile(null)

      console.log('✅ Sign out successful')
      return { error: null }
    } catch (err) {
      console.error('❌ Sign out exception:', err)
      return { error: err }
    }
  }

  const value = {
    user,
    session,
    userProfile,
    loading,
    isAdmin: userProfile?.role === 'admin',
    isApproved: userProfile?.is_approved === true,
    signUp,
    signIn,
    signOut,
    refreshProfile: () => fetchUserProfile(user?.id),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
