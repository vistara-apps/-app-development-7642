import React, { useState } from 'react'
import { ArrowLeft, Link as LinkIcon, Plus, Users, Calendar, MapPin } from 'lucide-react'

const DocumentViewer = ({ document, documents, links, onAddLink, onBack }) => {
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState([])
  const [linkType, setLinkType] = useState('reference')
  const [linkDescription, setLinkDescription] = useState('')

  if (!document) return null

  const existingLinks = links.filter(link => 
    link.documentIds.includes(document.documentId)
  )

  const availableDocuments = documents.filter(doc => 
    doc.documentId !== document.documentId &&
    !existingLinks.some(link => link.documentIds.includes(doc.documentId))
  )

  const handleCreateLink = () => {
    if (selectedDocuments.length === 0) return

    const newLink = {
      linkId: Math.random().toString(36).substr(2, 9),
      documentIds: [document.documentId, ...selectedDocuments],
      linkType,
      description: linkDescription,
      createdDate: new Date().toISOString()
    }

    onAddLink(newLink)
    setShowLinkModal(false)
    setSelectedDocuments([])
    setLinkDescription('')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {document.fileName}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span>Uploaded: {new Date(document.uploadDate).toLocaleDateString()}</span>
              <span>Source: {document.metadata?.source || 'Unknown'}</span>
              <span>Size: {document.metadata?.fileSize ? Math.round(document.metadata.fileSize / 1024) + ' KB' : 'Unknown'}</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowLinkModal(true)}
            className="mt-4 md:mt-0 flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Create Link</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Document Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* OCR Text */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Content</h2>
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap">
                {document.ocrText}
              </div>
            </div>
          </div>

          {/* Document Preview Placeholder */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Preview</h2>
            <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2" />
                <p>Document preview would appear here</p>
                <p className="text-sm">Supported formats: PDF, Images</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Existing Links */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LinkIcon className="h-5 w-5 mr-2" />
              Connected Documents ({existingLinks.length})
            </h3>
            
            {existingLinks.length === 0 ? (
              <p className="text-gray-500 text-sm">No connections yet. Create links to related documents.</p>
            ) : (
              <div className="space-y-3">
                {existingLinks.map(link => (
                  <div key={link.linkId} className="border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                        {link.linkType}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(link.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{link.description}</p>
                    
                    <div className="space-y-1">
                      {link.documentIds
                        .filter(id => id !== document.documentId)
                        .map(docId => {
                          const linkedDoc = documents.find(d => d.documentId === docId)
                          return linkedDoc ? (
                            <div key={docId} className="text-xs text-gray-600 truncate">
                              → {linkedDoc.fileName}
                            </div>
                          ) : null
                        })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Document Metadata */}
          <div className="bg-white rounded-lg shadow-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Uploaded:</span>
                <span className="font-medium">{new Date(document.uploadDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Source:</span>
                <span className="font-medium">{document.metadata?.source || 'Unknown'}</span>
              </div>
              
              {document.metadata?.fileType && (
                <div className="flex items-center space-x-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{document.metadata.fileType}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Link Creation Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Document Link</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Link Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Type
                </label>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="reference">Reference</option>
                  <option value="related">Related Event</option>
                  <option value="person">Same Person</option>
                  <option value="location">Same Location</option>
                  <option value="continuation">Document Series</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Description
                </label>
                <textarea
                  value={linkDescription}
                  onChange={(e) => setLinkDescription(e.target.value)}
                  placeholder="Describe the relationship between these documents..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                />
              </div>

              {/* Document Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Documents to Link
                </label>
                <div className="max-h-64 overflow-y-auto border border-gray-300 rounded-lg">
                  {availableDocuments.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No available documents to link
                    </div>
                  ) : (
                    availableDocuments.map(doc => (
                      <label key={doc.documentId} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.documentId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments(prev => [...prev, doc.documentId])
                            } else {
                              setSelectedDocuments(prev => prev.filter(id => id !== doc.documentId))
                            }
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <div className="ml-3 flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{doc.fileName}</h4>
                          <p className="text-sm text-gray-500 truncate">{doc.ocrText.slice(0, 100)}...</p>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLink}
                disabled={selectedDocuments.length === 0}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Create Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentViewer