import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import {
  Loader2,
  AlertTriangle,
  Search,
  Bookmark,
  ChevronDown,
} from 'lucide-react';
import api from '../../api/client';

export default function DocViewer({
  bookId,
  fileUrl,
  initialPosition = 0,
  onPositionChange,
  fontSize = 18,
  onAddBookmark,
  onDownload,
  hasAccess = false,
}) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(() => Boolean(bookId));
  const [error, setError] = useState(() => (bookId ? null : 'Book ID required for DOC conversion'));
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const contentRef = useRef(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    if (!bookId) return;
    let isCancelled = false;

    const loadConvertedDoc = async () => {
      try {
        setError(null);

        // Fetch converted HTML from backend conversion service
        const response = await api.get(`/books/${bookId}/converted`);
        if (isCancelled) return;

        if (response.data?.html) {
          const sanitized = DOMPurify.sanitize(response.data.html);
          setHtmlContent(sanitized);
        } else {
          throw new Error('Could not convert legacy DOC file');
        }
        setLoading(false);
      } catch (err) {
        if (!isCancelled) {
          console.error('Legacy DOC load error:', err);
          setError(
            err.response?.data?.error ||
              err?.message ||
              'Legacy Word .doc file could not be rendered online',
          );
          setLoading(false);
        }
      }
    };

    loadConvertedDoc();

    return () => {
      isCancelled = true;
    };
  }, [bookId]);

  // Restore scroll position
  useEffect(() => {
    if (!loading && htmlContent && !restoredRef.current && initialPosition) {
      restoredRef.current = true;
      setTimeout(() => {
        const percent = parseFloat(initialPosition);
        if (!isNaN(percent) && percent > 0 && percent <= 100) {
          const scrollH = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({
            top: (percent / 100) * scrollH,
            behavior: 'smooth',
          });
        }
      }, 300);
    }
  }, [loading, htmlContent, initialPosition]);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollH = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollH <= 0) return;
      const percent = Math.min(100, Math.max(0, (window.scrollY / scrollH) * 100));
      if (onPositionChange) {
        onPositionChange(percent.toFixed(1), percent);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onPositionChange]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.find(searchQuery, false, false, true, false, true, false);
  };

  const handleBookmarkCurrent = () => {
    const scrollH = document.documentElement.scrollHeight - window.innerHeight;
    const pct = scrollH > 0 ? Math.round((window.scrollY / scrollH) * 100) : 0;
    if (onAddBookmark) {
      onAddBookmark({
        position: String(pct),
        page: Math.max(1, Math.round(pct / 10)),
        label: `Position ${pct}%`,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-forest-500" />
        <span className="text-sm font-medium text-ink-muted">Converting legacy Word document…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-6 max-w-md mx-auto bg-white rounded-2xl border border-red-200 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-lg text-ink mb-2">Unsupported Legacy Format</h3>
        <p className="text-sm text-ink-light mb-6">{error}</p>
        <button
          onClick={onDownload}
          type="button"
          className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm cursor-pointer"
        >
          {hasAccess ? 'Download Word Document' : 'Download via Chapa (50 ETB)'}
        </button>
      </div>
    );
  }

  return (
    <div className="doc-reader w-full max-w-3xl mx-auto px-6 py-6">
      {/* Floating search & bookmark bar */}
      <div className="sticky top-16 z-20 flex justify-end mb-4">
        {showSearch ? (
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-md border border-cream-300 rounded-full py-1.5 px-3 shadow-md text-sm"
          >
            <Search className="w-4 h-4 text-ink-muted" />
            <input
              type="text"
              placeholder="Find in document…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 sm:w-56 bg-transparent text-xs focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="p-1 hover:bg-cream-100 rounded-full text-ink-muted hover:text-ink"
              title="Next match"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowSearch(false)}
              className="text-xs text-ink-muted hover:text-ink px-1"
            >
              Done
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSearch(true)}
              className="p-2 rounded-full bg-white/80 backdrop-blur-md border border-cream-200 shadow-sm hover:bg-cream-100 text-ink-muted transition"
              title="Search document"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={handleBookmarkCurrent}
              className="p-2 rounded-full bg-white/80 backdrop-blur-md border border-cream-200 shadow-sm hover:bg-cream-100 text-ink-muted transition"
              title="Bookmark current position"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <article
        ref={contentRef}
        className="doc-content reader-content"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
