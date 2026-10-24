import { useEffect, useState, useMemo } from 'react';
import { Search, BookOpen, X, Grid3X3, LayoutList, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import BookCard from '../components/BookCard';
import api from '../api/client';

/* ── gradient pool ── */
const gradientOptions = [
  'from-forest-600 via-forest-700 to-forest-900',
  'from-forest-400 via-secondary-green to-forest-600',
  'from-gold-400 via-gold-500 to-gold-600',
  'from-gold-300 via-gold-400 to-forest-500',
  'from-sage-300 via-sage-400 to-forest-500',
  'from-forest-500 via-gold-400 to-gold-600',
  'from-blue-400 via-blue-500 to-blue-600',
  'from-purple-400 via-purple-500 to-purple-600',
  'from-rose-400 via-rose-500 to-rose-600',
  'from-amber-400 via-amber-500 to-amber-600',
];

/* ── identical params to FeaturedBooks so the same server path succeeds ── */
function useBooks({ page, search }) {
  const [state, setState] = useState({ status: 'loading', books: [], totalPages: 1 });

  useEffect(() => {
    let cancelled = false;

    // Use limit:12 — well within the backend cap of 50
    api.get('/books', { params: { page, limit: 12, search: search || undefined } })
      .then(({ data }) => {
        if (cancelled) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setState({ status: items.length > 0 ? 'success' : 'empty', books: items, totalPages: data.totalPages || 1 });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Books fetch failed:', err);
        setState({ status: 'error', books: [], totalPages: 1 });
      });

    return () => { cancelled = true; };
  }, [page, search]);

  return state;
}

export default function Books() {
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  const { status, books, totalPages } = useBooks({ page, search });

  /* Show all books as featured since we only have 3 sample books */
  const featuredBooks = useMemo(
    () => (page === 1 && !search ? books : []),
    [books, page, search],
  );

  /* rest → filterable grid */
  const gridBooks = useMemo(() => {
    if (activeCategory === 'All') return books;
    return books.filter((b) => (b.categories?.[0] || b.category) === activeCategory);
  }, [books, activeCategory]);

  /* unique categories - showing all available categories */
  const categories = useMemo(() => {
    const cats = new Set();
    books.forEach((b) => { const c = b.categories?.[0] || b.category; if (c) cats.add(c); });
    return ['All', ...Array.from(cats).sort()];
  }, [books]);

  const handleSearch = (e) => { setPage(1); setActiveCategory('All'); setSearch(e.target.value); };
  const clearSearch  = ()  => { setSearch(''); setPage(1); };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col relative overflow-x-hidden">
      {/* background blobs */}
      <div className="absolute -top-12 -right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(216,170,91,.12) 0%,transparent 70%)', filter: 'blur(70px)' }} aria-hidden="true" />
      <div className="absolute top-1/3 -left-32 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(23,76,56,.08) 0%,transparent 70%)', filter: 'blur(90px)' }} aria-hidden="true" />
      <div className="absolute bottom-60 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle,rgba(216,170,91,.08) 0%,transparent 70%)', filter: 'blur(80px)' }} aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />

      <Navbar />

      <div className="flex-1 flex flex-col">

        {/* ── Hero Header ── */}
        <section className="pt-24 sm:pt-28 md:pt-36 pb-8 sm:pb-10 bg-gradient-to-b from-cream-100/90 via-cream-100/40 to-cream-50 border-b border-cream-200/60 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col gap-6 sm:gap-8">
              <div className="max-w-2xl">
                <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }} className="mb-3 sm:mb-4">
                  <span className="chip chip-forest gap-1.5 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
                    <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-forest-400" /> Library
                  </span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08 }}
                  className="font-display text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-ink font-semibold tracking-tight leading-[1.1]">
                  Explore Books
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.16 }}
                  className="mt-2.5 sm:mt-3.5 text-ink-light text-sm sm:text-base md:text-lg leading-relaxed max-w-xl">
                  Find your next great read from our curated library. Stories, wisdom, and knowledge for every journey.
                </motion.p>
              </div>

              {/* Search */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22 }} className="w-full lg:w-[420px]">
                <div className="relative group">
                  <Search className="w-4 h-4 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-forest-400 transition-colors pointer-events-none" />
                  <input type="search" value={search} onChange={handleSearch}
                    placeholder="Search by title or author…" aria-label="Search books"
                    className="w-full pl-10 sm:pl-11 pr-9 sm:pr-10 py-3 sm:py-3.5 rounded-2xl glass border border-cream-200/90 text-ink placeholder:text-ink-muted text-sm shadow-xs transition-all hover:border-cream-300 focus:outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest-400/10" />
                  {search && (
                    <button onClick={clearSearch} aria-label="Clear search"
                      className="absolute right-3 sm:right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-ink-muted hover:text-ink transition-colors">
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Content ── */}
        <main className="flex-1 w-full">

          {/* Loading */}
          {status === 'loading' && (
            <div className="max-w-7xl mx-auto px-6 py-10">
              <div className="h-4 w-32 rounded-full bg-cream-200 animate-pulse mb-6" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-cream-200 aspect-[2/3]" />
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-[3/4] rounded-xl bg-cream-200 mb-3" />
                    <div className="h-3.5 bg-cream-200 rounded w-4/5 mb-2" />
                    <div className="h-3 bg-cream-200 rounded w-3/5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="max-w-md mx-auto px-6 py-28 text-center">
              <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
              <h3 className="font-display text-xl text-ink font-semibold mb-2">Couldn't load books</h3>
              <p className="text-ink-light text-sm mb-6">The server may be offline. Please try again.</p>
              <button onClick={() => window.location.reload()}
                className="btn btn-outline-dark inline-flex gap-2">
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          )}

          {/* Empty (API returned 0 books) */}
          {status === 'empty' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="py-28 text-center max-w-md mx-auto px-6">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-cream-100 border border-cream-200 items-center justify-center mb-4 shadow-xs">
                <BookOpen className="w-7 h-7 text-forest-400/70" />
              </div>
              <h3 className="font-display text-2xl text-ink font-semibold">
                {search ? 'No books found' : 'No books yet'}
              </h3>
              <p className="text-ink-light text-sm mt-2 leading-relaxed">
                {search
                  ? `No books match "${search}". Try a different keyword.`
                  : 'The library is empty. Books will appear here once added by an admin.'}
              </p>
              {!search && (
                <p className="text-xs text-ink-muted mt-3">
                  Demo showing 2 sample categories. More categories can be added by admin or readers.
                </p>
              )}
              {search && (
                <button onClick={clearSearch} className="mt-6 btn btn-outline-dark text-sm px-5 py-2.5">
                  Clear search
                </button>
              )}
            </motion.div>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              {/* ══ FEATURED: top books ══ */}
              {featuredBooks.length > 0 && (
                <section className="border-b border-cream-200/60 bg-gradient-to-b from-cream-100/60 to-transparent">
                  <div className="max-w-7xl mx-auto px-6 py-10">
                    {/* label */}
                    <div className="flex items-center gap-2 mb-6">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <span className="text-xs font-bold uppercase tracking-widest text-gold-500">
                        Featured Books
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredBooks.slice(0, 3).map((book, idx) => (
                        <FeaturedBookCard key={book.id} book={book} index={idx} />
                      ))}
                    </div>
                  </div>
                </section>
              )}

              {/* ══ REST: category filter + grid / list ══ */}
              <div className="max-w-7xl mx-auto px-6 py-10">

                {/* Toolbar */}
                {gridBooks.length > 0 || activeCategory !== 'All' ? (
                  <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
                    {/* category pills */}
                    <div className="flex gap-2 overflow-x-auto pb-1.5 flex-1 min-w-0" style={{ scrollbarWidth: 'none' }}>
                      {categories.map((cat) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                          className={`flex-shrink-0 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-all border ${
                            activeCategory === cat
                              ? 'bg-forest-400 text-cream-50 border-forest-400 shadow-sm'
                              : 'bg-white/80 text-ink-light border-cream-200 hover:border-forest-300 hover:text-forest-400'
                          }`}>
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* count + view toggle */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-ink-muted font-medium">
                        {gridBooks.length} {gridBooks.length === 1 ? 'book' : 'books'}
                        {search && <span className="italic"> for "{search}"</span>}
                      </span>
                      <div className="flex items-center gap-1 p-1 rounded-xl bg-cream-100 border border-cream-200">
                        <button onClick={() => setViewMode('grid')} aria-label="Grid view"
                          className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-xs text-forest-400' : 'text-ink-muted hover:text-ink'}`}>
                          <Grid3X3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setViewMode('list')} aria-label="List view"
                          className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-xs text-forest-400' : 'text-ink-muted hover:text-ink'}`}>
                          <LayoutList className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Grid / List */}
                <AnimatePresence mode="wait">
                  {gridBooks.length === 0 ? (
                    <motion.div key="no-cat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="py-16 text-center">
                      <p className="text-ink-light text-sm">No other books in this category.</p>
                      <button onClick={() => setActiveCategory('All')}
                        className="mt-4 btn btn-outline-dark text-sm px-5 py-2.5">
                        Show all
                      </button>
                    </motion.div>
                  ) : viewMode === 'grid' ? (
                    <motion.div key="grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 md:gap-6">
                      {gridBooks.map((book, i) => (
                        <BookCard key={book.id} book={book} index={i} />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div key="list" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
                      className="flex flex-col gap-3">
                      {gridBooks.map((book, i) => (
                        <ListBookCard key={book.id} book={book} index={i} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pagination */}
                {totalPages > 1 && (
                  <nav className="mt-16 flex items-center justify-center gap-3" aria-label="Pagination">
                    <button disabled={page === 1}
                      onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="btn btn-outline-dark text-sm px-4 py-2 disabled:opacity-40">
                      Previous
                    </button>
                    <div className="flex items-center gap-1.5 px-3">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…-' + p);
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item) => {
                          if (typeof item === 'string') return <span key={item} className="px-2 text-ink-muted text-xs">…</span>;
                          const isCurrent = item === page;
                          return (
                            <button key={item}
                              onClick={() => { setPage(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                              className={`w-9 h-9 rounded-full text-xs font-semibold transition-all ${
                                isCurrent ? 'bg-forest-400 text-cream-50 shadow-sm scale-105'
                                  : 'bg-white/80 border border-cream-200 text-ink hover:border-forest-300 hover:bg-white'
                              }`}
                              aria-current={isCurrent ? 'page' : undefined}>
                              {item}
                            </button>
                          );
                        })}
                    </div>
                    <button disabled={page === totalPages}
                      onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="btn btn-outline-dark text-sm px-4 py-2 disabled:opacity-40">
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

/* ═══════════════════════════════════════
   FEATURED BOOK CARD  — compact featured
═══════════════════════════════════════ */
function FeaturedBookCard({ book, index }) {
  const cat = book.category || book.categories?.[0];

  // Use category-based gradient system
  const categoryGradients = {
    'Spiritual': 'from-purple-500 via-purple-600 to-purple-800',
    'Psychology': 'from-blue-500 via-blue-600 to-blue-800',
    'Education': 'from-forest-500 via-forest-600 to-forest-800',
    'Fiction': 'from-rose-500 via-rose-600 to-rose-800',
    'default': 'from-gold-400 via-gold-500 to-gold-700',
  };

  const fallbackGradients = [
    'from-forest-500 via-forest-600 to-forest-800',
    'from-gold-400 via-gold-500 to-gold-700',
    'from-purple-500 via-purple-600 to-purple-800',
  ];

  const coverBg = categoryGradients[cat] || fallbackGradients[(book.id ?? index) % fallbackGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link to={`/read/${book.id}`} className="group block"
        aria-label={`Start reading ${book.title} by ${book.author}`}>
        {/* Compact featured cover */}
        <div className={`relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-gradient-to-br ${coverBg} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}>
          {book.cover_url && (
            <img src={book.cover_url} alt="" loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Rank badge */}
          <div className="absolute top-3 left-3">
            <span className="rounded-full bg-gold-400/30 border border-gold-400/50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold-300 backdrop-blur-sm">
              #{index + 1}
            </span>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
            {cat && (
              <span className="inline-block mb-2 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/20 backdrop-blur-sm text-cream-50/90">
                {cat}
              </span>
            )}
            <p className="font-display text-sm sm:text-base text-cream-50 font-semibold leading-tight line-clamp-2 drop-shadow-sm">
              {book.title}
            </p>
            <p className="text-cream-50/70 text-[10px] sm:text-[11px] truncate mt-0.5">{book.author}</p>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-400/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}

/* ═══════════════════════════════════════
   LIST BOOK CARD  — compact row
═══════════════════════════════════════ */
function ListBookCard({ book, index }) {
  const cat = book.category || book.categories?.[0];

  // Use category-based gradient system
  const categoryGradients = {
    'Spiritual': 'from-purple-500 via-purple-600 to-purple-800',
    'Psychology': 'from-blue-500 via-blue-600 to-blue-800',
    'Education': 'from-forest-500 via-forest-600 to-forest-800',
    'Fiction': 'from-rose-500 via-rose-600 to-rose-800',
    'default': 'from-gold-400 via-gold-500 to-gold-700',
  };

  const fallbackGradients = [
    'from-forest-500 via-forest-600 to-forest-800',
    'from-gold-400 via-gold-500 to-gold-700',
    'from-purple-500 via-purple-600 to-purple-800',
  ];

  const coverBg = categoryGradients[cat] || fallbackGradients[(book.id ?? index) % fallbackGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
    >
      <Link to={`/read/${book.id}`}
        className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-xl bg-white/80 border border-cream-200/80 hover:border-forest-300/50 hover:shadow-md transition-all duration-200">
        <div className={`flex-shrink-0 w-12 h-16 sm:w-14 sm:h-[4.5rem] rounded-lg bg-gradient-to-br ${coverBg} relative overflow-hidden shadow-sm`}>
          {book.cover_url && (
            <img src={book.cover_url} alt="" loading="lazy"
              className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm text-ink font-medium leading-snug line-clamp-1 group-hover:text-forest-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5 truncate">{book.author}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {cat && <span className="chip chip-forest text-[10px] py-0.5 px-2 font-medium">{cat}</span>}
            {book.language && (
              <span className="text-[10px] text-ink-muted flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-gold-500" />{book.language}
              </span>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 w-7 h-7 rounded-full border border-cream-200 flex items-center justify-center text-ink-muted group-hover:border-forest-300 group-hover:text-forest-400 group-hover:bg-forest-400/5 transition-all">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </motion.div>
  );
}
