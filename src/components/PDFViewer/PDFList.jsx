import { useState, useEffect } from 'react'
import { usePDFs } from '../../hooks/usePDFs'
import PDFCard from './PDFCard'
import LoadingSpinner from '../Common/LoadingSpinner'
import ErrorMessage from '../Common/ErrorMessage'
import TestQuestionsModal from './TestQuestionsModal'
import { downloadPDF } from '../../utils/pdfHelpers'
import { ERROR_MESSAGES } from '../../utils/constants'
import { BiRefresh, BiChevronLeft, BiChevronRight, BiInfoCircle } from 'react-icons/bi'
import { getChunksForTestGeneration } from '../../services/documentChunksService'
import { generateTestQuestions } from '../../services/openaiService'
import { checkRateLimit, recordGeneration, formatTimeUntilReset } from '../../services/rateLimitService'
import { useAuth } from '../../hooks/useAuth'

const PDFList = () => {
  const { pdfs, loading, error, refetch } = usePDFs()
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Test Questions Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [testQuestions, setTestQuestions] = useState([])
  const [currentFileName, setCurrentFileName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Rate Limit State
  const [rateLimit, setRateLimit] = useState({ remaining: 5, limit: 5 })

  const handleOpen = (pdf) => {
    // Open PDF in new tab using the original URL (to avoid proxy issues)
    const urlToOpen = pdf.originalUrl || pdf.url
    window.open(urlToOpen, '_blank', 'noopener,noreferrer')
  }

  const handleDownload = async (pdf) => {
    try {
      // Use original URL for download to avoid proxy issues
      const urlToDownload = pdf.originalUrl || pdf.url
      await downloadPDF(urlToDownload, pdf.name)
    } catch (error) {
      alert(ERROR_MESSAGES.DOWNLOAD_FAILED)
    }
  }

  // Check rate limit on component mount
  useEffect(() => {
    if (user?.id) {
      updateRateLimit()
    }
  }, [user])

  const updateRateLimit = async () => {
    if (!user?.id) return

    const limit = await checkRateLimit(user.id)
    setRateLimit(limit)
  }

  const handleGenerateQuestions = async (pdf) => {
    try {
      // Check rate limit first
      const limit = await checkRateLimit(user.id)
      setRateLimit(limit)

      if (!limit.allowed) {
        const resetTimeStr = limit.resetTime ? formatTimeUntilReset(limit.resetTime) : 'später'
        alert(
          `Du hast dein Limit erreicht!\n\n` +
          `Du kannst ${limit.limit} Testfragen pro Stunde generieren.\n` +
          `Versuche es in ${resetTimeStr} erneut.`
        )
        return
      }

      setCurrentFileName(pdf.name)
      setIsModalOpen(true)
      setIsGenerating(true)
      setTestQuestions([])

      console.log('Generating test questions for:', pdf.name)
      console.log(`Rate limit: ${limit.remaining} remaining`)

      // Fetch and select chunks
      const { selectedChunks, totalChunks } = await getChunksForTestGeneration(pdf.name)

      console.log(`Using ${selectedChunks.length} of ${totalChunks} chunks`)

      // Generate test questions
      const questions = await generateTestQuestions(selectedChunks, pdf.name, 5)

      console.log('Generated questions:', questions)

      if (!questions || questions.length === 0) {
        throw new Error('Keine Testfragen wurden generiert')
      }

      // Record the generation
      await recordGeneration(user.id, pdf.name)

      // Update rate limit display
      await updateRateLimit()

      setTestQuestions(questions)
      setIsGenerating(false)
    } catch (error) {
      console.error('Error generating test questions:', error)
      console.error('Error stack:', error.stack)
      alert(`Fehler beim Generieren der Testfragen: ${error.message}`)
      setIsGenerating(false)
      // Don't close modal, let user see the error
    }
  }

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  if (loading) {
    return <LoadingSpinner text="PDFs werden geladen..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refetch} />
  }

  if (pdfs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
          <p className="text-gray-400 mb-6">Keine PDFs gefunden</p>
          <button onClick={refetch} className="btn-primary flex items-center mx-auto">
            <BiRefresh className="mr-2" />
            Aktualisieren
          </button>
        </div>
      </div>
    )
  }

  // Pagination calculations
  const totalPages = Math.ceil(pdfs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPDFs = pdfs.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  return (
    <>
      {/* Header with controls */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-800 border border-gray-700 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
          <p className="text-gray-300 font-medium">
            <span className="text-emerald-400 font-semibold">{pdfs.length}</span> {pdfs.length === 1 ? 'PDF' : 'PDFs'} verfügbar
          </p>
          <div className="flex items-center gap-2">
            <label htmlFor="itemsPerPage" className="text-sm text-gray-400">
              Pro Seite:
            </label>
            <select
              id="itemsPerPage"
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm text-gray-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>

          {/* Rate Limit Info */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-900/20 border border-purple-600/30 rounded-lg">
            <BiInfoCircle className="text-purple-400" size={16} />
            <span className="text-sm text-gray-300">
              Testfragen: <span className={`font-semibold ${rateLimit.remaining > 0 ? 'text-purple-400' : 'text-red-400'}`}>
                {rateLimit.remaining}/{rateLimit.limit}
              </span> übrig
            </span>
          </div>
        </div>

        <button onClick={refetch} className="btn-secondary flex items-center">
          <BiRefresh className="mr-2" />
          Aktualisieren
        </button>
      </div>

      {/* PDF List (vertical stack) */}
      <div className="space-y-4">
        {currentPDFs.map((pdf) => (
          <PDFCard
            key={pdf.path || pdf.name}
            pdf={pdf}
            onOpen={handleOpen}
            onDownload={handleDownload}
            onGenerateQuestions={handleGenerateQuestions}
            rateLimit={rateLimit}
          />
        ))}
      </div>

      {/* Test Questions Modal */}
      <TestQuestionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questions={testQuestions}
        fileName={currentFileName}
        isLoading={isGenerating}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="mt-8 bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            Seite {currentPage} von {totalPages} · Zeige {startIndex + 1}-{Math.min(endIndex, pdfs.length)} von {pdfs.length}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <BiChevronLeft size={20} />
            </button>

            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? 'wurm-gradient text-white shadow-lg shadow-emerald-900/50'
                        : 'bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <BiChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default PDFList
