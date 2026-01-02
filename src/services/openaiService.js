import OpenAI from 'openai'

// Get env vars with fallback for runtime injection
const getEnvVar = (key) => {
  // First check window.ENV for runtime-injected values (production)
  if (typeof window !== 'undefined' && window.ENV && window.ENV[key]) {
    const runtimeValue = window.ENV[key]
    if (runtimeValue && !runtimeValue.includes('PLACEHOLDER')) {
      return runtimeValue
    }
  }

  // Fallback to import.meta.env for development
  const devValue = import.meta.env[key]
  if (devValue && !devValue.includes('PLACEHOLDER')) {
    return devValue
  }

  return undefined
}

// Lazy initialization - only create client when needed
let openaiClient = null

const getOpenAIClient = () => {
  if (!openaiClient) {
    const OPENAI_API_KEY = getEnvVar('VITE_OPENAI_API_KEY')
    const OPENAI_BASE_URL = getEnvVar('VITE_OPENAI_BASE_URL') || 'https://api.openai.com/v1'

    if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your-openai-api-key-here') {
      throw new Error('OpenAI API Key ist nicht konfiguriert. Bitte setze VITE_OPENAI_API_KEY in der .env Datei.')
    }

    openaiClient = new OpenAI({
      apiKey: OPENAI_API_KEY,
      baseURL: OPENAI_BASE_URL,
      dangerouslyAllowBrowser: true
    })
  }
  return openaiClient
}

/**
 * Generate test questions from document chunks
 * @param {Array} chunks - Array of document chunks with content
 * @param {string} fileName - Name of the PDF file
 * @param {number} numQuestions - Number of questions to generate
 * @returns {Promise<Array>} Array of test questions with answers
 */
export const generateTestQuestions = async (chunks, fileName, numQuestions = 5) => {
  const openai = getOpenAIClient()
  const OPENAI_MODEL = getEnvVar('VITE_OPENAI_MODEL') || 'gpt-4.1-nano'

  // Combine chunks into context
  const context = chunks.map(chunk => chunk.content).join('\n\n')

  const systemPrompt = `Du bist ein Experte für die Erstellung von Testfragen.
Erstelle ${numQuestions} fundierte Testfragen basierend auf dem bereitgestellten Kontext.

Anforderungen:
- Fragen sollen das Verständnis des Materials testen
- Verwende verschiedene Fragetypen (Multiple Choice, Wahr/Falsch, offene Fragen)
- Fragen sollen unterschiedliche Schwierigkeitsgrade haben
- Jede Frage muss eine ausführliche Musterantwort haben
- Antworte im JSON Format
- Alle Inhalte in MARKDOWN Format

WICHTIG - Mathematische Formeln:
- Verwende KEINE LaTeX-Notation (kein $, $$, \\, etc.)
- Schreibe mathematische Ausdrücke als TEXT aus:
  ✓ RICHTIG: "Die Energie gleich Masse mal Lichtgeschwindigkeit zum Quadrat"
  ✓ RICHTIG: "E gleich m mal c zum Quadrat"
  ✗ FALSCH: "$E = mc^2$" oder "E = mc²"
- Griechische Buchstaben: Schreibe den Namen aus (Alpha, Beta, Gamma, etc.)
- Operatoren ausschreiben: "mal", "plus", "minus", "geteilt durch", "hoch", "Wurzel aus"

WICHTIG - Bilder und Tabellen:
- Im Kontext findest du Bilder im Format: ![img-id](link)
- Im Kontext findest du Tabellen im Format: [table-id](link) (HTML-Tabellen)
- Du DARFST Bilder und Tabellen in Fragen/Antworten verwenden!
- Bilder: Verwende Markdown ![Beschreibung](link)
- Tabellen: Konvertiere HTML-Tabellen in Markdown-Tabellen
  Markdown Tabellen-Format:
  | Spalte 1 | Spalte 2 |
  |----------|----------|
  | Wert 1   | Wert 2   |

Weitere Markdown-Formatierung:
- **Fett** für wichtige Begriffe
- *Kursiv* für Betonung
- \`Code\` für technische Begriffe
- Listen mit - oder 1., 2., 3.
- > für Zitate

JSON Format:
{
  "questions": [
    {
      "question": "Die Frage hier (in Markdown)",
      "type": "multiple_choice" oder "true_false" oder "open",
      "difficulty": "leicht", "mittel" oder "schwer",
      "answer": "Die korrekte Antwort (in Markdown)",
      "explanation": "Ausführliche Erklärung (in Markdown)"
    }
  ]
}`

  const userPrompt = `Dokument: ${fileName}

Kontext:
${context}

Erstelle ${numQuestions} Testfragen basierend auf diesem Kontext.`

  try {
    console.log('Calling OpenAI API...')
    const response = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    console.log('OpenAI Response received')

    const content = response.choices[0].message.content
    console.log('Raw content:', content)

    let result
    try {
      result = JSON.parse(content)
    } catch (parseError) {
      console.error('JSON Parse error:', parseError)
      console.error('Content that failed to parse:', content)
      throw new Error('Die AI-Antwort konnte nicht verarbeitet werden. Bitte versuche es erneut.')
    }

    const questions = result.questions || []

    if (!Array.isArray(questions)) {
      console.error('Questions is not an array:', questions)
      throw new Error('Die AI-Antwort hat ein ungültiges Format.')
    }

    console.log(`Generated ${questions.length} questions`)

    // Validate question structure
    const validQuestions = questions.filter(q => {
      const isValid = q.question && q.answer && q.type && q.difficulty
      if (!isValid) {
        console.warn('Invalid question structure:', q)
      }
      return isValid
    })

    if (validQuestions.length === 0) {
      throw new Error('Keine gültigen Testfragen wurden generiert.')
    }

    return validQuestions
  } catch (error) {
    console.error('Error generating test questions:', error)
    if (error.message.includes('API')) {
      throw new Error(`OpenAI API Fehler: ${error.message}`)
    }
    throw error
  }
}
