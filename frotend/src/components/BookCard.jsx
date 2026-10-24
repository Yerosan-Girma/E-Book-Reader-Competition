import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

// Color gradients based on categories - this will work for any book
const categoryGradients = {
  'Spiritual': 'from-purple-500 via-purple-600 to-purple-800',
  'Psychology': 'from-blue-500 via-blue-600 to-blue-800',
  'Education': 'from-forest-500 via-forest-600 to-forest-800',
  'Fiction': 'from-rose-500 via-rose-600 to-rose-800',
  'default': 'from-gold-400 via-gold-500 to-gold-700',
};

// Fallback gradients for books without category
const fallbackGradients = [
  'from-forest-500 via-forest-600 to-forest-800',
  'from-gold-400 via-gold-500 to-gold-700',
  'from-purple-500 via-purple-600 to-purple-800',
  'from-blue-500 via-blue-600 to-blue-800',
  'from-rose-500 via-rose-600 to-rose-800',
];

export default function BookCard({ book, index = 0 }) {
  // Get category from book data
  const categoryName = book.category || (Array.isArray(book.categories) ? book.categories[0] : null);

  // Assign gradient based on category or fallback to ID-based gradient
  const coverBg = categoryGradients[categoryName] || fallbackGradients[book.id % fallbackGradients.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <Link
        to={`/read/${book.id}`}
        className="group block touch-manipulation"
        aria-label={`Start reading ${book.title} by ${book.author}`}
      >
        {/* Compact Book Cover */}
        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 mb-3">
          {/* Gradient background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${coverBg} transition-all duration-300 group-hover:scale-105`}
          />

          {/* Cover image if available */}
          {book.cover_url && (
            <>
              <img
                src={book.cover_url}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            </>
          )}

          {/* Content overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
            {/* Top: Category badge */}
            {categoryName && (
              <div className="self-start">
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-cream-50/90 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  {categoryName}
                </span>
              </div>
            )}

            {/* Bottom: Title */}
            <div>
              <p className="font-display text-xs sm:text-sm text-cream-50 font-semibold leading-tight line-clamp-2 drop-shadow-sm">
                {book.title}
              </p>
              <p className="text-[10px] sm:text-xs text-cream-50/70 mt-0.5 truncate">
                {book.author}
              </p>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>

        {/* Book info below */}
        <div>
          <h3 className="font-display text-sm sm:text-base text-ink font-medium leading-snug line-clamp-2 group-hover:text-forest-400 transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-xs text-ink-muted mt-1 truncate">
            {book.author}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {book.file_type && (
              <span className="text-[8px] sm:text-[9px] uppercase font-bold tracking-wider px-1.5 sm:px-2 py-0.5 rounded-full bg-cream-200/80 text-forest-700 border border-cream-300">
                {book.file_type.includes('pdf')
                  ? 'PDF'
                  : book.file_type.includes('epub')
                  ? 'EPUB'
                  : book.file_type.includes('word') || book.file_type.includes('docx')
                  ? 'DOCX'
                  : book.file_type.includes('rtf')
                  ? 'RTF'
                  : book.file_type.includes('text')
                  ? 'TXT'
                  : 'FILE'}
              </span>
            )}
            {book.language && (
              <span className="text-[9px] sm:text-[10px] text-ink-muted flex items-center gap-0.5 font-medium">
                <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gold-500" />
                {book.language}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}