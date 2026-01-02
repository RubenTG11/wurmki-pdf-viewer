const LoadingSpinner = ({ text = 'Lädt...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-700"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-emerald-500 absolute top-0 left-0"></div>
      </div>
      {text && <p className="mt-6 text-gray-400 font-medium">{text}</p>}
    </div>
  )
}

export default LoadingSpinner
