import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { demoBooks } from '../../data/demoBooks';
import SectionHeading from '../ui/SectionHeading';
import api from '../../api/client';
import LandingBackdrop from '../ui/LandingBackdrop';

const coverGradients = [
  'from-forest-400 via-forest-500 to-forest-600',
  'from-forest-300 via-forest-400 to-forest-500',
  'from-forest-500 via-forest-600 to-forest-700',
];

function normalizeLiveBook(book, index) {
  return {
    ...book,
    category: book.categories?.[0] || 'Featured',
    language: book.language || 'English',
    coverGradient: coverGradients[index % coverGradients.length],
    isDemo: false,
  };
}

function useFeaturedBooks() {
  const [state, setState] = useState({
    status: 'loading',
    books: [],
    error: null,
    source: null,
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const mode = new URLSearchParams(window.location.search).get('featured');

    const load = async () => {
      await new Promise((resolve) => window.setTimeout(resolve, 350));
      if (cancelled) return;
      if (mode === 'error') {
        setState({ status: 'error', books: [], error: 'Featured books could not be loaded.', source: null });
        return;
      }
      if (mode === 'empty') {
        setState({ status: 'empty', books: [], error: null, source: null });
        return;
      }

      try {
        const { data } = await api.get('/books', { params: { page: 1, limit: 6 } });
        if (cancelled) return;
        const liveBooks = Array.isArray(data.items) ? data.items : [];
        if (liveBooks.length > 0) {
          setState({
            status: 'success',
            books: liveBooks.map(normalizeLiveBook),
            error: null,
            source: 'live',
          });
        } else {
          setState({
            status: 'success',
            books: demoBooks.map((book) => ({ ...book, isDemo: true })),
            error: null,
            source: 'demo',
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            books: [],
            error: error.response?.data?.error || 'Featured books could not be loaded.',
            source: null,
          });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setState({ status: 'loading', books: [], error: null, source: null });
    setReloadKey((key) => key + 1);
  };

  return { ...state, retry };
}

const categoryColors = {
  'Self Development': { bg: 'rgba(23,76,56,0.1)', text: '#174C38', border: 'rgba(23,76,56,0.2)' },
  'Fiction':          { bg: 'rgba(216,170,91,0.1)', text: '#A67F2D', border: 'rgba(216,170,91,0.25)' },
  'Business':         { bg: 'rgba(44,112,84,0.1)', text: '#2C7054', border: 'rgba(44,112,84,0.2)' },
  'Literature':       { bg: 'rgba(221,232,217,0.6)', text: '#174C38', border: 'rgba(184,209,181,0.5)' },
  'Adventure':        { bg: 'rgba(216,170,91,0.12)', text: '#C4963E', border: 'rgba(216,170,91,0.3)' },
  'Education':        { bg: 'rgba(44,112,84,0.1)', text: '#0B2920', border: 'rgba(44,112,84,0.2)' },
};

export default function FeaturedBooks() {
  const { status, books, error, retry, source } = useFeaturedBooks();

  return (
    <section
      id="featured-books"
      className="py-28 relative overflow-hidden scroll-mt-24"
      style={{ background: 'linear-gradient(to bottom, #F8F5ED, #FFFCF6)' }}
    >
      <LandingBackdrop variant="library" />
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream-300 to-transparent" />
        <div
          className="absolute -top-20 right-0 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(216,170,91,0.08) 0%, transparent 70%)', filter: 'blur(40px)' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-96 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(44,112,84,0.06) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
          <SectionHeading
            eyebrow="Find Your Next Favorite"
            heading="Stories worth your time."
            description="Explore ideas, stories, and perspectives that help you grow."
          />
          <Link
            to="/explore"
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-forest-400 hover:text-forest-500 group transition-colors"
          >
            Browse all books
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {status === 'loading' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-7" aria-busy="true" aria-label="Loading sample books">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] rounded-lg bg-cream-200 mb-4" />
                <div className="h-4 bg-cream-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-cream-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="rounded-2xl border border-cream-200 bg-white p-10 text-center max-w-md mx-auto">
            <AlertCircle className="w-10 h-10 text-error mx-auto mb-4" aria-hidden="true" />
            <p className="font-display text-lg text-ink mb-2">Couldn&apos;t load featured books</p>
            <p className="text-sm text-ink-light mb-6">{error}</p>
            <button type="button" onClick={retry} className="btn btn-outline-dark inline-flex">
              <RefreshCw className="w-4 h-4" /> Try again
            </button>
          </div>
        )}

        {status === 'empty' && (
          <div className="rounded-2xl border border-dashed border-sage-300 bg-white/80 p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-forest-400 mx-auto mb-4" aria-hidden="true" />
            <p className="font-display text-xl text-ink mb-2">No sample titles yet</p>
            <p className="text-sm text-ink-light mb-6">The demo catalog is empty — explore the library when titles are added.</p>
            <Link to="/explore" className="btn btn-primary inline-flex">Browse library</Link>
          </div>
        )}

        {/* Book grid */}
        {status === 'success' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-7">
          {books.slice(0, 6).map((book, index) => {
            const catStyle = categoryColors[book.category] || categoryColors['Education'];
            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.55, delay: index * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
              >
                <Link
                  to={book.isDemo ? '/explore' : `/books/${book.id}`}
                  className="group block"
                  aria-label={book.isDemo ? `Explore the library: ${book.title}` : `View ${book.title}`}
                >
                  {/* Digital library card */}
                  <div className="mb-4 overflow-hidden rounded-2xl border border-sage-200 bg-white/80 p-2 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    <div
                      className={`relative aspect-[4/5] overflow-hidden rounded-xl bg-gradient-to-br ${book.coverGradient}
                                  flex flex-col justify-between p-4`}
                    >
                      {book.cover_url && (
                        <img
                          src={book.cover_url}
                          alt=""
                          loading="lazy"
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,14,0.04),rgba(4,20,14,0.45))]" aria-hidden="true" />
                      <div className="relative z-10 flex items-center justify-between">
                        <p className="text-[8px] uppercase tracking-[0.2em] text-cream-50/65">ReadRise</p>
                        <span className="rounded-full border border-cream-50/25 bg-cream-50/10 px-2 py-1 text-[7px] font-semibold tracking-[0.14em] text-cream-50/85">E-BOOK</span>
                      </div>
                      <div className="relative z-10">
                        <div className="w-6 h-px bg-gold-400/60 mb-2" />
                        <p className="font-display text-xs md:text-sm text-cream-50 leading-tight line-clamp-3">
                          {book.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Book info */}
                  <div className="px-1">
                    <h3 className="font-display text-sm md:text-base text-ink leading-snug line-clamp-2
                                   group-hover:text-forest-400 transition-colors duration-200">
                      {book.title}
                    </h3>
                    <p className="text-xs text-ink-muted mt-1 truncate">{book.author}</p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                        style={{
                          background: catStyle.bg,
                          color:      catStyle.text,
                          border:     `1px solid ${catStyle.border}`,
                        }}
                      >
                        {book.category}
                      </span>
                      <span className="text-[10px] text-ink-muted flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {book.language}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Mobile browse link */}
        {status === 'success' && (
        <div className="mt-10 md:hidden text-center">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-sm font-semibold text-forest-400 hover:text-forest-500 group transition-colors"
          >
            Browse all books
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        )}

        {status === 'success' && (
          <p className="text-center text-xs text-ink-muted mt-8 italic">
            {source === 'live'
              ? 'Titles from the ReadRise catalog'
              : 'Sample titles — demo catalog, not live inventory'}
          </p>
        )}
      </div>
    </section>
  );
}
