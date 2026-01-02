import { useEffect } from 'react'
import { BiX, BiDownload } from 'react-icons/bi'
import PDFDocument from './PDFDocument'
import { downloadPDF } from '../../utils/pdfHelpers'
import { ERROR_MESSAGES } from '../../utils/constants'

const PDFModal = ({ pdf, onClose }) => {
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'

    // Close on ESC key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.body.style.overflow = 'auto'
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleDownload = async () => {
    try {
      await downloadPDF(pdf.url, pdf.name)
    } catch (error) {
      alert(ERROR_MESSAGES.DOWNLOAD_FAILED)
    }
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold truncate mr-4">{pdf.name}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-700 rounded flex items-center"
            >
              <BiDownload size={20} className="mr-2" />
              Download
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded"
            >
              <BiX size={24} />
            </button>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-auto p-4 bg-gray-100">
          <PDFDocument url={pdf.url} />
        </div>
      </div>
    </div>
  )
}

export default PDFModal
