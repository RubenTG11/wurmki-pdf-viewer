import { BiDownload, BiShow, BiFile, BiTask } from 'react-icons/bi'
import { formatFileSize, formatDate } from '../../utils/pdfHelpers'

const PDFCard = ({ pdf, onOpen, onDownload, onGenerateQuestions, rateLimit }) => {
  const isLimitReached = rateLimit && rateLimit.remaining === 0

  return (
    <div className="flex items-center justify-between p-5 bg-gray-800 border border-gray-700 rounded-xl hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-900/20 transition-all duration-200 group">
      {/* Left: File Info */}
      <div className="flex items-center flex-1 min-w-0">
        {/* PDF Icon */}
        <div className="flex-shrink-0 mr-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <BiFile size={28} className="text-white" />
          </div>
        </div>

        {/* File Details */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-100 truncate mb-1.5 group-hover:text-emerald-400 transition-colors" title={pdf.name}>
            {pdf.name}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {pdf.metadata?.size && (
              <span className="flex items-center">
                <span className="text-gray-500 mr-1">Größe:</span>
                {formatFileSize(pdf.metadata.size)}
              </span>
            )}
            {pdf.created_at && (
              <span className="flex items-center">
                <span className="text-gray-500 mr-1">Erstellt:</span>
                {formatDate(pdf.created_at)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 ml-4">
        <button
          onClick={() => onOpen(pdf)}
          className="btn-primary flex items-center px-4 py-2"
          title="Im Browser öffnen"
        >
          <BiShow className="mr-2" size={18} />
          Ansehen
        </button>
        <button
          onClick={() => onDownload(pdf)}
          className="btn-secondary flex items-center px-4 py-2"
          title="PDF herunterladen"
        >
          <BiDownload className="mr-2" size={18} />
          Download
        </button>
        <button
          onClick={() => onGenerateQuestions(pdf)}
          disabled={isLimitReached}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors font-semibold shadow-lg ${
            isLimitReached
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed shadow-gray-900/50'
              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/50'
          }`}
          title={isLimitReached ? 'Limit erreicht - bitte warten' : 'Testfragen generieren'}
        >
          <BiTask className="mr-2" size={18} />
          Testfragen
        </button>
      </div>
    </div>
  )
}

export default PDFCard
