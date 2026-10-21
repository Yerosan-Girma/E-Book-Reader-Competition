import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

const floatingParticles = [
  { left: '15%', top: '22%', size: 4, delay: 0, dur: 18, isGold: true },
  { left: '78%', top: '32%', size: 5, delay: 2, dur: 22, isGold: false },
  { left: '42%', top: '68%', size: 3, delay: 1, dur: 16, isGold: true },
  { left: '82%', top: '78%', size: 4, delay: 3, dur: 20, isGold: false },
  { left: '22%', top: '82%', size: 5, delay: 1.5, dur: 24, isGold: true },
];

export default function AuthSidePanel({
  badgeText = 'A New Chapter Awaits',
  quote = 'A reader lives a thousand lives before he dies. The man who never reads lives only one.',
  author = 'George R.R. Martin',
  authorRole = 'A Dance with Dragons',
  initials = 'GR',
}) {
  return (
    <div className="hero-gradient relative overflow-hidden flex flex-col justify-between p-10 lg:p-14 xl:p-16 text-cream-50 w-full h-full min-h-screen select-none">
      {/* Ambient gradient blobs */}
      <motion.div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(216, 170, 91, 0.22) 0%, rgba(216, 170, 91, 0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(44, 112, 84, 0.3) 0%, rgba(44, 112, 84, 0.08) 55%, transparent 70%)',
          filter: 'blur(70px)',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
      />

      <div
        className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(23, 76, 56, 0.25) 0%, transparent 65%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Grain overlay */}
      <div className="grain-overlay opacity-30" />

      {/* Floating particles */}
      {floatingParticles.map((p, idx) => (
        <motion.div
          key={idx}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.isGold ? 'rgba(216, 170, 91, 0.65)' : 'rgba(255, 255, 255, 0.55)',
            boxShadow: p.isGold ? '0 0 8px rgba(216, 170, 91, 0.6)' : '0 0 6px rgba(255, 255, 255, 0.5)',
          }}
          animate={{
            y: [0, -28, 0],
            opacity: [0.2, 0.85, 0.2],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.delay,
          }}
        />
      ))}

      {/* 4 Floating Abstract Book Shapes */}
      {/* Book 1 (top right) */}
      <motion.div
        className="absolute top-20 right-6 w-44 h-60 rounded-r-xl rounded-l-sm border border-cream-50/20 backdrop-blur-md shadow-2xl pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 252, 246, 0.12) 0%, rgba(216, 170, 91, 0.08) 50%, rgba(14, 53, 39, 0.3) 100%)',
        }}
        initial={{ opacity: 0, rotate: -8 }}
        animate={{
          opacity: [0.4, 0.65, 0.4],
          y: [0, -20, 0],
          rotate: [-8, -4, -8],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-r from-gold-400/50 via-gold-500/30 to-transparent border-r border-gold-300/20" />
        <div className="p-4 pl-6 space-y-2">
          <div className="w-12 h-1.5 bg-cream-50/30 rounded-full" />
          <div className="w-20 h-1 bg-cream-50/20 rounded-full" />
          <div className="w-16 h-1 bg-cream-50/15 rounded-full" />
          <div className="pt-16">
            <div className="w-10 h-1 bg-gold-300/30 rounded-full" />
          </div>
        </div>
      </motion.div>

      {/* Book 2 (mid-bottom left) */}
      <motion.div
        className="absolute bottom-36 left-6 w-36 h-48 rounded-r-xl rounded-l-sm border border-sage-200/20 backdrop-blur-sm shadow-xl pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(184, 209, 181, 0.15) 0%, rgba(23, 76, 56, 0.25) 100%)',
        }}
        initial={{ opacity: 0, rotate: 12 }}
        animate={{
          opacity: [0.35, 0.55, 0.35],
          y: [0, 18, 0],
          rotate: [12, 16, 12],
        }}
        transition={{
          duration: 9.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-r from-sage-300/40 to-transparent border-r border-sage-300/20" />
        <div className="p-3 pl-5 space-y-1.5">
          <div className="w-8 h-1.5 bg-sage-200/30 rounded-full" />
          <div className="w-14 h-1 bg-sage-200/20 rounded-full" />
          <div className="w-10 h-1 bg-sage-200/15 rounded-full" />
        </div>
      </motion.div>

      {/* Book 3 (bottom right) */}
      <motion.div
        className="absolute bottom-16 right-10 w-32 h-44 rounded-r-lg rounded-l-sm border border-gold-300/25 backdrop-blur-sm shadow-xl pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(216, 170, 91, 0.15) 0%, rgba(255, 252, 246, 0.05) 60%, rgba(8, 26, 19, 0.3) 100%)',
        }}
        initial={{ opacity: 0, rotate: -14 }}
        animate={{
          opacity: [0.3, 0.5, 0.3],
          y: [0, -15, 0],
          rotate: [-14, -10, -14],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-gold-400/40 to-transparent border-r border-gold-300/20" />
        <div className="p-3 pl-5 space-y-1.5">
          <div className="w-10 h-1.5 bg-gold-300/35 rounded-full" />
          <div className="w-12 h-1 bg-gold-300/20 rounded-full" />
        </div>
      </motion.div>

      {/* Book 4 (center top) */}
      <motion.div
        className="absolute top-28 left-1/4 w-28 h-38 rounded-r-lg rounded-l-sm border border-white/15 backdrop-blur-sm shadow-lg pointer-events-none overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(44, 112, 84, 0.15) 100%)',
        }}
        initial={{ opacity: 0, rotate: 6 }}
        animate={{
          opacity: [0.25, 0.45, 0.25],
          y: [0, 14, 0],
          rotate: [6, 2, 6],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white/30 to-transparent border-r border-white/15" />
        <div className="p-3 pl-4 space-y-1">
          <div className="w-7 h-1 bg-white/25 rounded-full" />
          <div className="w-10 h-1 bg-white/15 rounded-full" />
        </div>
      </motion.div>

      {/* ── Top: ReadRise Logo & Tagline ── */}
      <div className="relative z-10 pt-4">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-300 to-gold-500 text-forest-900 flex items-center justify-center shadow-md shadow-gold-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300">
            <BookOpen className="w-5 h-5 text-forest-900" strokeWidth={2.2} />
          </div>
          <div>
            <span className="font-display text-2xl font-bold tracking-tight text-cream-50 group-hover:text-gold-300 transition-colors">
              ReadRise
            </span>
            <span className="block text-[11px] font-medium tracking-widest text-gold-300/90 uppercase">
              Elevate your reading habit
            </span>
          </div>
        </Link>
      </div>

      {/* ── Center: Decorative Quote ── */}
      <div className="relative z-10 my-auto py-10 max-w-lg">
        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-semibold tracking-wider uppercase text-gold-300 mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span>{badgeText}</span>
        </div>

        {/* Decorative Quote Mark */}
        <div className="font-display text-5xl xl:text-6xl text-gold-400/40 leading-none select-none -mb-3 font-serif">
          “
        </div>

        {/* Large Quote */}
        <blockquote className="font-display text-2xl sm:text-3xl xl:text-4xl text-cream-50 leading-snug font-normal tracking-tight">
          {quote}
        </blockquote>

        {/* Gold divider line */}
        <div className="w-16 h-0.5 bg-gradient-to-r from-gold-400 to-transparent my-6" />

        {/* Author info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cream-50/10 border border-gold-400/30 flex items-center justify-center text-gold-300 text-xs font-bold shadow-xs">
            {initials}
          </div>
          <div>
            <cite className="not-italic text-sm font-semibold text-cream-100 block">
              {author}
            </cite>
            <span className="text-xs text-cream-50/60 block">
              {authorRole}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bottom: Community stats / trust marker ── */}
      <div className="relative z-10 pt-6 border-t border-cream-50/10 flex items-center justify-between text-xs text-cream-50/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Join 10,000+ active readers</span>
        </div>
        <span className="text-gold-300 font-medium">Daily Habit Tracking</span>
      </div>
    </div>
  );
}
