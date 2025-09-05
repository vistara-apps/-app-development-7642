/**
 * Advanced Search Service for Historify
 * Provides sophisticated search capabilities across documents, events, and links
 */

class SearchService {
  constructor() {
    this.searchIndex = new Map()
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
    ])
  }

  /**
   * Build search index from documents
   */
  buildIndex(documents) {
    this.searchIndex.clear()
    
    documents.forEach(doc => {
      const tokens = this.tokenize(doc.ocrText + ' ' + doc.fileName)
      tokens.forEach(token => {
        if (!this.searchIndex.has(token)) {
          this.searchIndex.set(token, new Set())
        }
        this.searchIndex.get(token).add(doc.documentId)
      })
    })
  }

  /**
   * Tokenize text into searchable terms
   */
  tokenize(text) {
    if (!text) return []
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Replace punctuation with spaces
      .split(/\s+/)
      .filter(token => token.length > 2 && !this.stopWords.has(token))
      .map(token => this.stemWord(token))
  }

  /**
   * Simple stemming algorithm
   */
  stemWord(word) {
    // Simple suffix removal
    const suffixes = ['ing', 'ed', 'er', 'est', 'ly', 'tion', 'sion', 'ness', 'ment']
    
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length)
      }
    }
    
    return word
  }

  /**
   * Advanced search with multiple filters and options
   */
  search(query, documents, options = {}) {
    const {
      filters = {},
      sortBy = 'relevance',
      sortOrder = 'desc',
      limit = 50,
      offset = 0,
      fuzzy = false,
      exactPhrase = false
    } = options

    let results = []

    if (exactPhrase) {
      results = this.phraseSearch(query, documents)
    } else if (fuzzy) {
      results = this.fuzzySearch(query, documents)
    } else {
      results = this.standardSearch(query, documents)
    }

    // Apply filters
    results = this.applyFilters(results, filters)

    // Calculate relevance scores
    results = results.map(result => ({
      ...result,
      relevanceScore: this.calculateRelevance(query, result, documents)
    }))

    // Sort results
    results = this.sortResults(results, sortBy, sortOrder)

    // Apply pagination
    const total = results.length
    results = results.slice(offset, offset + limit)

    return {
      results,
      total,
      query,
      filters,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < total
      }
    }
  }

  /**
   * Standard keyword search
   */
  standardSearch(query, documents) {
    const queryTokens = this.tokenize(query)
    if (queryTokens.length === 0) return documents

    const matchingDocIds = new Set()
    
    queryTokens.forEach(token => {
      if (this.searchIndex.has(token)) {
        this.searchIndex.get(token).forEach(docId => {
          matchingDocIds.add(docId)
        })
      }
    })

    return documents.filter(doc => matchingDocIds.has(doc.documentId))
  }

  /**
   * Exact phrase search
   */
  phraseSearch(query, documents) {
    const normalizedQuery = query.toLowerCase()
    
    return documents.filter(doc => {
      const content = (doc.ocrText + ' ' + doc.fileName).toLowerCase()
      return content.includes(normalizedQuery)
    })
  }

  /**
   * Fuzzy search with edit distance
   */
  fuzzySearch(query, documents) {
    const queryTokens = this.tokenize(query)
    const threshold = 2 // Maximum edit distance
    
    return documents.filter(doc => {
      const docTokens = this.tokenize(doc.ocrText + ' ' + doc.fileName)
      
      return queryTokens.some(queryToken => 
        docTokens.some(docToken => 
          this.editDistance(queryToken, docToken) <= threshold
        )
      )
    })
  }

  /**
   * Calculate edit distance between two strings
   */
  editDistance(str1, str2) {
    const matrix = []
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          )
        }
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  /**
   * Apply various filters to search results
   */
  applyFilters(results, filters) {
    let filtered = [...results]

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(doc => {
        const docDate = new Date(doc.uploadDate)
        const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : new Date('1900-01-01')
        const toDate = filters.dateTo ? new Date(filters.dateTo) : new Date()
        
        return docDate >= fromDate && docDate <= toDate
      })
    }

    // File type filter
    if (filters.fileTypes && filters.fileTypes.length > 0) {
      filtered = filtered.filter(doc => 
        filters.fileTypes.some(type => 
          doc.metadata?.fileType?.includes(type) || doc.fileName.toLowerCase().includes(type)
        )
      )
    }

    // Source filter
    if (filters.sources && filters.sources.length > 0) {
      filtered = filtered.filter(doc => 
        filters.sources.includes(doc.metadata?.source)
      )
    }

    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.some(tag => filters.tags.includes(tag))
      )
    }

    // Size filter
    if (filters.minSize || filters.maxSize) {
      filtered = filtered.filter(doc => {
        const size = doc.metadata?.fileSize || 0
        const minSize = filters.minSize || 0
        const maxSize = filters.maxSize || Infinity
        
        return size >= minSize && size <= maxSize
      })
    }

    return filtered
  }

  /**
   * Calculate relevance score for a document
   */
  calculateRelevance(query, document, allDocuments) {
    const queryTokens = this.tokenize(query)
    const docTokens = this.tokenize(document.ocrText + ' ' + document.fileName)
    
    if (queryTokens.length === 0 || docTokens.length === 0) return 0

    let score = 0
    const docTokenCount = new Map()
    
    // Count token frequencies in document
    docTokens.forEach(token => {
      docTokenCount.set(token, (docTokenCount.get(token) || 0) + 1)
    })

    // Calculate TF-IDF score
    queryTokens.forEach(queryToken => {
      const tf = (docTokenCount.get(queryToken) || 0) / docTokens.length
      const df = this.getDocumentFrequency(queryToken, allDocuments)
      const idf = Math.log(allDocuments.length / (df + 1))
      
      score += tf * idf
    })

    // Boost score for matches in filename
    const filenameTokens = this.tokenize(document.fileName)
    const filenameMatches = queryTokens.filter(token => 
      filenameTokens.includes(token)
    ).length
    
    score += filenameMatches * 0.5

    // Boost score for exact phrase matches
    const content = (document.ocrText + ' ' + document.fileName).toLowerCase()
    if (content.includes(query.toLowerCase())) {
      score += 1.0
    }

    return score
  }

  /**
   * Get document frequency for a term
   */
  getDocumentFrequency(term, documents) {
    return documents.filter(doc => {
      const tokens = this.tokenize(doc.ocrText + ' ' + doc.fileName)
      return tokens.includes(term)
    }).length
  }

  /**
   * Sort search results
   */
  sortResults(results, sortBy, sortOrder) {
    const multiplier = sortOrder === 'desc' ? -1 : 1
    
    return results.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'relevance':
          comparison = (a.relevanceScore || 0) - (b.relevanceScore || 0)
          break
        case 'date':
          comparison = new Date(a.uploadDate) - new Date(b.uploadDate)
          break
        case 'name':
          comparison = a.fileName.localeCompare(b.fileName)
          break
        case 'size':
          comparison = (a.metadata?.fileSize || 0) - (b.metadata?.fileSize || 0)
          break
        default:
          comparison = 0
      }
      
      return comparison * multiplier
    })
  }

  /**
   * Get search suggestions based on partial query
   */
  getSuggestions(partialQuery, documents, limit = 5) {
    if (!partialQuery || partialQuery.length < 2) return []

    const suggestions = new Set()
    const normalizedQuery = partialQuery.toLowerCase()

    // Get suggestions from search index
    for (const [term, docIds] of this.searchIndex.entries()) {
      if (term.startsWith(normalizedQuery) && suggestions.size < limit * 2) {
        suggestions.add(term)
      }
    }

    // Get suggestions from document content
    documents.forEach(doc => {
      const content = doc.ocrText + ' ' + doc.fileName
      const words = content.toLowerCase().match(/\b\w{3,}\b/g) || []
      
      words.forEach(word => {
        if (word.startsWith(normalizedQuery) && suggestions.size < limit * 2) {
          suggestions.add(word)
        }
      })
    })

    return Array.from(suggestions)
      .slice(0, limit)
      .sort((a, b) => a.length - b.length) // Prefer shorter suggestions
  }

  /**
   * Highlight search terms in text
   */
  highlightMatches(text, query, className = 'highlight') {
    if (!text || !query) return text

    const queryTokens = this.tokenize(query)
    let highlightedText = text

    queryTokens.forEach(token => {
      const regex = new RegExp(`\\b${token}\\b`, 'gi')
      highlightedText = highlightedText.replace(regex, `<span class="${className}">$&</span>`)
    })

    return highlightedText
  }

  /**
   * Get search analytics
   */
  getSearchAnalytics(searchHistory) {
    const analytics = {
      totalSearches: searchHistory.length,
      uniqueQueries: new Set(searchHistory.map(s => s.query)).size,
      averageResultsPerSearch: 0,
      topQueries: [],
      searchTrends: []
    }

    if (searchHistory.length === 0) return analytics

    // Calculate average results
    analytics.averageResultsPerSearch = searchHistory.reduce((sum, search) => 
      sum + (search.resultCount || 0), 0
    ) / searchHistory.length

    // Get top queries
    const queryCount = new Map()
    searchHistory.forEach(search => {
      queryCount.set(search.query, (queryCount.get(search.query) || 0) + 1)
    })

    analytics.topQueries = Array.from(queryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([query, count]) => ({ query, count }))

    // Get search trends (searches per day for last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const dailySearches = new Map()
    searchHistory
      .filter(search => new Date(search.timestamp) >= thirtyDaysAgo)
      .forEach(search => {
        const date = new Date(search.timestamp).toDateString()
        dailySearches.set(date, (dailySearches.get(date) || 0) + 1)
      })

    analytics.searchTrends = Array.from(dailySearches.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    return analytics
  }
}

// Export singleton instance
export const searchService = new SearchService()
export default searchService
