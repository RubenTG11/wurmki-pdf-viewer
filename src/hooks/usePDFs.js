import { useState, useEffect } from 'react'
import { supabase, BUCKET_NAME } from '../lib/supabaseClient'
import { ERROR_MESSAGES } from '../utils/constants'

export const usePDFs = () => {
  const [pdfs, setPdfs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPDFs = async () => {
    try {
      setLoading(true)
      setError(null)

      // First, try to list all files recursively
      const { data, error: fetchError } = await supabase
        .storage
        .from(BUCKET_NAME)
        .list('', {
          limit: 1000,
          offset: 0,
          sortBy: { column: 'name', order: 'asc' },
          search: ''
        })

      if (fetchError) {
        console.error('Bucket fetch error:', fetchError)
        throw fetchError
      }

      // Check if we have folders
      const folders = data.filter(item => item.id === null)

      let allPdfFiles = []

      // Get PDFs from root
      const rootPdfs = data.filter(file =>
        file.id !== null && file.name.toLowerCase().endsWith('.pdf')
      )
      allPdfFiles = [...rootPdfs]

      // If there are folders, search in them too
      for (const folder of folders) {
        const { data: folderData, error: folderError } = await supabase
          .storage
          .from(BUCKET_NAME)
          .list(folder.name, {
            limit: 1000,
            sortBy: { column: 'name', order: 'asc' }
          })

        if (!folderError && folderData) {
          const folderPdfs = folderData.filter(file =>
            file.name.toLowerCase().endsWith('.pdf')
          )

          // Add folder path to file names
          const pdfsWithPath = folderPdfs.map(file => ({
            ...file,
            name: file.name,
            path: `${folder.name}/${file.name}`
          }))
          allPdfFiles = [...allPdfFiles, ...pdfsWithPath]
        }
      }

      // Generate public URLs for each PDF
      const pdfsWithUrls = allPdfFiles.map(file => {
        const publicUrl = supabase.storage.from(BUCKET_NAME).getPublicUrl(file.path || file.name).data.publicUrl

        return {
          ...file,
          url: publicUrl,
          originalUrl: publicUrl
        }
      })

      setPdfs(pdfsWithUrls)
    } catch (err) {
      console.error('Error fetching PDFs:', err)
      setError(err.message || ERROR_MESSAGES.FETCH_PDFS_FAILED)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPDFs()
  }, [])

  return { pdfs, loading, error, refetch: fetchPDFs }
}
