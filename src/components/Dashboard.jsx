import React, { useState } from 'react'
import { Search, FileText, Link as LinkIcon, Calendar, BarChart3 } from 'lucide-react'
import SearchInput from './SearchInput'

const Dashboard = ({ documents, events, links, onViewDocument }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.ocrText.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (selectedFilter === 'all') return matchesSearch
    if (selectedFilter === 'linked') return matchesSearch && links.some(link => 
      link.documentIds.includes(doc.documentId))
    if (selectedFilter === 'recent') return matchesSearch && 
      new Date(doc.uploadDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    return matchesSearch
  })

  const stats = [
    { label: 'Documents', value: documents.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Events', value: events.length, icon: Calendar, color: 'text-green-600' },
    { label: 'Links', value: links.length, icon: LinkIcon, color: 'text-purple-600' },
    { label: 'Archives', value: new Set(documents.map(d => d.metadata?.source || 'Unknown')).size, icon: BarChart3, color: 'text-orange-600' },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-lg p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
              <Icon className={`h-8 w-8 ${color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg p-6 shadow-card mb-8">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search documents by name or content..."
            />
          </div>
          <div className="flex space-x-2">
            {['all', 'linked', 'recent'].map(filter => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                  selectedFilter === filter
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white rounded-lg shadow-card">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Documents ({filteredDocuments.length})
          </h2>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {documents.length === 0 ? (
              <div>
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No documents yet</p>
                <p>Upload your first historical document to get started.</p>
              </div>
            ) : (
              <div>
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium mb-2">No documents found</p>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {filteredDocuments.map(doc => (
              <div
                key={doc.documentId}
                onClick={() => onViewDocument(doc)}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 truncate flex-1 mr-2">
                    {doc.fileName}
                  </h3>
                  {links.some(link => link.documentIds.includes(doc.documentId)) && (
                    <LinkIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {doc.ocrText.slice(0, 100)}...
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                  <span>{doc.metadata?.source || 'Unknown source'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard