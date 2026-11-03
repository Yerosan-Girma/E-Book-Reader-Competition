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
  PanelLeftClose,
  PanelLeft,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  FileText,
  FileCode,
  LayoutList,
  Eye,
} from 'lucide-react';
import AdobePDFViewer from './AdobePDFViewer';

// Configure PDF.js worker reliably via public asset
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
  componentDidCatch(error) {
    console.warn('PDF Canvas Error caught:', error);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

/**
 * World-Class PDF Reader with Multiple Reading Engines:
 * 1. Continuous Scroll Engine (Scribd & WPS style): all pages flow sequentially with live sidebar thumbnails
 * 2. Official Adobe Acrobat Reader: embedded via Adobe PDF Embed API with free Client ID
 * 3. Native Stream Engine: browser hardware-accelerated PDF viewer
 */
export default function PDFViewer({
  fileUrl,
  initialPage = 1,
  onPageChange,
  theme = 'wps-green',
  bookmarks = [],
  onAddBookmark,
  onRemoveBookmark,
  fileName = 'document.pdf',
  onDownload,
  hasAccess = false,
}) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(() => Number(initialPage) || 1);
  const [pageInput, setPageInput] = useState(() => String(initialPage || 1));
  const [rotation, setRotation] = useState(0);
  const [localScale, setLocalScale] = useState(1.0);
  const [fitMode, setFitMode] = useState('width'); // 'width' | 'custom'

  // Engine: 'adobe' | 'continuous' | 'single' | 'native'
  const hasAdobeKey = Boolean(
    import.meta.env.VITE_ADOBE_PDF_CLIENT_ID ||
      (typeof window !== 'undefined' && localStorage.getItem('readrise_adobe_client_id')) ||
      true // Provided by user
  );
  const [engineMode, setEngineMode] = useState(() => (hasAdobeKey ? 'adobe' : 'continuous'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState('thumbnails'); // 'thumbnails' | 'bookmarks'

  const containerRef = useRef(null);
  const scrollAreaRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(820);
  const isScrollingByCode = useRef(false);

  // Responsive width calculation
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const available = containerRef.current.clientWidth;
        const sidebarW = sidebarOpen ? (available > 900 ? 220 : 0) : 0;
        const maxContent = available - sidebarW - 32;
        setContainerWidth(Math.max(340, Math.min(1150, maxContent)));
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [sidebarOpen]);

  const onDocumentLoadSuccess = ({ numPages: total }) => {
    setNumPages(total);
    const valid = Math.min(Math.max(1, Number(initialPage) || 1), total);
    setPageNumber(valid);
    setPageInput(String(valid));
    if (onPageChange) onPageChange(valid, total);

    // Auto-scroll to saved position if resuming
    if (valid > 1) {
      setTimeout(() => {
        const el = document.getElementById(`pdf-page-wrapper-${valid}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  };

  // Scroll to a specific page
  const scrollToPage = useCallback(
    (pg) => {
      if (!numPages) return;
      const target = Math.max(1, Math.min(pg, numPages));
      setPageNumber(target);
      setPageInput(String(target));

      if (engineMode === 'continuous') {
        const el = document.getElementById(`pdf-page-wrapper-${target}`);
        if (el) {
          isScrollingByCode.current = true;
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setTimeout(() => {
            isScrollingByCode.current = false;
          }, 800);
        }
      }

      if (onPageChange) onPageChange(target, numPages);
    },
    [numPages, engineMode, onPageChange],
  );

  // Scroll observer to update page indicator in continuous mode
  useEffect(() => {
    if (engineMode !== 'continuous' || !numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (isScrollingByCode.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            const pg = Number(entry.target.getAttribute('data-page-number'));
            if (pg && pg !== pageNumber) {
              setPageNumber(pg);
              setPageInput(String(pg));
              if (onPageChange) onPageChange(pg, numPages);
            }
          }
        });
      },
      { threshold: [0.4, 0.7] },
    );

    for (let p = 1; p <= numPages; p++) {
      const el = document.getElementById(`pdf-page-wrapper-${p}`);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [engineMode, numPages, onPageChange]);

  const prevPage = () => scrollToPage(pageNumber - 1);
  const nextPage = () => scrollToPage(pageNumber + 1);

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(pageInput, 10);
    if (!isNaN(p)) {
      scrollToPage(p);
    } else {
      setPageInput(String(pageNumber));
    }
  };

  const zoomIn = () => {
    setLocalScale((s) => Math.min(s + 0.2, 2.5));
    setFitMode('custom');
  };

  const zoomOut = () => {
    setLocalScale((s) => Math.max(s - 0.2, 0.5));
    setFitMode('custom');
  };

  const fitWidth = () => {
    setLocalScale(1.0);
    setFitMode('width');
  };

  const rotate = () => setRotation((r) => (r + 90) % 360);

  const isCurrentPageBookmarked = bookmarks?.some(
    (b) => String(b.position) === String(pageNumber) || Number(b.page) === pageNumber,
  );

  const handleToggleBookmark = (pg = pageNumber) => {
    const isBookmarked = bookmarks?.some(
      (b) => String(b.position) === String(pg) || Number(b.page) === pg,
    );
    if (isBookmarked) {
      const existing = bookmarks.find(
        (b) => String(b.position) === String(pg) || Number(b.page) === pg,
      );
      if (existing && onRemoveBookmark) onRemoveBookmark(existing.id);
    } else if (onAddBookmark) {
      onAddBookmark({
        position: String(pg),
        page: pg,
        label: `Page ${pg}`,
      });
    }
  };

  const themeBgClasses = {
    'wps-green': 'bg-[#e7f3e8]',
    light: 'bg-[#f4f4f6]',
    sepia: 'bg-[#f7f2e7]',
    dark: 'bg-[#18181b]',
  };

  return (
    <div
      ref={containerRef}
      className={`pdf-reader-root w-full min-h-[calc(100vh-130px)] flex flex-col transition-colors duration-200 ${
        themeBgClasses[theme] || themeBgClasses['wps-green']
      }`}
    >
      {/* ─── Consolidated Professional PDF Command Bar ────────────────── */}
      <div className="sticky top-14 z-20 w-full px-3 py-1.5 bg-white/95 backdrop-blur-md border-b border-cream-300 shadow-xs flex flex-wrap items-center justify-between gap-2 text-ink text-xs">
        {/* Left: Engine Info or Sidebar Toggle & Page Nav */}
        <div className="flex items-center gap-2">
          {engineMode === 'adobe' ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-red-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                A
              </div>
              <span className="font-semibold text-xs text-ink hidden sm:inline">
                Adobe Acrobat Reader (Full Screen)
              </span>
            </div>
          ) : engineMode === 'native' ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-ink">
              <span className="w-2 h-2 rounded-full bg-forest-600" />
              <span>Native Browser Stream</span>
            </div>
          ) : (
            <>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-1.5 rounded-lg border transition ${
                  sidebarOpen ? 'bg-cream-200 border-cream-300 text-forest-700' : 'hover:bg-cream-100 border-cream-200 text-ink-muted'
                }`}
                title={sidebarOpen ? 'Hide thumbnail drawer' : 'Show thumbnail drawer'}
              >
                {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
              </button>

              {/* Page Jumper */}
              <div className="flex items-center gap-1 bg-cream-100 rounded-lg p-0.5">
                <button
                  onClick={prevPage}
                  disabled={pageNumber <= 1}
                  className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <form onSubmit={handlePageInputSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    onBlur={() => setPageInput(String(pageNumber))}
                    className="w-9 text-center font-bold text-xs py-0.5 px-0.5 bg-white rounded border border-cream-300 focus:outline-none"
                  />
                  <span className="text-[11px] text-ink-muted px-1.5">/ {numPages || '…'}</span>
                </form>

                <button
                  onClick={nextPage}
                  disabled={!numPages || pageNumber >= numPages}
                  className="p-1 rounded hover:bg-white disabled:opacity-30 disabled:pointer-events-none transition"
                  title="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Center: Zoom & View Mode */}
        {engineMode !== 'adobe' && engineMode !== 'native' && (
          <div className="flex items-center gap-1">
            <button
              onClick={zoomOut}
              disabled={localScale <= 0.5}
              className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition"
              title="Zoom out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={fitWidth}
              className={`px-2 py-1 rounded-md text-[11px] font-semibold transition ${
                fitMode === 'width' ? 'bg-cream-200 text-forest-700' : 'hover:bg-cream-100 text-ink-muted'
              }`}
              title="Fit to comfortable page width"
            >
              Fit Width
            </button>

            <button
              onClick={zoomIn}
              disabled={localScale >= 2.5}
              className="p-1.5 rounded-lg hover:bg-cream-100 disabled:opacity-30 transition"
              title="Zoom in (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={rotate}
              className="p-1.5 rounded-lg hover:bg-cream-100 text-ink-muted hover:text-ink transition"
              title="Rotate 90 degrees"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <div className="h-4 w-px bg-cream-300 mx-1 hidden sm:block" />

            {/* Continuous vs Single Page Switcher */}
            <div className="inline-flex rounded-lg bg-cream-100 p-0.5 text-[11px] font-medium">
              <button
                onClick={() => setEngineMode('continuous')}
                className={`px-2 py-1 rounded transition ${
                  engineMode === 'continuous' ? 'bg-white shadow-xs text-forest-700 font-bold' : 'text-ink-muted'
                }`}
                title="Continuous vertical scroll (Scribd/WPS mode)"
              >
                Scroll View
              </button>
              <button
                onClick={() => setEngineMode('single')}
                className={`px-2 py-1 rounded transition ${
                  engineMode === 'single' ? 'bg-white shadow-xs text-forest-700 font-bold' : 'text-ink-muted'
                }`}
                title="Single page card view"
              >
                Page View
              </button>
            </div>
          </div>
        )}

        {/* Right: Engine Selector & Actions */}
        <div className="flex items-center gap-1.5">
          {/* Reader Engine Switcher */}
          <div className="inline-flex rounded-lg bg-cream-200/80 p-0.5 text-[11px] font-semibold">
            <button
              onClick={() => setEngineMode('continuous')}
              className={`px-2.5 py-1 rounded-md transition ${
                engineMode === 'continuous' || engineMode === 'single'
                  ? 'bg-white shadow-xs text-forest-700'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="High Performance Continuous Document Reader"
            >
              Reader
            </button>

            <button
              onClick={() => setEngineMode('adobe')}
              className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                engineMode === 'adobe'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Official Adobe Acrobat Reader (Free API Key)"
            >
              <span className="font-black text-[10px]">A</span> Adobe
            </button>

            <button
              onClick={() => setEngineMode('native')}
              className={`px-2.5 py-1 rounded-md transition ${
                engineMode === 'native'
                  ? 'bg-white shadow-xs text-forest-700'
                  : 'text-ink-muted hover:text-ink'
              }`}
              title="Browser Native PDF Stream"
            >
              Stream
            </button>
          </div>

          <div className="h-4 w-px bg-cream-300 mx-1 hidden sm:block" />

          {/* Bookmark Current */}
          <button
            onClick={() => handleToggleBookmark(pageNumber)}
            className={`p-1.5 rounded-lg border transition ${
              isCurrentPageBookmarked ? 'bg-gold-50 border-gold-300 text-gold-700' : 'hover:bg-cream-100 border-cream-200 text-ink-muted'
            }`}
            title="Bookmark current page"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isCurrentPageBookmarked ? 'fill-gold-500' : ''}`} />
          </button>

          {/* Download (Gated by Chapa) */}
          <button
            onClick={onDownload}
            type="button"
            className="p-1.5 rounded-lg border border-cream-200 hover:bg-cream-100 text-ink-muted hover:text-ink transition cursor-pointer"
            title={hasAccess ? "Download PDF document" : "Pay 50 ETB via Chapa to download"}
          >
            <Download className={`w-3.5 h-3.5 ${hasAccess ? 'text-forest-600' : 'text-gold-600'}`} />
          </button>
        </div>
      </div>

      {/* ─── Main Content Viewport ────────────────────────────────────────── */}
      <div className="flex-1 flex w-full relative overflow-hidden">
        {/* ════ Mode A: Adobe Acrobat Engine ════ */}
        {engineMode === 'adobe' ? (
          <div className="w-full flex-1 p-0 overflow-hidden">
            <AdobePDFViewer
              fileUrl={fileUrl}
              fileName={fileName}
              initialPage={pageNumber}
              onPageChange={(p) => {
                if (onPageChange && numPages) onPageChange(p, numPages);
              }}
              onSwitchEngine={(eng) => setEngineMode(eng)}
            />
          </div>
        ) : engineMode === 'native' ? (
          /* ════ Mode B: Browser Native Stream Engine ════ */
          <div className="w-full flex-1 h-[calc(100vh-96px)] bg-slate-900 p-0">
            <embed
              src={`${fileUrl}#page=${pageNumber}&view=FitH`}
              type="application/pdf"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          /* ════ Mode C: Continuous & Single Page Reader ════ */
          <div className="flex-1 flex w-full relative">
            {/* Left Collapsible Thumbnails Drawer */}
            {sidebarOpen && numPages && (
              <aside className="w-48 sm:w-56 shrink-0 bg-white/90 backdrop-blur-md border-r border-cream-300 p-3 h-[calc(100vh-96px)] sticky top-28 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-cream-200">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSidebarTab('thumbnails')}
                      className={`text-xs font-semibold pb-1 border-b-2 transition ${
                        sidebarTab === 'thumbnails' ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-muted'
                      }`}
                    >
                      Pages ({numPages})
                    </button>
                    <button
                      onClick={() => setSidebarTab('bookmarks')}
                      className={`text-xs font-semibold pb-1 border-b-2 transition ${
                        sidebarTab === 'bookmarks' ? 'border-forest-600 text-forest-700' : 'border-transparent text-ink-muted'
                      }`}
                    >
                      Bookmarks ({bookmarks.length})
                    </button>
                  </div>
                </div>

                {sidebarTab === 'thumbnails' ? (
                  <div className="space-y-3">
                    {Array.from(new Array(numPages), (_, i) => {
                      const p = i + 1;
                      const isActive = p === pageNumber;
                      return (
                        <button
                          key={`thumb_${p}`}
                          onClick={() => scrollToPage(p)}
                          className={`w-full text-left p-1.5 rounded-xl border transition group ${
                            isActive
                              ? 'bg-forest-50 border-forest-500 ring-2 ring-forest-500/20 shadow-sm'
                              : 'bg-cream-50 hover:bg-white border-cream-200 hover:border-cream-300'
                          }`}
                        >
                          <div className="aspect-[1/1.3] w-full rounded-lg bg-white border border-black/10 overflow-hidden flex flex-col items-center justify-center p-2 text-ink-muted">
                            <span className="text-[10px] font-bold text-ink mb-1">Page {p}</span>
                            <div className="w-full space-y-1 opacity-25">
                              <div className="h-1 bg-current rounded w-full" />
                              <div className="h-1 bg-current rounded w-3/4" />
                              <div className="h-1 bg-current rounded w-4/5" />
                            </div>
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] px-1">
                            <span className={`font-semibold ${isActive ? 'text-forest-700' : 'text-ink-muted'}`}>
                              {p}
                            </span>
                            {bookmarks.some((b) => Number(b.page) === p) && (
                              <Bookmark className="w-3 h-3 fill-gold-500 text-gold-500" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {bookmarks.length === 0 ? (
                      <p className="text-xs text-ink-muted py-6 text-center">No bookmarks saved yet.</p>
                    ) : (
                      bookmarks.map((bm) => (
                        <button
                          key={bm.id}
                          onClick={() => scrollToPage(Number(bm.page) || 1)}
                          className="w-full text-left p-2 rounded-lg hover:bg-cream-100 text-xs text-ink flex items-center justify-between group"
                        >
                          <span className="truncate font-medium">{bm.label || `Page ${bm.page}`}</span>
                          <span className="text-[10px] text-ink-muted">p.{bm.page}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </aside>
            )}

            {/* Document Canvas Column */}
            <main
              ref={scrollAreaRef}
              className="flex-1 flex flex-col items-center py-6 px-3 sm:px-6 overflow-y-auto"
            >
              <PDFErrorBoundary
                fallback={(err) => (
                  <div className="w-full max-w-lg bg-white p-8 rounded-3xl border border-cream-200 shadow-lg text-center my-12">
                    <FileText className="w-12 h-12 text-forest-500 mx-auto mb-3" />
                    <h3 className="font-bold text-lg text-ink mb-2">Switching to Browser Native Stream</h3>
                    <p className="text-xs text-ink-muted mb-6">
                      Your browser can render this document directly with maximum clarity and hardware acceleration.
                    </p>
                    <button
                      onClick={() => setEngineMode('native')}
                      className="btn btn-primary text-xs px-6 py-2.5 rounded-xl"
                    >
                      Stream Native PDF
                    </button>
                  </div>
                )}
              >
                <Document
                  file={fileUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex flex-col items-center justify-center py-32 gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-forest-600" />
                      <span className="text-sm font-semibold text-ink">Preparing Document Stream…</span>
                      <span className="text-xs text-ink-muted">Rendering crisp vector pages</span>
                    </div>
                  }
                  className="flex flex-col items-center w-full"
                >
                  {/* Mode C1: Continuous Scroll through ALL pages */}
                  {engineMode === 'continuous' ? (
                    <div className="w-full flex flex-col items-center">
                      {Array.from(new Array(numPages || 1), (_, idx) => {
                        const pg = idx + 1;
                        return (
                          <div
                            key={`continuous_page_${pg}`}
                            id={`pdf-page-wrapper-${pg}`}
                            data-page-number={pg}
                            className="pdf-page-wrapper w-full flex flex-col items-center mb-8"
                          >
                            <div className="bg-white rounded-2xl shadow-xl border border-black/10 overflow-hidden transition-transform duration-200">
                              <Page
                                pageNumber={pg}
                                width={containerWidth}
                                scale={localScale}
                                rotate={rotation}
                                renderAnnotationLayer={true}
                                renderTextLayer={true}
                                loading={
                                  <div
                                    style={{ width: containerWidth, height: containerWidth * 1.3 }}
                                    className="flex items-center justify-center bg-white"
                                  >
                                    <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
                                  </div>
                                }
                              />
                            </div>
                            <div className="mt-2 flex items-center justify-between text-xs text-ink-muted w-full max-w-[600px] px-4">
                              <span>Page {pg} of {numPages}</span>
                              <button
                                onClick={() => handleToggleBookmark(pg)}
                                className="text-[11px] hover:text-forest-600 transition"
                              >
                                {bookmarks.some((b) => Number(b.page) === pg) ? '★ Bookmarked' : '☆ Bookmark'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Mode C2: Single Page Card View */
                    <div className="flex flex-col items-center my-4">
                      <div className="bg-white rounded-2xl shadow-2xl border border-black/10 overflow-hidden">
                        <Page
                          pageNumber={pageNumber}
                          width={containerWidth}
                          scale={localScale}
                          rotate={rotation}
                          renderAnnotationLayer={true}
                          renderTextLayer={true}
                          loading={
                            <div
                              style={{ width: containerWidth, height: containerWidth * 1.3 }}
                              className="flex items-center justify-center bg-white"
                            >
                              <Loader2 className="w-6 h-6 animate-spin text-forest-400" />
                            </div>
                          }
                        />
                      </div>
                      <div className="mt-3 text-xs font-semibold text-ink-muted">
                        Page {pageNumber} of {numPages}
                      </div>
                    </div>
                  )}
                </Document>
              </PDFErrorBoundary>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
