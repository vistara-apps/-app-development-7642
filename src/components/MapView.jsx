import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Layers, FileText, Calendar, Settings } from 'lucide-react'

const MapView = ({ documents, events }) => {
  const [showHistoricalLayer, setShowHistoricalLayer] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [mapCenter] = useState([40.7128, -74.0060]) // Default to NYC
  
  // Mock historical locations for demonstration
  const historicalMarkers = [
    {
      id: 1,
      position: [40.7614, -73.9776],
      title: "Central Park Historical Site",
      type: "location",
      description: "Site of historical significance mentioned in multiple documents",
      associatedDocuments: documents.slice(0, 2).map(d => d.documentId),
      year: "1857"
    },
    {
      id: 2,
      position: [40.7505, -73.9934],
      title: "Times Square Development",
      type: "event",
      description: "Location of major urban development event",
      associatedEvents: events.slice(0, 1).map(e => e.eventId),
      year: "1904"
    },
    {
      id: 3,
      position: [40.7282, -74.0776],
      title: "Ellis Island Immigration Center",
      type: "location",
      description: "Primary immigration processing center",
      associatedDocuments: documents.slice(1, 3).map(d => d.documentId),
      year: "1892"
    }
  ]

  const filteredMarkers = selectedFilter === 'all' 
    ? historicalMarkers 
    : historicalMarkers.filter(marker => marker.type === selectedFilter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Geo-Historical Map</h1>
        <p className="text-gray-600">
          Explore historical locations and events on an interactive map
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-card p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Map Layers:</span>
            </div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showHistoricalLayer}
                onChange={(e) => setShowHistoricalLayer(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Historical Overlay</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter:</span>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Markers</option>
              <option value="location">Locations</option>
              <option value="event">Events</option>
            </select>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <div className="h-[600px] relative">
          <MapContainer
            center={mapCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="rounded-lg"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Historical Overlay */}
            {showHistoricalLayer && (
              <TileLayer
                attribution='Historical overlay'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                opacity={0.5}
              />
            )}

            {/* Historical Markers */}
            {filteredMarkers.map(marker => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <div className="p-2 min-w-[250px]">
                    <h3 className="font-semibold text-gray-900 mb-2">{marker.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{marker.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        <span>Year: {marker.year}</span>
                      </div>
                      
                      {marker.associatedDocuments && marker.associatedDocuments.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-1 text-xs text-gray-700 mb-1">
                            <FileText className="h-3 w-3" />
                            <span>Documents ({marker.associatedDocuments.length})</span>
                          </div>
                          <div className="space-y-1">
                            {marker.associatedDocuments.map(docId => {
                              const doc = documents.find(d => d.documentId === docId)
                              return doc ? (
                                <div key={docId} className="text-xs text-blue-600 hover:underline cursor-pointer">
                                  {doc.fileName}
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                      
                      {marker.associatedEvents && marker.associatedEvents.length > 0 && (
                        <div>
                          <div className="flex items-center space-x-1 text-xs text-gray-700 mb-1">
                            <Calendar className="h-3 w-3" />
                            <span>Events ({marker.associatedEvents.length})</span>
                          </div>
                          <div className="space-y-1">
                            {marker.associatedEvents.map(eventId => {
                              const event = events.find(e => e.eventId === eventId)
                              return event ? (
                                <div key={eventId} className="text-xs text-green-600 hover:underline cursor-pointer">
                                  {event.title}
                                </div>
                              ) : null
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-card p-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Map Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Historical Locations</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Historical Events</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Property Records</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView