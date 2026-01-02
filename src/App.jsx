import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/Layout/PrivateRoute'
import { AdminRoute } from './components/Layout/AdminRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import NotFound from './pages/NotFound'
import { ROUTES } from './utils/constants'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path={ROUTES.REGISTER} element={<Register />} />
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path={ROUTES.NOT_FOUND} element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
