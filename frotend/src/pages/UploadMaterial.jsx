import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Globe,
  Tag,
  User,
  Loader2,
  Share2,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { formatFileSize } from '../lib/materialUtils';

const SUGGESTED_CATEGORIES = [
  'Education',
  'Science',
  'Digital Library',
  'Psychology',
  'Spiritual',
  'Art & Culture',
  'Classic Literature',
  'Tech & Engineering',
  'Business',
];

const LANGUAGES = [
  'English',
  'Amharic',
  'Afaan Oromoo',
  'Tigrinya',
  'French',
  'Arabic',
  'Spanish',
  'German',
];

export default function UploadMaterial() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: user?.display_name || user?.username || '',
    description: '',
    category: 'Education',
    language: 'English',
    cover_url: '',
  });

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message, book }

  // Detect file format details from extension/type
  const getFormatBadge = (fileObj) => {
    if (!fileObj) return null;
    const name = (fileObj.name || '').toLowerCase();
    const type = (fileObj.type || '').toLowerCase();

    if (name.endsWith('.pdf') || type.includes('pdf')) {
      return { label: 'PDF DOCUMENT', color: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (name.endsWith('.docx') || name.endsWith('.doc') || type.includes('word')) {
      return { label: 'WORD DOCUMENT', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
    if (name.endsWith('.epub') || type.includes('epub')) {
      return { label: 'EPUB EBOOK', color: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    if (name.endsWith('.txt') || type.includes('plain')) {
      return { label: 'TEXT FILE', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    if (name.match(/\.(jpg|jpeg|png|webp|gif)$/i) || type.includes('image')) {
      return { label: 'IMAGE DOCUMENT', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
    return { label: 'DOCUMENT', color: 'bg-cream-100 text-ink-muted border-cream-200' };
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setFile(selected);
    setStatus(null);

    // Auto-populate title if empty
    if (!formData.title) {
      const baseName = selected.name.replace(/\.[^/.]+$/, '');
      const formatted = baseName
        .replace(/[-_]+/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
      setFormData((prev) => ({ ...prev, title: formatted }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setStatus({ type: 'error', message: 'Please select a document or book file to upload.' });
      return;
    }

    if (!formData.title.trim() || !formData.author.trim()) {
      setStatus({ type: 'error', message: 'Title and author are required.' });
      return;
    }

    setUploading(true);
    setStatus(null);
    setUploadProgress(10);

    const body = new FormData();
    body.append('file', file);
    body.append('title', formData.title.trim());
    body.append('author', formData.author.trim());
    body.append('description', formData.description.trim());
    body.append('category', formData.category.trim() || 'Digital Library');
    body.append('language', formData.language);
    if (formData.cover_url.trim()) {
      body.append('cover_url', formData.cover_url.trim());
    }

    try {
      const { data } = await api.post('/books/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 90) / progressEvent.total);
            setUploadProgress(Math.max(15, percentCompleted));
          }
        },
      });

      setUploadProgress(100);
      const createdBook = data.book;

      setStatus({
        type: 'success',
        book: createdBook,
        message: `"${createdBook.title}" has been successfully uploaded and published to the Book Library!`,
      });
    } catch (err) {
      console.error('Upload error:', err);
      const errMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to upload material. Please verify the file and try again.';
      setStatus({ type: 'error', message: errMessage });
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFormData({
      title: '',
      author: user?.display_name || user?.username || '',
      description: '',
      category: 'Education',
      language: 'English',
      cover_url: '',
    });
    setStatus(null);
    setUploadProgress(0);
  };

  const formatBadge = getFormatBadge(file);

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient background glow */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(216,170,91,0.14) 0%, transparent 70%)',
          filter: 'blur(75px)',
        }}
      />
      <div
        className="absolute top-1/3 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(23,76,56,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div className="grain-overlay" aria-hidden="true" />

      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 pt-28 pb-16 relative z-10">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-gold-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Book Library</span>
          </Link>

          <span className="text-[11px] font-medium text-ink-muted">
            Sharing with ReadRise Community
          </span>
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-100/80 border border-forest-200/60 text-forest-800 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Community Contributions</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Upload Reading Material
          </h1>

          <p className="mt-2 text-sm sm:text-base text-ink-light max-w-2xl leading-relaxed">
            Missing a book or document you want to read? Upload your file here to read it immediately
            with full tracking, and make it accessible to other readers across the digital library.
          </p>
        </motion.div>

        {/* Success Card (Shown when upload finishes) */}
        <AnimatePresence mode="wait">
          {status?.type === 'success' && status.book ? (
            <motion.div
              key="success-card"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none" />

              <div className="relative text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="font-display text-2xl text-ink font-bold mb-2">
                  Material Published to Library!
                </h2>

                <p className="text-sm text-ink-light mb-6">
                  <strong className="text-ink font-semibold">{status.book.title}</strong> by{' '}
                  <span className="italic">{status.book.author}</span> has been saved and is now available in
                  the Book Library.
                </p>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                  <Link
                    to={`/read/${status.book.id}`}
                    className="btn btn-primary w-full sm:w-auto px-7 py-3 text-sm rounded-xl inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Start Reading Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/books?search=${encodeURIComponent(status.book.title)}`}
                    className="btn btn-outline w-full sm:w-auto px-6 py-3 text-sm rounded-xl inline-flex items-center justify-center gap-2"
                  >
                    <span>View in Library</span>
                  </Link>
                </div>

                <div className="pt-5 border-t border-cream-200 flex items-center justify-between text-xs text-ink-muted">
                  <span className="flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-forest-500" />
                    Available to all ReadRise members
                  </span>

                  <button
                    onClick={handleReset}
                    className="font-semibold text-forest-600 hover:text-gold-600 hover:underline"
                  >
                    Upload Another Document →
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Upload Form */
            <motion.form
              key="upload-form"
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl p-6 sm:p-9 border border-cream-200 shadow-sm space-y-6"
            >
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                  Select Document or Book File *
                </label>

                <div className="border-2 border-dashed border-cream-300 hover:border-forest-400 rounded-2xl p-6 sm:p-8 text-center transition-colors bg-cream-50/60">
                  {file ? (
                    <div className="flex items-center justify-between bg-white rounded-2xl p-4 sm:p-5 border border-cream-200 shadow-xs">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center shrink-0">
                          <FileText className="w-6 h-6 text-forest-600" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-semibold text-sm sm:text-base text-ink truncate">
                            {file.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {formatBadge && (
                              <span
                                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${formatBadge.color}`}
                              >
                                {formatBadge.label}
                              </span>
                            )}
                            <span className="text-xs text-ink-muted">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-cream-100 rounded-full text-ink-muted hover:text-ink transition-colors"
                        title="Remove file"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <Upload className="w-7 h-7 text-forest-500" />
                      </div>
                      <p className="font-display font-semibold text-base text-ink mb-1">
                        Choose a document to add to the library
                      </p>
                      <p className="text-xs text-ink-muted mb-4 max-w-md mx-auto">
                        Supports <strong>PDF</strong>, <strong>DOCX/DOC</strong>, <strong>EPUB</strong>,{' '}
                        <strong>RTF</strong>, <strong>TXT</strong>, and scanned <strong>Images</strong> (up to 100MB)
                      </p>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.epub,.docx,.doc,.txt,.rtf,.jpg,.jpeg,.png,.webp,application/pdf,application/epub+zip,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,application/rtf,image/*"
                        className="hidden"
                        id="user-file-upload"
                      />
                      <label
                        htmlFor="user-file-upload"
                        className="btn btn-primary inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs hover:shadow transition-all"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Browse from Computer</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Title & Author Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-forest-500" /> Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 focus:outline-none bg-cream-50/30"
                    placeholder="e.g. Clean Code in Practice"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-forest-500" /> Author / Source *
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:ring-1 focus:ring-forest-500 focus:outline-none bg-cream-50/30"
                    placeholder="e.g. Robert C. Martin or Your Name"
                    required
                  />
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-forest-500" /> Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30 mb-2.5"
                  placeholder="e.g. Education, Science, Spiritual, Psychology"
                />

                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={`text-xs font-medium px-3 py-1 rounded-full border transition-all ${
                        formData.category === cat
                          ? 'bg-forest-600 text-cream-50 border-forest-600 shadow-xs'
                          : 'bg-cream-100 text-ink-light border-cream-200 hover:border-forest-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language & Cover URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-forest-500" /> Language
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30 cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-forest-500" /> Cover Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.cover_url}
                    onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30"
                    placeholder="https://example.com/cover.jpg"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                  Summary or Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30 min-h-[90px]"
                  placeholder="Provide a short description or abstract so other readers can learn about this material..."
                />
              </div>

              {/* Error Message */}
              {status?.type === 'error' && (
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-medium">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{status.message}</span>
                </div>
              )}

              {/* Upload Progress Bar */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-ink-muted">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-forest-500" />
                      Uploading and preparing reader content…
                    </span>
                    <span className="font-bold text-forest-700">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-cream-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-forest-500 to-gold-400 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
                <Link
                  to="/books"
                  className="btn btn-outline text-xs sm:text-sm px-5 py-2.5 rounded-xl"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="btn btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Add to Library</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
