import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  ArrowLeft,
  Pause,
  Play,
  Sun,
  Moon,
  Coffee,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Bookmark,
  Trash2,
  ChevronDown,
} from 'lucide-react';
import api from '../../api/client';
import PDFViewer from './PDFViewer';
import DocxViewer from './DocxViewer';
import EPUBViewer from './EPUBViewer';
import TextViewer from './TextViewer';
import RTFViewer from './RTFViewer';
import DocViewer from './DocViewer';
import ChapterViewer from './ChapterViewer';

const FONT_SIZES = [15, 16, 17, 18, 20, 22, 24];
const THEMES = ['light', 'sepia', 'dark'];

export default function BookReader({
  book,
  chapters = [],
  chapterId,
  onSelectChapter,
  currentChapter,
  status,
  seconds,
  onStartSession,
  onPauseSession,
  onResumeSession,
  onFinishSession,
}) {
  const [theme, setTheme] = useState('light');
  const [fontIdx, setFontIdx] = useState(3); // 18px default
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showBookmarksMenu, setShowBookmarksMenu] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [savedPosition, setSavedPosition] = useState(null);
  const [currentPercent, setCurrentPercent] = useState(0);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeViewMode, setActiveViewMode] = useState('auto'); // 'file' | 'chapters' | 'auto'

  const saveTimerRef = useRef(null);

  // Determine detected format
  const detectFormat = () => {
    if (!book) return 'chapter';
    const fileType = (book.file_type || '').toLowerCase();
    const fileUrl = (book.file_url || '').toLowerCase();

    if (fileType.includes('pdf') || fileUrl.endsWith('.pdf')) return 'pdf';
    if (
      fileType.includes('wordprocessingml') ||
      fileType.includes('docx') ||
      fileUrl.endsWith('.docx')
    ) {
      return 'docx';
    }
    if (fileType.includes('msword') || fileUrl.endsWith('.doc')) return 'doc';
    if (fileType.includes('epub') || fileUrl.endsWith('.epub')) return 'epub';
    if (fileType.includes('rtf') || fileUrl.endsWith('.rtf')) return 'rtf';
    if (fileType.includes('text') || fileUrl.endsWith('.txt')) return 'txt';

    if (book.file_url) return 'file';
    return 'chapter';
  };

  const detectedFormat = detectFormat();

  // Mode resolution (if both file and chapters exist)
  const effectiveFormat =
    activeViewMode === 'chapters' && chapters.length > 0
      ? 'chapter'
      : activeViewMode === 'file' && book?.file_url
      ? detectedFormat
      : book?.file_url
      ? detectedFormat
      : 'chapter';

  // Construct reliable file URL
  const getFileUrl = () => {
    if (!book?.id) return null;
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/books/${book.id}/file`;
  };

  const fileUrl = getFileUrl();

  // Load progress and bookmarks on mount
  useEffect(() => {
    if (!book?.id) return;
    api
      .get(`/reading-sessions/progress/${book.id}`)
      .then(({ data }) => {
        if (data) {
          if (data.bookmarks && Array.isArray(data.bookmarks)) {
            setBookmarks(data.bookmarks);
          }
          if (data.position != null) {
            setSavedPosition(data.position);
            setCurrentPosition(data.position);
          }
          if (data.scrollPercent != null) {
            setCurrentPercent(Number(data.scrollPercent));
          }
          if (data.isCompleted) {
            setIsCompleted(true);
          }
        }
      })
      .catch(() => {});
  }, [book?.id]);

  // Debounced progress saver
  const saveProgressDebounced = useCallback(
    (pos, pct) => {
      if (!book?.id) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

      saveTimerRef.current = setTimeout(() => {
        const numPct = typeof pct === 'number' ? pct : parseFloat(pct) || 0;
        const willComplete = numPct >= 95 || isCompleted;

        api
          .post('/reading-sessions/progress', {
            bookId: book.id,
            chapterId: effectiveFormat === 'chapter' ? chapterId : null,
            format: effectiveFormat,
            position: pos != null ? String(pos) : undefined,
            scrollPercent: Math.min(100, Math.max(0, numPct)),
            isCompleted: willComplete,
            bookmarks,
          })
          .then(() => {
            if (willComplete && !isCompleted) {
              setIsCompleted(true);
            }
          })
          .catch((e) => console.error('Error saving progress:', e));
      }, 1500);
    },
    [book, chapterId, effectiveFormat, isCompleted, bookmarks],
  );

  const handlePositionChange = useCallback(
    (pos, pct) => {
      setCurrentPosition(pos);
      if (pct !== undefined) setCurrentPercent(Math.round(pct));
      saveProgressDebounced(pos, pct);
    },
    [saveProgressDebounced],
  );

  // Bookmarking helpers
  const handleAddBookmark = (newBm) => {
    const item = {
      id: Date.now(),
      position: newBm.position || String(currentPosition || currentPercent),
      label: newBm.label || `Bookmark at ${currentPercent}%`,
      page: newBm.page,
      createdAt: new Date().toISOString(),
    };
    const updated = [item, ...bookmarks];
    setBookmarks(updated);

    if (book?.id) {
      api
        .post('/reading-sessions/progress', {
          bookId: book.id,
          format: effectiveFormat,
          position: String(currentPosition || ''),
          scrollPercent: currentPercent,
          bookmarks: updated,
        })
        .catch(() => {});
    }
  };

  const handleRemoveBookmark = (bId) => {
    const updated = bookmarks.filter((b) => b.id !== bId);
    setBookmarks(updated);

    if (book?.id) {
      api
        .post('/reading-sessions/progress', {
          bookId: book.id,
          format: effectiveFormat,
          position: String(currentPosition || ''),
          scrollPercent: currentPercent,
          bookmarks: updated,
        })
        .catch(() => {});
    }
  };

  const handleJumpToBookmark = (bm) => {
    setSavedPosition(bm.position);
    setShowBookmarksMenu(false);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const mmss = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const themeClasses =
    theme === 'sepia'
      ? 'reader-sepia'
      : theme === 'dark'
      ? 'reader-dark'
      : 'bg-cream-50 text-ink';

  const formatBadgeColors = {
    pdf: 'bg-red-100 text-red-700 border-red-200',
    docx: 'bg-blue-100 text-blue-700 border-blue-200',
    doc: 'bg-sky-100 text-sky-700 border-sky-200',
    epub: 'bg-purple-100 text-purple-700 border-purple-200',
    rtf: 'bg-amber-100 text-amber-700 border-amber-200',
    txt: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    chapter: 'bg-forest-100 text-forest-700 border-forest-200',
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      {/* ─── Top Main Navigation Bar ────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-cream-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Home & Back & Book Info */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              to="/"
              title="Go to Home"
              aria-label="Go to Home"
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center hover:bg-black/5 transition text-forest-500"
            >
              <Home className="w-4 h-4" />
            </Link>

            <Link
              to={`/books/${book?.id || ''}`}
              title="Back to book details"
              aria-label="Back to book details"
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center hover:bg-black/5 transition text-ink-muted"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                    formatBadgeColors[effectiveFormat] || formatBadgeColors.chapter
                  }`}
                >
                  {effectiveFormat.toUpperCase()}
                </span>
                <p className="text-sm font-semibold truncate text-ink">{book?.title || 'Reader'}</p>
              </div>
              <p className="text-xs text-ink-muted truncate">{book?.author || ''}</p>
            </div>
          </div>

          {/* Center / Right: Reader tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* View Mode Switcher if both file & chapters exist */}
            {book?.file_url && chapters.length > 0 && (
              <div className="hidden md:inline-flex rounded-lg bg-cream-100 p-0.5 text-xs font-medium">
                <button
                  onClick={() => setActiveViewMode('file')}
                  className={`px-2 py-1 rounded-md transition ${
                    effectiveFormat !== 'chapter' ? 'bg-white shadow-xs text-ink' : 'text-ink-muted'
                  }`}
                >
                  Document
                </button>
                <button
                  onClick={() => setActiveViewMode('chapters')}
                  className={`px-2 py-1 rounded-md transition ${
                    effectiveFormat === 'chapter' ? 'bg-white shadow-xs text-ink' : 'text-ink-muted'
                  }`}
                >
                  Chapters ({chapters.length})
                </button>
              </div>
            )}

            {/* Bookmarks Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowBookmarksMenu((v) => !v)}
                className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                  bookmarks.length > 0
                    ? 'border-gold-300 bg-gold-50 text-gold-700'
                    : 'border-cream-200 hover:bg-cream-100 text-ink-muted'
                }`}
                title="Bookmarks"
              >
                <Bookmark className={`w-3.5 h-3.5 ${bookmarks.length > 0 ? 'fill-gold-500' : ''}`} />
                <span className="hidden sm:inline">{bookmarks.length}</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {showBookmarksMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-cream-200 p-3 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-cream-200 mb-2">
                    <span className="text-xs font-semibold text-ink">Saved Bookmarks</span>
                    <button
                      onClick={() => handleAddBookmark({})}
                      className="text-[11px] font-medium text-forest-600 hover:underline"
                    >
                      + Add Current
                    </button>
                  </div>
                  {bookmarks.length === 0 ? (
                    <p className="text-xs text-ink-muted py-3 text-center">No bookmarks saved yet</p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto space-y-1">
                      {bookmarks.map((bm) => (
                        <div
                          key={bm.id}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-cream-100 group text-xs text-ink"
                        >
                          <button
                            onClick={() => handleJumpToBookmark(bm)}
                            className="truncate text-left flex-1"
                          >
                            <span className="font-medium">{bm.label}</span>
                          </button>
                          <button
                            onClick={() => handleRemoveBookmark(bm.id)}
                            className="p-1 opacity-0 group-hover:opacity-100 hover:text-red-600 transition"
                            title="Delete bookmark"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Font Sizing (for text-based formats) */}
            {effectiveFormat !== 'pdf' && (
              <div className="hidden sm:inline-flex rounded-full bg-cream-100 border border-cream-200 p-0.5 text-xs">
                <button
                  onClick={() => setFontIdx((i) => Math.max(0, i - 1))}
                  className="w-7 h-7 rounded-full hover:bg-white font-semibold transition"
                  title="Decrease font size"
                >
                  A−
                </button>
                <button
                  onClick={() => setFontIdx((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
                  className="w-7 h-7 rounded-full hover:bg-white font-semibold transition"
                  title="Increase font size"
                >
                  A+
                </button>
              </div>
            )}

            {/* Theme switcher */}
            <div className="inline-flex rounded-full bg-cream-100 border border-cream-200 p-0.5 gap-0.5">
              {THEMES.map((t) => {
                const Icon = t === 'light' ? Sun : t === 'sepia' ? Coffee : Moon;
                return (
                  <button
                    key={`t-${t}`}
                    onClick={() => setTheme(t)}
                    title={`${t} mode`}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                      theme === t ? 'bg-white shadow-xs text-forest-700' : 'text-ink-muted'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit full screen' : 'Full screen reading mode'}
              className="p-2 rounded-lg border border-cream-200 hover:bg-cream-100 text-ink-muted transition"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            {/* Reading Session Controls */}
            {status === 'active' ? (
              <button
                onClick={onPauseSession}
                className="btn btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Pause className="w-3 h-3" />
                <span className="tabular-nums font-mono">{mmss(seconds)}</span>
              </button>
            ) : status === 'paused' ? (
              <button
                onClick={onResumeSession}
                className="btn btn-gold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" /> Resume
              </button>
            ) : (
              <button
                onClick={onStartSession}
                className="btn btn-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5"
              >
                <Play className="w-3 h-3" /> Start
              </button>
            )}

            <button
              onClick={onFinishSession}
              className="btn btn-outline text-xs px-2.5 py-1.5 rounded-lg hidden lg:inline-flex items-center gap-1"
              title="Finish session & save progress"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-forest-600" /> Finish
            </button>
          </div>
        </div>

        {/* Top Progress Bar */}
        <div className="h-1 bg-black/5 w-full">
          <div
            className="h-full bg-gradient-to-r from-forest-600 via-secondary-green to-gold-400 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(currentPercent, 0))}%` }}
          />
        </div>
      </header>

      {/* ─── Main Reader Stage ──────────────────────────────────────────────── */}
      <main className="reader-main-stage w-full flex-1">
        {effectiveFormat === 'pdf' ? (
          <PDFViewer
            fileUrl={fileUrl}
            initialPage={savedPosition ? Number(savedPosition) : 1}
            onPageChange={(page, total) => {
              const pct = total > 0 ? (page / total) * 100 : 0;
              handlePositionChange(String(page), pct);
            }}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        ) : effectiveFormat === 'docx' ? (
          <DocxViewer
            fileUrl={fileUrl}
            initialPosition={savedPosition}
            onPositionChange={handlePositionChange}
            fontSize={FONT_SIZES[fontIdx]}
            theme={theme}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        ) : effectiveFormat === 'doc' ? (
          <DocViewer
            bookId={book?.id}
            fileUrl={fileUrl}
            initialPosition={savedPosition}
            onPositionChange={handlePositionChange}
            fontSize={FONT_SIZES[fontIdx]}
            theme={theme}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        ) : effectiveFormat === 'epub' ? (
          <EPUBViewer
            fileUrl={fileUrl}
            initialPosition={savedPosition}
            onPositionChange={handlePositionChange}
            fontSize={FONT_SIZES[fontIdx]}
            theme={theme}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        ) : effectiveFormat === 'rtf' ? (
          <RTFViewer
            fileUrl={fileUrl}
            initialPosition={savedPosition}
            onPositionChange={handlePositionChange}
            fontSize={FONT_SIZES[fontIdx]}
            theme={theme}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        ) : effectiveFormat === 'txt' ? (
          <TextViewer
            fileUrl={fileUrl}
            initialPosition={savedPosition}
            onPositionChange={handlePositionChange}
            fontSize={FONT_SIZES[fontIdx]}
            theme={theme}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        ) : (
          <ChapterViewer
            chapter={currentChapter}
            chapters={chapters}
            onSelectChapter={onSelectChapter}
            fontSize={FONT_SIZES[fontIdx]}
            theme={theme}
            initialPosition={savedPosition}
            onPositionChange={handlePositionChange}
            bookmarks={bookmarks}
            onAddBookmark={handleAddBookmark}
            onRemoveBookmark={handleRemoveBookmark}
          />
        )}
      </main>
    </div>
  );
}
