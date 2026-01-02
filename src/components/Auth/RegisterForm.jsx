import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES, ERROR_MESSAGES } from '../../utils/constants'

const RegisterForm = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validation
    if (!email) {
      setError(ERROR_MESSAGES.EMAIL_REQUIRED)
      return
    }
    if (!password) {
      setError(ERROR_MESSAGES.PASSWORD_REQUIRED)
      return
    }
    if (password.length < 6) {
      setError(ERROR_MESSAGES.PASSWORD_TOO_SHORT)
      return
    }
    if (password !== confirmPassword) {
      setError(ERROR_MESSAGES.PASSWORDS_DONT_MATCH)
      return
    }

    setIsLoading(true)

    try {
      const { error: signUpError } = await signUp(email, password)
      if (signUpError) {
        setError(signUpError.message || ERROR_MESSAGES.REGISTRATION_FAILED)
        return
      }

      setSuccess(true)
      // Don't auto-navigate - show info message instead
      setTimeout(() => {
        navigate(ROUTES.LOGIN)
      }, 3000)
    } catch (err) {
      setError(ERROR_MESSAGES.REGISTRATION_FAILED)
    } finally {
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
        <p className="text-xs text-gray-500 mt-1.5">Mindestens 6 Zeichen</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
          Passwort bestätigen
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

      {success && (
        <div className="bg-emerald-900/20 border border-emerald-800 rounded-lg p-4">
          <p className="text-emerald-400 font-semibold mb-2">✓ Registrierung erfolgreich!</p>
          <p className="text-emerald-300 text-sm">
            Dein Account wurde erstellt. Ein Administrator muss dich erst freischalten, bevor du dich anmelden kannst.
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary mt-6"
      >
        {isLoading ? 'Registrierung läuft...' : 'Registrieren'}
      </button>
    </form>
  )
}

export default RegisterForm
