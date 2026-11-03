import { useMemo } from 'react';
import { FileText, BookOpen, FileCode, AlignLeft, Sparkles, Image as ImageIcon } from 'lucide-react';
import { detectMaterialFormat, getMaterialCoverTheme, getMaterialLengthLabel } from '../../lib/materialUtils';

/**
 * Scribd-inspired Book & Document Cover Component
 * Renders high-fidelity covers for uploaded materials (PDF, DOCX, DOC, EPUB, TXT)
 * with tactile spine depth, paper sheen, format badges, and elegant editorial typography.
 */
export function BookCover({
  book,
  className = '',
  tilt = true,
  showBadge = true,
  aspectRatio = 'aspect-[1/1.42]',
}) {
  const format = useMemo(() => detectMaterialFormat(book), [book]);
  const theme = useMemo(() => getMaterialCoverTheme(book), [book]);
  const lengthLabel = useMemo(() => getMaterialLengthLabel(book), [book]);

  if (!book) {
    return (
      <div
        className={`relative ${aspectRatio} w-full rounded-xl bg-forest-900/90 shadow-md ring-1 ring-white/10 overflow-hidden flex flex-col items-center justify-center p-4 text-cream-50/50 ${
          tilt ? 'device-tilt transition-transform duration-300' : ''
        } ${className}`}
        role="img"
        aria-label="Document placeholder"
      >
        <BookOpen className="w-8 h-8 stroke-[1.5] text-gold-400/60 mb-2" />
        <span className="text-[0.65em] font-medium uppercase tracking-wider">No Material</span>
      </div>
    );
  }

  // Check if real cover image exists
  const coverImageUrl =
    book.cover_url ||
    (typeof book.cover === 'string' &&
    (book.cover.startsWith('http') || book.cover.startsWith('/') || book.cover.startsWith('blob:'))
      ? book.cover
      : null);

  const title = book.title || 'Untitled Material';
  const author = book.author || 'Unknown Author';
  const categoryName =
    book.category ||
    (Array.isArray(book.categories) && book.categories.length > 0 ? book.categories[0] : null) ||
    null;

  // Pick format icon
  const FormatIcon =
    format.type === 'pdf'
      ? FileText
      : format.type === 'docx' || format.type === 'doc'
      ? FileCode
      : format.type === 'image'
      ? ImageIcon
      : format.type === 'txt' || format.type === 'rtf'
      ? AlignLeft
      : BookOpen;

  return (
    <div
      className={`group/cover relative ${aspectRatio} w-full rounded-xl overflow-hidden select-none shadow-book ring-1 ring-black/15 ${
        tilt ? 'device-tilt transition-transform duration-300' : ''
      } ${className}`}
      role="img"
      aria-label={`${format.label}: ${title} by ${author}`}
    >
      {/* ── Realistic Book / Document Spine Edge (Left side) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-[5%] min-w-[5px] max-w-[12px] z-20 flex"
      >
        {/* Spine highlight line */}
        <div className="w-[40%] h-full bg-white/20 backdrop-blur-[1px]" />
        {/* Spine crease shadow */}
        <div className="w-[60%] h-full bg-black/35 shadow-inner" />
      </div>

      {/* ── Realistic Paper / Page Stacking (Right edge) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-r from-black/20 to-cream-100/40 z-20"
      />

      {/* ── Surface Sheen (Subtle angle reflection) ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-80"
      />

      {coverImageUrl ? (
        /* ════ Case A: Real Cover Image Provided ════ */
        <div className="relative w-full h-full bg-forest-950">
          <img
            src={coverImageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide broken image so fallback sheet is visible
              e.currentTarget.style.display = 'none';
            }}
          />
          {/* Subtle bottom vignette for legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Floating Format Badge */}
          {showBadge && (
            <div className="absolute top-2.5 left-3 z-20">
              <span
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.6em] font-bold tracking-wider uppercase border backdrop-blur-md ${format.badgeClass}`}
              >
                <FormatIcon className="w-2.5 h-2.5" />
                {format.label}
              </span>
            </div>
          )}

          {/* Bottom Title overlay if image is abstract */}
          <div className="absolute bottom-0 left-0 right-0 p-3 pl-4 z-20">
            {categoryName && (
              <span className="inline-block text-[0.55em] uppercase font-bold tracking-widest text-gold-300 drop-shadow-sm mb-0.5">
                {categoryName}
              </span>
            )}
            <p className="font-display text-[0.85em] font-semibold text-cream-50 leading-tight line-clamp-2 drop-shadow-md">
              {title}
            </p>
            <p className="text-[0.6em] text-cream-50/80 truncate mt-0.5 drop-shadow-sm">
              {author}
            </p>
          </div>
        </div>
      ) : (
        /* ════ Case B: Scribd-Style Auto-Generated Document Cover ════ */
        <div
          className={`relative w-full h-full bg-gradient-to-br ${theme.bg} p-[7%] pl-[10%] flex flex-col justify-between text-cream-50 overflow-hidden`}
        >
          {/* Subtle paper texture overlay */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: `radial-gradient(${theme.accent} 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          />

          {/* Top Bar: Format pill & Category/Document indicator */}
          <div className="relative z-10 flex items-center justify-between gap-1">
            {showBadge && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[0.58em] font-bold tracking-wider uppercase border ${format.badgeClass}`}
              >
                <FormatIcon className="w-2.5 h-2.5" />
                {format.label}
              </span>
            )}
            <span
              className="text-[0.55em] uppercase tracking-wider font-semibold opacity-75 truncate max-w-[50%]"
              style={{ color: theme.accent }}
            >
              {categoryName || format.description}
            </span>
          </div>

          {/* Center Stage: Title, Divider, Author */}
          <div className="relative z-10 my-auto py-2">
            <h3
              className="font-display text-[0.92em] font-semibold leading-[1.2] text-cream-50 line-clamp-3 drop-shadow-sm tracking-tight"
              title={title}
            >
              {title}
            </h3>

            {/* Accent divider rule */}
            <div
              className="my-2 h-[1.5px] w-8 rounded-full"
              style={{ background: theme.accent }}
            />

            <p className="text-[0.62em] font-medium text-cream-50/80 line-clamp-1">
              by <span className="text-cream-50 font-semibold">{author}</span>
            </p>

            {/* Faint document text silhouettes (Scribd document sheet effect) */}
            <div
              aria-hidden="true"
              className="mt-3 space-y-1 opacity-20 pointer-events-none"
            >
              <div className="h-[2px] w-full rounded bg-white" />
              <div className="h-[2px] w-[85%] rounded bg-white" />
              <div className="h-[2px] w-[65%] rounded bg-white" />
            </div>
          </div>

          {/* Bottom Bar: Length / Reading time & ReadRise Hallmark */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[0.52em] text-cream-50/70 font-medium">
            <span className="truncate">{lengthLabel}</span>
            <span className="flex items-center gap-0.5 opacity-60 uppercase tracking-widest text-[0.9em]">
              <Sparkles className="w-2 h-2 text-gold-400" />
              ReadRise
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookCover;
