import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  X,
  Grid3X3,
  LayoutList,
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
  FileCode,
  ArrowUpDown,
  Upload,
  Clock,
  HardDrive,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import BookCard from '../components/BookCard';
import { BookCover } from '../components/ui/BookCover';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  detectMaterialFormat,
  formatFileSize,
  estimateReadingTime,
  getMaterialLengthLabel,
  FORMAT_TABS,
} from '../lib/materialUtils';

/* ── Books Fetch Hook with search, format & category filters ── */
function useBooks({ page, search, formatFilter, category }) {
  const [state, setState] = useState({ status: 'loading', books: [], totalPages: 1 });

  useEffect(() => {
    let cancelled = false;

    const params = {
      page,
      limit: 24,
      search: search || undefined,
      format: formatFilter !== 'all' ? formatFilter : undefined,
      category: category && category !== 'All' ? category : undefined,
    };

    api
      .get('/books', { params })
      .then(({ data }) => {
        if (cancelled) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setState({
          status: items.length > 0 ? 'success' : 'empty',
          books: items,
          totalPages: data.totalPages || 1,
        });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Books fetch failed:', err);
        setState({ status: 'error', books: [], totalPages: 1 });
      });

    return () => {
      cancelled = true;
    };
  }, [page, search, formatFilter, category]);

  return state;
}

