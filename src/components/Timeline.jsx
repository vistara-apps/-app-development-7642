import React, { useState } from 'react'
import { Plus, Calendar, FileText, Tag, Edit3 } from 'lucide-react'

const Timeline = ({ events, documents, onAddEvent }) => {
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState('all')
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    themeTag: '',
    associatedDocuments: []
  })

  const themes = ['all', ...new Set(events.map(e => e.themeTag).filter(Boolean))]
  
  const filteredEvents = selectedTheme === 'all' 
    ? events 
    : events.filter(e => e.themeTag === selectedTheme)

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date))

  const handleCreateEvent = () => {
    const newEvent = {
      eventId: Math.random().toString(36).substr(2, 9),
      ...eventForm,
      createdDate: new Date().toISOString()
    }
    
    onAddEvent(newEvent)
    setShowEventModal(false)
    setEventForm({
      title: '',
      description: '',
      date: '',
      themeTag: '',
      associatedDocuments: []
    })
  }

  const getThemeColor = (theme) => {
    const colors = {
      'Immigration': 'bg-blue-100 text-blue-800',
      'Industrial Development': 'bg-green-100 text-green-800',
      'Civil War': 'bg-red-100 text-red-800',
      'Education': 'bg-yellow-100 text-yellow-800',
      'Transportation': 'bg-purple-100 text-purple-800',
      'default': 'bg-gray-100 text-gray-800'
    }
    return colors[theme] || colors.default
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Historical Timeline</h1>
          <p className="text-gray-600">
            Create and explore thematic timelines of historical events
          </p>
        </div>
        
        <button
          onClick={() => setShowEventModal(true)}
          className="mt-4 md:mt-0 flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Theme Filter */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Theme</h3>
        <div className="flex flex-wrap gap-2">
          {themes.map(theme => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(theme)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                selectedTheme === theme
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {theme === 'all' ? 'All Themes' : theme}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow-card">
        {sortedEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">No events yet</h3>
            <p>Create your first historical event to start building timelines.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-8">
                {sortedEvents.map((event, index) => (
                  <div key={event.eventId} className="relative flex items-start space-x-4">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-sm"></div>
                    
                    {/* Event content */}
                    <div className="flex-1 min-w-0 pb-8">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                          <div className="flex items-center space-x-2">
                            {event.themeTag && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getThemeColor(event.themeTag)}`}>
                                {event.themeTag}
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3">{event.description}</p>
                        
                        {/* Associated Documents */}
                        {event.associatedDocuments && event.associatedDocuments.length > 0 && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                              <FileText className="h-4 w-4 mr-1" />
                              Associated Documents
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {event.associatedDocuments.map(docId => {
                                const doc = documents.find(d => d.documentId === docId)
                                return doc ? (
                                  <span key={docId} className="text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                    {doc.fileName}
                                  </span>
                                ) : null
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Historical Event</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., First Railroad Arrives in Town"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              {/* Theme Tag */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme Tag
                </label>
                <input
                  type="text"
                  value={eventForm.themeTag}
                  onChange={(e) => setEventForm(prev => ({ ...prev, themeTag: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="e.g., Transportation, Immigration, Industrial Development"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={eventForm.description}
                  onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={4}
                  placeholder="Describe the historical event and its significance..."
                />
              </div>

              {/* Associated Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Associated Documents
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-lg">
                  {documents.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No documents available
                    </div>
                  ) : (
                    documents.map(doc => (
                      <label key={doc.documentId} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={eventForm.associatedDocuments.includes(doc.documentId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEventForm(prev => ({
                                ...prev,
                                associatedDocuments: [...prev.associatedDocuments, doc.documentId]
                              }))
                            } else {
                              setEventForm(prev => ({
                                ...prev,
                                associatedDocuments: prev.associatedDocuments.filter(id => id !== doc.documentId)
                              }))
                            }
                          }}
                          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                        <span className="ml-3 text-sm text-gray-900 truncate">{doc.fileName}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!eventForm.title || !eventForm.date}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Timeline