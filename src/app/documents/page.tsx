'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import EmptyState from '@/components/EmptyState'

interface Document {
  id: string
  name: string
  type: 'motion' | 'brief' | 'evidence' | 'correspondence' | 'other'
  caseNumber: string
  uploadedBy: string
  uploadDate: string
  size: string
  status: 'processing' | 'ready' | 'error'
  aiSummary?: string
  tags: string[]
  isPublic: boolean
}

export default function DocumentsPage() {
  const { user, userProfile, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'motion' | 'brief' | 'evidence' | 'correspondence' | 'other'>('all')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (user) {
      // Load documents based on user's saved cases
    const loadDocuments = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // For new users, show empty state
      if (!userProfile?.savedCases || userProfile.savedCases.length === 0) {
        setDocuments([])
        setIsLoading(false)
        return
      }
      
      // Generate documents from saved cases
      const userDocuments: Document[] = userProfile.savedCases.map((savedCase, index) => ({
        id: `doc-${savedCase.id}`,
        name: `${savedCase.caseType} - ${savedCase.caseNumber}.pdf`,
        type: 'motion' as const,
        caseNumber: savedCase.caseNumber,
        uploadedBy: user.name,
        uploadDate: savedCase.savedAt.split('T')[0],
        size: '1.2 MB',
        status: 'ready' as const,
        aiSummary: `Document for ${savedCase.caseTitle}`,
        tags: [savedCase.caseType.toLowerCase(), 'case-document'],
        isPublic: false
      }))
      
      setDocuments(userDocuments)
      setIsLoading(false)
    }

    loadDocuments()
    }
  }, [authLoading, user, router, userProfile])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadingFiles(files)
    setShowUploadModal(true)
  }

  const handleUpload = async () => {
    // Simulate file upload
    const newDocuments: Document[] = uploadingFiles.map((file, index) => ({
      id: `new-${index}`,
      name: file.name,
      type: 'other' as const,
      caseNumber: 'FL-2024-001234',
      uploadedBy: user?.name || 'Unknown',
      uploadDate: new Date().toISOString().split('T')[0],
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      status: 'processing' as const,
      tags: [],
      isPublic: false
    }))

    setDocuments(prev => [...newDocuments, ...prev])
    setShowUploadModal(false)
    setUploadingFiles([])
  }

  const handleDownload = (document: Document) => {
    // Create a demo PDF content
    const pdfContent = `
      Case Document: ${document.name}
      Case Number: ${document.caseNumber}
      Uploaded by: ${document.uploadedBy}
      Upload Date: ${document.uploadDate}
      
      This is a demo document for ${document.caseNumber}.
      In a real implementation, this would be the actual document content.
      
      AI Summary: ${document.aiSummary || 'No summary available'}
    `
    
    // Create a blob and download
    const blob = new Blob([pdfContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = document.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    // Show success message
    alert(`Downloaded: ${document.name}`)
  }

  const handleView = (document: Document) => {
    // Open document in a new tab with demo content
    const pdfContent = `
      <html>
        <head>
          <title>${document.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .document { background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .content { line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="document">
            <div class="header">
              <h1>${document.name}</h1>
              <p><strong>Case Number:</strong> ${document.caseNumber}</p>
              <p><strong>Uploaded by:</strong> ${document.uploadedBy}</p>
              <p><strong>Date:</strong> ${new Date(document.uploadDate).toLocaleDateString()}</p>
            </div>
            <div class="content">
              <h2>Document Content</h2>
              <p>This is a preview of the document for case ${document.caseNumber}.</p>
              <p>In a real implementation, this would show the actual document content.</p>
              
              ${document.aiSummary ? `
                <h3>AI Summary</h3>
                <p><em>${document.aiSummary}</em></p>
              ` : ''}
              
              <h3>Document Details</h3>
              <ul>
                <li><strong>Type:</strong> ${document.type}</li>
                <li><strong>Size:</strong> ${document.size}</li>
                <li><strong>Status:</strong> ${document.status}</li>
                <li><strong>Public:</strong> ${document.isPublic ? 'Yes' : 'No'}</li>
              </ul>
            </div>
          </div>
        </body>
      </html>
    `
    
    const newWindow = window.open()
    if (newWindow) {
      newWindow.document.write(pdfContent)
      newWindow.document.close()
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'motion':
        return 'fa-gavel'
      case 'brief':
        return 'fa-file-text'
      case 'evidence':
        return 'fa-folder-open'
      case 'correspondence':
        return 'fa-envelope'
      default:
        return 'fa-file'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-400'
      case 'processing':
        return 'text-yellow-400'
      case 'error':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || doc.type === filterType
    return matchesSearch && matchesType
  })

  if (!user) {
    return null
  }

  // Show empty state if no documents and no saved cases
  if (!isLoading && documents.length === 0 && (!userProfile?.savedCases || userProfile.savedCases.length === 0)) {
    return (
      <main 
        className="min-h-screen animated-aura"
        style={{
          background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
          padding: '20px 24px 40px 24px' // Reduced top padding
        }}
      >
        <div className="max-w-4xl mx-auto">
          <EmptyState type="documents" />
        </div>
      </main>
    )
  }

  return (
    <main 
      className="min-h-screen animated-aura"
      style={{
        background: 'linear-gradient(180deg,#0f0520 0%,#1a0b2e 100%)',
        padding: '20px 24px 40px 24px' // Reduced top padding
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">Document Management</h1>
            <p className="text-gray-300 text-lg">Organize and manage your case documents</p>
          </div>
          <div className="flex gap-4">
            <label className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200 cursor-pointer">
              <i className="fa-solid fa-upload mr-2"></i>
              Upload Documents
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </label>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="apple-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documents by name or case number..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <i className="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all" className="bg-gray-800 text-white">All Types</option>
              <option value="motion" className="bg-gray-800 text-white">Motions</option>
              <option value="brief" className="bg-gray-800 text-white">Briefs</option>
              <option value="evidence" className="bg-gray-800 text-white">Evidence</option>
              <option value="correspondence" className="bg-gray-800 text-white">Correspondence</option>
              <option value="other" className="bg-gray-800 text-white">Other</option>
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="apple-card p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded mb-4"></div>
                <div className="h-3 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((document) => (
              <div key={document.id} className="apple-card p-6 hover-lift transition-all duration-200">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`fa-solid ${getDocumentIcon(document.type)} text-white text-lg`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg mb-1 truncate">{document.name}</h3>
                    <p className="text-blue-300 text-sm mb-2">{document.caseNumber}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{document.size}</span>
                      <span className={getStatusColor(document.status)}>
                        {document.status === 'processing' ? (
                          <i className="fa-solid fa-spinner animate-spin mr-1"></i>
                        ) : null}
                        {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {document.aiSummary && (
                  <div className="mb-4">
                    <p className="text-gray-300 text-sm leading-relaxed">{document.aiSummary}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {document.tags.map((tag, index) => (
                    <span key={index} className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-400">
                    <p>Uploaded by {document.uploadedBy}</p>
                    <p>{new Date(document.uploadDate).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDownload(document)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      <i className="fa-solid fa-download mr-1"></i>
                      Download
                    </button>
                    <button 
                      onClick={() => handleView(document)}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    >
                      <i className="fa-solid fa-eye mr-1"></i>
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredDocuments.length === 0 && !isLoading && (
          <div className="apple-card p-12 text-center">
            <i className="fa-solid fa-folder-open text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-white text-xl font-semibold mb-2">No documents found</h3>
            <p className="text-gray-400">Try adjusting your search criteria or upload new documents</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="apple-card p-8 max-w-md w-full">
            <h3 className="text-white text-2xl font-bold mb-6">Upload Documents</h3>
            <div className="space-y-4">
              {uploadingFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <i className="fa-solid fa-file text-blue-400"></i>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{file.name}</p>
                    <p className="text-gray-400 text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-2xl font-medium transition-all duration-200"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
