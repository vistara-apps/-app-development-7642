# Historify API Documentation

## Overview

The Historify API provides comprehensive endpoints for managing historical documents, events, and user data. This RESTful API supports document digitization, OCR processing, cross-archive linking, and geo-historical mapping.

## Base URL

```
Production: https://api.historify.com/v1
Development: http://localhost:3001/api
```

## Authentication

All API requests require authentication using Bearer tokens.

```http
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### POST /auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "userId": "user_123",
    "email": "user@example.com",
    "subscriptionTier": "basic",
    "uploadLimit": 100,
    "storageUsed": 1024000
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400
}
```

#### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### POST /auth/refresh
Refresh authentication token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

## User Management

### GET /users/profile
Get current user profile information.

**Response:**
```json
{
  "userId": "user_123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "subscriptionTier": "basic",
  "uploadLimit": 100,
  "storageUsed": 1024000,
  "storageLimit": 1073741824,
  "createdDate": "2024-01-15T10:30:00Z",
  "lastLoginDate": "2024-01-20T14:22:00Z"
}
```

### PATCH /users/profile
Update user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

### GET /users/usage
Get current usage statistics for the user.

**Response:**
```json
{
  "uploads": {
    "used": 25,
    "limit": 100,
    "percentage": 25,
    "unit": "documents"
  },
  "storage": {
    "used": 512,
    "limit": 1024,
    "percentage": 50,
    "unit": "MB"
  },
  "ocr": {
    "used": 150,
    "limit": 500,
    "percentage": 30,
    "unit": "pages"
  }
}
```

## Document Management

### GET /documents
Retrieve user's documents with optional filtering and pagination.

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 20, max: 100)
- `sortBy` (string): Sort field (date, name, size)
- `sortOrder` (string): Sort order (asc, desc)
- `fileType` (string): Filter by file type
- `source` (string): Filter by document source
- `dateFrom` (string): Filter by upload date (ISO 8601)
- `dateTo` (string): Filter by upload date (ISO 8601)

