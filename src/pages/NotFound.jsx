import { Link } from 'react-router-dom'
import { ROUTES } from '../utils/constants'
import { BiError } from 'react-icons/bi'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <BiError className="mx-auto text-primary-600 text-6xl mb-4" />
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Seite nicht gefunden</p>
        <Link to={ROUTES.DASHBOARD} className="btn-primary">
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}

export default NotFound
