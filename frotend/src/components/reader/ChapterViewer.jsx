import { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import {
  ArrowLeft,
  ArrowRight,
  Search,
  Bookmark,
  ChevronDown,
} from 'lucide-react';

export default function ChapterViewer({
  chapter,
  chapters = [],
  onSelectChapter,
  fontSize = 18,
  initialPosition = 0,
  onPositionChange,
  onAddBookmark,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const contentRef = useRef(null);
  const restoredRef = useRef(false);

  const currentIdx = chapters.findIndex((c) => c.id === chapter?.id);
  const prevChapter = chapters[currentIdx - 1];
  const nextChapter = chapters[currentIdx + 1];

  // Restore scroll position
  useEffect(() => {
    if (chapter && !restoredRef.current && initialPosition) {
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
  }, [chapter, initialPosition]);

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
        page: chapter?.chapter_number || 1,
        label: `${chapter?.title || 'Chapter'} (${pct}%)`,
      });
    }
  };

  const sanitizedContent = chapter?.content ? DOMPurify.sanitize(chapter.content) : '';

  return (
    <div className="chapter-reader w-full max-w-3xl mx-auto px-6 py-6">
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
              placeholder="Find in chapter…"
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
              title="Search chapter"
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

      {chapter && (
        <>
          <p className="text-xs uppercase tracking-widest opacity-50 font-medium">
            Chapter {chapter.chapter_number}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl text-forest-deep mt-2 mb-8 leading-tight">
            {chapter.title}
          </h1>

          <article
            ref={contentRef}
            className="chapter-content reader-content"
            style={{ fontSize: `${fontSize}px` }}
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />

          {/* Chapter Navigation */}
          <nav
            className="mt-16 grid grid-cols-2 gap-4 border-t border-black/5 pt-8"
            aria-label="Chapter navigation"
          >
            <button
              disabled={!prevChapter}
              onClick={() => prevChapter && onSelectChapter(prevChapter.id)}
              className="btn btn-outline text-sm justify-start text-left disabled:opacity-30 disabled:pointer-events-none py-3 px-4 rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              {prevChapter ? (
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider opacity-60">
                    Previous
                  </span>
                  <span className="block truncate font-medium">{prevChapter.title}</span>
                </span>
              ) : (
                <span className="text-xs opacity-60">Beginning of book</span>
              )}
            </button>

            <button
              disabled={!nextChapter}
              onClick={() => nextChapter && onSelectChapter(nextChapter.id)}
              className="btn btn-outline text-sm justify-end text-right disabled:opacity-30 disabled:pointer-events-none py-3 px-4 rounded-xl flex items-center gap-2"
            >
              {nextChapter ? (
                <span className="min-w-0">
                  <span className="block text-[10px] uppercase tracking-wider opacity-60">
                    Next
                  </span>
                  <span className="block truncate font-medium">{nextChapter.title}</span>
                </span>
              ) : (
                <span className="text-xs opacity-60">End of book</span>
              )}
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </nav>
        </>
      )}
    </div>
  );
}
