import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';
import LandingBackdrop from '../ui/LandingBackdrop';

const seededRandom = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

export default function FinalCTA({ id = 'get-started' }) {
  const particles = useMemo(() =>
    [...Array(16)].map((_, i) => ({
      id: i,
      w:    seededRandom(i) * 6 + 3,
      h:    seededRandom(i + 100) * 6 + 3,
      left: seededRandom(i + 200) * 100,
      top:  seededRandom(i + 300) * 100,
      dur:  5 + seededRandom(i + 400) * 5,
      del:  seededRandom(i + 500) * 4,
      gold: i % 3 === 0,
    })),
    []
  );

  return (
    <section
      id={id}
      className="relative py-36 overflow-hidden scroll-mt-24"
      style={{
        background: 'linear-gradient(155deg, #0E3527 0%, #174C38 35%, #0B2920 65%, #071810 100%)',
      }}
    >
      <LandingBackdrop variant="community" dark />
      {/* Aurora glow — top */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at top, rgba(216,170,91,0.14) 0%, rgba(44,112,84,0.08) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0.85, 0.6] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Aurora glow — bottom */}
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at bottom, rgba(23,76,56,0.25) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Floating book — right */}

      {/* Floating book — left */}

      {/* Ambient particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width:  p.w,
            height: p.h,
            left:   `${p.left}%`,
            top:    `${p.top}%`,
            background: p.gold
              ? 'rgba(216, 170, 91, 0.35)'
              : 'rgba(44, 112, 84, 0.25)',
            filter: 'blur(0.5px)',
          }}
          animate={{ y: [0, -35, 0], opacity: [0.2, 0.55, 0.2] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.del }}
        />
      ))}

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        >
          {/* Eyebrow */}
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="hero-eyebrow-pill mx-auto mb-8 inline-flex"
          >
            Begin Today
          </motion.span>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-cream-50 leading-tight mb-6">
            Every Great Journey
            <br />
            <span className="hero-accent">Begins with a Page.</span>
          </h2>

          {/* Divider */}
          <div className="section-divider section-divider-center mb-8" style={{ background: 'linear-gradient(to right, rgba(216,170,91,0.4), rgba(44,112,84,0.3))' }} />

          {/* Description */}
          <p className="text-lg md:text-xl text-cream-50/75 max-w-2xl mx-auto mb-12 leading-relaxed">
            Make reading part of your everyday life with ReadRise.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              id="final-cta-join"
              className="btn btn-gold text-base md:text-lg px-12 py-4 shadow-[0_12px_40px_rgba(216,170,91,0.45)]"
            >
              Begin Your Reading Journey
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/explore"
              id="final-cta-explore"
              className="btn btn-outline text-base md:text-lg px-10 py-4"
            >
              Explore Books
              <BookOpen className="w-5 h-5" />
            </Link>
          </div>

          {/* Trust line */}
          <p className="mt-10 text-sm text-cream-50/40 italic">
            Free to join · No credit card required
          </p>
        </motion.div>
      </div>

      {/* Bottom fade to footer */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent, rgba(5,16,12,0.5))' }}
      />
    </section>
  );
}
