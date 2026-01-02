import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../Common/LoadingSpinner'
import { ROUTES } from '../../utils/constants'

export const PrivateRoute = ({ children }) => {
  const { user, userProfile, loading, isApproved, isAdmin } = useAuth()

  console.log('🔒 PrivateRoute check:', {
    user: user?.email,
    hasProfile: !!userProfile,
    profileData: userProfile,
    loading,
    isApproved,
    isAdmin
  })

  if (loading) {
    console.log('⏳ PrivateRoute: Still loading auth state')
    return <LoadingSpinner text="Authentifizierung wird geprüft..." />
  }

  if (!user) {
    console.log('❌ PrivateRoute: No user, redirecting to login')
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // Warte bis userProfile geladen ist (um flackern zu vermeiden)
  if (user && !userProfile) {
    console.log('⏳ PrivateRoute: User exists but profile still loading')
    return <LoadingSpinner text="Profil wird geladen..." />
  }

  // Admins können immer zugreifen
  if (isAdmin) {
    console.log('✅ PrivateRoute: Admin access granted')
    return children
  }

  // Normale Benutzer müssen genehmigt sein
  if (!isApproved) {
    console.log('⚠️ PrivateRoute: User not approved, showing waiting screen')

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="max-w-md w-full bg-gray-800 border border-gray-700 shadow-xl rounded-xl p-8 text-center">
          <div className="mb-6">
            <svg className="mx-auto h-20 w-20 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Warte auf Freigabe</h1>
          <p className="text-gray-300 mb-3">
            Dein Account wurde erstellt, muss aber erst von einem Administrator genehmigt werden.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            Du erhältst Zugriff auf die Wurm-KI Wissensdatenbank, sobald dein Account freigeschaltet wurde.
          </p>
          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-3 mb-6">
            <p className="text-gray-400 text-sm">
              Eingeloggt als: <strong className="text-emerald-400">{user.email}</strong>
            </p>
          </div>
          <button
            onClick={() => window.location.href = ROUTES.LOGIN}
            className="btn-secondary w-full"
          >
            Ausloggen
          </button>
        </div>
      </div>
    )
  }

  console.log('✅ PrivateRoute: Access granted (user is approved)')
  return children
}
