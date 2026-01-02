import { Link } from 'react-router-dom'
import RegisterForm from '../components/Auth/RegisterForm'
import { ROUTES } from '../utils/constants'

const Register = () => {
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
            <h2 className="text-2xl font-bold text-gray-100">Konto erstellen</h2>
            <p className="mt-2 text-sm text-gray-400">
              Registriere dich für den Zugriff auf die PDF-Bibliothek
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Bereits ein Konto?{' '}
              <Link to={ROUTES.LOGIN} className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                Jetzt anmelden
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
