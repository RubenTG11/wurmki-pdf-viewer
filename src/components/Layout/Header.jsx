import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { BiLogOut, BiUser, BiCog } from 'react-icons/bi'
import { ROUTES } from '../../utils/constants'

const Header = () => {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    console.log('🔓 Logout button clicked')
    const { error } = await signOut()

    if (error) {
      console.error('❌ Logout failed:', error)
      alert('Logout fehlgeschlagen. Bitte versuche es erneut.')
      return
    }

    console.log('✅ Logout successful, navigating to login...')
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <header className="bg-gray-800 border-b border-gray-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-4">
            <img
              src="/img/logo_bright.png"
              alt="Wurm-KI Logo"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold wurm-gradient-text">Wurm-KI</h1>
              <p className="text-xs text-gray-400">Wissensdatenbank</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-300 bg-gray-700/50 px-4 py-2 rounded-lg border border-gray-600">
              <BiUser className="mr-2 text-emerald-400" />
              <span className="text-sm">{user?.email}</span>
              {isAdmin && (
                <span className="ml-2 px-2 py-0.5 bg-emerald-600/20 text-emerald-400 text-xs font-semibold rounded border border-emerald-600/30">
                  Admin
                </span>
              )}
            </div>

            {/* Admin Dashboard Link */}
            {isAdmin && (
              <Link
                to={ROUTES.ADMIN_DASHBOARD}
                className={`flex items-center px-4 py-2 rounded-lg transition-all font-semibold ${
                  location.pathname === ROUTES.ADMIN_DASHBOARD
                    ? 'wurm-gradient text-white shadow-lg shadow-emerald-900/50'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600'
                }`}
              >
                <BiCog className="mr-2" />
                Admin-Panel
              </Link>
            )}

            {/* Dashboard Link (wenn auf Admin-Page) */}
            {isAdmin && location.pathname === ROUTES.ADMIN_DASHBOARD && (
              <Link
                to={ROUTES.DASHBOARD}
                className="flex items-center btn-secondary"
              >
                Zurück zu PDFs
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="flex items-center btn-secondary"
            >
              <BiLogOut className="mr-2" />
              Abmelden
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
