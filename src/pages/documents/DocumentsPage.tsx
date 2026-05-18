import React, { useState, useEffect, useRef } from 'react';
import { FileText, Upload, Download, Trash2, Share2, File, Image, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import api from '../../lib/api';

// ✅ Safe date formatter
const formatTime = (dateValue: string | Date | undefined | null): string => {
  if (!dateValue) return 'recently';
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'recently';
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return 'recently';
  }
};

// ✅ Get file icon based on type
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return <FileText size={24} className="text-red-500" />;
    case 'doc':
    case 'docx':
      return <FileText size={24} className="text-blue-500" />;
    case 'xls':
    case 'xlsx':
      return <FileText size={24} className="text-green-500" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
      return <Image size={24} className="text-purple-500" />;
    default:
      return <File size={24} className="text-gray-500" />;
  }
};

// ✅ Format file size
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const DocumentsPage: React.FC = () => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'shared' | 'owned'>('all');

  // ✅ Fetch documents from backend
  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    if (!user?._id) return;

    try {
      setLoading(true);
      const response = await api.get('/docs');
      console.log('Documents:', response.data);
      setDocuments(response.data.documents || response.data || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Upload document
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/docs/upload-document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('Upload response:', response.data);

      // Add new document to list
      const newDoc = response.data.document || response.data;
      setDocuments((prev) => [newDoc, ...prev]);

    } catch (error) {
      console.error('Failed to upload document:', error);
      alert('Failed to upload document');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // ✅ Delete document
  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/docs/${docId}`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== docId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  // ✅ Share document
  const handleShare = async (docId: string) => {
    const shareWithEmail = prompt('Enter email to share with:');
    if (!shareWithEmail) return;

    try {
      await api.post(`/docs/${docId}/share`, {
        email: shareWithEmail
      });
      alert('Document shared successfully!');
      fetchDocuments(); // Refresh
    } catch (error) {
      console.error('Failed to share document:', error);
      alert('Failed to share document');
    }
  };

  // ✅ Download document
  const handleDownload = async (doc: any) => {
    try {
      const response = await api.get(`/docs/${doc._id}`, {
        responseType: 'blob'
      });

      // If backend returns file URL instead
      if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank');
        return;
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.name || doc.fileName || 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download document:', error);
      // Fallback: try opening URL directly
      if (doc.fileUrl) {
        window.open(doc.fileUrl, '_blank');
      }
    }
  };

  // ✅ Filter documents
  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'shared') return doc.shared || doc.sharedWith?.length > 0;
    if (filter === 'owned') return doc.uploadedBy === user?._id || doc.owner === user?._id;
    return true;
  });

  // ✅ Calculate storage
  const totalSize = documents.reduce((acc, doc) => acc + (doc.size || doc.fileSize || 0), 0);
  const maxStorage = 20 * 1024 * 1024 * 1024; // 20GB
  const usagePercent = Math.min((totalSize / maxStorage) * 100, 100);

  if (!user) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your startup's important files</p>
        </div>

        {/* ✅ Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleUpload}
          className="hidden"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
        />

        <Button
          leftIcon={<Upload size={18} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Document'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Storage info */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Storage</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used</span>
                <span className="font-medium text-gray-900">
                  {formatFileSize(totalSize)}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full">
                <div
                  className="h-2 bg-primary-600 rounded-full transition-all"
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total files</span>
                <span className="font-medium text-gray-900">
                  {documents.length}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Filter</h3>
              <div className="space-y-1">
                {(['all', 'owned', 'shared'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md capitalize ${
                      filter === f
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {f === 'all' ? 'All Files' : `${f} Files`}
                  </button>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Document list */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Documents
              </h2>
              <span className="text-sm text-gray-500">
                {filteredDocuments.length} files
              </span>
            </CardHeader>

            <CardBody>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-2">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                    >
                      <div className="p-2 bg-gray-50 rounded-lg mr-4">
                        {getFileIcon(doc.name || doc.fileName || '')}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {doc.name || doc.fileName || 'Untitled'}
                          </h3>
                          {(doc.shared || doc.sharedWith?.length > 0) && (
                            <Badge variant="secondary" size="sm">Shared</Badge>
                          )}
                          {doc.signed && (
                            <Badge variant="success" size="sm">Signed</Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{formatFileSize(doc.size || doc.fileSize || 0)}</span>
                          <span>Modified {formatTime(doc.updatedAt || doc.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => handleDownload(doc)}
                        >
                          <Download size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2"
                          onClick={() => handleShare(doc._id)}
                        >
                          <Share2 size={18} />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-2 text-red-500 hover:text-red-700"
                          onClick={() => handleDelete(doc._id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No documents yet</h3>
                  <p className="text-gray-500 mt-1">Upload your first document to get started</p>
                  <Button
                    className="mt-4"
                    leftIcon={<Upload size={18} />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Document
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};