/**
 * Error Handling Utilities for Historify
 * Provides centralized error handling, logging, and user-friendly error messages
 */

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  AUTHORIZATION: 'AUTHORIZATION_ERROR',
  FILE_UPLOAD: 'FILE_UPLOAD_ERROR',
  OCR_PROCESSING: 'OCR_PROCESSING_ERROR',
  SUBSCRIPTION: 'SUBSCRIPTION_ERROR',
  STORAGE: 'STORAGE_ERROR',
  SEARCH: 'SEARCH_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
}

class ErrorHandler {
  constructor() {
    this.errorLog = []
    this.maxLogSize = 1000
    this.setupGlobalErrorHandlers()
  }

  /**
   * Setup global error handlers
   */
  setupGlobalErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, ERROR_TYPES.UNKNOWN, ERROR_SEVERITY.HIGH)
      event.preventDefault()
    })

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error, ERROR_TYPES.UNKNOWN, ERROR_SEVERITY.HIGH)
    })
  }

  /**
   * Main error handling method
   */
  handleError(error, type = ERROR_TYPES.UNKNOWN, severity = ERROR_SEVERITY.MEDIUM, context = {}) {
    const errorInfo = this.processError(error, type, severity, context)
    
    // Log the error
    this.logError(errorInfo)
    
    // Report to external service (in production)
    this.reportError(errorInfo)
    
    // Return user-friendly error message
    return this.getUserFriendlyMessage(errorInfo)
  }

  /**
   * Process and normalize error information
   */
  processError(error, type, severity, context) {
    const timestamp = new Date().toISOString()
    const errorId = this.generateErrorId()
    
    let message = 'An unexpected error occurred'
    let stack = null
    let code = null

    if (error instanceof Error) {
      message = error.message
      stack = error.stack
      code = error.code
    } else if (typeof error === 'string') {
      message = error
    } else if (error && typeof error === 'object') {
      message = error.message || error.error || JSON.stringify(error)
      code = error.code || error.status
    }

    return {
      id: errorId,
      timestamp,
      type,
      severity,
      message,
      stack,
      code,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId()
    }
  }

  /**
   * Log error to internal storage
   */
  logError(errorInfo) {
    this.errorLog.unshift(errorInfo)
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize)
    }

    // Store in localStorage for persistence
    try {
      const recentErrors = this.errorLog.slice(0, 100) // Store only recent errors
      localStorage.setItem('historify_error_log', JSON.stringify(recentErrors))
    } catch (e) {
      console.warn('Failed to store error log:', e)
    }

    // Console logging based on severity
    switch (errorInfo.severity) {
      case ERROR_SEVERITY.LOW:
        console.info('Historify Error (Low):', errorInfo)
        break
      case ERROR_SEVERITY.MEDIUM:
        console.warn('Historify Error (Medium):', errorInfo)
        break
      case ERROR_SEVERITY.HIGH:
      case ERROR_SEVERITY.CRITICAL:
        console.error('Historify Error (High/Critical):', errorInfo)
        break
    }
  }

  /**
   * Report error to external monitoring service
   */
  reportError(errorInfo) {
    // In production, this would send to services like Sentry, LogRocket, etc.
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // this.sendToErrorService(errorInfo)
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(errorInfo) {
    const messages = {
      [ERROR_TYPES.NETWORK]: {
        title: 'Connection Problem',
        message: 'Please check your internet connection and try again.',
        action: 'Retry'
      },
      [ERROR_TYPES.VALIDATION]: {
        title: 'Invalid Input',
        message: 'Please check your input and try again.',
        action: 'Fix Input'
      },
      [ERROR_TYPES.AUTHENTICATION]: {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
        action: 'Log In'
      },
      [ERROR_TYPES.AUTHORIZATION]: {
        title: 'Access Denied',
        message: 'You don\'t have permission to perform this action.',
        action: 'Contact Support'
      },
      [ERROR_TYPES.FILE_UPLOAD]: {
        title: 'Upload Failed',
        message: 'There was a problem uploading your file. Please try again.',
        action: 'Retry Upload'
      },
      [ERROR_TYPES.OCR_PROCESSING]: {
        title: 'Processing Failed',
        message: 'We couldn\'t process your document. Please try with a different file.',
        action: 'Try Again'
      },
      [ERROR_TYPES.SUBSCRIPTION]: {
        title: 'Subscription Issue',
        message: 'There\'s an issue with your subscription. Please check your account.',
        action: 'View Account'
      },
      [ERROR_TYPES.STORAGE]: {
        title: 'Storage Error',
        message: 'There was a problem saving your data. Please try again.',
        action: 'Retry'
      },
      [ERROR_TYPES.SEARCH]: {
        title: 'Search Error',
        message: 'Search is temporarily unavailable. Please try again later.',
        action: 'Retry Search'
      },
      [ERROR_TYPES.UNKNOWN]: {
        title: 'Something Went Wrong',
        message: 'An unexpected error occurred. Our team has been notified.',
        action: 'Refresh Page'
      }
    }

    const defaultMessage = messages[ERROR_TYPES.UNKNOWN]
    const errorMessage = messages[errorInfo.type] || defaultMessage

    return {
      ...errorMessage,
      errorId: errorInfo.id,
      timestamp: errorInfo.timestamp,
      severity: errorInfo.severity,
      canRetry: this.canRetry(errorInfo.type),
      technicalDetails: process.env.NODE_ENV === 'development' ? errorInfo.message : null
    }
  }

  /**
   * Determine if an error type can be retried
   */
  canRetry(errorType) {
    const retryableErrors = [
      ERROR_TYPES.NETWORK,
      ERROR_TYPES.FILE_UPLOAD,
      ERROR_TYPES.OCR_PROCESSING,
      ERROR_TYPES.STORAGE,
      ERROR_TYPES.SEARCH
    ]
    
    return retryableErrors.includes(errorType)
  }

  /**
   * Specific error handlers for different scenarios
   */
  
  // File upload errors
  handleFileUploadError(error, file) {
    const context = {
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    }
    
    let type = ERROR_TYPES.FILE_UPLOAD
    let message = 'File upload failed'
    
    if (error.message?.includes('size')) {
      message = 'File is too large. Please choose a smaller file.'
    } else if (error.message?.includes('type')) {
      message = 'File type not supported. Please choose a PDF, JPG, or PNG file.'
    } else if (error.message?.includes('network')) {
      type = ERROR_TYPES.NETWORK
      message = 'Upload failed due to connection issues.'
    }
    
    return this.handleError(message, type, ERROR_SEVERITY.MEDIUM, context)
  }

  // OCR processing errors
  handleOCRError(error, file) {
    const context = {
      fileName: file?.name,
      ocrProvider: error.provider || 'unknown'
    }
    
    let message = 'Document processing failed'
    
    if (error.message?.includes('confidence')) {
      message = 'Document quality is too low for accurate text extraction.'
    } else if (error.message?.includes('language')) {
      message = 'Document language not supported.'
    } else if (error.message?.includes('quota')) {
      message = 'Processing limit reached. Please try again later.'
    }
    
    return this.handleError(message, ERROR_TYPES.OCR_PROCESSING, ERROR_SEVERITY.MEDIUM, context)
  }

  // Authentication errors
  handleAuthError(error) {
    const context = {
      action: error.action || 'unknown'
    }
    
    let message = 'Authentication failed'
    
    if (error.message?.includes('expired')) {
      message = 'Your session has expired. Please log in again.'
    } else if (error.message?.includes('invalid')) {
      message = 'Invalid credentials. Please check your email and password.'
    } else if (error.message?.includes('blocked')) {
      message = 'Account temporarily blocked. Please try again later.'
    }
    
    return this.handleError(message, ERROR_TYPES.AUTHENTICATION, ERROR_SEVERITY.HIGH, context)
  }

  // Subscription errors
  handleSubscriptionError(error, action) {
    const context = {
      action,
      subscriptionTier: error.tier || 'unknown'
    }
    
    let message = 'Subscription error'
    
    if (error.message?.includes('limit')) {
      message = 'You\'ve reached your subscription limit. Please upgrade your plan.'
    } else if (error.message?.includes('payment')) {
      message = 'Payment failed. Please update your payment method.'
    } else if (error.message?.includes('cancelled')) {
      message = 'Your subscription has been cancelled.'
    }
    
    return this.handleError(message, ERROR_TYPES.SUBSCRIPTION, ERROR_SEVERITY.HIGH, context)
  }

  // Network errors
  handleNetworkError(error, request) {
    const context = {
      url: request?.url,
      method: request?.method,
      status: error.status
    }
    
    let message = 'Network error'
    let severity = ERROR_SEVERITY.MEDIUM
    
    if (error.status === 0) {
      message = 'No internet connection. Please check your network.'
      severity = ERROR_SEVERITY.HIGH
    } else if (error.status >= 500) {
      message = 'Server error. Please try again later.'
      severity = ERROR_SEVERITY.HIGH
    } else if (error.status === 404) {
      message = 'Requested resource not found.'
    } else if (error.status === 403) {
      message = 'Access denied.'
      severity = ERROR_SEVERITY.HIGH
    }
    
    return this.handleError(message, ERROR_TYPES.NETWORK, severity, context)
  }

  /**
   * Validation helpers
   */
  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff'],
      maxFiles = 10
    } = options

    const errors = []

    if (!file) {
      errors.push('No file selected')
    } else {
      if (file.size > maxSize) {
        errors.push(`File size exceeds ${Math.round(maxSize / (1024 * 1024))}MB limit`)
      }
      
      if (!allowedTypes.includes(file.type)) {
        errors.push(`File type ${file.type} not supported`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return {
      isValid: emailRegex.test(email),
      errors: emailRegex.test(email) ? [] : ['Invalid email format']
    }
  }

  validatePassword(password) {
    const errors = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Utility methods
   */
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  getCurrentUserId() {
    try {
      const user = JSON.parse(localStorage.getItem('historify_user') || '{}')
      return user.userId || 'anonymous'
    } catch {
      return 'anonymous'
    }
  }

  getErrorLog(limit = 50) {
    return this.errorLog.slice(0, limit)
  }

  clearErrorLog() {
    this.errorLog = []
    localStorage.removeItem('historify_error_log')
  }

  getErrorStats() {
    const stats = {
      total: this.errorLog.length,
      byType: {},
      bySeverity: {},
      recent: this.errorLog.slice(0, 10)
    }

    this.errorLog.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1
    })

    return stats
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler()

// Export convenience functions
export const handleError = (error, type, severity, context) => 
  errorHandler.handleError(error, type, severity, context)

export const handleFileUploadError = (error, file) => 
  errorHandler.handleFileUploadError(error, file)

export const handleOCRError = (error, file) => 
  errorHandler.handleOCRError(error, file)

export const handleAuthError = (error) => 
  errorHandler.handleAuthError(error)

export const handleSubscriptionError = (error, action) => 
  errorHandler.handleSubscriptionError(error, action)

export const handleNetworkError = (error, request) => 
  errorHandler.handleNetworkError(error, request)

export const validateFile = (file, options) => 
  errorHandler.validateFile(file, options)

export const validateEmail = (email) => 
  errorHandler.validateEmail(email)

export const validatePassword = (password) => 
  errorHandler.validatePassword(password)

export default errorHandler
