import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  Bookmark,
  BookmarkCheck,
  Grid,
  Sparkles,
  Download,
} from 'lucide-react';

/**
 * WPS-Style Image & Illustrated Document Reader
 * High performance image viewer with pan, zoom, rotate, page flip, and thumbnail gallery
 */
export default function ImageViewer({
  book,
  chapters = [],
  fileUrl,
  initialPage = 1,
  onPageChange,
  theme = 'light',
  bookmarks = [],
  onAddBookmark,
  onRemoveBookmark,
}) {
  // Collect all image plates/pages
  const images = useRef([]);

  if (chapters && chapters.length > 0 && chapters.some((c) => c.content?.startsWith('http') || c.content?.includes('uploads/'))) {
    images.current = chapters.map((c, idx) => ({
      page: idx + 1,
      title: c.title || `Page ${idx + 1}`,
      src: c.content,
    }));
  } else if (fileUrl) {
    images.current = [
      {
        page: 1,
        title: book?.title || 'Plate 1',
        src: fileUrl,
      },
    ];
  } else if (book?.cover_url) {
    images.current = [
      {
        page: 1,
        title: book?.title || 'Plate 1',
        src: book.cover_url,
      },
    ];
  } else {
    images.current = [
      {
        page: 1,
        title: 'Illustration 1',
        src: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1400',
      },
    ];
  }

  const totalPages = images.current.length;
  const [currentPage, setCurrentPage] = useState(() => Math.min(totalPages, Math.max(1, Number(initialPage) || 1)));
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Pan / drag state
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const activeImage = images.current[currentPage - 1] || images.current[0];

  const goToPage = useCallback(
    (pg) => {
      const target = Math.max(1, Math.min(pg, totalPages));
      setCurrentPage(target);
      setPosition({ x: 0, y: 0 });
      if (onPageChange) {
        onPageChange(target, totalPages);
      }
    },
    [totalPages, onPageChange],
  );

  const prevPage = () => goToPage(currentPage - 1);
  const nextPage = () => goToPage(currentPage + 1);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevPage();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        nextPage();
      } else if (e.key === '+' || e.key === '=') {
        setScale((s) => Math.min(s + 0.25, 4.0));
      } else if (e.key === '-') {
        setScale((s) => Math.max(s - 0.25, 0.5));
      } else if (e.key === '0') {
        setScale(1.0);
        setPosition({ x: 0, y: 0 });
      } else if (e.key === 'r' || e.key === 'R') {
        setRotation((r) => (r + 90) % 360);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  // Pan handlers
  const handleMouseDown = (e) => {
    if (scale <= 1.0) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const isCurrentPageBookmarked = bookmarks?.some(
    (b) => Number(b.page) === currentPage || String(b.position) === String(currentPage),
  );

  const toggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      const existing = bookmarks.find(
        (b) => Number(b.page) === currentPage || String(b.position) === String(currentPage),
      );
      if (existing && onRemoveBookmark) onRemoveBookmark(existing.id);
    } else if (onAddBookmark) {
      onAddBookmark({
        position: String(currentPage),
        page: currentPage,
        label: `Plate ${currentPage}: ${activeImage?.title || 'Illustration'}`,
      });
    }
  };

  const themeBgClasses = {
    light: 'bg-[#f4f4f5]',
    'wps-green': 'bg-[#e7f3e8]',
    sepia: 'bg-[#f7f2e7]',
    dark: 'bg-[#18181b]',
  };

  return (
    <div
      ref={containerRef}
      className={`wps-image-viewer flex flex-col items-center w-full min-h-[calc(100vh-140px)] transition-colors duration-200 select-none ${
        themeBgClasses[theme] || themeBgClasses.light
      }`}
    >
      {/* ─── WPS Image Control Bar ─── */}
      <div className="sticky top-16 z-20 w-full max-w-4xl px-4 py-2 my-2 flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-cream-300 rounded-2xl shadow-sm text-ink text-sm">
        {/* Page Nav */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevPage}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Previous plate (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold px-2 py-1 rounded bg-cream-100">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 disabled:pointer-events-none transition"
            title="Next plate (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className="text-xs text-ink-muted hidden md:inline ml-2 truncate max-w-[200px]">
            {activeImage?.title}
          </span>
        </div>

        {/* Zoom & Transform Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            disabled={scale <= 0.5}
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition"
            title="Zoom out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setScale(1.0);
              setPosition({ x: 0, y: 0 });
            }}
            className="px-2 py-1 text-xs font-medium rounded-lg hover:bg-cream-100 transition"
            title="Reset to 100%"
          >
            {Math.round(scale * 100)}%
          </button>

          <button
            onClick={() => setScale((s) => Math.min(s + 0.25, 4.0))}
            disabled={scale >= 4.0}
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition"
            title="Zoom in (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="p-1.5 rounded-lg hover:bg-cream-100 transition text-ink-muted hover:text-ink"
            title="Rotate 90° (R)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowThumbnails(!showThumbnails)}
            className={`p-1.5 rounded-lg transition ${
              showThumbnails ? 'bg-forest-100 text-forest-700' : 'hover:bg-cream-100 text-ink-muted'
            }`}
            title="Toggle thumbnails drawer"
          >
            <Grid className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-cream-300 mx-1" />

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            title={isCurrentPageBookmarked ? 'Remove bookmark' : 'Bookmark this image'}
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
              isCurrentPageBookmarked ? 'bg-gold-100 text-gold-700' : 'hover:bg-cream-100 text-ink-muted'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-gold-500 text-gold-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* ─── Image Display Canvas ─── */}
      <div
        className="flex-1 w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden relative cursor-default"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
      >
        <div
          className="relative max-w-full max-h-[75vh] flex items-center justify-center transition-transform duration-100"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
          }}
        >
          <img
            src={activeImage?.src}
            alt={activeImage?.title || 'Book plate'}
            draggable={false}
            className="max-w-[92vw] sm:max-w-4xl max-h-[72vh] object-contain rounded-xl shadow-2xl border border-black/15 bg-white pointer-events-auto"
            onError={(e) => {
              // Fallback to placeholder if link fails
              e.currentTarget.src =
                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1200';
            }}
          />
        </div>
      </div>

      {/* ─── Bottom Thumbnail Filmstrip (WPS Gallery style) ─── */}
      {showThumbnails && totalPages > 1 && (
        <div className="w-full max-w-4xl p-3 bg-white/90 backdrop-blur-md border border-cream-300 rounded-2xl shadow-lg mb-4 flex items-center gap-3 overflow-x-auto">
          {images.current.map((img) => (
            <button
              key={img.page}
              onClick={() => goToPage(img.page)}
              className={`shrink-0 w-16 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                currentPage === img.page ? 'border-forest-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={img.src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Quick Navigation Hint */}
      <div className="text-[11px] text-ink-muted/70 pb-4 flex items-center gap-2">
        <span>Use Left/Right arrows or spacebar to flip pages</span>
        <span>•</span>
        <span>Drag to pan when zoomed</span>
      </div>
    </div>
  );
}
