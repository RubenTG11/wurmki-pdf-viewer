import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'

const ProfileDebug = () => {
  const { user, userProfile, isAdmin, isApproved } = useAuth()
  const [directFetch, setDirectFetch] = useState(null)
  const [directError, setDirectError] = useState(null)

  useEffect(() => {
    if (user?.id) {
      // Direkter Fetch des Profils zum Testen
      const fetchDirect = async () => {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (error) {
            console.error('Direct fetch error:', error)
            setDirectError(error)
          } else {
            console.log('Direct fetch success:', data)
            setDirectFetch(data)
          }
        } catch (err) {
          console.error('Direct fetch exception:', err)
          setDirectError(err)
        }
      }

      fetchDirect()
    }
  }, [user?.id])

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-blue-500 rounded-lg p-4 max-w-md shadow-xl text-xs">
      <h3 className="font-bold text-lg mb-2 text-blue-600">Debug Info</h3>

      <div className="space-y-2">
        <div>
          <strong>User ID:</strong> {user?.id || 'Nicht eingeloggt'}
        </div>
        <div>
          <strong>Email:</strong> {user?.email || '-'}
        </div>

        <hr className="my-2" />

        <div>
          <strong>Context userProfile:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto max-h-32">
            {JSON.stringify(userProfile, null, 2) || 'null'}
          </pre>
        </div>

        <div>
          <strong>isAdmin:</strong> {isAdmin ? '✅ true' : '❌ false'}
        </div>
        <div>
          <strong>isApproved:</strong> {isApproved ? '✅ true' : '❌ false'}
        </div>

        <hr className="my-2" />

        <div>
          <strong>Direkter Fetch:</strong>
          <pre className="bg-gray-100 p-2 rounded mt-1 text-xs overflow-auto max-h-32">
            {directFetch ? JSON.stringify(directFetch, null, 2) : 'Lädt...'}
          </pre>
        </div>

        {directError && (
          <div>
            <strong className="text-red-600">Fetch Error:</strong>
            <pre className="bg-red-100 p-2 rounded mt-1 text-xs overflow-auto max-h-32">
              {JSON.stringify(directError, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileDebug
