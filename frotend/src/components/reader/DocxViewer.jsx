import { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import {
  Loader2,
  AlertTriangle,
  Search,
  Bookmark,
  ChevronDown,
} from 'lucide-react';

export default function DocxViewer({
  fileUrl,
  initialPosition = 0,
  onPositionChange,
  fontSize = 18,
  onAddBookmark,
}) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const contentRef = useRef(null);
  const restoredRef = useRef(false);

  useEffect(() => {
    let isCancelled = false;

    const loadDocx = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error(`Failed to download Word document (${response.status})`);
        }
        const arrayBuffer = await response.arrayBuffer();
        if (isCancelled) return;

        const result = await mammoth.convertToHtml({ arrayBuffer });
        const clean = DOMPurify.sanitize(result.value);
        setHtmlContent(clean);
        setLoading(false);
      } catch (err) {
        if (!isCancelled) {
          console.error('DOCX load error:', err);
          setError(err?.message || 'Failed to render DOCX file');
          setLoading(false);
        }
      }
    };

    loadDocx();
    return () => {
      isCancelled = true;
    };
  }, [fileUrl]);

  // Restore scroll position after loading
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

  // Search highlighting
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim() || !contentRef.current) return;

    window.find(searchQuery, false, false, true, false, true, false);
  };

  const currentScrollPercent = () => {
    const scrollH = document.documentElement.scrollHeight - window.innerHeight;
    return scrollH > 0 ? Math.round((window.scrollY / scrollH) * 100) : 0;
  };

  const handleBookmarkCurrent = () => {
    const pct = currentScrollPercent();
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
        <span className="text-sm font-medium text-ink-muted">Converting Word document…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-6 max-w-md mx-auto bg-white rounded-2xl border border-red-200 shadow-sm">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h3 className="font-semibold text-lg text-ink mb-2">Could Not Open Word Document</h3>
        <p className="text-sm text-ink-light mb-6">{error}</p>
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
        >
          Download DOCX File
        </a>
      </div>
    );
  }

  return (
    <div className="docx-reader w-full max-w-3xl mx-auto px-6 py-6">
      {/* Floating search bar toggle */}
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

      {/* Rendered & Sanitized HTML from Mammoth */}
      <article
        ref={contentRef}
        className="docx-content reader-content"
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
