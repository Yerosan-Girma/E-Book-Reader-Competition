import { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import DOMPurify from 'dompurify';
import {
  Loader2,
  AlertTriangle,
  Search,
  Bookmark,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Download,
  FileText,
  Sparkles,
} from 'lucide-react';

/**
 * WPS-Style Word Document Reader (.docx)
 * Converts Word docs client-side via Mammoth with clean editorial typography,
 * WPS eye-care green protection theme, and interactive document search.
 */
export default function DocxViewer({
  fileUrl,
  initialPosition = 0,
  onPositionChange,
  fontSize = 18,
  theme = 'light',
  bookmarks = [],
  onAddBookmark,
  onRemoveBookmark,
  onDownload,
  hasAccess = false,
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

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToBottom = () =>
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

  const themeBgClasses = {
    light: 'bg-[#f4f4f6]',
    'wps-green': 'bg-[#e7f3e8]',
    sepia: 'bg-[#f7f2e7]',
    dark: 'bg-[#18181b]',
  };

  const paperBgClasses = {
    light: 'bg-white text-ink border-cream-300',
    'wps-green': 'bg-[#f4faf4] text-[#1b3a24] border-emerald-200/80',
    sepia: 'bg-[#fbf7ed] text-[#3f2f18] border-amber-200/80',
    dark: 'bg-[#22242a] text-[#e2e8f0] border-white/10',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-forest-500" />
        <span className="text-sm font-medium text-ink-muted">Converting Word document (WPS Engine)…</span>
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
          <Download className="w-4 h-4" /> Download DOCX File
        </a>
      </div>
    );
  }

  return (
    <div
      className={`docx-reader flex flex-col items-center w-full min-h-[calc(100vh-140px)] transition-colors duration-200 px-4 py-4 ${
        themeBgClasses[theme] || themeBgClasses.light
      }`}
    >
      {/* ─── WPS Word Top Command Bar ─── */}
      <div className="sticky top-16 z-20 w-full max-w-4xl px-4 py-2 my-2 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-cream-300 rounded-2xl shadow-sm text-ink text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <FileText className="w-3.5 h-3.5" /> Word .docx
          </span>
          <span className="text-xs text-ink-muted hidden sm:inline">
            Scroll {currentScrollPercent()}%
          </span>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-1.5">
          {showSearch ? (
            <form
              onSubmit={handleSearch}
              className="flex items-center gap-1.5 bg-cream-100 rounded-full py-1 px-3 text-xs"
            >
              <Search className="w-3.5 h-3.5 text-ink-muted" />
              <input
                type="text"
                placeholder="Find in doc…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 sm:w-44 bg-transparent text-xs focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="p-0.5 hover:bg-white rounded-full text-ink-muted hover:text-ink"
                title="Next match"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="text-[11px] text-ink-muted hover:text-ink px-1"
              >
                Done
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition"
              title="Search in document"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={handleBookmarkCurrent}
            className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition"
            title="Bookmark this position"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={scrollToTop}
            className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition"
            title="Jump to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>

          <button
            onClick={scrollToBottom}
            className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition"
            title="Jump to Bottom"
          >
            <ArrowDown className="w-4 h-4" />
          </button>

          <button
            onClick={onDownload}
            type="button"
            className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition cursor-pointer"
            title={hasAccess ? "Download original DOCX file" : "Pay 50 ETB via Chapa to download"}
          >
            <Download className={`w-4 h-4 ${hasAccess ? 'text-forest-600' : 'text-gold-600'}`} />
          </button>
        </div>
      </div>

      {/* ─── WPS Document Paper Sheet ─── */}
      <article
        ref={contentRef}
        className={`docx-content reader-content w-full max-w-4xl p-6 sm:p-12 md:p-16 rounded-2xl shadow-book border my-4 transition-colors ${
          paperBgClasses[theme] || paperBgClasses.light
        }`}
        style={{ fontSize: `${fontSize}px` }}
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </div>
  );
}
