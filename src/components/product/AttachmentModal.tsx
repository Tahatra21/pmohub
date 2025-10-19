import React, { useState, useEffect } from 'react';
import { X, Upload, Download, Trash2, File, AlertCircle } from 'lucide-react';

interface Attachment {
  id: string;
  nama_file: string;
  path_file: string;
  tipe_file: string;
  ukuran_file: string;
  created_at: string;
}

interface Product {
  id: string;
  produk: string;
}

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const AttachmentModal: React.FC<AttachmentModalProps> = ({
  isOpen,
  onClose,
  product
}) => {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // Fetch attachments when modal opens
  useEffect(() => {
    if (isOpen && product) {
      fetchAttachments();
    }
  }, [isOpen, product]);

  const fetchAttachments = async () => {
    if (!product) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lifecycle/products/${product.id}/attachments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setAttachments(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch attachments');
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
      setError('An error occurred while fetching attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !product) return;

    setUploading(true);
    setError('');

    try {
      // For now, we'll simulate file upload since we don't have actual file storage
      // In a real implementation, you would upload to a file storage service
      const mockAttachment = {
        nama_file: file.name,
        path_file: `/uploads/${file.name}`,
        tipe_file: file.type,
        ukuran_file: file.size.toString()
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lifecycle/products/${product.id}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(mockAttachment)
      });

      const data = await response.json();
      if (data.success) {
        // Refresh attachments list
        fetchAttachments();
      } else {
        setError(data.message || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('An error occurred while uploading the file');
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleDownload = (attachment: Attachment) => {
    // In a real implementation, this would download the actual file
    // For now, we'll just show an alert
    alert(`Downloading: ${attachment.nama_file}`);
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/lifecycle/products/${product?.id}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        // Refresh attachments list
        fetchAttachments();
      } else {
        setError(data.message || 'Failed to delete attachment');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      setError('An error occurred while deleting the attachment');
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(size) / Math.log(k));
    return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Attachments
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {product.produk}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Upload Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upload New File
            </h3>
            <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-6">
            <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Attachments List */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : attachments.length === 0 ? (
            <div className="text-center py-8">
              <File className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No attachments
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Upload files to share documents related to this product.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Files ({attachments.length})
              </h3>
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mr-4">
                      <File className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {attachment.nama_file}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatFileSize(attachment.ukuran_file)} • {attachment.tipe_file} • {formatDate(attachment.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(attachment)}
                      className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentModal;
