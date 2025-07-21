import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Download,
  Eye,
  Trash2,
  Search,
  Plus,
  BarChart3,
  Clock,
  CheckCircle,
  FileCheck,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { documentsApi } from '../services/api';

const DocumentsPage = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingDocuments, setDeletingDocuments] = useState(new Set());
  const fileInputRef = useRef(null);

  // Load documents from API on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        const response = await documentsApi.getDocuments();

        // Transform documents to match frontend expectations
        const transformedDocuments = (response.data || []).map(doc => {
          let analysis = null;
          if (doc.ai_analysis) {
            try {
              analysis = JSON.parse(doc.ai_analysis);
            } catch (e) {}
          }

          return {
            id: doc.id,
            name: doc.original_filename,
            type: doc.document_type,
            size: formatFileSize(parseInt(doc.file_size)),
            status: doc.is_processed ? 'analyzed' : 'pending',
            uploadDate: doc.created_at,
            summary: analysis?.summary || null,
            insights: analysis?.insights || null,
          };
        });

        setDocuments(transformedDocuments);
      } catch (error) {
        toast.error(
          `Failed to load documents: ${error.response?.data?.error || error.message}`
        );
        setDocuments([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const filteredDocuments = documents.filter(doc => {
    const matchesFilter =
      selectedFilter === 'all' ||
      doc.type.toLowerCase().includes(selectedFilter.toLowerCase());
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // File validation
  const validateFile = file => {
    const allowedTypes = [
      'application/pdf',
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error:
          'File type not supported. Please upload PDF, CSV, or Excel files.',
      };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds 10MB limit.' };
    }

    return { valid: true };
  };

  // Format file size
  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get document type from file
  const getDocumentType = fileName => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes('bank') || lowerName.includes('statement'))
      return 'Bank Statement';
    if (lowerName.includes('credit') || lowerName.includes('card'))
      return 'Credit Card';
    if (
      lowerName.includes('tax') ||
      lowerName.includes('1099') ||
      lowerName.includes('w2')
    )
      return 'Tax Document';
    if (lowerName.includes('investment') || lowerName.includes('portfolio'))
      return 'Investment Report';
    if (lowerName.includes('loan') || lowerName.includes('mortgage'))
      return 'Loan Statement';
    return 'Other Document';
  };

  const handleDrag = e => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = e => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  // Handle file upload
  const handleFileUpload = async files => {
    if (files.length === 0) return;

    // Validate files
    const validFiles = [];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadingFiles(
      validFiles.map(file => ({
        name: file.name,
        size: formatFileSize(file.size),
        progress: 0,
        status: 'uploading',
      }))
    );

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];

        // Update current file progress
        setUploadingFiles(prev =>
          prev.map((f, index) =>
            index === i ? { ...f, status: 'uploading' } : f
          )
        );

        // Create form data for upload
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', getDocumentType(file.name));

        try {
          // Upload to API
          const response = await documentsApi.uploadDocument(formData);

          // Transform response to match frontend expectations
          const newDoc = {
            id: response.data.id,
            name: response.data.original_filename,
            type: response.data.document_type,
            size: formatFileSize(parseInt(response.data.file_size)),
            status: response.data.is_processed ? 'analyzed' : 'pending',
            uploadDate: response.data.created_at,
            summary: null,
            insights: null,
          };

          setDocuments(prev => [newDoc, ...prev]);

          // Mark as complete
          setUploadingFiles(prev =>
            prev.map((f, index) =>
              index === i ? { ...f, status: 'complete', progress: 100 } : f
            )
          );

          setUploadProgress(((i + 1) * 100) / validFiles.length);
        } catch (uploadError) {
          setUploadingFiles(prev =>
            prev.map((f, index) =>
              index === i ? { ...f, status: 'error', progress: 0 } : f
            )
          );

          // Handle duplicate file detection
          if (uploadError.response?.status === 409) {
            toast.error(`${file.name} already exists in your account`, {
              icon: '📁',
              duration: 4000,
            });
          } else {
            toast.error(`Failed to upload ${file.name}`);
          }
        }
      }

      const successCount = uploadingFiles.filter(
        f => f.status === 'complete'
      ).length;
      if (successCount > 0) {
        toast.success(
          `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}`
        );
      }
    } catch (error) {
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => setUploadingFiles([]), 2000);
    }
  };

  // Handle file input change
  const handleFileInputChange = e => {
    const files = Array.from(e.target.files);
    handleFileUpload(files);
    e.target.value = ''; // Reset input
  };

  // Handle choose files button
  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId, documentName) => {
    // Prevent multiple clicks
    if (deletingDocuments.has(documentId)) return;

    // Show confirmation dialog
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm(
      `Are you sure you want to delete "${documentName}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      // Add to deleting set
      setDeletingDocuments(prev => new Set(prev).add(documentId));

      // Call API to delete document
      await documentsApi.deleteDocument(documentId);

      // Remove document from state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      // Show success message
      toast.success(`Successfully deleted "${documentName}"`);
    } catch (error) {
      toast.error('Failed to delete document. Please try again.');
    } finally {
      // Remove from deleting set
      setDeletingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(documentId);
        return newSet;
      });
    }
  };

  // Handle document analysis
  const handleAnalyzeDocument = async (documentId, documentName) => {
    try {
      // Update document status to analyzing
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? { ...doc, status: 'analyzing' } : doc
        )
      );

      // Call API to analyze document
      const response = await documentsApi.analyzeDocument(documentId);

      // Update document with analysis results
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId
            ? {
                ...doc,
                status: 'analyzed',
                summary: response.data.summary,
                insights: response.data.insights || [],
              }
            : doc
        )
      );

      // Show success message
      toast.success(`Successfully analyzed "${documentName}"`);
    } catch (error) {
      // Reset status on error
      setDocuments(prev =>
        prev.map(doc =>
          doc.id === documentId ? { ...doc, status: 'pending' } : doc
        )
      );

      toast.error('Failed to analyze document. Please try again.');
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'analyzed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'analyzing':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'pending':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStatusIcon = status => {
    switch (status) {
      case 'analyzed':
        return <CheckCircle className="h-4 w-4" />;
      case 'analyzing':
        return <Clock className="h-4 w-4 animate-spin" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTypeIcon = type => {
    return <FileText className="h-5 w-5 text-indigo-400" />;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Modern Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">
            <span className="text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text">
              Documents
            </span>
          </h1>
          <p className="text-gray-400 mt-3 text-xl">
            Upload and analyze your financial documents with AI
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-800/50 backdrop-blur border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-gray-800/70 w-64"
            />
          </div>
          <select
            value={selectedFilter}
            onChange={e => setSelectedFilter(e.target.value)}
            className="bg-gray-800/50 backdrop-blur text-white border border-gray-600/50 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all hover:bg-gray-800/70 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="bank">Bank Statements</option>
            <option value="tax">Tax Documents</option>
            <option value="investment">Investment Reports</option>
            <option value="loan">Loan Statements</option>
            <option value="credit">Credit Cards</option>
          </select>
        </div>
      </div>

      {/* Modern Upload Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10 scale-105'
            : 'border-gray-600/50 hover:border-gray-500/50 hover:bg-gray-800/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="max-w-md mx-auto">
          <div className="p-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl inline-block mb-6">
            <Upload className="h-12 w-12 text-indigo-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            {dragActive ? 'Drop files here' : 'Upload Financial Documents'}
          </h3>
          <p className="text-gray-400 mb-8 text-lg">
            Drag and drop files here, or click to select files
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept=".pdf,.csv,.xls,.xlsx"
              className="hidden"
            />
            <button
              onClick={handleChooseFiles}
              disabled={isUploading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-indigo-500/25 hover:scale-105 active:scale-95 flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>{isUploading ? 'Uploading...' : 'Choose Files'}</span>
            </button>
            <div className="text-sm text-gray-400 bg-gray-800/50 backdrop-blur px-4 py-2 rounded-xl border border-gray-700/50">
              PDF, CSV, XLS files supported • Max 10MB
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              Uploading Files
            </h3>
            <span className="text-sm text-gray-400">
              {Math.round(uploadProgress)}%
            </span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2 mb-6">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          <div className="space-y-3">
            {uploadingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    {file.status === 'complete' ? (
                      <FileCheck className="h-4 w-4 text-green-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">{file.size}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-700 rounded-full h-1.5">
                    <div
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${file.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-400 w-8">
                    {file.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modern Documents Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {filteredDocuments.map(doc => (
            <div
              key={doc.id}
              className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-6 hover:bg-gray-950/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/10 rounded-lg group-hover:bg-indigo-500/20 transition-colors">
                    {getTypeIcon(doc.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-base group-hover:text-indigo-300 transition-colors">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {doc.type} • {doc.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-medium border flex items-center space-x-1 ${getStatusColor(doc.status)}`}
                  >
                    {getStatusIcon(doc.status)}
                    <span className="capitalize">{doc.status}</span>
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-400 mb-4 flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
                </span>
              </div>

              {doc.summary && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                    <div className="p-1 bg-purple-500/20 rounded-lg mr-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                    </div>
                    AI Summary
                  </h4>
                  <p className="text-sm text-gray-300 bg-gray-800/50 backdrop-blur p-3 rounded-lg border border-gray-700/50 leading-relaxed">
                    {doc.summary}
                  </p>
                </div>
              )}

              {doc.insights && doc.insights.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                    <div className="p-1 bg-blue-500/20 rounded-lg mr-2">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                    </div>
                    Key Insights
                  </h4>
                  <div className="space-y-2">
                    {doc.insights.map((insight, index) => (
                      <div
                        key={index}
                        className="flex items-start text-sm text-gray-300 bg-gray-800/30 p-2 rounded-lg"
                      >
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mr-2 mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-800/50">
                <div className="flex items-center space-x-3">
                  <button className="flex items-center text-sm text-gray-400 hover:text-indigo-400 transition-colors">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button className="flex items-center text-sm text-gray-400 hover:text-green-400 transition-colors">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  {doc.status === 'analyzed' && (
                    <button
                      onClick={() => handleAnalyzeDocument(doc.id, doc.name)}
                      className="flex items-center text-sm text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Re-analyze
                    </button>
                  )}
                  {doc.status === 'pending' && (
                    <button
                      onClick={() => handleAnalyzeDocument(doc.id, doc.name)}
                      className="flex items-center text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Analyze
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteDocument(doc.id, doc.name)}
                    disabled={deletingDocuments.has(doc.id)}
                    className="flex items-center text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    {deletingDocuments.has(doc.id) ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredDocuments.length === 0 && (
        <div className="text-center py-20">
          <div className="p-6 bg-gray-800/30 rounded-2xl inline-block mb-6">
            <FileText className="h-16 w-16 text-gray-400 mx-auto" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">
            No documents found
          </h3>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            {searchTerm || selectedFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Upload your first document to get started with AI analysis'}
          </p>
        </div>
      )}

      {/* Modern Analysis Tips */}
      <div className="bg-gray-950/30 backdrop-blur border border-gray-800/50 rounded-2xl p-8 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/5">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl mr-3">
            <Sparkles className="h-6 w-6 text-purple-400" />
          </div>
          AI Document Analysis
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg group">
            <div className="p-3 bg-green-500/10 rounded-xl inline-block mb-4 group-hover:bg-green-500/20 transition-colors">
              <FileText className="h-6 w-6 text-green-400" />
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">
              Bank Statements
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Automatically categorize transactions, identify spending patterns,
              and detect unusual activity.
            </p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg group">
            <div className="p-3 bg-blue-500/10 rounded-xl inline-block mb-4 group-hover:bg-blue-500/20 transition-colors">
              <BarChart3 className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">Tax Documents</h3>
            <p className="text-gray-400 leading-relaxed">
              Extract key information, identify deduction opportunities, and
              plan for next year.
            </p>
          </div>
          <div className="bg-gray-800/40 backdrop-blur border border-gray-700/50 p-6 rounded-2xl hover:bg-gray-800/60 transition-all duration-300 hover:shadow-lg group">
            <div className="p-3 bg-purple-500/10 rounded-xl inline-block mb-4 group-hover:bg-purple-500/20 transition-colors">
              <Sparkles className="h-6 w-6 text-purple-400" />
            </div>
            <h3 className="font-bold text-white mb-3 text-lg">
              Investment Reports
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Analyze portfolio performance, asset allocation, and provide
              rebalancing recommendations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
