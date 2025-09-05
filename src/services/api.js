/**
 * API Service Layer for Historify
 * Handles all external API integrations including OCR, storage, and backend services
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
const OCR_SERVICE_URL = import.meta.env.VITE_OCR_SERVICE_URL || 'https://api.ocr.space/parse/image'
const OCR_API_KEY = import.meta.env.VITE_OCR_API_KEY || 'demo_key'

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL
    this.ocrURL = OCR_SERVICE_URL
    this.ocrKey = OCR_API_KEY
  }

  /**
   * Generic HTTP request handler
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    // Add auth token if available
    const token = localStorage.getItem('historify_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  /**
   * OCR Service Integration
   * Supports multiple OCR providers (OCR.space, Google Vision, AWS Textract)
   */
  async processOCR(file, options = {}) {
    const { provider = 'ocr.space', language = 'eng' } = options

    try {
      switch (provider) {
        case 'ocr.space':
          return await this.processOCRSpace(file, language)
        case 'google-vision':
          return await this.processGoogleVision(file)
        case 'aws-textract':
          return await this.processAWSTextract(file)
        default:
          throw new Error(`Unsupported OCR provider: ${provider}`)
      }
    } catch (error) {
      console.error('OCR processing failed:', error)
      // Fallback to mock OCR for development
      return this.mockOCRResult(file)
    }
  }

  /**
   * OCR.space API integration
   */
  async processOCRSpace(file, language = 'eng') {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('language', language)
    formData.append('apikey', this.ocrKey)
    formData.append('OCREngine', '2')
    formData.append('detectOrientation', 'true')
    formData.append('scale', 'true')

    const response = await fetch(this.ocrURL, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    
    if (result.IsErroredOnProcessing) {
      throw new Error(result.ErrorMessage || 'OCR processing failed')
    }

    return {
      text: result.ParsedResults?.[0]?.ParsedText || '',
      confidence: result.ParsedResults?.[0]?.TextOverlay?.HasOverlay ? 0.9 : 0.7,
      provider: 'ocr.space'
    }
  }

  /**
   * Google Vision API integration (placeholder)
   */
  async processGoogleVision(file) {
    // This would integrate with Google Cloud Vision API
    // For now, return mock data
    return this.mockOCRResult(file)
  }

  /**
   * AWS Textract integration (placeholder)
   */
  async processAWSTextract(file) {
    // This would integrate with AWS Textract
    // For now, return mock data
    return this.mockOCRResult(file)
  }

  /**
   * Mock OCR result for development/fallback
   */
  mockOCRResult(file) {
    const mockTexts = {
      'census': `UNITED STATES CENSUS 1920 - WARD 3

Smith, John - Age 35, Occupation: Factory Worker
Smith, Mary - Age 32, Occupation: Housewife
Smith, Robert - Age 8, Occupation: Student

Address: 123 Main Street
Immigration Year: 1905 (Ireland)`,
      'immigration': `MANIFEST OF ALIEN PASSENGERS
SS CELTIC - April 15, 1905

Smith, John - Age 20
Occupation: Laborer
Country of Origin: Ireland
Destination: New York
Sponsored by: Michael O'Brien, 456 Oak Avenue`,
      'deed': `PROPERTY DEED
Recorded: June 15, 1910
Grantor: City of Springfield
Grantee: John Smith
Property: Lot 15, Block 3, Main Street
Consideration: $500.00
Witnesses: Thomas Brown, Sarah Wilson`,
      'newspaper': `THE SPRINGFIELD GAZETTE
March 20, 1918

FACTORY EXPANSION ANNOUNCED
Local textile mill to add 200 jobs

The Springfield Textile Company announced plans to expand their Main Street facility, creating 200 new positions for local residents...`
    }

    // Determine mock text based on filename
    const fileName = file.name.toLowerCase()
    let mockText = `Historical document content from ${file.name}. `
    
    if (fileName.includes('census')) {
      mockText = mockTexts.census
    } else if (fileName.includes('immigration') || fileName.includes('ellis')) {
      mockText = mockTexts.immigration
    } else if (fileName.includes('deed') || fileName.includes('property')) {
      mockText = mockTexts.deed
    } else if (fileName.includes('newspaper') || fileName.includes('gazette')) {
      mockText = mockTexts.newspaper
    } else {
      mockText += `This is a sample OCR result that would contain the actual text extracted from the document. The text might include names, dates, addresses, and other historical information relevant to local research.`
    }

    return {
      text: mockText,
      confidence: 0.85,
      provider: 'mock'
    }
  }

  /**
   * Cloud Storage Service
   */
  async uploadFile(file, metadata = {}) {
    try {
      // In production, this would upload to AWS S3, Google Cloud Storage, etc.
      const formData = new FormData()
      formData.append('file', file)
      formData.append('metadata', JSON.stringify(metadata))

      const response = await this.request('/files/upload', {
        method: 'POST',
        body: formData,
        headers: {
          // Remove Content-Type to let browser set it for FormData
        }
      })

      return response
    } catch (error) {
      // Fallback to local storage simulation
      return this.mockFileUpload(file, metadata)
    }
  }

  /**
   * Mock file upload for development
   */
  async mockFileUpload(file, metadata) {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const fileUrl = URL.createObjectURL(file)
    
    return {
      fileId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl,
      uploadDate: new Date().toISOString(),
      metadata
    }
  }

  /**
   * Document Management API
   */
  async saveDocument(documentData) {
    try {
      return await this.request('/documents', {
        method: 'POST',
        body: JSON.stringify(documentData)
      })
    } catch (error) {
      // Fallback to local storage
      const documents = JSON.parse(localStorage.getItem('historify_documents') || '[]')
      const newDocument = {
        ...documentData,
        documentId: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uploadDate: new Date().toISOString()
      }
      documents.push(newDocument)
      localStorage.setItem('historify_documents', JSON.stringify(documents))
      return newDocument
    }
  }

  async getDocuments(userId) {
    try {
      return await this.request(`/documents?userId=${userId}`)
    } catch (error) {
      // Fallback to local storage
      return JSON.parse(localStorage.getItem('historify_documents') || '[]')
    }
  }

  async updateDocument(documentId, updates) {
    try {
      return await this.request(`/documents/${documentId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
    } catch (error) {
      // Fallback to local storage
      const documents = JSON.parse(localStorage.getItem('historify_documents') || '[]')
      const index = documents.findIndex(doc => doc.documentId === documentId)
      if (index !== -1) {
        documents[index] = { ...documents[index], ...updates }
        localStorage.setItem('historify_documents', JSON.stringify(documents))
        return documents[index]
      }
      throw new Error('Document not found')
    }
  }

  async deleteDocument(documentId) {
    try {
      return await this.request(`/documents/${documentId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      // Fallback to local storage
      const documents = JSON.parse(localStorage.getItem('historify_documents') || '[]')
      const filtered = documents.filter(doc => doc.documentId !== documentId)
      localStorage.setItem('historify_documents', JSON.stringify(filtered))
      return { success: true }
    }
  }

  /**
   * Event Management API
   */
  async saveEvent(eventData) {
    try {
      return await this.request('/events', {
        method: 'POST',
        body: JSON.stringify(eventData)
      })
    } catch (error) {
      // Fallback to local storage
      const events = JSON.parse(localStorage.getItem('historify_events') || '[]')
      const newEvent = {
        ...eventData,
        eventId: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdDate: new Date().toISOString()
      }
      events.push(newEvent)
      localStorage.setItem('historify_events', JSON.stringify(events))
      return newEvent
    }
  }

  async getEvents(userId) {
    try {
      return await this.request(`/events?userId=${userId}`)
    } catch (error) {
      // Fallback to local storage
      return JSON.parse(localStorage.getItem('historify_events') || '[]')
    }
  }

  /**
   * Link Management API
   */
  async saveLink(linkData) {
    try {
      return await this.request('/links', {
        method: 'POST',
        body: JSON.stringify(linkData)
      })
    } catch (error) {
      // Fallback to local storage
      const links = JSON.parse(localStorage.getItem('historify_links') || '[]')
      const newLink = {
        ...linkData,
        linkId: `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdDate: new Date().toISOString()
      }
      links.push(newLink)
      localStorage.setItem('historify_links', JSON.stringify(links))
      return newLink
    }
  }

  async getLinks(userId) {
    try {
      return await this.request(`/links?userId=${userId}`)
    } catch (error) {
      // Fallback to local storage
      return JSON.parse(localStorage.getItem('historify_links') || '[]')
    }
  }

  /**
   * Search API
   */
  async searchDocuments(query, filters = {}) {
    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      })
      return await this.request(`/search/documents?${params}`)
    } catch (error) {
      // Fallback to local search
      const documents = JSON.parse(localStorage.getItem('historify_documents') || '[]')
      return documents.filter(doc => 
        doc.fileName.toLowerCase().includes(query.toLowerCase()) ||
        doc.ocrText.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  /**
   * User Management API
   */
  async createUser(userData) {
    try {
      return await this.request('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
    } catch (error) {
      // Mock user creation
      const user = {
        userId: `user_${Date.now()}`,
        ...userData,
        subscriptionTier: 'free',
        uploadLimit: 10,
        storageUsed: 0,
        createdDate: new Date().toISOString()
      }
      localStorage.setItem('historify_user', JSON.stringify(user))
      return user
    }
  }

  async loginUser(credentials) {
    try {
      const response = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })
      
      if (response.token) {
        localStorage.setItem('historify_token', response.token)
      }
      
      return response
    } catch (error) {
      // Mock login
      const user = {
        userId: `user_${Date.now()}`,
        email: credentials.email,
        subscriptionTier: 'free',
        uploadLimit: 10,
        storageUsed: 0
      }
      localStorage.setItem('historify_user', JSON.stringify(user))
      return { user, token: 'mock_token' }
    }
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService
