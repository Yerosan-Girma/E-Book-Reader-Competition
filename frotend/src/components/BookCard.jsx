import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

export default function BookCard({ book, index = 0 }) {
  const coverBg = book.coverGradient || 'from-forest-600 via-forest-700 to-forest-900';
  const categoryName = book.category || (Array.isArray(book.categories) ? book.categories[0] : null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link
        to={`/books/${book.id}`}
        className="group block"
        aria-label={`Open ${book.title} by ${book.author}`}
      >
        {/* 3D Book Container */}
        <div className="book-3d mb-4">
          <div className="book-3d-inner relative aspect-[3/4] w-full">
            <div className="book-spine" aria-hidden="true" />
            <div className="book-pages" aria-hidden="true" />

            <div
              className={`book-cover-img w-full h-full bg-gradient-to-br ${coverBg} relative flex flex-col justify-between p-4 overflow-hidden`}
            >
              {/* Sheen Overlay */}
              <div className="book-cover-sheen" aria-hidden="true" />

              {book.cover_url ? (
                <>
                  <img
                    src={book.cover_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover z-0"
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent z-1"
                    aria-hidden="true"
                  />
                  <div className="relative z-2 flex flex-col justify-between h-full">
                    {/* ReadRise watermark at top */}
                    <div className="flex items-center justify-between">
                      <p className="text-cream-50/70 text-[9px] uppercase tracking-[0.25em] font-semibold">
                        ReadRise
                      </p>
                      <BookOpen className="w-3.5 h-3.5 text-gold-400/80" />
                    </div>
                    {/* Title at bottom with gold divider line */}
                    <div>
                      <div className="w-8 h-px bg-gold-400/70 mb-2" />
                      <p className="font-display text-sm md:text-base text-cream-50 leading-tight line-clamp-3 drop-shadow-sm">
                        {book.title}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative z-2 flex flex-col justify-between h-full">
                  {/* ReadRise watermark at top */}
                  <div className="flex items-center justify-between">
                    <p className="text-cream-50/50 text-[9px] uppercase tracking-[0.25em] font-semibold">
                      ReadRise
                    </p>
                    <BookOpen className="w-3.5 h-3.5 text-gold-400/50" />
                  </div>

                  {/* Title at bottom with gold divider line */}
                  <div>
                    <div className="w-8 h-px bg-gold-400/60 mb-2" />
                    <p className="font-display text-sm md:text-base text-cream-50 leading-tight line-clamp-3">
                      {book.title}
                    </p>
                  </div>
                </div>
              )}

              {/* Hover sheen shadow */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>

        {/* Book Details below cover */}
        <div className="px-0.5">
          <h3 className="font-display text-base text-ink leading-snug line-clamp-2 group-hover:text-forest-400 transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-xs text-ink-muted mt-1 truncate">
            {book.author}
          </p>

          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {categoryName && (
              <span className="chip chip-forest text-[10px] py-0.5 px-2 font-medium">
                {categoryName}
              </span>
            )}
            {book.language && (
              <span className="text-[10px] text-ink-muted flex items-center gap-1 font-medium">
                <BookOpen className="w-3 h-3 text-gold-500" />
                {book.language}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}