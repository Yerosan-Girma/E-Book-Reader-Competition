import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import EReaderShowcase from '../ui/EReaderShowcase';
import LandingBackdrop from '../ui/LandingBackdrop';

export default function ReadingMoment() {
  return (
    <section
      id="reading-moment"
      className="py-28 relative overflow-hidden scroll-mt-24"
      style={{ background: 'linear-gradient(to bottom, #FFFCF6, #F8F5ED)' }}
    >
      <LandingBackdrop variant="reader" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
            className="relative"
          >
            <EReaderShowcase />
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[82%] rounded-2xl border border-white/70 bg-cream-50/85 px-5 py-3 text-center shadow-lg backdrop-blur-md">
              <p className="font-display text-sm italic text-forest-400">
                "Every book is a journey waiting to begin."
              </p>
            </div>
            <span className="absolute -top-3 -left-3 rounded-full border border-sage-300 bg-white/75 px-3 py-1 text-xs font-medium text-forest-400 shadow-sm backdrop-blur">
              read
            </span>
            <span className="absolute top-1/2 -right-2 rounded-full border border-gold-400/30 bg-gold-300/25 px-3 py-1 text-xs font-medium text-gold-600 shadow-sm backdrop-blur">
              grow
            </span>
            <span className="absolute -bottom-2 left-7 rounded-full border border-sage-300 bg-white/75 px-3 py-1 text-xs font-medium text-forest-400 shadow-sm backdrop-blur">
              think
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="section-eyebrow">The Reading Experience</span>
            <h2 className="section-heading mt-4">
              Every page moves<br />you forward.
            </h2>
            <div className="section-divider" />
            <p className="section-description">
              Progress is not about reading everything. It is about making space
              for something meaningful, every day.
            </p>

            <div
              className="mt-8 pl-5 border-l-2 py-1"
              style={{ borderColor: 'rgba(216,170,91,0.5)' }}
            >
              <p className="font-display text-lg italic" style={{ color: '#174C38' }}>
                "A reader lives a thousand lives before they die."
              </p>
              <p className="text-xs text-ink-muted mt-2 uppercase tracking-widest">ReadRise â€” Our Philosophy</p>
            </div>

            <Link
              to="/register"
              className="mt-10 inline-flex btn btn-primary text-base px-8 py-4"
            >
              Begin Your Reading Journey
              <BookOpen className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
