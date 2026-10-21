import { motion } from 'framer-motion';
import { useMemo } from 'react';

// Simple seeded random for consistent values
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const books = [
  {
    id: 'banner-1',
    title: "The Art of Consistent Habit",
    author: "Dr. Alemseged Tesfaye",
    gradient: "from-forest-400 via-forest-500 to-forest-600",
    accent: "gold-400"
  },
  {
    id: 'banner-2',
    title: "Voices of the Highlands",
    author: "Selam Bekele",
    gradient: "from-forest-300 via-forest-400 to-forest-500",
    accent: "sage-300"
  },
  {
    id: 'banner-3',
    title: "Innovation in Africa",
    author: "Prof. Meseret Demissie",
    gradient: "from-forest-500 via-forest-600 to-forest-700",
    accent: "gold-400"
  },
  {
    id: 'banner-4',
    title: "Letters from Addis",
    author: "Hiwot Mekonnen",
    gradient: "from-forest-400 via-forest-500 to-forest-600",
    accent: "sage-200"
  },
  {
    id: 'banner-5',
    title: "The Mountain Path",
    author: "Kedir Hussein",
    gradient: "from-forest-300 via-forest-400 to-forest-500",
    accent: "gold-300"
  }
];

export default function AnimatedBookBanner() {
  const animatedBooks = useMemo(() =>
    books.map((book, i) => ({
      ...book,
      startY: seededRandom(i) * 30 - 15,
      duration: 8 + seededRandom(i + 100) * 4,
      delay: seededRandom(i + 200) * 3,
      rotation: seededRandom(i + 300) * 10 - 5,
      scale: 0.8 + seededRandom(i + 400) * 0.3,
    })),
    []
  );

  return (
    <div className="relative w-full h-48 md:h-64 overflow-hidden bg-gradient-to-b from-forest-400 to-forest-500">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Animated books */}
      <div className="absolute inset-0 flex items-center justify-center gap-8 md:gap-16 px-6">
        {animatedBooks.map((book) => (
          <motion.div
            key={book.id}
            className="relative"
            style={{ perspective: '1000px' }}
            animate={{
              y: [book.startY, book.startY - 20, book.startY],
              rotateY: [book.rotation, book.rotation + 5, book.rotation],
              rotateX: [0, 3, 0],
            }}
            transition={{
              duration: book.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: book.delay,
            }}
          >
            {/* Book cover */}
            <div
              className="relative w-32 md:w-40 h-44 md:h-56 rounded-lg shadow-2xl transform-gpu"
              style={{
                transform: `scale(${book.scale})`,
                background: `linear-gradient(135deg, var(--color-${book.gradient.split(' ')[0]}), var(--color-${book.gradient.split(' ')[2]}))`,
              }}
            >
              {/* Book spine */}
              <div className="absolute left-0 top-0 bottom-0 w-3 rounded-l-lg bg-gradient-to-r from-black/30 to-transparent" />

              {/* Book content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between text-cream-50">
                <div>
                  <p className="text-[8px] md:text-[10px] uppercase tracking-wider text-cream-50/70">
                    ReadRise
                  </p>
                  <div className="mt-2 w-8 h-0.5 bg-cream-50/30" />
                </div>
                <div>
                  <p className="font-display text-sm md:text-base leading-tight line-clamp-3">
                    {book.title}
                  </p>
                  <p className="text-[10px] md:text-xs text-cream-50/60 mt-2 uppercase tracking-wide">
                    {book.author}
                  </p>
                </div>
              </div>

              {/* Gloss effect */}
              <div className="absolute inset-0 rounded-lg overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>

            {/* Floating text label */}
            <motion.div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
              animate={{
                y: [0, -5, 0],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: book.delay + 0.5,
              }}
            >
              <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-forest-600 shadow-lg">
                {book.title.split(' ').slice(0, 2).join(' ')}
              </span>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-cream-50 to-transparent" />
    </div>
  );
}
