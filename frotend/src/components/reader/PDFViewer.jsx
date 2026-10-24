import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Bookmark,
  RotateCw,
  Loader2,
  AlertTriangle,
  Download,
} from 'lucide-react';

// Configure PDF.js worker reliably via public assets or CDN fallback
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
}

class PDFErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('PDF ErrorBoundary caught error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

export default function PDFViewer({
  fileUrl,
  initialPage = 1,
  onPageChange,
  bookmarks = [],
  onAddBookmark,
  onRemoveBookmark,
  scale = 1.0,
  onScaleChange,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(() => Number(initialPage) || 1);
  const [prevInitial, setPrevInitial] = useState(initialPage);
  const [rotation, setRotation] = useState(0);
  const [localScale, setLocalScale] = useState(scale);
  const [pageInput, setPageInput] = useState(() => String(initialPage || 1));
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  // Sync state if initialPage prop changes
  if (initialPage !== prevInitial) {
    setPrevInitial(initialPage);
    const p = Number(initialPage) || 1;
    setPageNumber(p);
    setPageInput(String(p));
  }

  // Measure container width for responsive fit
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 48; // padding
        setContainerWidth(Math.max(320, Math.min(1000, width)));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const onDocumentLoadSuccess = ({ numPages: total }) => {
    setNumPages(total);
    setError(null);
    const validPage = Math.min(Math.max(1, Number(initialPage) || 1), total);
    setPageNumber(validPage);
    setPageInput(String(validPage));
    if (onPageChange) {
      onPageChange(validPage, total);
    }
  };

  const onDocumentLoadError = (err) => {
    console.error('PDF load error:', err);
    setError(err?.message || 'Failed to render PDF document');
  };

  const goToPage = useCallback(
    (page) => {
      if (!numPages) return;
      const target = Math.max(1, Math.min(page, numPages));
      setPageNumber(target);
      setPageInput(String(target));
      if (onPageChange) {
        onPageChange(target, numPages);
      }
    },
    [numPages, onPageChange],
  );

  const prevPage = () => goToPage(pageNumber - 1);
  const nextPage = () => goToPage(pageNumber + 1);

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p)) {
      goToPage(p);
    } else {
      setPageInput(String(pageNumber));
    }
  };

  const zoomIn = () => {
    const nextScale = Math.min(localScale + 0.2, 2.5);
    setLocalScale(nextScale);
    if (onScaleChange) onScaleChange(nextScale);
  };

  const zoomOut = () => {
    const nextScale = Math.max(localScale - 0.2, 0.5);
    setLocalScale(nextScale);
    if (onScaleChange) onScaleChange(nextScale);
  };

  const resetZoom = () => {
    setLocalScale(1.0);
    if (onScaleChange) onScaleChange(1.0);
  };

  const rotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  const isCurrentPageBookmarked = bookmarks?.some(
    (b) => String(b.position) === String(pageNumber) || Number(b.page) === pageNumber,
  );

  const handleToggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      const existing = bookmarks.find(
        (b) => String(b.position) === String(pageNumber) || Number(b.page) === pageNumber,
      );
      if (existing && onRemoveBookmark) {
        onRemoveBookmark(existing.id);
      }
    } else if (onAddBookmark) {
      onAddBookmark({
        position: String(pageNumber),
        page: pageNumber,
        label: `Page ${pageNumber}`,
      });
    }
  };

  const renderErrorUI = (errMessage) => (
    <div className="text-center py-16 px-6 max-w-md mx-auto bg-white rounded-2xl border border-red-200 shadow-sm">
      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <h3 className="font-semibold text-lg text-ink mb-2">Could Not Render PDF</h3>
      <p className="text-sm text-ink-light mb-6">{errMessage || error || 'Failed to display PDF document'}</p>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
      >
        <Download className="w-4 h-4" /> Download PDF File
      </a>
    </div>
  );

  return (
    <div className="pdf-reader flex flex-col items-center w-full" ref={containerRef}>
      {/* ─── PDF Floating Secondary Toolbar ──────────────────────────────── */}
      <div className="sticky top-16 z-20 w-full max-w-4xl px-4 py-2 my-2 flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md border border-cream-300 rounded-2xl shadow-sm text-ink text-sm">
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevPage}
            disabled={pageNumber <= 1}
            title="Previous page (Left arrow)"
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1">
            <span className="text-xs text-ink-muted hidden sm:inline">Page</span>
            <input
              type="text"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onBlur={() => setPageInput(String(pageNumber))}
              aria-label="Current page number"
              className="w-12 text-center text-xs font-semibold py-1 px-1 border border-cream-300 rounded-md bg-cream-50 focus:bg-white focus:outline-none focus:border-forest-500"
            />
            <span className="text-xs text-ink-muted">/ {numPages || '…'}</span>
          </form>

          <button
            onClick={nextPage}
            disabled={!numPages || pageNumber >= numPages}
            title="Next page (Right arrow)"
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 disabled:pointer-events-none transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zoom & view controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={zoomOut}
            disabled={localScale <= 0.5}
            title="Zoom out"
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={resetZoom}
            title="Reset zoom to 100%"
            className="px-2 py-1 text-xs font-medium rounded-lg hover:bg-cream-100 transition"
          >
            {Math.round(localScale * 100)}%
          </button>

          <button
            onClick={zoomIn}
            disabled={localScale >= 2.5}
            title="Zoom in"
            className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={rotate}
            title="Rotate 90 degrees"
            className="p-1.5 rounded-lg hover:bg-cream-100 transition text-ink-muted hover:text-ink"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-cream-300 mx-1" />

          {/* Bookmark page */}
          <button
            onClick={handleToggleBookmark}
            title={isCurrentPageBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
            className={`p-1.5 rounded-lg transition flex items-center gap-1 text-xs font-medium ${
              isCurrentPageBookmarked
                ? 'bg-gold-100 text-gold-700'
                : 'hover:bg-cream-100 text-ink-muted'
            }`}
          >
            <Bookmark
              className={`w-4 h-4 ${isCurrentPageBookmarked ? 'fill-gold-500 text-gold-500' : ''}`}
            />
            <span className="hidden sm:inline">
              {isCurrentPageBookmarked ? 'Bookmarked' : 'Bookmark'}
            </span>
          </button>
        </div>
      </div>

      {/* ─── PDF Document Canvas ────────────────────────────────────────── */}
      <div className="pdf-canvas-container flex justify-center py-6 w-full overflow-auto">
        {error ? (
          renderErrorUI(error)
        ) : (
          <PDFErrorBoundary fallback={(err) => renderErrorUI(err?.message)}>
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-forest-500" />
                  <span className="text-sm font-medium text-ink-muted">Loading PDF pages…</span>
                </div>
              }
              className="flex flex-col items-center shadow-xl rounded-lg overflow-hidden border border-black/10 bg-white"
            >
              <Page
                pageNumber={pageNumber}
                scale={localScale}
                width={containerWidth}
                rotate={rotation}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                loading={
                  <div className="h-[600px] flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
                  </div>
                }
              />
            </Document>
          </PDFErrorBoundary>
        )}
      </div>

      {/* ─── Quick Bottom Slider ────────────────────────────────────────── */}
      {numPages > 1 && (
        <div className="w-full max-w-xl px-6 py-4 flex items-center gap-4 text-xs text-ink-muted">
          <span>1</span>
          <input
            type="range"
            min={1}
            max={numPages}
            value={pageNumber}
            onChange={(e) => goToPage(Number(e.target.value))}
            className="flex-1 accent-forest-600 cursor-pointer h-1.5 bg-cream-300 rounded-lg"
          />
          <span>{numPages}</span>
        </div>
      )}
    </div>
  );
}
