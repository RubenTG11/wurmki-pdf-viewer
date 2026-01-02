import Header from '../components/Layout/Header'
import PDFList from '../components/PDFViewer/PDFList'

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">PDF-Bibliothek</h2>
          <p className="text-gray-400">
            Wissensdatenbank der Wurm-KI
          </p>
        </div>
        <PDFList />
      </main>
    </div>
  )
}

export default Dashboard