export default function Books() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const urlCategory = searchParams.get('category') || 'All';
  const urlSearch = searchParams.get('search') || '';
  const urlFormat = searchParams.get('format') || 'all';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(urlSearch);
  const [activeFormat, setActiveFormat] = useState(urlFormat);
  const [activeCategory, setActiveCategory] = useState(urlCategory);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'title' | 'pages'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const { status, books, totalPages } = useBooks({
    page,
    search,
    formatFilter: activeFormat,
    category: activeCategory,
  });

  /* Dynamically extract all available categories from current dataset */
  const categories = useMemo(() => {
    const cats = new Set();
    books.forEach((b) => {
      const c = b.category || (Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : null);
      if (c && typeof c === 'string' && c.trim()) cats.add(c.trim());
    });
    return ['All', ...Array.from(cats).sort()];
  }, [books]);

  /* Format count breakdown for quick badges */
  const formatCounts = useMemo(() => {
    const counts = { all: books.length, pdf: 0, docx: 0, image: 0, ebook: 0 };
    books.forEach((b) => {
      const f = detectMaterialFormat(b);
      if (f.type === 'pdf') counts.pdf++;
      else if (f.type === 'docx' || f.type === 'doc') counts.docx++;
      else if (f.type === 'image') counts.image++;
      else counts.ebook++;
    });
    return counts;
  }, [books]);

  /* Filter and Sort Books */
  const processedBooks = useMemo(() => {
    let result = [...books];

    // Filter by Format (client-side safety check)
    if (activeFormat !== 'all') {
      result = result.filter((b) => {
        const fmt = detectMaterialFormat(b);
        if (activeFormat === 'pdf') return fmt.type === 'pdf';
        if (activeFormat === 'docx') return fmt.type === 'docx' || fmt.type === 'doc';
        if (activeFormat === 'image') return fmt.type === 'image';
        if (activeFormat === 'ebook') return fmt.type === 'ebook';
        return true;
      });
    }

    // Filter by Category
    if (activeCategory !== 'All') {
      result = result.filter((b) => {
        const c = b.category || (Array.isArray(b.categories) && b.categories.length > 0 ? b.categories[0] : null);
        return c === activeCategory;
      });
    }

    // Sort
    if (sortBy === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (sortBy === 'pages') {
      result.sort((a, b) => (b.pages || b.total_chapters || 0) - (a.pages || a.total_chapters || 0));
    } else {
      // Default: newest first (by id or created_at)
      result.sort((a, b) => (b.id || 0) - (a.id || 0));
    }

    return result;
  }, [books, activeFormat, activeCategory, sortBy]);

  /* Featured materials: Top 3 items when browsing unfiltered first page */
  const featuredBooks = useMemo(() => {
    if (page === 1 && !search && activeFormat === 'all' && activeCategory === 'All') {
      return books.slice(0, 3);
    }
    return [];
  }, [books, page, search, activeFormat, activeCategory]);

  const handleSearch = (e) => {
    setPage(1);
    setActiveCategory('All');
    setSearch(e.target.value);
  };

  const clearSearch = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col relative overflow-x-hidden">
      {/* Subtle ambient lighting */}
      <div
        className="absolute -top-12 -right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(216,170,91,.12) 0%,transparent 70%)', filter: 'blur(70px)' }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -left-32 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(23,76,56,.08) 0%,transparent 70%)', filter: 'blur(90px)' }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      <Navbar />

      <div className="flex-1 flex flex-col">
        {/* ── Scribd-Style Store Header ── */}
        <section className="pt-24 sm:pt-28 md:pt-36 pb-8 sm:pb-10 bg-gradient-to-b from-cream-100/90 via-cream-100/40 to-cream-50 border-b border-cream-200/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8">
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-3 sm:mb-4 flex items-center gap-2 flex-wrap"
                >
                  <span className="chip chip-forest gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-forest-400" /> Digital Library & Document Store
                  </span>
                  <Link
                    to="/upload"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest-700 hover:text-forest-900 bg-white border border-forest-200/90 shadow-2xs hover:shadow-xs px-3.5 py-1.5 rounded-full transition-all"
                  >
                    <Upload className="w-3.5 h-3.5 text-forest-500" />
                    <span>Upload Material to Library</span>
                  </Link>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                  className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-ink font-semibold tracking-tight leading-[1.1]"
                >
                  Explore Books & Documents
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.16 }}
                  className="mt-3 text-ink-light text-sm sm:text-base md:text-lg leading-relaxed max-w-xl"
                >
                  Browse digital books, research papers, manuscripts, and notes. Read PDFs, Word docs, and ePubs seamlessly online.
                </motion.p>
              </div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22 }}
                className="w-full lg:w-[380px]"
              >
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-forest-400 transition-colors pointer-events-none" />
                  <input
                    type="search"
                    value={search}
                    onChange={handleSearch}
                    placeholder="Search by title, author, or keyword…"
                    aria-label="Search library materials"
                    className="w-full pl-11 pr-10 py-3.5 rounded-2xl glass border border-cream-200/90 text-ink placeholder:text-ink-muted text-sm shadow-xs transition-all hover:border-cream-300 focus:outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest-400/10"
                  />
                  {search && (
                    <button
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-ink-muted hover:text-ink transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* ── Scribd Material Format Filter Tabs ── */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              className="mt-8 pt-4 border-t border-cream-200/60 flex items-center gap-2 overflow-x-auto pb-2"
              style={{ scrollbarWidth: 'none' }}
              role="tablist"
              aria-label="Material format filter"
            >
              {FORMAT_TABS.map((tab) => {
                const isActive = activeFormat === tab.id;
                const count = formatCounts[tab.id] ?? 0;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => {
                      setActiveFormat(tab.id);
                      setPage(1);
                    }}
                    className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      isActive
                        ? 'bg-forest-900 text-cream-50 border-forest-900 shadow-sm'
                        : 'bg-white/80 text-ink-light border-cream-200 hover:border-forest-300 hover:text-forest-400'
                    }`}
                  >
                    <span>{tab.label}</span>
                    {count > 0 && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                          isActive ? 'bg-forest-800 text-gold-300' : 'bg-cream-100 text-ink-muted'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* ── Main Content Area ── */}
        <main className="flex-1 w-full">
          {/* Loading Skeletons */}
          {status === 'loading' && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
              <div className="h-5 w-40 rounded-full bg-cream-200 animate-pulse mb-8" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse bg-white/60 p-3 rounded-2xl border border-cream-200">
                    <div className="aspect-[1/1.42] rounded-xl bg-cream-200 mb-3" />
                    <div className="h-3.5 bg-cream-200 rounded w-4/5 mb-2" />
                    <div className="h-3 bg-cream-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {status === 'error' && (
            <div className="max-w-md mx-auto px-6 py-28 text-center">
              <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
              <h3 className="font-display text-xl text-ink font-semibold mb-2">Couldn't load library materials</h3>
              <p className="text-ink-light text-sm mb-6">The server might be offline or undergoing updates. Please try again.</p>
              <button onClick={() => window.location.reload()} className="btn btn-outline-dark inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          )}

          {/* Empty State */}
          {status === 'empty' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-28 text-center max-w-md mx-auto px-6">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-cream-100 border border-cream-200 items-center justify-center mb-4 shadow-xs">
                <BookOpen className="w-7 h-7 text-forest-400/70" />
              </div>
              <h3 className="font-display text-2xl text-ink font-semibold">
                {search ? 'No materials found' : 'No materials yet in this category'}
              </h3>
              <p className="text-ink-light text-sm mt-2 leading-relaxed">
                {search
                  ? `No books or documents match "${search}". Try adjusting keywords or formats.`
                  : 'Materials will appear here as soon as they are uploaded to the library.'}
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                {search && (
                  <button onClick={clearSearch} className="btn btn-outline-dark text-sm px-5 py-2.5">
                    Clear search
                  </button>
                )}
                <Link to="/upload" className="btn btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Upload Material
                </Link>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <>
              {/* ══ FEATURED: Top Curated Materials ══ */}
              {featuredBooks.length > 0 && (
                <section className="border-b border-cream-200/60 bg-gradient-to-b from-cream-100/50 via-cream-100/20 to-transparent">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-gold-500" />
                        <h2 className="text-xs font-bold uppercase tracking-widest text-gold-600">
                          Featured & Trending Materials
                        </h2>
                      </div>
                      <span className="text-xs text-ink-muted">Curated collection</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredBooks.map((book, idx) => (
                        <FeaturedMaterialCard key={book.id} book={book} index={idx} />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ══ CATALOG: Filter Toolbar & Materials Grid/List ══ */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                {/* Toolbar */}
                <div className="flex flex-col gap-4 mb-6 sm:mb-8">
                  {/* Category Filter Pills (Dynamically populated) */}
                  {categories.length > 2 && (
                    <div className="flex gap-2 overflow-x-auto pb-1.5" style={{ scrollbarWidth: 'none' }}>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategory(cat)}
                          className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            activeCategory === cat
                              ? 'bg-forest-400 text-cream-50 border-forest-400 shadow-xs'
                              : 'bg-white/80 text-ink-light border-cream-200 hover:border-forest-300 hover:text-forest-400'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Summary Count, Sorting & View Toggle */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-cream-200/50">
                    <div className="text-xs text-ink-muted font-medium flex items-center gap-2">
                      <span className="font-semibold text-ink">{processedBooks.length}</span>
                      <span>{processedBooks.length === 1 ? 'material available' : 'materials available'}</span>
                      {activeCategory !== 'All' && <span>in <strong className="text-forest-500">{activeCategory}</strong></span>}
                      {search && <span className="italic"> matching "{search}"</span>}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Sort Dropdown */}
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                        <ArrowUpDown className="w-3.5 h-3.5 text-ink-muted" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-white border border-cream-200 rounded-lg px-2.5 py-1.5 text-xs text-ink focus:outline-none focus:border-forest-400 cursor-pointer shadow-xs"
                          aria-label="Sort materials"
                        >
                          <option value="newest">Recently Added</option>
                          <option value="title">Title (A to Z)</option>
                          <option value="pages">Document Length</option>
                        </select>
                      </div>

                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-cream-100 border border-cream-200">
                        <button
                          onClick={() => setViewMode('grid')}
                          aria-label="Grid view"
                          className={`p-1.5 rounded-lg transition-all ${
                            viewMode === 'grid' ? 'bg-white shadow-xs text-forest-400' : 'text-ink-muted hover:text-ink'
                          }`}
                        >
                          <Grid3X3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setViewMode('list')}
                          aria-label="List view"
                          className={`p-1.5 rounded-lg transition-all ${
                            viewMode === 'list' ? 'bg-white shadow-xs text-forest-400' : 'text-ink-muted hover:text-ink'
                          }`}
                        >
                          <LayoutList className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid / List Results */}
                <AnimatePresence mode="wait">
                  {processedBooks.length === 0 ? (
                    <motion.div
                      key="no-match"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-16 text-center bg-white/50 rounded-2xl border border-dashed border-cream-300 p-8"
                    >
                      <p className="text-ink-light text-sm font-medium">No materials match the selected filters.</p>
                      <div className="mt-4 flex items-center justify-center gap-3">
                        <button
                          onClick={() => {
                            setActiveCategory('All');
                            setActiveFormat('all');
                            setSearch('');
                          }}
                          className="btn btn-outline-dark text-xs px-4 py-2"
                        >
                          Reset All Filters
                        </button>
                        <Link
                          to="/upload"
                          className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Material</span>
                        </Link>
                      </div>
                    </motion.div>
                  ) : viewMode === 'grid' ? (
                    <motion.div
                      key="grid-view"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 md:gap-6"
                    >
                      {processedBooks.map((book, i) => (
                        <BookCard key={book.id} book={book} index={i} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list-view"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col gap-3.5"
                    >
                      {processedBooks.map((book, i) => (
                        <ListMaterialRow key={book.id} book={book} index={i} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-14 flex items-center justify-center gap-3" aria-label="Pagination">
                    <button
                      disabled={page === 1}
                      onClick={() => {
                        setPage((p) => Math.max(1, p - 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn btn-outline-dark text-xs px-4 py-2 disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…-' + p);
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item) => {
                          if (typeof item === 'string') {
                            return (
                              <span key={item} className="px-2 text-ink-muted text-xs">
                                …
                              </span>
                            );
                          }
                          const isCurrent = item === page;
                          return (
                            <button
                              key={item}
                              onClick={() => {
                                setPage(item);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                              className={`w-8 h-8 rounded-full text-xs font-semibold transition-all ${
                                isCurrent
                                  ? 'bg-forest-400 text-cream-50 shadow-sm scale-105'
                                  : 'bg-white/80 border border-cream-200 text-ink hover:border-forest-300'
                              }`}
                              aria-current={isCurrent ? 'page' : undefined}
                            >
                              {item}
                            </button>
                          );
                        })}
                    </div>

                    <button
                      disabled={page === totalPages}
                      onClick={() => {
                        setPage((p) => Math.min(totalPages, p + 1));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn btn-outline-dark text-xs px-4 py-2 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </nav>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

/* ═════════════════════════════════════════════════
   FEATURED MATERIAL CARD  — Scribd spotlight card
═════════════════════════════════════════════════ */
function FeaturedMaterialCard({ book, index }) {
  const format = detectMaterialFormat(book);
  const lengthLabel = getMaterialLengthLabel(book);
  const readTime = estimateReadingTime(book);
  const category =
    book.category ||
    (Array.isArray(book.categories) && book.categories.length > 0 ? book.categories[0] : null) ||
    'eBook';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
      className="group relative bg-white rounded-2xl p-4 sm:p-5 border border-cream-200 hover:border-forest-300/80 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between"
    >
      <div className="flex gap-4 sm:gap-5 items-start">
        {/* Cover Preview (with tactile book spine and format badge) */}
        <Link to={`/read/${book.id}`} className="shrink-0 w-24 sm:w-28 block group-hover:scale-[1.02] transition-transform duration-300">
          <BookCover book={book} tilt={false} showBadge={true} />
        </Link>

        {/* Info Column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 bg-gold-50 border border-gold-200/80 px-2 py-0.5 rounded-full">
              {category}
            </span>
            <span className="text-[10px] text-ink-muted">• {readTime}</span>
          </div>

          <Link to={`/books/${book.id}`}>
            <h3 className="font-display text-base sm:text-lg font-semibold text-ink leading-snug line-clamp-2 group-hover:text-forest-400 transition-colors">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-ink-light mt-1">by <span className="font-medium text-ink">{book.author}</span></p>

          {book.description && (
            <p className="text-xs text-ink-muted line-clamp-2 mt-2 leading-relaxed font-reader">
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Action Row */}
      <div className="mt-4 pt-3 border-t border-cream-200/70 flex items-center justify-between">
        <span className="text-xs text-ink-muted font-medium">{lengthLabel}</span>
        <div className="flex items-center gap-2">
          <Link
            to={`/books/${book.id}`}
            className="text-xs font-semibold text-ink-light hover:text-ink px-3 py-1.5 rounded-lg transition-colors"
          >
            Overview
          </Link>
          <Link
            to={`/read/${book.id}`}
            className="btn btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1.5"
          >
            <span>Read Online</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════
   LIST MATERIAL ROW  — Scribd document table row
═════════════════════════════════════════════════ */
function ListMaterialRow({ book, index }) {
  const format = detectMaterialFormat(book);
  const lengthLabel = getMaterialLengthLabel(book);
  const fileSizeLabel = formatFileSize(book.file_size);
  const readTimeLabel = estimateReadingTime(book);
  const category =
    book.category ||
    (Array.isArray(book.categories) && book.categories.length > 0 ? book.categories[0] : null) ||
    null;

  return (
    <motion.article
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: Math.min(0.2, index * 0.03) }}
      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-cream-200/90 hover:border-forest-300/80 shadow-xs hover:shadow-md transition-all duration-200"
    >
      <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
        {/* Thumbnail Cover */}
        <Link
          to={`/read/${book.id}`}
          className="shrink-0 w-12 sm:w-16 block rounded-lg overflow-hidden group-hover:scale-105 transition-transform"
        >
          <BookCover book={book} tilt={false} showBadge={false} />
        </Link>

        {/* Document Metadata */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${format.badgeClass}`}>
              <FileText className="w-2.5 h-2.5" />
              {format.label}
            </span>
            {category && (
              <span className="text-[10px] uppercase font-semibold text-forest-500 bg-forest-50 px-2 py-0.5 rounded-full">
                {category}
              </span>
            )}
            <span className="text-[11px] text-ink-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-gold-500" />
              {readTimeLabel}
            </span>
          </div>

          <Link to={`/books/${book.id}`}>
            <h3 className="font-display text-sm sm:text-base text-ink font-semibold line-clamp-1 group-hover:text-forest-400 transition-colors">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-ink-light truncate mt-0.5">by {book.author}</p>

          {book.description && (
            <p className="text-xs text-ink-muted line-clamp-1 mt-1 hidden md:block font-reader">
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Row Actions */}
      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-cream-200">
        <div className="text-right text-xs text-ink-muted hidden lg:block">
          <div>{lengthLabel}</div>
          {fileSizeLabel && <div>{fileSizeLabel}</div>}
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/books/${book.id}`}
            className="text-xs font-semibold text-ink-light hover:text-ink px-3 py-2 rounded-lg border border-cream-200 hover:bg-cream-100 transition-colors"
          >
            Overview
          </Link>
          <Link
            to={`/read/${book.id}`}
            className="btn btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
          >
            <span>Read</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
