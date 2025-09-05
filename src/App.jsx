import React, { useState } from 'react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import DocumentUpload from './components/DocumentUpload'
import DocumentViewer from './components/DocumentViewer'
import Timeline from './components/Timeline'
import MapView from './components/MapView'
import AuthModal from './components/AuthModal'
import { useAuth } from './hooks/useAuth'
import { useDocuments } from './hooks/useDocuments'

function App() {
  const { user, login, logout, showAuth, setShowAuth } = useAuth()
  const { documents, events, links, addDocument, addEvent, addLink } = useDocuments()
  const [activeView, setActiveView] = useState('dashboard')
  const [selectedDocument, setSelectedDocument] = useState(null)

  const renderView = () => {
    if (!user) {
      return (
        <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
          <div className="text-center text-white max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Historify</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Unearth Your Local History: Digitize, Connect, and Visualize.
            </p>
            <p className="text-lg mb-8 opacity-80">
              Transform historical documents into searchable digital archives. 
              Connect related records and create compelling timelines of your local history.
            </p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-white text-purple-700 px-8 py-4 rounded-lg text-lg font-semibold 
                       hover:bg-gray-100 transition-colors duration-200 shadow-lg"
            >
              Get Started
            </button>
            
            {/* Feature Preview */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Document Digitization</h3>
                <p className="opacity-80">Upload and OCR historical documents to make them searchable</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Cross-Archive Linking</h3>
                <p className="opacity-80">Connect related documents across different archives</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Thematic Timelines</h3>
                <p className="opacity-80">Create themed historical narratives and timelines</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Geo-Historical Maps</h3>
                <p className="opacity-80">Overlay historical maps onto modern interfaces</p>
              </div>
            </div>
          </div>
        </div>
      )
    }

    switch (activeView) {
      case 'upload':
        return <DocumentUpload onDocumentAdded={addDocument} />
      case 'document':
        return (
          <DocumentViewer 
            document={selectedDocument} 
            documents={documents}
            links={links}
            onAddLink={addLink}
            onBack={() => setActiveView('dashboard')}
          />
        )
      case 'timeline':
        return <Timeline events={events} documents={documents} onAddEvent={addEvent} />
      case 'map':
        return <MapView documents={documents} events={events} />
      default:
        return (
          <Dashboard 
            documents={documents} 
            events={events}
            links={links}
            onViewDocument={(doc) => {
              setSelectedDocument(doc)
              setActiveView('document')
            }}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {user && (
        <Header 
          user={user}
          onLogout={logout}
          activeView={activeView}
          onViewChange={setActiveView}
        />
      )}
      {renderView()}
      {showAuth && (
        <AuthModal 
          onLogin={login}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  )
}

export default App