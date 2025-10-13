'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadDate: Date
  caseNumber: string
  description?: string
  downloadUrl?: string
  isPublic: boolean
  tags: string[]
}

interface DocumentManagerProps {
  caseNumber: string
}

export default function DocumentManager({ caseNumber }: DocumentManagerProps) {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    if (caseNumber) {
      loadDocuments()
    }
  }, [caseNumber])

  const loadDocuments = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/documents?caseNumber=${caseNumber}`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('caseNumber', caseNumber)
      formData.append('userId', user?.id || '')

      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        await loadDocuments() // Reload documents
        setShowUploadModal(false)
      }
    } catch (error) {
      console.error('Error uploading document:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const downloadDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`, {
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = documents.find(d => d.id === documentId)?.name || 'document'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const deleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.id}`
        }
      })

      if (response.ok) {
        await loadDocuments() // Reload documents
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <div className="apple-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold">Document Management</h3>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
        >
          <i className="fa-solid fa-upload"></i>
          Upload Document
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <i className="fa-solid fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="pdf">PDF</option>
          <option value="doc">Word Document</option>
          <option value="image">Image</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Documents List */}
      {isLoading ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading documents...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-8">
          <i className="fa-solid fa-file-circle-plus text-gray-600 text-4xl mb-4"></i>
          <p className="text-gray-400">No documents found</p>
          <p className="text-gray-500 text-sm mt-2">Upload your first document to get started</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-file text-blue-400"></i>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-medium truncate">{doc.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{formatFileSize(doc.size)}</span>
                  <span>{doc.type.toUpperCase()}</span>
                  <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                  {doc.tags.length > 0 && (
                    <div className="flex gap-1">
                      {doc.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => downloadDocument(doc.id)}
                  className="text-blue-400 hover:text-blue-300 p-2 transition-colors"
                  title="Download"
                >
                  <i className="fa-solid fa-download"></i>
                </button>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="text-red-400 hover:text-red-300 p-2 transition-colors"
                  title="Delete"
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="apple-card p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-lg font-semibold">Upload Document</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Select File
                </label>
                <input
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file)
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white file:cursor-pointer"
                  disabled={isUploading}
                />
              </div>
              
              {isUploading && (
                <div className="text-center py-4">
                  <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-gray-400">Uploading...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
