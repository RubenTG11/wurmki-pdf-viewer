import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES, ERROR_MESSAGES } from '../../utils/constants'

const LoginForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!email) {
      setError(ERROR_MESSAGES.EMAIL_REQUIRED)
      return
    }
    if (!password) {
      setError(ERROR_MESSAGES.PASSWORD_REQUIRED)
      return
    }

    setIsLoading(true)
    console.log('🔐 Starting login attempt for:', email)

    try {
      console.log('📞 Calling signIn...')
      const { data, error: signInError } = await signIn(email, password)
      console.log('✅ SignIn response received:', { data, error: signInError })

      if (signInError) {
        console.error('❌ Login error:', signInError)
        console.error('Error message:', signInError.message)
        console.error('Error status:', signInError.status)

        // Spezifische Fehlermeldungen
        if (signInError.message?.includes('Invalid login credentials')) {
          setError('Ungültige E-Mail oder Passwort. Bitte überprüfe deine Eingaben.')
        } else if (signInError.message?.includes('Email not confirmed')) {
          setError('E-Mail wurde noch nicht bestätigt. Bitte überprüfe dein Postfach.')
        } else if (signInError.message?.includes('Invalid')) {
          setError('Ungültige E-Mail oder Passwort. Hast du dich bereits registriert?')
        } else {
          setError(signInError.message || ERROR_MESSAGES.INVALID_CREDENTIALS)
        }
        setIsLoading(false)
        return
      }

      if (!data?.user) {
        console.error('❌ No user data received')
        setError('Login fehlgeschlagen. Keine Benutzerdaten erhalten.')
        setIsLoading(false)
        return
      }

      // Erfolgreicher Login
      console.log('✅ Login successful, navigating to dashboard')
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      console.error('❌ Login exception:', err)
      console.error('Exception details:', err.message, err.stack)
      setError('Login fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      console.log('🏁 Login process completed, setting isLoading to false')
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          E-Mail
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="deine@email.de"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
          Passwort
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input-field"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary mt-6"
      >
        {isLoading ? 'Anmelden...' : 'Anmelden'}
      </button>
    </form>
  )
}

export default LoginForm
