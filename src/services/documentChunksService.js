import { supabase } from '../lib/supabaseClient'

/**
 * Fetch document chunks from Supabase for a specific file
 * @param {string} fileName - The file name to search for in metadata
 * @returns {Promise<Array>} Array of document chunks
 */
export const fetchDocumentChunks = async (fileName) => {
  try {
    console.log('Fetching chunks for file:', fileName)

    const { data, error } = await supabase
      .from('documents')
      .select('id, content, metadata')
      .ilike('metadata->>file_name', fileName)
      .order('metadata->>chunk_index', { ascending: true })

    if (error) throw error

    console.log(`Found ${data?.length || 0} chunks for ${fileName}`)
    return data || []
  } catch (error) {
    console.error('Error fetching document chunks:', error)
    throw new Error(`Fehler beim Laden der Dokument-Chunks: ${error.message}`)
  }
}

/**
 * Intelligently select chunks for test question generation
 * Max 20 chunks to avoid token limits
 * @param {Array} chunks - All chunks from the document
 * @param {number} maxChunks - Maximum number of chunks to select
 * @returns {Array} Selected chunks
 */
export const selectRepresentativeChunks = (chunks, maxChunks = 20) => {
  if (chunks.length <= maxChunks) {
    return chunks
  }

  // Strategy: Take chunks evenly distributed throughout the document
  const interval = Math.floor(chunks.length / maxChunks)
  const selectedChunks = []

  for (let i = 0; i < maxChunks; i++) {
    const index = i * interval
    if (index < chunks.length) {
      selectedChunks.push(chunks[index])
    }
  }

  console.log(`Selected ${selectedChunks.length} of ${chunks.length} chunks`)
  return selectedChunks
}

/**
 * Get chunks and generate test questions for a document
 * @param {string} fileName - The file name
 * @returns {Promise<Object>} Object with chunks and metadata
 */
export const getChunksForTestGeneration = async (fileName) => {
  try {
    // Fetch all chunks
    const allChunks = await fetchDocumentChunks(fileName)

    if (allChunks.length === 0) {
      throw new Error('Keine Chunks für dieses Dokument gefunden. Das Dokument muss zuerst verarbeitet werden.')
    }

    // Select representative chunks
    const selectedChunks = selectRepresentativeChunks(allChunks)

    return {
      totalChunks: allChunks.length,
      selectedChunks,
      fileName
    }
  } catch (error) {
    console.error('Error getting chunks for test generation:', error)
    throw error
  }
}
