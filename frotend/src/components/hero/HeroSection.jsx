import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, ChevronDown, Sparkles } from 'lucide-react';
import AmbientBackground from './AmbientBackground';
import HeroBackgroundMedia from './HeroBackgroundMedia';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.2, 0.8, 0.2, 1] } },
};

export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center hero-gradient overflow-hidden pt-20 scroll-mt-24"
      aria-labelledby="hero-heading"
    >
      <HeroBackgroundMedia />
      <AmbientBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28 w-full">

        {/* ── Left: Content ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-cream-50 max-w-xl"
        >
          {/* Eyebrow pill */}
          <motion.div variants={itemVariants}>
            <span className="hero-eyebrow-pill" aria-label="A new chapter in reading">
              A NEW CHAPTER IN READING
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="mt-7 font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-[-0.025em]"
          >
            Your Next Chapter<br />
            <span className="hero-accent">Starts Here.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mt-7 text-lg md:text-xl text-cream-50/75 leading-relaxed max-w-lg"
          >
            Discover books you love, build a lasting reading habit, and join a
            community that celebrates every page you read.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-wrap gap-4"
          >
            <Link
              to="/register"
              id="hero-cta-primary"
              className="btn btn-gold text-base md:text-lg px-8 py-4 shadow-[0_8px_32px_rgba(216,170,91,0.4)]"
            >
              Start Reading
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#featured-books"
              id="hero-cta-secondary"
              className="btn btn-outline text-base md:text-lg px-8 py-4"
            >
              Explore Library
              <BookOpen className="w-5 h-5" />
            </a>
          </motion.div>

          {/* Trust tagline */}
          <motion.div
            variants={itemVariants}
            className="mt-10 flex items-center gap-3"
          >
            <div className="h-px w-10 bg-gradient-to-r from-transparent to-cream-50/30" />
            <p className="text-sm text-cream-50/50 italic tracking-wide">
              One page at a time. One reader at a time.
            </p>
            <div className="h-px w-10 bg-gradient-to-l from-transparent to-cream-50/30" />
          </motion.div>

          {/* Feature pills */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap gap-2"
          >
            {['Track progress', 'Daily goals', 'Reading streaks', 'Earn badges'].map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(248,245,237,0.7)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <Sparkles className="w-3 h-3 text-gold-400" />
                {feat}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right: 3D Books ── */}
      </div>

      {/* Bottom gradient fade into cream */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cream-50 to-transparent pointer-events-none" />

      {/* Subtle top-left corner accent */}
      <div
        className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(216,170,91,0.08) 0%, transparent 60%)',
        }}
      />

      <motion.a
        href="#featured-books"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 hidden sm:inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-cream-50/55 hover:text-cream-50 transition-colors"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: [0, 5, 0] }}
        transition={{ opacity: { delay: 1.2, duration: 0.6 }, y: { delay: 1.8, duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }}
        aria-label="Scroll to featured books"
      >
        Scroll to explore
        <ChevronDown className="w-3.5 h-3.5 text-gold-400" aria-hidden="true" />
      </motion.a>
    </section>
  );
}
