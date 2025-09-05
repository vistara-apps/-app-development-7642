import React, { useState } from 'react'
import { Upload, File, CheckCircle, Loader, X, AlertCircle } from 'lucide-react'
import { apiService } from '../services/api'
import { subscriptionService } from '../services/subscription'
import { handleFileUploadError, handleOCRError, validateFile } from '../utils/errorHandler'

const DocumentUpload = ({ onDocumentAdded, user }) => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState([])
  const [errors, setErrors] = useState([])
  const [uploadProgress, setUploadProgress] = useState({})

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList)
    const validatedFiles = []
    const newErrors = []

    // Check subscription limits
    if (!subscriptionService.canPerformAction(user, 'upload_document', newFiles.length)) {
      const subscription = subscriptionService.getCurrentSubscription(user)
      newErrors.push({
        id: 'subscription_limit',
        message: `Upload limit reached. You can upload ${subscription.features.uploadLimit} documents per month.`,
        type: 'subscription'
      })
      setErrors(prev => [...prev, ...newErrors])
      return
    }

    newFiles.forEach(file => {
      const validation = validateFile(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff']
      })

      if (validation.isValid) {
        validatedFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          name: file.name,
          size: file.size,
          status: 'pending'
        })
      } else {
        newErrors.push({
          id: Math.random().toString(36).substr(2, 9),
          message: `${file.name}: ${validation.errors.join(', ')}`,
          type: 'validation'
        })
      }
    })

    if (newErrors.length > 0) {
      setErrors(prev => [...prev, ...newErrors])
    }

    if (validatedFiles.length > 0) {
      setFiles(prev => [...prev, ...validatedFiles])
      processFiles(validatedFiles)
    }
  }

  const processFiles = async (filesToProcess) => {
    for (const fileItem of filesToProcess) {
      try {
        setProcessing(prev => [...prev, fileItem.id])
        
        // Update file status to uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading' } : f
        ))
        
        // Upload file to storage
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 0 }))
        const uploadResult = await apiService.uploadFile(fileItem.file, {
          source: 'User Upload',
          uploadedBy: user.userId
        })
        
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 50 }))
        
        // Update file status to processing OCR
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'processing' } : f
        ))
        
        // Process OCR
        const ocrResult = await apiService.processOCR(fileItem.file, {
          provider: 'ocr.space',
          language: 'eng'
        })
        
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 90 }))
        
        // Create document record
        const documentData = {
          fileName: fileItem.name,
          ocrText: ocrResult.text,
          ocrConfidence: ocrResult.confidence,
          ocrProvider: ocrResult.provider,
          metadata: {
            source: 'User Upload',
            fileSize: fileItem.size,
            fileType: fileItem.file.type,
            uploadedBy: user.userId
          },
          fileUrl: uploadResult.fileUrl,
          linkedDocuments: []
        }
        
        const savedDocument = await apiService.saveDocument(documentData)
        
        // Update usage statistics
        subscriptionService.updateUsage(user.userId, 'upload_document', 1)
        subscriptionService.updateUsage(user.userId, 'use_storage', fileItem.size)
        subscriptionService.updateUsage(user.userId, 'process_ocr', 1)
        
        setUploadProgress(prev => ({ ...prev, [fileItem.id]: 100 }))
        
        // Update file status to completed
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'completed', document: savedDocument } : f
        ))
        
        // Add to documents list
        onDocumentAdded(savedDocument)
        
      } catch (error) {
        console.error('File processing error:', error)
        
        // Handle different types of errors
        let errorMessage
        if (error.message?.includes('OCR')) {
          errorMessage = handleOCRError(error, fileItem.file)
        } else {
          errorMessage = handleFileUploadError(error, fileItem.file)
        }
        
        // Update file status to error
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { 
            ...f, 
            status: 'error', 
            error: errorMessage.message 
          } : f
        ))
        
        // Add error to errors list
        setErrors(prev => [...prev, {
          id: fileItem.id,
          message: errorMessage.message,
          type: 'processing'
        }])
      } finally {
        setProcessing(prev => prev.filter(id => id !== fileItem.id))
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[fileItem.id]
          return newProgress
        })
      }
    }
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const removeError = (errorId) => {
    setErrors(prev => prev.filter(e => e.id !== errorId))
  }

  const retryFile = (fileId) => {
    const file = files.find(f => f.id === fileId)
    if (file) {
      processFiles([file])
    }
  }

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Get subscription info for display
  const subscription = user ? subscriptionService.getCurrentSubscription(user) : null
  const usageDisplay = user ? subscriptionService.getUsageDisplay(user) : null

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
        <p className="text-gray-600">
          Upload historical documents to digitize and make them searchable. 
          Supported formats: PDF, JPG, PNG, TIFF
        </p>
        
        {/* Subscription Status */}
        {subscription && usageDisplay && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-900">
                {subscription.name} Plan
              </span>
              <span className="text-sm text-blue-700">
                {usageDisplay.uploads.used}/{usageDisplay.uploads.limit} uploads used
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${usageDisplay.uploads.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mb-6 space-y-2">
          {errors.map(error => (
            <div key={error.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-sm text-red-800">{error.message}</span>
              </div>
              <button
                onClick={() => removeError(error.id)}
                className="text-red-600 hover:text-red-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-card p-8 mb-8">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.tiff,.tif"
            onChange={handleChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Drop files here or click to browse
          </h3>
          <p className="text-gray-600 mb-4">
            Select multiple files to upload and process
          </p>
          <p className="text-sm text-gray-500">
            Maximum file size: 50MB per file
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white rounded-lg shadow-card">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Processing Queue ({files.length})
            </h2>
            {files.some(f => f.status === 'completed') && (
              <button
                onClick={clearCompleted}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear Completed
              </button>
            )}
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map(fileItem => (
              <div key={fileItem.id} className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <File className="h-8 w-8 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {fileItem.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(fileItem.size)}
                    </p>
                    
                    {/* Progress Bar */}
                    {uploadProgress[fileItem.id] !== undefined && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress[fileItem.id]}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadProgress[fileItem.id]}% complete
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {fileItem.status === 'pending' && (
                      <span className="text-sm text-gray-500">Waiting...</span>
                    )}
                    {fileItem.status === 'uploading' && (
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                        <span className="text-sm text-blue-600">Uploading...</span>
                      </div>
                    )}
                    {fileItem.status === 'processing' && (
                      <div className="flex items-center space-x-2">
                        <Loader className="h-4 w-4 text-purple-600 animate-spin" />
                        <span className="text-sm text-purple-600">Processing OCR...</span>
                      </div>
                    )}
                    {fileItem.status === 'completed' && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Completed</span>
                      </div>
                    )}
                    {fileItem.status === 'error' && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-600">Error</span>
                        <button
                          onClick={() => retryFile(fileItem.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Retry
                        </button>
                      </div>
                    )}
                    
                    <button
                      onClick={() => removeFile(fileItem.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Error Message */}
                {fileItem.status === 'error' && fileItem.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-800">{fileItem.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentUpload
