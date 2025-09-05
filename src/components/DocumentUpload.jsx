import React, { useState } from 'react'
import { Upload, File, CheckCircle, Loader, X } from 'lucide-react'

const DocumentUpload = ({ onDocumentAdded }) => {
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const [processing, setProcessing] = useState([])

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
    const newFiles = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      status: 'pending'
    }))
    
    setFiles(prev => [...prev, ...newFiles])
    processFiles(newFiles)
  }

  const processFiles = async (filesToProcess) => {
    for (const fileItem of filesToProcess) {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'processing' } : f
      ))
      
      // Simulate OCR processing
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))
      
      // Mock OCR result
      const mockOcrText = `Historical document content from ${fileItem.name}. This is a sample OCR result that would contain the actual text extracted from the document. The text might include names, dates, addresses, and other historical information relevant to local research.`
      
      const document = {
        documentId: Math.random().toString(36).substr(2, 9),
        fileName: fileItem.name,
        uploadDate: new Date().toISOString(),
        ocrText: mockOcrText,
        metadata: {
          source: 'User Upload',
          fileSize: fileItem.size,
          fileType: fileItem.file.type
        },
        linkedDocuments: []
      }
      
      onDocumentAdded(document)
      
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'completed' } : f
      ))
    }
  }

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Documents</h1>
        <p className="text-gray-600">
          Upload historical documents to digitize and make them searchable. 
          Supported formats: PDF, JPG, PNG, TIFF
        </p>
      </div>

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
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Processing Queue ({files.length})
            </h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {files.map(fileItem => (
              <div key={fileItem.id} className="p-6 flex items-center space-x-4">
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
                </div>
                
                <div className="flex items-center space-x-2">
                  {fileItem.status === 'pending' && (
                    <span className="text-sm text-gray-500">Waiting...</span>
                  )}
                  {fileItem.status === 'processing' && (
                    <div className="flex items-center space-x-2">
                      <Loader className="h-4 w-4 text-blue-600 animate-spin" />
                      <span className="text-sm text-blue-600">Processing OCR...</span>
                    </div>
                  )}
                  {fileItem.status === 'completed' && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Completed</span>
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
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentUpload