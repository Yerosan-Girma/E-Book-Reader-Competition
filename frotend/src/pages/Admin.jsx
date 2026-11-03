import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  BookOpen,
  FileText,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  FileCode,
  Sparkles,
  ArrowRight,
  HardDrive,
  Users,
  BarChart3,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Check,
  Shield,
  UserCheck,
  UserX,
  Clock,
  ExternalLink,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { BookCover } from '../components/ui/BookCover';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { detectMaterialFormat, formatFileSize } from '../lib/materialUtils';

const SUGGESTED_CATEGORIES = [
  'Spiritual',
  'Psychology',
  'Education',
  'Fiction',
  'Technology & Science',
  'Business & Finance',
  'Philosophy',
  'History & Culture',
];

const formatBadgeColors = {
  pdf: 'bg-red-100 text-red-700 border-red-200',
  docx: 'bg-blue-100 text-blue-700 border-blue-200',
  doc: 'bg-sky-100 text-sky-700 border-sky-200',
  image: 'bg-purple-100 text-purple-700 border-purple-200',
  epub: 'bg-purple-100 text-purple-700 border-purple-200',
  chapter: 'bg-forest-100 text-forest-700 border-forest-200',
};

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'admin') {
      toast.error('Admin privileges required to access this dashboard.');
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Active top-level tab
  const [activeTab, setActiveTab] = useState('materials'); // 'materials' | 'upload' | 'users' | 'analytics'

  // Tab 1: Materials Management state
  const [books, setBooks] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(false);
  const [bookSearch, setBookSearch] = useState('');
  const [bookStatusFilter, setBookStatusFilter] = useState('all'); // 'all' | 'published' | 'unpublished'
  const [bookFormatFilter, setBookFormatFilter] = useState('all');

  // Edit Book Modal state
  const [editingBook, setEditingBook] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    author: '',
    category: '',
    description: '',
    language: 'English',
    is_published: true,
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Tab 2: Upload state
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    language: 'English',
    cover_url: '',
  });

  // Tab 3: Users state
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  // Tab 4: Analytics state
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch books
  const fetchBooks = useCallback(async () => {
    setLoadingBooks(true);
    try {
      const { data } = await api.get('/admin/books', {
        params: {
          search: bookSearch || undefined,
          status: bookStatusFilter !== 'all' ? bookStatusFilter : undefined,
          format: bookFormatFilter !== 'all' ? bookFormatFilter : undefined,
        },
      });
      setBooks(data.items || []);
    } catch (e) {
      console.error('Error fetching admin books:', e);
      toast.error('Failed to load library catalog');
    } finally {
      setLoadingBooks(false);
    }
  }, [bookSearch, bookStatusFilter, bookFormatFilter]);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const { data } = await api.get('/admin/users', {
        params: { search: userSearch || undefined },
      });
      setUsersList(data.users || []);
    } catch (e) {
      console.error('Error fetching users:', e);
      toast.error('Failed to load user accounts');
    } finally {
      setLoadingUsers(false);
    }
  }, [userSearch]);

  // Fetch analytics
  const fetchAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      const { data } = await api.get('/admin/analytics');
      setAnalytics(data);
    } catch (e) {
      console.error('Error fetching analytics:', e);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  // Initial load based on tab
  useEffect(() => {
    if (activeTab === 'materials') fetchBooks();
    else if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'analytics') fetchAnalytics();
  }, [activeTab, fetchBooks, fetchUsers, fetchAnalytics]);

  // Debounced search for books
  useEffect(() => {
    if (activeTab !== 'materials') return;
    const timer = setTimeout(() => {
      fetchBooks();
    }, 300);
    return () => clearTimeout(timer);
  }, [bookSearch, bookStatusFilter, bookFormatFilter, activeTab, fetchBooks]);

  // Debounced search for users
  useEffect(() => {
    if (activeTab !== 'users') return;
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch, activeTab, fetchUsers]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
        <div className="text-center p-8 bg-white rounded-3xl border border-cream-200 shadow-sm max-w-md w-full">
          <div className="w-14 h-14 rounded-2xl bg-gold-100/80 border border-gold-200 flex items-center justify-center mx-auto mb-4 text-forest-700">
            <Upload className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold font-display text-ink mb-2">Looking to Upload Books?</h2>
          <p className="text-ink-light text-sm mb-6 leading-relaxed">
            You do not need admin privileges! Any reader can upload books and documents directly to the library to read online and share.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              to="/upload"
              className="btn btn-primary w-full py-2.5 text-sm rounded-xl inline-flex items-center justify-center gap-2 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Go to Upload Material</span>
            </Link>
            <Link to="/books" className="btn btn-outline w-full py-2.5 text-sm rounded-xl">
              Browse Book Library
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Handle Publish Toggle
  const handleTogglePublish = async (bookId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.patch(`/admin/books/${bookId}/publish`, { is_published: newStatus });
      setBooks((prev) =>
        prev.map((b) => (b.id === bookId ? { ...b, is_published: newStatus } : b))
      );
      toast.success(newStatus ? 'Material published to store' : 'Material moved to unpublished drafts');
    } catch (e) {
      toast.error('Failed to change publish status');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (b) => {
    setEditingBook(b);
    setEditFormData({
      title: b.title || '',
      author: b.author || '',
      category: Array.isArray(b.categories) ? b.categories[0] || 'Digital Library' : 'Digital Library',
      description: b.description || '',
      language: b.language || 'English',
      is_published: b.is_published,
    });
  };

  // Save Book Edit
  const handleSaveBookEdit = async (e) => {
    e.preventDefault();
    if (!editingBook) return;
    setSavingEdit(true);
    try {
      await api.put(`/admin/books/${editingBook.id}`, editFormData);
      toast.success(`"${editFormData.title}" updated successfully`);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      toast.error('Failed to update book');
    } finally {
      setSavingEdit(false);
    }
  };

  // Handle Delete Book
  const handleDeleteBook = async (bookId, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`)) {
      return;
    }
    try {
      await api.delete(`/admin/books/${bookId}`);
      toast.success(`"${title}" deleted`);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (e) {
      toast.error('Failed to delete book');
    }
  };

  // Handle User Role Toggle
  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'reader' : 'admin';
    if (!window.confirm(`Change ${targetUser.username}'s role to ${newRole.toUpperCase()}?`)) {
      return;
    }
    try {
      await api.patch(`/admin/users/${targetUser.id}/role`, { role: newRole });
      toast.success(`Updated role for ${targetUser.username} to ${newRole}`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
      );
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to update user role');
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Delete user account "${targetUser.username}"?`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${targetUser.id}`);
      toast.success(`User ${targetUser.username} deleted`);
      setUsersList((prev) => prev.filter((u) => u.id !== targetUser.id));
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to delete user');
    }
  };

  // Upload helpers
  const detectedFileFormat = useMemo(() => {
    if (!file) return null;
    return detectMaterialFormat({
      file_type: file.type,
      file_url: file.name,
    });
  }, [file]);

  const previewBook = useMemo(() => {
    return {
      id: 9999,
      title: formData.title || (file ? file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ') : 'Sample Document'),
      author: formData.author || (user?.username ? `@${user.username}` : 'Author Name'),
      category: formData.category || 'General',
      cover_url: formData.cover_url || null,
      file_type: file?.type || 'application/pdf',
      file_url: file?.name || 'document.pdf',
      file_size: file?.size || 1024 * 500,
    };
  }, [formData, file, user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 100 * 1024 * 1024) {
        setUploadStatus({ type: 'error', message: 'File size exceeds 100MB limit.' });
        return;
      }
      setFile(selectedFile);
      setUploadStatus(null);

      if (!formData.title) {
        const cleanName = selectedFile.name
          .replace(/\.[^/.]+$/, '')
          .replace(/[-_]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        const formatted = cleanName
          .split(' ')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');
        setFormData((prev) => ({ ...prev, title: formatted }));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
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
    if (formData.cover_url) {
      uploadFormData.append('cover_url', formData.cover_url);
    }

    try {
      const response = await api.post('/admin/books/upload', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedBook = response.data?.book;
      const title = uploadedBook?.title || formData.title;

      setUploadStatus({
        type: 'success',
        bookId: uploadedBook?.id,
        book: uploadedBook,
        message: `Material "${title}" successfully stored in Book Library!`,
      });

      toast.success(`"${title}" published to library!`);

      setFile(null);
      setFormData({
        title: '',
        author: '',
        description: '',
        category: '',
        language: 'English',
        cover_url: '',
      });
      e.target.reset();

      // Refresh books list
      fetchBooks();
    } catch (error) {
      setUploadStatus({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload material. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 pt-24 md:pt-32">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-cream-200">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="chip chip-gold text-[10px] font-bold uppercase tracking-wider">
                Admin Management Portal
              </span>
              <span className="text-xs text-ink-muted">Logged in as {user.username}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-ink font-bold">
              Library Administration & Operations
            </h1>
            <p className="text-ink-light text-xs sm:text-sm mt-1">
              Comprehensive controls to manage materials catalog, publish status, user accounts, and platform analytics.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <Link
              to="/books"
              className="btn btn-outline-dark text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-forest-500" />
              <span>Public Library</span>
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>User Dashboard</span>
            </Link>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex items-center gap-2 mt-6 border-b border-cream-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'materials'
                ? 'border-forest-600 text-forest-700 bg-white shadow-xs'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <BookOpen className="w-4 h-4 text-forest-500" />
            <span>Manage Catalog ({books.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-forest-600 text-forest-700 bg-white shadow-xs'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Upload className="w-4 h-4 text-forest-500" />
            <span>Upload New Material</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'users'
                ? 'border-forest-600 text-forest-700 bg-white shadow-xs'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <Users className="w-4 h-4 text-forest-500" />
            <span>User Accounts ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-2 border-b-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'border-forest-600 text-forest-700 bg-white shadow-xs'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-forest-500" />
            <span>Platform Analytics</span>
          </button>
        </div>

        {/* ════ TAB 1: MANAGE CATALOG & MATERIALS ════ */}
        {activeTab === 'materials' && (
          <div className="mt-6 space-y-4">
            {/* Search & Filters Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Search books by title, author, category..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:border-forest-400 focus:outline-none transition"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Status Filter */}
                <div className="inline-flex rounded-lg bg-cream-100 p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => setBookStatusFilter('all')}
                    className={`px-3 py-1 rounded-md transition ${
                      bookStatusFilter === 'all' ? 'bg-white shadow-xs text-forest-700' : 'text-ink-muted'
                    }`}
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => setBookStatusFilter('published')}
                    className={`px-3 py-1 rounded-md transition ${
                      bookStatusFilter === 'published' ? 'bg-white shadow-xs text-forest-700' : 'text-ink-muted'
                    }`}
                  >
                    Published
                  </button>
                  <button
                    onClick={() => setBookStatusFilter('unpublished')}
                    className={`px-3 py-1 rounded-md transition ${
                      bookStatusFilter === 'unpublished' ? 'bg-white shadow-xs text-forest-700' : 'text-ink-muted'
                    }`}
                  >
                    Drafts / Hidden
                  </button>
                </div>

                {/* Format Filter */}
                <select
                  value={bookFormatFilter}
                  onChange={(e) => setBookFormatFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-cream-200 bg-white font-medium text-ink cursor-pointer focus:outline-none"
                >
                  <option value="all">All Formats</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">Word (.docx)</option>
                  <option value="image">Image Album</option>
                  <option value="epub">EPUB</option>
                  <option value="chapter">Chapter Book</option>
                </select>

                <button
                  onClick={() => setActiveTab('upload')}
                  className="btn btn-primary text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Book</span>
                </button>
              </div>
            </div>

            {/* Books Table */}
            <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-xs">
              {loadingBooks ? (
                <div className="py-24 text-center">
                  <Loader2 className="w-7 h-7 text-forest-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-ink-muted">Loading books catalog…</p>
                </div>
              ) : books.length === 0 ? (
                <div className="py-20 text-center">
                  <BookOpen className="w-10 h-10 text-cream-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-ink">No books match your criteria</p>
                  <p className="text-xs text-ink-muted mt-1">Try clearing filters or uploading new materials</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-cream-100/70 border-b border-cream-200 text-ink-muted font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Book Details</th>
                        <th className="py-3 px-4">Format / Category</th>
                        <th className="py-3 px-4">Reading Activity</th>
                        <th className="py-3 px-4">Publish Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {books.map((b) => {
                        const fmt = detectMaterialFormat(b);
                        const cat = Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : 'Digital Library';
                        return (
                          <tr key={`book-row-${b.id}`} className="hover:bg-cream-50/70 transition-colors">
                            {/* Book Title & Author */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-12 rounded bg-cream-100 border border-black/10 overflow-hidden shrink-0 flex items-center justify-center">
                                  {b.cover_url ? (
                                    <img src={b.cover_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <BookOpen className="w-4 h-4 text-forest-500/60" />
                                  )}
                                </div>
                                <div className="min-w-0 max-w-xs sm:max-w-sm">
                                  <p className="font-semibold text-ink truncate text-sm">{b.title}</p>
                                  <p className="text-xs text-ink-muted truncate">by {b.author}</p>
                                  <span className="text-[10px] text-ink-muted">ID: #{b.id}</span>
                                </div>
                              </div>
                            </td>

                            {/* Format & Category */}
                            <td className="py-3 px-4">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${fmt.badgeClass}`}>
                                  {fmt.label}
                                </span>
                                <span className="text-xs text-ink-light">{cat}</span>
                                {b.file_size && (
                                  <span className="text-[10px] text-ink-muted">{formatFileSize(b.file_size)}</span>
                                )}
                              </div>
                            </td>

                            {/* Activity */}
                            <td className="py-3 px-4 text-ink-light">
                              <div className="text-xs">
                                <span className="font-semibold text-ink">{b.total_reads || 0}</span> sessions
                              </div>
                              <div className="text-[10px] text-ink-muted">
                                {Math.round((b.total_seconds_read || 0) / 60)} mins total read
                              </div>
                            </td>

                            {/* Publish Status Toggle */}
                            <td className="py-3 px-4">
                              <button
                                onClick={() => handleTogglePublish(b.id, b.is_published)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition border ${
                                  b.is_published
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                                }`}
                                title={b.is_published ? 'Click to unpublish' : 'Click to publish'}
                              >
                                {b.is_published ? (
                                  <>
                                    <ToggleRight className="w-4 h-4 text-emerald-600" />
                                    <span>Published</span>
                                  </>
                                ) : (
                                  <>
                                    <ToggleLeft className="w-4 h-4 text-amber-600" />
                                    <span>Draft / Hidden</span>
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link
                                  to={`/read/${b.id}`}
                                  target="_blank"
                                  className="p-1.5 rounded-lg hover:bg-cream-100 text-forest-600 transition"
                                  title="Open in Reader"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>

                                <button
                                  onClick={() => handleOpenEdit(b)}
                                  className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition"
                                  title="Edit Book Details"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => handleDeleteBook(b.id, b.title)}
                                  className="p-1.5 rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition"
                                  title="Delete Book"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ TAB 2: UPLOAD MATERIAL ════ */}
        {activeTab === 'upload' && (
          <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-8 items-start">
            {/* Left: Upload Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6 sm:p-8">
              <h2 className="font-display text-xl text-ink font-semibold mb-5 flex items-center gap-2">
                <Upload className="w-5 h-5 text-forest-500" />
                Material Details & File Upload
              </h2>

              <form onSubmit={handleUploadSubmit} className="space-y-6">
                {/* File Dropzone */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                    Select Material File *
                  </label>
                  <div className="border-2 border-dashed border-cream-300 hover:border-forest-400 rounded-xl p-6 sm:p-8 text-center transition-colors bg-cream-50/50">
                    {file ? (
                      <div className="flex items-center justify-between bg-white rounded-xl p-4 border border-cream-200 shadow-xs">
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-forest-50 border border-forest-100 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-forest-500" />
                          </div>
                          <div className="text-left min-w-0">
                            <p className="font-semibold text-sm text-ink truncate">{file.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {detectedFileFormat && (
                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${detectedFileFormat.badgeClass}`}>
                                  {detectedFileFormat.label}
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
                          className="p-1.5 hover:bg-cream-100 rounded-full text-ink-muted hover:text-ink transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <div className="w-14 h-14 rounded-2xl bg-cream-100 border border-cream-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
                          <Upload className="w-6 h-6 text-forest-400" />
                        </div>
                        <p className="text-ink font-semibold text-sm mb-1">
                          Click to browse or drag & drop document
                        </p>
                        <p className="text-xs text-ink-muted mb-4 max-w-sm mx-auto">
                          Supports <strong>PDF</strong>, <strong>DOCX/DOC</strong>, <strong>EPUB</strong>, <strong>RTF</strong>, and <strong>TXT</strong> (up to 100MB)
                        </p>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          accept=".pdf,.epub,.docx,.doc,.txt,.rtf,application/pdf,application/epub+zip,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,text/plain,application/rtf"
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="btn btn-primary inline-flex items-center gap-2 cursor-pointer text-xs px-5 py-2.5 rounded-xl shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Document File</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Author */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none"
                      placeholder="e.g. Software Architecture"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                      Author *
                    </label>
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none"
                      placeholder="Author or Organization name"
                      required
                    />
                  </div>
                </div>

                {/* Category with suggestions */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none mb-2"
                    placeholder="e.g. Education, Psychology, Spiritual"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                          formData.category === cat
                            ? 'bg-forest-500 text-cream-50 border-forest-500 shadow-xs'
                            : 'bg-cream-100 text-ink-light border-cream-200 hover:border-forest-300'
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
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                      Language
                    </label>
                    <select
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none bg-white cursor-pointer"
                    >
                      <option value="English">English</option>
                      <option value="Amharic">Amharic</option>
                      <option value="Oromo">Afaan Oromoo</option>
                      <option value="Tigrinya">Tigrinya</option>
                      <option value="French">French</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                      Cover URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={formData.cover_url}
                      onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none"
                      placeholder="https://example.com/cover.jpg"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Description & Summary
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none min-h-[90px]"
                    placeholder="Enter an abstract or brief summary..."
                  />
                </div>

                {/* Status alert */}
                {uploadStatus && (
                  <div
                    className={`flex items-center justify-between gap-3 p-4 rounded-xl ${
                      uploadStatus.type === 'success'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border border-rose-200 text-rose-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                      {uploadStatus.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <span>{uploadStatus.message}</span>
                    </div>

                    {uploadStatus.bookId && (
                      <Link
                        to={`/read/${uploadStatus.bookId}`}
                        className="btn btn-primary text-xs px-3.5 py-1.5 rounded-lg shrink-0"
                      >
                        Read Online →
                      </Link>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="btn btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm shadow-md disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Material to Library…</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Publish Material to Store</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right: Live Preview */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm text-center">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                    Live Book Preview
                  </h3>
                  <span className="text-[10px] text-forest-500 font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Auto-Generated
                  </span>
                </div>

                <div className="w-40 mx-auto mb-4">
                  <BookCover book={previewBook} tilt={false} showBadge={true} />
                </div>

                <p className="font-display text-sm font-semibold text-ink line-clamp-1">
                  {previewBook.title}
                </p>
                <p className="text-xs text-ink-muted truncate mt-0.5">by {previewBook.author}</p>
              </div>
            </div>
          </div>
        )}

        {/* ════ TAB 3: USER ACCOUNTS & MANAGEMENT ════ */}
        {activeTab === 'users' && (
          <div className="mt-6 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-xs flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search user by username, email, display name..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-cream-200 bg-cream-50 focus:bg-white focus:border-forest-400 focus:outline-none transition"
                />
              </div>

              <span className="text-xs text-ink-muted font-medium">
                {usersList.length} Registered {usersList.length === 1 ? 'User' : 'Users'}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-xs">
              {loadingUsers ? (
                <div className="py-24 text-center">
                  <Loader2 className="w-7 h-7 text-forest-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-ink-muted">Loading user accounts…</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-cream-100/70 border-b border-cream-200 text-ink-muted font-bold uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Role</th>
                        <th className="py-3 px-4">Reading Time</th>
                        <th className="py-3 px-4">Joined Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cream-100">
                      {usersList.map((u) => {
                        const isSelf = Number(u.id) === Number(user.id);
                        return (
                          <tr key={`user-row-${u.id}`} className="hover:bg-cream-50/70 transition-colors">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-semibold text-ink text-sm flex items-center gap-1.5">
                                  <span>{u.display_name || u.username}</span>
                                  {isSelf && (
                                    <span className="text-[10px] bg-gold-100 text-gold-800 px-1.5 py-0.2 rounded font-bold">
                                      YOU
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-ink-muted">{u.email}</p>
                              </div>
                            </td>

                            <td className="py-3 px-4">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                  u.role === 'admin'
                                    ? 'bg-gold-50 text-gold-800 border-gold-300'
                                    : 'bg-cream-100 text-ink-light border-cream-200'
                                }`}
                              >
                                {u.role.toUpperCase()}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-ink">
                              <span className="font-bold text-forest-700">{u.total_reading_minutes || 0} mins</span>
                              <div className="text-[10px] text-ink-muted">
                                {u.total_sessions || 0} sessions • {u.books_read || 0} books
                              </div>
                            </td>

                            <td className="py-3 px-4 text-ink-muted">
                              {new Date(u.created_at).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleToggleUserRole(u)}
                                  disabled={isSelf}
                                  className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition ${
                                    isSelf
                                      ? 'opacity-30 cursor-not-allowed border-cream-200'
                                      : u.role === 'admin'
                                      ? 'hover:bg-rose-50 text-rose-700 border-rose-200'
                                      : 'hover:bg-gold-50 text-gold-700 border-gold-200'
                                  }`}
                                  title={isSelf ? 'Cannot demote own account' : 'Change user role'}
                                >
                                  {u.role === 'admin' ? 'Demote to Reader' : 'Promote to Admin'}
                                </button>

                                {!isSelf && (
                                  <button
                                    onClick={() => handleDeleteUser(u)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-ink-muted hover:text-rose-600 transition"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════ TAB 4: PLATFORM ANALYTICS ════ */}
        {activeTab === 'analytics' && (
          <div className="mt-6 space-y-6">
            {loadingAnalytics || !analytics ? (
              <div className="py-24 text-center">
                <Loader2 className="w-7 h-7 text-forest-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-ink-muted">Aggregating platform metrics…</p>
              </div>
            ) : (
              <>
                {/* Analytics KPI Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="card p-5 bg-white rounded-2xl border border-cream-200">
                    <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Total Users</span>
                    <p className="text-2xl font-bold font-display text-ink mt-1">{analytics.users?.total || 0}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">Registered accounts</p>
                  </div>

                  <div className="card p-5 bg-white rounded-2xl border border-cream-200">
                    <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Catalog Materials</span>
                    <p className="text-2xl font-bold font-display text-forest-700 mt-1">{analytics.books?.total_books || 0}</p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {analytics.books?.published_books || 0} published • {analytics.books?.unpublished_books || 0} drafts
                    </p>
                  </div>

                  <div className="card p-5 bg-white rounded-2xl border border-cream-200">
                    <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Platform Reading Time</span>
                    <p className="text-2xl font-bold font-display text-forest-700 mt-1">
                      {analytics.sessions?.total_reading_hours || '0.0'} hrs
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {analytics.sessions?.total_reading_minutes || 0} minutes logged
                    </p>
                  </div>

                  <div className="card p-5 bg-white rounded-2xl border border-cream-200">
                    <span className="text-xs text-ink-muted uppercase font-bold tracking-wider">Reading Sessions</span>
                    <p className="text-2xl font-bold font-display text-ink mt-1">
                      {analytics.sessions?.total_sessions || 0}
                    </p>
                    <p className="text-[11px] text-ink-muted mt-0.5">
                      {analytics.sessions?.finished_sessions || 0} verified & completed
                    </p>
                  </div>
                </div>

                {/* Popular Books Table */}
                <div className="bg-white rounded-2xl border border-cream-200 p-6 shadow-xs">
                  <h3 className="font-display font-semibold text-lg text-ink mb-1">
                    Most Popular Materials by Reading Engagement
                  </h3>
                  <p className="text-xs text-ink-muted mb-4">
                    Ranked by total reader minutes invested on the platform
                  </p>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-cream-100/70 border-b border-cream-200 text-ink-muted font-bold uppercase tracking-wider">
                        <tr>
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Title & Author</th>
                          <th className="py-2.5 px-3">Total Minutes</th>
                          <th className="py-2.5 px-3">Reader Sessions</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-cream-100">
                        {analytics.topBooks?.map((b, idx) => (
                          <tr key={`top-${b.id}`} className="hover:bg-cream-50/70 transition">
                            <td className="py-2.5 px-3 font-bold text-forest-700">#{idx + 1}</td>
                            <td className="py-2.5 px-3">
                              <p className="font-semibold text-ink">{b.title}</p>
                              <p className="text-[11px] text-ink-muted">by {b.author}</p>
                            </td>
                            <td className="py-2.5 px-3 font-bold text-forest-700 font-mono">
                              {b.total_minutes}m
                            </td>
                            <td className="py-2.5 px-3 text-ink-light">{b.sessions_count} sessions</td>
                            <td className="py-2.5 px-3 text-right">
                              <Link
                                to={`/read/${b.id}`}
                                className="text-xs font-semibold text-forest-600 hover:underline"
                              >
                                Preview →
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Edit Book Metadata Modal ── */}
        <AnimatePresence>
          {editingBook && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-cream-300 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-5">
                  <h3 className="font-display font-bold text-xl text-ink">Edit Material Metadata</h3>
                  <button
                    onClick={() => setEditingBook(null)}
                    className="p-1 rounded-full hover:bg-cream-100 text-ink-muted"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveBookEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-ink-muted mb-1">Title *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-ink-muted mb-1">Author *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.author}
                      onChange={(e) => setEditFormData({ ...editFormData, author: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-ink-muted mb-1">Category</label>
                    <input
                      type="text"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-ink-muted mb-1">Description</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-cream-300 focus:border-forest-400 focus:outline-none min-h-[70px]"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="edit-published"
                      checked={editFormData.is_published}
                      onChange={(e) => setEditFormData({ ...editFormData, is_published: e.target.checked })}
                      className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500 cursor-pointer"
                    />
                    <label htmlFor="edit-published" className="text-xs font-semibold text-ink cursor-pointer">
                      Published in Book Library (visible to all readers)
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-cream-200">
                    <button
                      type="button"
                      onClick={() => setEditingBook(null)}
                      className="btn btn-outline text-xs px-4 py-2 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="btn btn-primary text-xs px-5 py-2 rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      {savingEdit ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
