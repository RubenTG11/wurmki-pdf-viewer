import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../Common/LoadingSpinner'
import { ROUTES } from '../../utils/constants'

export const AdminRoute = ({ children }) => {
  const { user, userProfile, loading, isAdmin } = useAuth()

  if (loading) {
    return <LoadingSpinner text="Überprüfe Berechtigungen..." />
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Zugriff verweigert</h1>
          <p className="text-gray-600 mb-6">Du hast keine Berechtigung für diese Seite.</p>
          <button
            onClick={() => window.location.href = ROUTES.DASHBOARD}
            className="btn-primary"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    )
  }

  return children
}
