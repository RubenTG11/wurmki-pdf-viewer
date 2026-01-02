import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { BiCheck, BiX, BiTrash, BiRefresh } from 'react-icons/bi'
import LoadingSpinner from '../Common/LoadingSpinner'
import ErrorMessage from '../Common/ErrorMessage'

const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('pending') // 'all', 'pending', 'approved'

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Fehler beim Laden der Benutzer')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleApprove = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_approved: true })
        .eq('id', userId)

      if (error) throw error

      await fetchUsers()
      alert('Benutzer wurde erfolgreich genehmigt!')
    } catch (err) {
      console.error('Error approving user:', err)
      alert('Fehler beim Genehmigen des Benutzers')
    }
  }

  const handleReject = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_approved: false })
        .eq('id', userId)

      if (error) throw error

      await fetchUsers()
      alert('Genehmigung wurde zurückgezogen')
    } catch (err) {
      console.error('Error rejecting user:', err)
      alert('Fehler beim Ablehnen des Benutzers')
    }
  }

  const handleDelete = async (userId, email) => {
    if (!confirm(`Möchtest du den Benutzer "${email}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

    try {
      // Delete from user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId)

      if (profileError) throw profileError

      // Note: Deleting from auth.users requires admin privileges
      // This will only delete the profile, not the auth user
      // You may need to delete the auth user via Supabase Dashboard or using service role key

      await fetchUsers()
      alert('Benutzerprofil wurde gelöscht')
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Fehler beim Löschen des Benutzers')
    }
  }

  const filteredUsers = users.filter(user => {
    if (filter === 'pending') return !user.is_approved && user.role !== 'admin'
    if (filter === 'approved') return user.is_approved
    return user.role !== 'admin' // Don't show admins in 'all'
  })

  if (loading) {
    return <LoadingSpinner text="Lade Benutzer..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchUsers} />
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="mb-6 flex items-center justify-between bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white border-2 border-yellow-500 shadow-lg shadow-yellow-900/50'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Wartend ({users.filter(u => !u.is_approved && u.role !== 'admin').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'approved'
                ? 'bg-emerald-600 text-white border-2 border-emerald-500 shadow-lg shadow-emerald-900/50'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Genehmigt ({users.filter(u => u.is_approved).length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === 'all'
                ? 'wurm-gradient text-white border-2 border-emerald-500 shadow-lg shadow-emerald-900/50'
                : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
            }`}
          >
            Alle ({users.filter(u => u.role !== 'admin').length})
          </button>
        </div>

        <button onClick={fetchUsers} className="btn-secondary flex items-center">
          <BiRefresh className="mr-2" />
          Aktualisieren
        </button>
      </div>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
            <p className="text-gray-400">Keine Benutzer gefunden</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-5 bg-gray-800 border border-gray-700 rounded-xl hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-900/20 transition-all"
            >
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-gray-100 text-lg">{user.email}</h3>
                  {user.is_approved ? (
                    <span className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 text-xs font-semibold rounded border border-emerald-600/30">
                      ✓ Genehmigt
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-yellow-600/20 text-yellow-400 text-xs font-semibold rounded border border-yellow-600/30">
                      ⏱ Wartend
                    </span>
                  )}
                  {user.role === 'admin' && (
                    <span className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 text-xs font-semibold rounded border border-emerald-600/30">
                      ★ Admin
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  Erstellt: {new Date(user.created_at).toLocaleString('de-DE')}
                </p>
              </div>

              {/* Actions */}
              {user.role !== 'admin' && (
                <div className="flex items-center gap-3">
                  {!user.is_approved ? (
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="btn-success flex items-center"
                      title="Genehmigen"
                    >
                      <BiCheck size={20} className="mr-2" />
                      Genehmigen
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(user.id)}
                      className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-semibold"
                      title="Genehmigung entziehen"
                    >
                      <BiX size={20} className="mr-2" />
                      Widerrufen
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(user.id, user.email)}
                    className="btn-danger flex items-center p-2.5"
                    title="Löschen"
                  >
                    <BiTrash size={18} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UserManagement
