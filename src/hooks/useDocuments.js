import { useState } from 'react'

export const useDocuments = () => {
  const [documents, setDocuments] = useState([
    {
      documentId: 'doc1',
      fileName: 'Census_1920_Ward_3.pdf',
      uploadDate: '2024-01-15T10:30:00Z',
      ocrText: 'UNITED STATES CENSUS 1920 - WARD 3\n\nSmith, John - Age 35, Occupation: Factory Worker\nSmith, Mary - Age 32, Occupation: Housewife\nSmith, Robert - Age 8, Occupation: Student\n\nAddress: 123 Main Street\nImmigration Year: 1905 (Ireland)',
      metadata: {
        source: 'National Archives',
        fileSize: 2048000,
        fileType: 'application/pdf'
      },
      linkedDocuments: []
    },
    {
      documentId: 'doc2',
      fileName: 'Immigration_Record_Ellis_Island_1905.jpg',
      uploadDate: '2024-01-16T14:20:00Z',
      ocrText: 'MANIFEST OF ALIEN PASSENGERS\nSS CELTIC - April 15, 1905\n\nSmith, John - Age 20\nOccupation: Laborer\nCountry of Origin: Ireland\nDestination: New York\nSponsored by: Michael O\'Brien, 456 Oak Avenue',
      metadata: {
        source: 'Ellis Island Records',
        fileSize: 1024000,
        fileType: 'image/jpeg'
      },
      linkedDocuments: []
    }
  ])

  const [events, setEvents] = useState([
    {
      eventId: 'event1',
      title: 'Great Irish Immigration Wave',
      description: 'Large influx of Irish immigrants to the city following economic hardship in Ireland.',
      date: '1905-04-15',
      themeTag: 'Immigration',
      associatedDocuments: ['doc2'],
      createdDate: '2024-01-20T09:00:00Z'
    }
  ])

  const [links, setLinks] = useState([
    {
      linkId: 'link1',
      documentIds: ['doc1', 'doc2'],
      linkType: 'person',
      description: 'Both documents reference John Smith - immigration record and census record 15 years later',
      createdDate: '2024-01-20T10:00:00Z'
    }
  ])

  const addDocument = (document) => {
    setDocuments(prev => [...prev, document])
  }

  const addEvent = (event) => {
    setEvents(prev => [...prev, event])
  }

  const addLink = (link) => {
    setLinks(prev => [...prev, link])
  }

  return {
    documents,
    events,
    links,
    addDocument,
    addEvent,
    addLink
  }
}