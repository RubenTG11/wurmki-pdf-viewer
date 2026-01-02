import { useState, useMemo } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { BiChevronLeft, BiChevronRight, BiZoomIn, BiZoomOut } from 'react-icons/bi'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { PDF_VIEWER_CONFIG } from '../../utils/constants'

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

const PDFDocument = ({ url }) => {
  const [numPages, setNumPages] = useState(null)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(PDF_VIEWER_CONFIG.DEFAULT_SCALE)
  const [loadError, setLoadError] = useState(null)

  // Memoize options to prevent unnecessary reloads
  const documentOptions = useMemo(() => ({
    cMapUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@3.11.174/standard_fonts/',
  }), [])

  console.log('🔗 Loading PDF in viewer:', url)

  function onDocumentLoadSuccess({ numPages }) {
    console.log('✅ PDF loaded successfully. Pages:', numPages)
    setNumPages(numPages)
    setPageNumber(1)
    setLoadError(null)
  }

  function onDocumentLoadError(error) {
    console.error('❌ PDF load error:', error)
    console.error('Failed URL:', url)
    setLoadError(error.message || 'Fehler beim Laden des PDFs')
  }

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages))
  }

  const zoomIn = () => {
    setScale(prev => Math.min(prev + PDF_VIEWER_CONFIG.SCALE_STEP, PDF_VIEWER_CONFIG.MAX_SCALE))
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev - PDF_VIEWER_CONFIG.SCALE_STEP, PDF_VIEWER_CONFIG.MIN_SCALE))
  }

  return (
    <div className="flex flex-col items-center">
      {/* Controls */}
      <div className="bg-gray-800 text-white p-4 rounded-lg mb-4 flex items-center space-x-4">
        {/* Page Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiChevronLeft size={24} />
          </button>
          <span className="text-sm">
            Seite {pageNumber} von {numPages || '...'}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiChevronRight size={24} />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-2 border-l border-gray-600 pl-4">
          <button
            onClick={zoomOut}
            disabled={scale <= PDF_VIEWER_CONFIG.MIN_SCALE}
            className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiZoomOut size={24} />
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= PDF_VIEWER_CONFIG.MAX_SCALE}
            className="p-2 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiZoomIn size={24} />
          </button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="border border-gray-300 shadow-lg">
        {loadError ? (
          <div className="p-8 text-red-600 text-center">
            <p className="font-semibold mb-2">Fehler beim Laden des PDFs</p>
            <p className="text-sm">{loadError}</p>
            <p className="text-xs mt-2 text-gray-500 break-all">{url}</p>
          </div>
        ) : (
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            options={documentOptions}
            loading={
              <div className="flex flex-col items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="mt-4 text-gray-600">PDF wird geladen...</p>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
          </Document>
        )}
      </div>
    </div>
  )
}

export default PDFDocument