**Response:**
```json
{
  "documents": [
    {
      "documentId": "doc_123",
      "userId": "user_123",
      "fileName": "Census_1920_Ward_3.pdf",
      "uploadDate": "2024-01-15T10:30:00Z",
      "ocrText": "UNITED STATES CENSUS 1920...",
      "ocrConfidence": 0.92,
      "metadata": {
        "source": "National Archives",
        "fileSize": 2048000,
        "fileType": "application/pdf",
        "pages": 5
      },
      "linkedDocuments": ["doc_124", "doc_125"],
      "tags": ["census", "1920", "immigration"],
      "fileUrl": "https://storage.historify.com/files/doc_123.pdf"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /documents
Upload and process a new document.

**Request Body (multipart/form-data):**
- `file`: Document file (PDF, JPG, PNG, TIFF)
- `metadata`: JSON string with document metadata

**Metadata Example:**
```json
{
  "source": "Local Historical Society",
  "description": "Property deed from 1910",
  "tags": ["property", "deed", "1910"],
  "ocrOptions": {
    "language": "eng",
    "provider": "ocr.space"
  }
}
```

**Response:**
```json
{
  "documentId": "doc_126",
  "fileName": "property_deed_1910.pdf",
  "uploadDate": "2024-01-20T15:45:00Z",
  "status": "processing",
  "fileUrl": "https://storage.historify.com/files/doc_126.pdf",
  "processingId": "proc_789"
}
```

### GET /documents/{documentId}
Get detailed information about a specific document.

**Response:**
```json
{
  "documentId": "doc_123",
  "userId": "user_123",
  "fileName": "Census_1920_Ward_3.pdf",
  "uploadDate": "2024-01-15T10:30:00Z",
  "ocrText": "UNITED STATES CENSUS 1920...",
  "ocrConfidence": 0.92,
  "ocrProvider": "ocr.space",
  "processingStatus": "completed",
  "metadata": {
    "source": "National Archives",
    "fileSize": 2048000,
    "fileType": "application/pdf",
    "pages": 5,
    "dimensions": {
      "width": 612,
      "height": 792
    }
  },
  "linkedDocuments": [
    {
      "documentId": "doc_124",
      "fileName": "Immigration_Record_1905.jpg",
      "linkType": "person",
      "linkDescription": "Same person - John Smith"
    }
  ],
  "tags": ["census", "1920", "immigration"],
  "fileUrl": "https://storage.historify.com/files/doc_123.pdf",
  "thumbnailUrl": "https://storage.historify.com/thumbnails/doc_123.jpg"
}
```

### PATCH /documents/{documentId}
Update document metadata, tags, or OCR text.

**Request Body:**
```json
{
  "tags": ["census", "1920", "immigration", "ward-3"],
  "metadata": {
    "description": "Updated description",
    "source": "National Archives - Updated"
  },
  "ocrText": "Corrected OCR text..."
}
```

### DELETE /documents/{documentId}
Delete a document and all associated data.

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## OCR Processing

### POST /ocr/process
Process OCR for an uploaded document.

**Request Body:**
```json
{
  "documentId": "doc_123",
  "options": {
    "language": "eng",
    "provider": "ocr.space",
    "detectOrientation": true,
    "scale": true
  }
}
```

**Response:**
```json
{
  "processingId": "proc_789",
  "status": "processing",
  "estimatedTime": 30,
  "message": "OCR processing started"
}
```

### GET /ocr/status/{processingId}
Check OCR processing status.

**Response:**
```json
{
  "processingId": "proc_789",
  "status": "completed",
  "progress": 100,
  "result": {
    "text": "Extracted text content...",
    "confidence": 0.92,
    "provider": "ocr.space",
    "processingTime": 25,
    "pages": 5
  }
}
```

## Search

### GET /search/documents
Advanced document search with filters.

**Query Parameters:**
- `q` (string): Search query
- `page` (integer): Page number
- `limit` (integer): Results per page
- `sortBy` (string): Sort field (relevance, date, name)
- `sortOrder` (string): Sort order (asc, desc)
- `fuzzy` (boolean): Enable fuzzy search
- `exactPhrase` (boolean): Search for exact phrase
- `fileTypes` (array): Filter by file types
- `sources` (array): Filter by sources
- `tags` (array): Filter by tags
- `dateFrom` (string): Filter by date range
- `dateTo` (string): Filter by date range

**Response:**
```json
{
  "results": [
    {
      "documentId": "doc_123",
      "fileName": "Census_1920_Ward_3.pdf",
      "relevanceScore": 0.95,
      "matchedText": "...John Smith - Age 35...",
      "highlights": ["John Smith", "Age 35"],
      "uploadDate": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 15,
  "query": "John Smith",
  "filters": {
    "fileTypes": ["pdf"],
    "dateFrom": "2024-01-01"
  },
  "pagination": {
    "limit": 20,
    "offset": 0,
    "hasMore": false
  }
}
```

### GET /search/suggestions
Get search suggestions based on partial query.

**Query Parameters:**
- `q` (string): Partial search query
- `limit` (integer): Number of suggestions (default: 5)

**Response:**
```json
{
  "suggestions": [
    "john smith",
    "john doe",
    "johnson",
    "johnston",
    "jones"
  ]
}
```

## Events and Timelines

### GET /events
Get user's historical events.

**Query Parameters:**
- `page` (integer): Page number
- `limit` (integer): Items per page
- `themeTag` (string): Filter by theme
- `dateFrom` (string): Filter by event date
- `dateTo` (string): Filter by event date

**Response:**
```json
{
  "events": [
    {
      "eventId": "event_123",
      "userId": "user_123",
      "title": "Great Irish Immigration Wave",
      "description": "Large influx of Irish immigrants...",
      "date": "1905-04-15",
      "themeTag": "Immigration",
      "associatedDocuments": ["doc_124", "doc_125"],
      "location": {
        "latitude": 40.7128,
        "longitude": -74.0060,
        "address": "New York, NY"
      },
      "createdDate": "2024-01-20T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

### POST /events
Create a new historical event.

**Request Body:**
```json
{
  "title": "Factory Expansion Announced",
  "description": "Local textile mill announces expansion...",
  "date": "1918-03-20",
  "themeTag": "Industrial Development",
  "associatedDocuments": ["doc_130"],
  "location": {
    "latitude": 42.3601,
    "longitude": -71.0589,
    "address": "Springfield, MA"
  }
}
```

### GET /events/{eventId}
Get detailed information about a specific event.

### PATCH /events/{eventId}
Update event information.

### DELETE /events/{eventId}
Delete an event.

## Document Links

### GET /links
Get document links and relationships.

**Response:**
```json
{
  "links": [
    {
      "linkId": "link_123",
      "documentIds": ["doc_123", "doc_124"],
      "linkType": "person",
      "description": "Both documents reference John Smith",
      "confidence": 0.9,
      "createdDate": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### POST /links
Create a new document link.

**Request Body:**
```json
{
  "documentIds": ["doc_123", "doc_124"],
  "linkType": "person",
  "description": "Both documents reference the same person",
  "confidence": 0.95
}
```

### DELETE /links/{linkId}
Delete a document link.

## File Storage

### POST /files/upload
Upload a file to cloud storage.

**Request Body (multipart/form-data):**
- `file`: File to upload
- `metadata`: JSON metadata

**Response:**
```json
{
  "fileId": "file_123",
  "fileName": "document.pdf",
  "fileSize": 2048000,
  "fileType": "application/pdf",
  "fileUrl": "https://storage.historify.com/files/file_123.pdf",
  "uploadDate": "2024-01-20T15:45:00Z"
}
```

### GET /files/{fileId}
Get file information and download URL.

### DELETE /files/{fileId}
Delete a file from storage.

## Subscription Management

### GET /subscription
Get current subscription details.

**Response:**
```json
{
  "id": "basic",
  "name": "Basic",
  "price": 5,
  "currency": "USD",
  "interval": "month",
  "status": "active",
  "startDate": "2024-01-01T00:00:00Z",
  "nextBillingDate": "2024-02-01T00:00:00Z",
  "features": {
    "uploadLimit": 100,
    "storageLimit": 1000,
    "ocrProcessing": 500,
    "advancedSearch": true,
    "priorityProcessing": false,
    "collaborationTools": false
  }
}
```

### POST /subscription/upgrade
Upgrade subscription tier.

**Request Body:**
```json
{
  "tier": "premium",
  "paymentMethod": "card_123"
}
```

### POST /subscription/cancel
Cancel subscription.

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled. Access continues until 2024-02-01.",
  "endDate": "2024-02-01T00:00:00Z"
}
```

## Analytics and Reporting

### GET /analytics/usage
Get detailed usage analytics.

**Response:**
```json
{
  "period": "2024-01",
  "uploads": {
    "total": 25,
    "byFileType": {
      "pdf": 15,
      "jpg": 8,
      "png": 2
    }
  },
  "storage": {
    "used": 512000000,
    "limit": 1073741824
  },
  "ocr": {
    "pagesProcessed": 150,
    "averageConfidence": 0.89
  },
  "searches": {
    "total": 45,
    "topQueries": ["john smith", "census 1920", "immigration"]
  }
}
```

### GET /analytics/documents
Get document analytics and insights.

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid file type",
    "details": {
      "field": "file",
      "allowedTypes": ["pdf", "jpg", "png", "tiff"]
    },
    "timestamp": "2024-01-20T15:45:00Z",
    "requestId": "req_123"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid request data
- `AUTHENTICATION_ERROR` (401): Invalid or missing authentication
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `SUBSCRIPTION_LIMIT_EXCEEDED` (402): Subscription limit reached
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

API requests are rate-limited based on subscription tier:

- **Free**: 100 requests/hour
- **Basic**: 1,000 requests/hour
- **Premium**: 10,000 requests/hour

Rate limit headers are included in all responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642694400
```

## Webhooks

Historify supports webhooks for real-time notifications:

### Supported Events

- `document.uploaded`
- `document.processed`
- `ocr.completed`
- `ocr.failed`
- `subscription.updated`
- `subscription.cancelled`

### Webhook Payload Example

```json
{
  "event": "document.processed",
  "timestamp": "2024-01-20T15:45:00Z",
  "data": {
    "documentId": "doc_123",
    "userId": "user_123",
    "status": "completed",
    "ocrConfidence": 0.92
  }
}
```

## SDKs and Libraries

Official SDKs are available for:

- JavaScript/Node.js
- Python
- PHP
- Ruby

Example JavaScript usage:

```javascript
import { HistorifyAPI } from '@historify/sdk'

const api = new HistorifyAPI({
  apiKey: 'your_api_key',
  baseURL: 'https://api.historify.com/v1'
})

// Upload and process document
const result = await api.documents.upload(file, {
  source: 'Local Archives',
  tags: ['census', '1920']
})
```

## Support

For API support and questions:

- Documentation: https://docs.historify.com
- Support Email: api-support@historify.com
- Status Page: https://status.historify.com
- GitHub Issues: https://github.com/historify/api-issues
