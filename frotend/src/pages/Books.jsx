import { useEffect, useState } from 'react';
import { Search, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import BookCard from '../components/BookCard';
import api from '../api/client';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let cancelled = false;

    const loadingTimer = window.setTimeout(() => {
      if (!cancelled) setLoading(true);
    }, 0);

    api.get('/books', { params: { page, search, limit: 12 } })
      .then(({ data }) => {
        if (cancelled) return;
        setBooks(data.items || []);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Failed to load books:', err);
        setBooks([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [page, search]);

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between relative overflow-x-hidden">
      {/* Decorative background blobs */}
      <div
        className="absolute -top-12 -right-20 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(216, 170, 91, 0.12) 0%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -left-32 w-[520px] h-[520px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(23, 76, 56, 0.08) 0%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute bottom-60 right-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(216, 170, 91, 0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Hero header area */}
        <section className="pt-28 md:pt-36 pb-12 sm:pb-16 bg-gradient-to-b from-cream-100/90 via-cream-100/40 to-cream-50 border-b border-cream-200/60 relative">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
              {/* Left Title & Description */}
              <div className="max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
                  className="mb-4"
                >
                  <span className="chip chip-forest gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                    <BookOpen className="w-3.5 h-3.5 text-forest-400" />
                    Library
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                  className="font-display text-4xl sm:text-5xl lg:text-6xl text-ink font-semibold tracking-tight leading-[1.1]"
                >
                  Explore Books
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                  className="mt-3.5 text-ink-light text-base sm:text-lg leading-relaxed max-w-xl"
                >
                  Find your next great read from our curated library. Stories, wisdom, and knowledge to empower your reading journey.
                </motion.p>
              </div>

              {/* Search bar: glass-style input with Search icon, wider on desktop */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
                className="w-full lg:w-[420px]"
              >
                <div className="relative group">
                  <Search
                    className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-forest-400 transition-colors pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => {
                      setPage(1);
                      setSearch(e.target.value);
                    }}
                    placeholder="Search by title or author…"
                    aria-label="Search books"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass border border-cream-200/90 text-ink placeholder:text-ink-muted text-sm shadow-xs transition-all duration-200 hover:border-cream-300 focus:outline-none focus:border-forest-400 focus:ring-4 focus:ring-forest-400/10"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Books Grid & Content */}
        <main className="max-w-7xl mx-auto px-6 py-12 flex-1 w-full">
          {loading ? (
            /* Loading state: centered spinner with animated pulse */
            <div className="py-32 flex flex-col items-center justify-center gap-4">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-forest-400/15 animate-ping absolute" />
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-cream-200/80 flex items-center justify-center relative z-10">
                  <Loader2 className="w-6 h-6 text-forest-400 animate-spin" />
                </div>
              </div>
              <p className="text-sm font-medium text-ink-light animate-pulse mt-1">
                Loading books…
              </p>
            </div>
          ) : books.length === 0 ? (
            /* Empty state: animated empty illustration with Search icon */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="py-28 text-center max-w-md mx-auto"
            >
              <div className="inline-flex w-16 h-16 rounded-2xl bg-cream-100 border border-cream-200 items-center justify-center mb-4 text-forest-400 shadow-xs">
                <Search className="w-7 h-7 text-forest-400/70" />
              </div>
              <h3 className="font-display text-2xl text-ink font-semibold">No books found</h3>
              <p className="text-ink-light text-sm mt-2 leading-relaxed">
                {search
                  ? `No books match "${search}". Try searching by another keyword or author.`
                  : 'No books available at the moment. Please check back soon.'}
              </p>
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  className="mt-6 btn btn-outline-dark text-sm px-5 py-2.5"
                >
                  Clear search
                </button>
              )}
            </motion.div>
          ) : (
            <>
              {/* Results meta count */}
              <div className="flex items-center justify-between mb-8 pb-3 border-b border-cream-200/50">
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                  {search ? `Results for "${search}"` : 'Curated Library'}
                </p>
                <span className="text-xs text-ink-muted font-medium">
                  Page {page} of {totalPages}
                </span>
              </div>

              {/* Animated book grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
                {books.map((b, i) => (
                  <BookCard key={b.id} book={b} index={i} />
                ))}
              </div>

              {/* Pagination: styled with btn-outline-dark buttons, current page highlight */}
              {totalPages > 1 && (
                <nav
                  className="mt-16 flex items-center justify-center gap-3"
                  aria-label="Pagination"
                >
                  <button
                    disabled={page === 1}
                    onClick={() => {
                      setPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="btn btn-outline-dark text-sm px-4 py-2 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1.5 px-3">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) {
                          acc.push('ellipsis-' + p);
                        }
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
                            className={`w-9 h-9 rounded-full text-xs font-semibold transition-all duration-200 ${
                              isCurrent
                                ? 'bg-forest-400 text-cream-50 shadow-sm scale-105'
                                : 'bg-white/80 border border-cream-200 text-ink hover:border-forest-300 hover:bg-white'
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
                    className="btn btn-outline-dark text-sm px-4 py-2 disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              )}
            </>
          )}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}