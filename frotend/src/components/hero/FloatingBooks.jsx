import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const FLOATING_TITLES = [
  {
    size: 'lg',
    cover: 'bg-gradient-to-br from-forest-400 via-[#1a5c45] to-forest-600',
    title: 'The Quiet Discipline',
    author: 'Fictional title',
    label: 'Sample cover',
    className: 'relative z-10',
    float: { y: [0, -18, 0], rotateZ: [0, 1.5, 0] },
    floatDuration: 7,
    delay: 0.1,
  },
  {
    size: 'md',
    cover: 'bg-gradient-to-br from-forest-300 via-forest-400 to-[#1E6040]',
    title: 'Between Ideas',
    author: 'Fictional title',
    label: 'Sample cover',
    className: 'absolute -top-4 -right-16 md:-right-24 z-0 opacity-80',
    float: { y: [0, -12, 0], rotateZ: [0, -2, 0] },
    floatDuration: 8.5,
    delay: 0.3,
  },
  {
    size: 'sm',
    cover: 'bg-gradient-to-br from-sage-300 via-forest-300 to-forest-400',
    title: 'A Map of Tomorrow',
    author: 'Fictional title',
    className: 'absolute -bottom-8 -left-14 md:-left-20 z-0 opacity-70',
    float: { y: [0, 14, 0], rotateZ: [0, 2.5, 0] },
    floatDuration: 9,
    delay: 0.5,
  },
];

function Book({ cover, title, author, label, size = 'lg', className = '', delay = 0, extraAnimate = {} }) {
  const sizes = {
    lg: { w: 'w-52 md:w-64', aspect: 'aspect-[3/4]', titleSize: 'text-xl md:text-2xl', authorSize: 'text-xs' },
    md: { w: 'w-36 md:w-44', aspect: 'aspect-[3/4]', titleSize: 'text-sm md:text-base', authorSize: 'text-[10px]' },
    sm: { w: 'w-24 md:w-32', aspect: 'aspect-[3/4]', titleSize: 'text-xs', authorSize: 'text-[9px]' },
  };
  const s = sizes[size];

  return (
    <motion.div
      className={`book-3d ${s.w} ${className}`}
      initial={{ opacity: 0, scale: 0.85, rotateY: 20 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0, ...extraAnimate }}
      transition={{ duration: 0.9, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <div className="book-3d-inner">
        <div className="book-spine" aria-hidden="true" />
        <div className="book-pages" aria-hidden="true" />
        <div className={`book-cover-img ${s.aspect} ${cover} flex flex-col justify-between p-5 md:p-7`}>
          <div className="book-cover-sheen" aria-hidden="true" />
          <div>
            <p className="text-[9px] uppercase tracking-[0.3em] text-gold-300/80">{label || 'ReadRise'}</p>
            <div className="mt-2 w-8 h-px bg-gold-400/40" />
          </div>
          <div>
            <p className={`font-display ${s.titleSize} text-cream-50 leading-tight`}>{title}</p>
            {author && (
              <p className={`mt-2 ${s.authorSize} text-cream-50/55 uppercase tracking-widest`}>{author}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FloatingBooks() {
  const containerRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  const springX = useSpring(mouseX, { stiffness: 55, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 55, damping: 20 });

  const rotateY = useTransform(springX, [-300, 300], [6, -6]);
  const rotateX = useTransform(springY, [-300, 300], [-4, 4]);
  const shiftX = useTransform(springX, [-300, 300], [-8, 8]);
  const shiftY = useTransform(springY, [-300, 300], [-6, 6]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;
    const handleMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left - rect.width / 2);
      mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [mouseX, mouseY, reducedMotion]);

  const floatTransition = (dur, del = 0) =>
    reducedMotion
      ? { duration: 0 }
      : { duration: dur, repeat: Infinity, ease: 'easeInOut', delay: del, repeatType: 'mirror' };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center floating-books-static"
      style={{ minHeight: 480 }}
      aria-label="Decorative sample book covers"
    >
      <div className="book-glow" aria-hidden="true" />

      <motion.div
        className="relative"
        style={
          reducedMotion
            ? { perspective: '1200px' }
            : { perspective: '1200px', rotateY, rotateX, x: shiftX, y: shiftY }
        }
      >
        {FLOATING_TITLES.map((book) => (
          <motion.div
            key={book.title}
            className={book.className}
            animate={reducedMotion ? {} : book.float}
            transition={floatTransition(book.floatDuration, book.delay)}
          >
            <Book
              size={book.size}
              cover={book.cover}
              title={book.title}
              author={book.author}
              label={book.label}
              delay={book.delay}
            />
          </motion.div>
        ))}

        <p className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest text-cream-50/40 whitespace-nowrap">
          Illustration · fictional titles
        </p>
      </motion.div>
    </div>
  );
}
