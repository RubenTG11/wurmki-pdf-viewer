import { BiErrorCircle } from 'react-icons/bi'

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-900/20 border border-red-800 rounded-xl max-w-md mx-auto">
      <BiErrorCircle className="text-red-400 text-5xl mb-4" />
      <p className="text-red-300 text-center mb-6 font-medium">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-primary">
          Erneut versuchen
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
