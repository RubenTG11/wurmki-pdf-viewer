import { Link } from 'react-router-dom'
import LoginForm from '../components/Auth/LoginForm'
import { ROUTES } from '../utils/constants'

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold wurm-gradient-text mb-2">Wurm-KI</h1>
          <p className="text-gray-400 text-sm">Wissensdatenbank</p>
        </div>

        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-100">Willkommen zurück</h2>
            <p className="mt-2 text-sm text-gray-400">
              Melde dich an, um auf die PDF-Bibliothek zuzugreifen
            </p>
          </div>

          <LoginForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Noch kein Konto?{' '}
              <Link to={ROUTES.REGISTER} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Jetzt registrieren
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
