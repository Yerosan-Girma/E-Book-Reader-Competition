import { useState, useEffect, useRef, useCallback } from 'react';
import ePub from 'epubjs';
import {
  ChevronLeft,
  ChevronRight,
  List,
  Bookmark,
  Loader2,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function EPUBViewer({
  fileUrl,
  initialPosition = null,
  onPositionChange,
  fontSize = 18,
  theme = 'light',
  onAddBookmark,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toc, setToc] = useState([]);
  const [showToc, setShowToc] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [chapterTitle, setChapterTitle] = useState('');

  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);

  // Initialize EPUB
  useEffect(() => {
    let isMounted = true;

    const book = ePub(fileUrl);
    bookRef.current = book;

    book.loaded.navigation.then((nav) => {
      if (isMounted) {
        setToc(nav.toc || []);
      }
    });

    const rendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      flow: 'paginated',
      spread: 'auto',
    });
    renditionRef.current = rendition;

    // Apply initial theme styles
    rendition.themes.register('light', {
      body: { background: '#FAF8F5', color: '#1A2E26', 'font-family': 'Georgia, serif' },
    });
    rendition.themes.register('sepia', {
      body: { background: '#F4ECD8', color: '#5B4636', 'font-family': 'Georgia, serif' },
    });
    rendition.themes.register('dark', {
      body: { background: '#121E19', color: '#D4E2D8', 'font-family': 'Georgia, serif' },
    });
    rendition.themes.select(theme);
    rendition.themes.fontSize(`${fontSize}px`);

    const startLoc = initialPosition && typeof initialPosition === 'string' && initialPosition.startsWith('epubcfi(')
      ? initialPosition
      : undefined;

    rendition.display(startLoc).then(() => {
      if (isMounted) setLoading(false);
    }).catch((err) => {
      console.warn('Initial display position error, falling back to beginning:', err);
      rendition.display().then(() => {
        if (isMounted) setLoading(false);
      }).catch(() => {
        if (isMounted) {
          setError('Failed to load EPUB file');
          setLoading(false);
        }
      });
    });

    // Relocated listener
    rendition.on('relocated', (location) => {
      if (!isMounted) return;
      setCurrentLocation(location);
      const cfi = location.start.cfi;
      const percent = location.start.percentage ? (location.start.percentage * 100).toFixed(1) : '0';

      // Find current chapter from TOC
      if (book.navigation && location.start.href) {
        const item = book.navigation.toc.find((t) => t.href.includes(location.start.href));
        if (item) setChapterTitle(item.label);
      }

      if (onPositionChange) {
        onPositionChange(cfi, Number(percent));
      }
    });

    return () => {
      isMounted = false;
      if (renditionRef.current) {
        try {
          renditionRef.current.destroy();
        } catch { /* ignore */ }
      }
      if (bookRef.current) {
        try {
          bookRef.current.destroy();
        } catch { /* ignore */ }
      }
    };
  }, [fileUrl]); // eslint-disable-line

  // Update theme when changed
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.select(theme);
    }
  }, [theme]);

  // Update font size when changed
  useEffect(() => {
    if (renditionRef.current) {
      renditionRef.current.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize]);

  const handlePrev = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  }, []);

  const handleNext = useCallback(() => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  }, []);

  const handleGoToChapter = (href) => {
    if (renditionRef.current) {
      renditionRef.current.display(href);
      setShowToc(false);
    }
  };

  const handleBookmarkCurrent = () => {
    if (!currentLocation?.start?.cfi) return;
    const cfi = currentLocation.start.cfi;
    const label = chapterTitle ? `${chapterTitle}` : 'EPUB Location';
    if (onAddBookmark) {
      onAddBookmark({
        position: cfi,
        label,
      });
    }
  };

  return (
    <div className="epub-reader relative flex flex-col items-center w-full min-h-[80vh]">
      {/* ─── EPUB Secondary Toolbar ─────────────────────────────────────── */}
      <div className="sticky top-16 z-20 w-full max-w-4xl px-4 py-2 my-2 flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md border border-cream-300 rounded-2xl shadow-sm text-ink text-sm">
        <div className="flex items-center gap-2">
          {toc.length > 0 && (
            <button
              onClick={() => setShowToc((v) => !v)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-cream-100 flex items-center gap-1.5 text-xs font-medium text-forest-700 transition"
              title="Table of Contents"
            >
              <List className="w-4 h-4" />
              <span>Chapters ({toc.length})</span>
            </button>
          )}

          {chapterTitle && (
            <span className="text-xs text-ink-muted truncate max-w-[200px] sm:max-w-xs">
              {chapterTitle}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleBookmarkCurrent}
            className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition"
            title="Bookmark this location"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-cream-300 mx-1" />

          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-cream-100 transition"
            title="Previous page (Left arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg hover:bg-cream-100 transition"
            title="Next page (Right arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─── TOC Drawer / Modal ─────────────────────────────────────────── */}
      {showToc && (
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowToc(false)}
          />
          <div className="relative w-80 max-w-full bg-white h-full shadow-2xl z-50 flex flex-col p-6 border-r border-cream-200 overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-cream-200 mb-4">
              <h3 className="font-display font-semibold text-lg text-ink">Table of Contents</h3>
              <button
                onClick={() => setShowToc(false)}
                className="p-1.5 hover:bg-cream-100 rounded-full text-ink-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {toc.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleGoToChapter(item.href)}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-cream-100 text-sm text-ink transition truncate block"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── EPUB Rendition Stage ───────────────────────────────────────── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-forest-500" />
          <span className="text-sm font-medium text-ink-muted">Rendering EPUB book…</span>
        </div>
      )}

      {error && (
        <div className="text-center py-16 px-6 max-w-md bg-white rounded-2xl border border-red-200 shadow-sm">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="font-semibold text-lg text-ink mb-2">Could Not Render EPUB</h3>
          <p className="text-sm text-ink-light mb-6">{error}</p>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
          >
            Download EPUB File
          </a>
        </div>
      )}

      <div
        ref={viewerRef}
        className="epub-viewport w-full max-w-4xl flex-1 bg-white shadow-xl rounded-2xl border border-cream-200 overflow-hidden"
        style={{ minHeight: '75vh', display: loading || error ? 'none' : 'block' }}
      />
    </div>
  );
}
