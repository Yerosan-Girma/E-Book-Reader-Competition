import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Bookmark, BookmarkCheck, Clock, FileText, ArrowRight, HardDrive } from 'lucide-react';
import { toast } from 'sonner';
import { BookCover } from './ui/BookCover';
import { detectMaterialFormat, formatFileSize, estimateReadingTime, getMaterialLengthLabel } from '../lib/materialUtils';

export default function BookCard({ book, index = 0, onBookmarkToggle, isBookmarked = false }) {
  const [saved, setSaved] = useState(isBookmarked);
  const navigate = useNavigate();

  if (!book) return null;

  const format = detectMaterialFormat(book);
  const lengthLabel = getMaterialLengthLabel(book);
  const fileSizeLabel = formatFileSize(book.file_size);
  const readTimeLabel = estimateReadingTime(book);
  const categoryName =
    book.category ||
    (Array.isArray(book.categories) && book.categories.length > 0 ? book.categories[0] : null) ||
    null;

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = !saved;
    setSaved(nextSaved);

    if (onBookmarkToggle) {
      onBookmarkToggle(book.id, nextSaved);
    } else {
      if (nextSaved) {
        toast.success(`Saved "${book.title}" to reading list`, {
          description: `${format.label} document saved.`,
        });
      } else {
        toast(`Removed "${book.title}" from reading list`);
      }
    }
  };

  return (
    <motion.article
      data-testid="book-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: Math.min(0.25, (index % 6) * 0.05), ease: [0.2, 0.8, 0.2, 1] }}
      className="group flex flex-col h-full bg-white/70 hover:bg-white rounded-2xl p-3 sm:p-3.5 border border-cream-200/80 hover:border-forest-300/60 shadow-xs hover:shadow-card transition-all duration-300"
    >
      {/* ── Document / Book Cover Section ── */}
      <div className="relative mb-3">
        <Link
          to={`/read/${book.id}`}
          className="block relative rounded-xl overflow-hidden cursor-pointer"
          aria-label={`Read ${book.title}`}
        >
          {/* Cover Component */}
          <div className="transition-transform duration-300 group-hover:scale-[1.02]">
            <BookCover book={book} tilt={false} showBadge={false} />
          </div>

          {/* Format Pill (top-left) */}
          <div className="absolute top-2.5 left-2.5 z-20">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold tracking-wider uppercase border backdrop-blur-md shadow-xs ${format.badgeClass}`}
            >
              <FileText className="w-3 h-3" />
              {format.label}
            </span>
          </div>

          {/* Hover Action Overlay: "Read Online" button */}
          <div className="absolute inset-0 z-30 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3 pointer-events-none">
            <span className="btn btn-primary text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5 shadow-md">
              <span>Read Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Quick Bookmark Action (top-right) */}
        <button
          onClick={toggleBookmark}
          aria-label={saved ? 'Remove bookmark' : 'Bookmark this material'}
          className={`absolute top-2.5 right-2.5 z-30 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-sm ${
            saved
              ? 'bg-gold-500 text-cream-50 scale-105'
              : 'bg-white/90 text-ink-muted hover:text-ink hover:bg-white'
          }`}
        >
          {saved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Metadata & Details Section ── */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Length Meta Row */}
          <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
            {categoryName ? (
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-forest-500 bg-forest-50 border border-forest-100 px-2 py-0.5 rounded-full truncate max-w-[65%]">
                {categoryName}
              </span>
            ) : (
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                {format.description}
              </span>
            )}
            <span className="text-[10px] text-ink-muted flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-gold-500" />
              {readTimeLabel}
            </span>
          </div>

          {/* Book Title */}
          <Link to={`/books/${book.id}`} className="block group-hover/title">
            <h3
              className="font-display text-sm sm:text-base font-semibold text-ink leading-snug line-clamp-2 group-hover:text-forest-400 transition-colors"
              title={book.title}
            >
              {book.title}
            </h3>
          </Link>

          {/* Author */}
          <p className="text-xs text-ink-light mt-1 truncate">
            by <span className="font-medium text-ink">{book.author || 'Unknown'}</span>
          </p>
        </div>

        {/* ── Bottom Specs & Quick Actions Bar ── */}
        <div className="mt-3 pt-2.5 border-t border-cream-200/80 flex items-center justify-between gap-2 text-[11px] text-ink-muted">
          <div className="flex items-center gap-2 truncate">
            <span className="font-medium truncate">{lengthLabel}</span>
            {fileSizeLabel && (
              <>
                <span className="text-cream-300">•</span>
                <span className="truncate flex items-center gap-0.5">
                  <HardDrive className="w-3 h-3 text-ink-muted/80" />
                  {fileSizeLabel}
                </span>
              </>
            )}
          </div>

          {/* Details Link */}
          <Link
            to={`/books/${book.id}`}
            className="shrink-0 text-[11px] font-semibold text-forest-400 hover:text-forest-600 transition-colors flex items-center gap-0.5"
          >
            <span>Overview</span>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
