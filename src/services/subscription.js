/**
 * Subscription Management Service for Historify
 * Handles subscription tiers, limits, and billing
 */

export const SUBSCRIPTION_TIERS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: {
      uploadLimit: 10,
      storageLimit: 100, // MB
      ocrProcessing: 50, // pages per month
      advancedSearch: false,
      priorityProcessing: false,
      collaborationTools: false,
      exportFormats: ['PDF'],
      supportLevel: 'community'
    },
    description: 'Perfect for getting started with local history research'
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 5,
    currency: 'USD',
    interval: 'month',
    features: {
      uploadLimit: 100,
      storageLimit: 1000, // MB (1GB)
      ocrProcessing: 500, // pages per month
      advancedSearch: true,
      priorityProcessing: false,
      collaborationTools: false,
      exportFormats: ['PDF', 'CSV', 'JSON'],
      supportLevel: 'email'
    },
    description: 'Ideal for serious researchers and local historians'
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 15,
    currency: 'USD',
    interval: 'month',
    features: {
      uploadLimit: 1000,
      storageLimit: 10000, // MB (10GB)
      ocrProcessing: 2000, // pages per month
      advancedSearch: true,
      priorityProcessing: true,
      collaborationTools: true,
      exportFormats: ['PDF', 'CSV', 'JSON', 'XML', 'DOCX'],
      supportLevel: 'priority'
    },
    description: 'Full-featured plan for professional historians and institutions'
  }
}

class SubscriptionService {
  constructor() {
    this.currentUser = null
    this.usage = this.loadUsage()
  }

  /**
   * Get current user's subscription details
   */
  getCurrentSubscription(user) {
    if (!user) return null
    
    const tier = user.subscriptionTier || 'free'
    return {
      ...SUBSCRIPTION_TIERS[tier.toUpperCase()],
      userId: user.userId,
      startDate: user.subscriptionStartDate || new Date().toISOString(),
      nextBillingDate: this.calculateNextBillingDate(user.subscriptionStartDate),
      status: user.subscriptionStatus || 'active'
    }
  }

  /**
   * Check if user can perform an action based on their subscription limits
   */
  canPerformAction(user, action, amount = 1) {
    const subscription = this.getCurrentSubscription(user)
    if (!subscription) return false

    const usage = this.getUserUsage(user.userId)
    const features = subscription.features

    switch (action) {
      case 'upload_document':
        return usage.documentsUploaded + amount <= features.uploadLimit
      
      case 'process_ocr':
        return usage.ocrPagesProcessed + amount <= features.ocrProcessing
      
      case 'use_storage':
        return usage.storageUsed + amount <= features.storageLimit * 1024 * 1024 // Convert MB to bytes
      
      case 'advanced_search':
        return features.advancedSearch
      
      case 'priority_processing':
        return features.priorityProcessing
      
      case 'collaboration':
        return features.collaborationTools
      
      case 'export_format':
        return features.exportFormats.includes(amount) // amount is format in this case
      
      default:
        return false
    }
  }

  /**
   * Get user's current usage statistics
   */
  getUserUsage(userId) {
    const defaultUsage = {
      userId,
      documentsUploaded: 0,
      storageUsed: 0,
      ocrPagesProcessed: 0,
      searchesPerformed: 0,
      lastResetDate: new Date().toISOString(),
      currentPeriodStart: this.getCurrentPeriodStart()
    }

    return this.usage[userId] || defaultUsage
  }

  /**
   * Update user usage statistics
   */
  updateUsage(userId, action, amount = 1) {
    if (!this.usage[userId]) {
      this.usage[userId] = this.getUserUsage(userId)
    }

    const usage = this.usage[userId]
    
    // Reset usage if new billing period
    if (this.isNewBillingPeriod(usage.currentPeriodStart)) {
      usage.documentsUploaded = 0
      usage.ocrPagesProcessed = 0
      usage.searchesPerformed = 0
      usage.currentPeriodStart = this.getCurrentPeriodStart()
    }

    switch (action) {
      case 'upload_document':
        usage.documentsUploaded += amount
        break
      
      case 'process_ocr':
        usage.ocrPagesProcessed += amount
        break
      
      case 'use_storage':
        usage.storageUsed += amount
        break
      
      case 'search':
        usage.searchesPerformed += amount
        break
    }

    this.saveUsage()
    return usage
  }

  /**
   * Get usage percentage for a specific limit
   */
  getUsagePercentage(user, limitType) {
    const subscription = this.getCurrentSubscription(user)
    const usage = this.getUserUsage(user.userId)
    
    if (!subscription) return 0

    const features = subscription.features

    switch (limitType) {
      case 'uploads':
        return Math.min((usage.documentsUploaded / features.uploadLimit) * 100, 100)
      
      case 'storage':
        const storageLimit = features.storageLimit * 1024 * 1024 // Convert MB to bytes
        return Math.min((usage.storageUsed / storageLimit) * 100, 100)
      
      case 'ocr':
        return Math.min((usage.ocrPagesProcessed / features.ocrProcessing) * 100, 100)
      
      default:
        return 0
    }
  }

