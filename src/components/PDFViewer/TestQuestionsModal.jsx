import { useState } from 'react'
import { BiX, BiChevronDown, BiChevronUp, BiLoader } from 'react-icons/bi'
import MarkdownRenderer from '../Common/MarkdownRenderer'

const TestQuestionsModal = ({ isOpen, onClose, questions, fileName, isLoading }) => {
  const [expandedAnswers, setExpandedAnswers] = useState({})

  if (!isOpen) return null

  const toggleAnswer = (index) => {
    setExpandedAnswers(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'leicht':
        return 'bg-emerald-600/20 text-emerald-400 border-emerald-600/30'
      case 'mittel':
        return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30'
      case 'schwer':
        return 'bg-red-600/20 text-red-400 border-red-600/30'
      default:
        return 'bg-gray-600/20 text-gray-400 border-gray-600/30'
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice'
      case 'true_false':
        return 'Wahr/Falsch'
      case 'open':
        return 'Offene Frage'
      default:
        return type
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-gray-800 border border-gray-700 rounded-xl shadow-2xl shadow-emerald-900/20 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
          <div>
            <h2 className="text-2xl font-bold wurm-gradient-text">Testfragen</h2>
            <p className="text-sm text-gray-400 mt-1">{fileName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-gray-200"
            aria-label="Schließen"
          >
            <BiX size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <BiLoader className="animate-spin text-emerald-500 mb-4" size={48} />
              <p className="text-gray-400 text-lg">Testfragen werden generiert...</p>
              <p className="text-gray-500 text-sm mt-2">Dies kann einen Moment dauern</p>
            </div>
          ) : questions && questions.length > 0 ? (
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-emerald-600/50 transition-all"
                >
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-emerald-400 font-bold text-lg">
                          Frage {index + 1}
                        </span>
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded border ${getDifficultyColor(q.difficulty)}`}>
                          {q.difficulty}
                        </span>
                        <span className="px-2.5 py-1 bg-gray-700/50 text-gray-300 text-xs font-semibold rounded border border-gray-600">
                          {getTypeLabel(q.type)}
                        </span>
                      </div>
                      <div className="text-gray-100 text-lg font-medium">
                        <MarkdownRenderer>{q.question}</MarkdownRenderer>
                      </div>
                    </div>
                  </div>

                  {/* Answer Section */}
                  <div className="mt-4">
                    <button
                      onClick={() => toggleAnswer(index)}
                      className="flex items-center justify-between w-full p-3 bg-gray-800 hover:bg-gray-750 rounded-lg transition-colors border border-gray-700 hover:border-emerald-600/50"
                    >
                      <span className="font-semibold text-gray-200">
                        Musterantwort anzeigen
                      </span>
                      {expandedAnswers[index] ? (
                        <BiChevronUp size={20} className="text-emerald-400" />
                      ) : (
                        <BiChevronDown size={20} className="text-gray-400" />
                      )}
                    </button>

                    {expandedAnswers[index] && (
                      <div className="mt-3 p-4 bg-emerald-900/10 border border-emerald-600/30 rounded-lg">
                        <div className="mb-3">
                          <h4 className="text-emerald-400 font-semibold mb-2">Antwort:</h4>
                          <div className="text-gray-200">
                            <MarkdownRenderer>{q.answer}</MarkdownRenderer>
                          </div>
                        </div>
                        {q.explanation && (
                          <div>
                            <h4 className="text-emerald-400 font-semibold mb-2">Erklärung:</h4>
                            <div className="text-gray-300 text-sm">
                              <MarkdownRenderer>{q.explanation}</MarkdownRenderer>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 max-w-md mx-auto">
                <p className="text-gray-400">Keine Testfragen vorhanden</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isLoading && questions && questions.length > 0 && (
          <div className="border-t border-gray-700 p-4 bg-gray-900">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{questions.length} Testfrage{questions.length !== 1 ? 'n' : ''} generiert</span>
              <button
                onClick={onClose}
                className="btn-secondary"
              >
                Schließen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestQuestionsModal
