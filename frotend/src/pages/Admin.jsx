import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, BookOpen, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    language: 'English'
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-ink mb-2">Access Denied</h2>
          <p className="text-ink-light">Admin access required</p>
        </div>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Accept all file types
      if (selectedFile.size > 100 * 1024 * 1024) {
        setUploadStatus({ type: 'error', message: 'File size exceeds 100MB limit.' });
        return;
      }
      setFile(selectedFile);
      setUploadStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadStatus({ type: 'error', message: 'Please select a file to upload.' });
      return;
    }
    if (!formData.title || !formData.author) {
      setUploadStatus({ type: 'error', message: 'Title and author are required.' });
      return;
    }

    setUploading(true);
    setUploadStatus(null);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('author', formData.author);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('category', formData.category);
    uploadFormData.append('language', formData.language);

    try {
      const response = await api.post('/admin/books/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const bookId = response.data?.book?.id;
      setUploadStatus({
        type: 'success',
        bookId,
        message: `Book "${response.data?.book?.title || formData.title}" uploaded successfully! It is now ready to read online in the multi-format reader.`,
      });

      // Reset form
      setFile(null);
      setFormData({
        title: '',
        author: '',
        description: '',
        category: '',
        language: 'English'
      });

      // Reset file input
      e.target.reset();
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload book. Please try again.'
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus(null);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="font-display text-4xl text-ink font-semibold mb-2">Admin Dashboard</h1>
            <p className="text-ink-light">Upload and manage books for the ReadRise library</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-cream-200 p-8">
            <h2 className="font-display text-2xl text-ink font-semibold mb-6 flex items-center gap-2">
              <Upload className="w-6 h-6 text-forest-400" />
              Upload New Book
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div className="border-2 border-dashed border-cream-300 rounded-xl p-8 text-center hover:border-forest-400 transition-colors">
                {file ? (
                  <div className="flex items-center justify-between bg-cream-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-forest-400" />
                      <div className="text-left">
                        <p className="font-medium text-ink">{file.name}</p>
                        <p className="text-sm text-ink-muted">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="p-2 hover:bg-cream-200 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-ink-muted" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-forest-400 mx-auto mb-4" />
                    <p className="text-ink mb-2">Drag and drop your book file here, or click to browse</p>
                    <p className="text-sm text-ink-muted mb-4">Supports all file formats including PDF, EPUB, MOBI, DOC, DOCX, TXT, and more (max 100MB)</p>
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept="*"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="btn btn-primary inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      Choose File
                    </label>
                  </div>
                )}
              </div>

              {/* Book Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-cream-300 focus:border-forest-400 focus:ring-2 focus:ring-forest-400/20 outline-none transition-all"
                    placeholder="Enter book title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Author *</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-cream-300 focus:border-forest-400 focus:ring-2 focus:ring-forest-400/20 outline-none transition-all"
                    placeholder="Enter author name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-cream-300 focus:border-forest-400 focus:ring-2 focus:ring-forest-400/20 outline-none transition-all"
                    placeholder="e.g., Fiction, Science, History"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-2">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-cream-300 focus:border-forest-400 focus:ring-2 focus:ring-forest-400/20 outline-none transition-all"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Amharic">Amharic</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-cream-300 focus:border-forest-400 focus:ring-2 focus:ring-forest-400/20 outline-none transition-all min-h-[120px] resize-y"
                  placeholder="Enter a brief description of the book"
                />
              </div>

              {/* Upload Status */}
              {uploadStatus && (
                <div
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl ${
                    uploadStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {uploadStatus.type === 'success' ? (
                      <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600" />
                    )}
                    <p className="text-sm font-medium">{uploadStatus.message}</p>
                  </div>
                  {uploadStatus.bookId && (
                    <a
                      href={`/read/${uploadStatus.bookId}`}
                      className="btn btn-primary text-xs px-4 py-2 rounded-lg shrink-0 self-start sm:self-auto"
                    >
                      Open in Reader →
                    </a>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={uploading || !file}
                className="btn btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Book
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-forest-50 border border-forest-200 rounded-xl p-6">
            <h3 className="font-semibold text-ink mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-forest-400" />
              About Book Uploads
            </h3>
            <ul className="text-sm text-ink-light space-y-1 list-disc list-inside">
              <li><strong>PDF</strong>: Rendered inline with React-PDF, zoom controls, and page slider</li>
              <li><strong>DOCX</strong>: Converted via Mammoth.js into clean, sanitized reading layout</li>
              <li><strong>EPUB</strong>: Rendered via EPUB.js with full table of contents & chapter navigation</li>
              <li><strong>TXT & RTF</strong>: Rendered with native styling, themes, and font resizing</li>
              <li><strong>Word DOC</strong>: Converted via backend document extractor</li>
              <li><strong>Saved Progress & Bookmarks</strong>: Saved to PostgreSQL and restored automatically</li>
              <li>Maximum file size is 100MB</li>
            </ul>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