  /**
   * Get formatted usage display
   */
  getUsageDisplay(user) {
    const subscription = this.getCurrentSubscription(user)
    const usage = this.getUserUsage(user.userId)
    
    if (!subscription) return null

    const features = subscription.features

    return {
      uploads: {
        used: usage.documentsUploaded,
        limit: features.uploadLimit,
        percentage: this.getUsagePercentage(user, 'uploads'),
        unit: 'documents'
      },
      storage: {
        used: Math.round(usage.storageUsed / (1024 * 1024)), // Convert to MB
        limit: features.storageLimit,
        percentage: this.getUsagePercentage(user, 'storage'),
        unit: 'MB'
      },
      ocr: {
        used: usage.ocrPagesProcessed,
        limit: features.ocrProcessing,
        percentage: this.getUsagePercentage(user, 'ocr'),
        unit: 'pages'
      }
    }
  }

  /**
   * Upgrade user subscription
   */
  async upgradeSubscription(userId, newTier) {
    try {
      // In production, this would integrate with Stripe, PayPal, etc.
      const user = JSON.parse(localStorage.getItem('historify_user') || '{}')
      
      if (user.userId === userId) {
        user.subscriptionTier = newTier
        user.subscriptionStartDate = new Date().toISOString()
        user.subscriptionStatus = 'active'
        
        localStorage.setItem('historify_user', JSON.stringify(user))
        
        return {
          success: true,
          subscription: this.getCurrentSubscription(user)
        }
      }
      
      throw new Error('User not found')
    } catch (error) {
      console.error('Subscription upgrade failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Cancel user subscription
   */
  async cancelSubscription(userId) {
    try {
      const user = JSON.parse(localStorage.getItem('historify_user') || '{}')
      
      if (user.userId === userId) {
        user.subscriptionStatus = 'cancelled'
        user.subscriptionEndDate = this.calculateNextBillingDate(user.subscriptionStartDate)
        
        localStorage.setItem('historify_user', JSON.stringify(user))
        
        return {
          success: true,
          message: 'Subscription cancelled. Access will continue until the end of the current billing period.'
        }
      }
      
      throw new Error('User not found')
    } catch (error) {
      console.error('Subscription cancellation failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Get subscription comparison data
   */
  getSubscriptionComparison() {
    return Object.values(SUBSCRIPTION_TIERS).map(tier => ({
      ...tier,
      popular: tier.id === 'basic', // Mark Basic as popular
      features: Object.entries(tier.features).map(([key, value]) => ({
        name: this.formatFeatureName(key),
        value: this.formatFeatureValue(key, value),
        included: this.isFeatureIncluded(key, value)
      }))
    }))
  }

  /**
   * Helper methods
   */
  calculateNextBillingDate(startDate) {
    if (!startDate) return null
    
    const start = new Date(startDate)
    const next = new Date(start)
    next.setMonth(next.getMonth() + 1)
    
    return next.toISOString()
  }

  getCurrentPeriodStart() {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  }

  isNewBillingPeriod(lastPeriodStart) {
    const current = this.getCurrentPeriodStart()
    return current !== lastPeriodStart
  }

  formatFeatureName(key) {
    const names = {
      uploadLimit: 'Document Uploads',
      storageLimit: 'Storage Space',
      ocrProcessing: 'OCR Processing',
      advancedSearch: 'Advanced Search',
      priorityProcessing: 'Priority Processing',
      collaborationTools: 'Collaboration Tools',
      exportFormats: 'Export Formats',
      supportLevel: 'Support Level'
    }
    return names[key] || key
  }

  formatFeatureValue(key, value) {
    switch (key) {
      case 'uploadLimit':
        return `${value} documents/month`
      case 'storageLimit':
        return value >= 1000 ? `${value / 1000}GB` : `${value}MB`
      case 'ocrProcessing':
        return `${value} pages/month`
      case 'exportFormats':
        return Array.isArray(value) ? value.join(', ') : value
      case 'supportLevel':
        return value.charAt(0).toUpperCase() + value.slice(1)
      default:
        return typeof value === 'boolean' ? (value ? 'Included' : 'Not included') : value
    }
  }

  isFeatureIncluded(key, value) {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value > 0
    if (Array.isArray(value)) return value.length > 0
    return true
  }

  loadUsage() {
    try {
      return JSON.parse(localStorage.getItem('historify_usage') || '{}')
    } catch {
      return {}
    }
  }

  saveUsage() {
    localStorage.setItem('historify_usage', JSON.stringify(this.usage))
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService()
export default subscriptionService
