import Header from '../components/Layout/Header'
import UserManagement from '../components/Admin/UserManagement'

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Admin-Dashboard</h1>
          <p className="text-gray-400">Verwalte Benutzer und Zugriff auf die Wurm-KI Wissensdatenbank</p>
        </div>

        <UserManagement />
      </main>
    </div>
  )
}

export default AdminDashboard
