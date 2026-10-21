import { BookOpen, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const footerLinks = {
  Explore: [
    { label: 'Books',        to: '/explore' },
    { label: 'Challenges',   to: '/challenges' },
    { label: 'Leaderboard',  to: '/leaderboard' },
  ],
  Platform: [
    { label: 'About',   to: '/about' },
    { label: 'Contact', to: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy',   to: '/privacy' },
    { label: 'Terms of Service', to: '/terms' },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'linear-gradient(to bottom, #081A13, #050F0A)',
        borderTop: '1px solid rgba(44,112,84,0.2)',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">

        {/* Main grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-14">

          {/* Brand — 2 cols */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link to="/" className="flex items-center gap-2.5 mb-5 group w-fit">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center
                           group-hover:scale-110 transition-transform duration-300"
                style={{ background: 'linear-gradient(135deg, #2C7054, #174C38)' }}
              >
                <BookOpen className="w-4.5 h-4.5 text-cream-50" strokeWidth={2.2} />
              </div>
              <span className="font-display text-xl text-cream-50 tracking-tight">ReadRise</span>
            </Link>

            <p className="text-sm text-cream-50/55 leading-relaxed mb-5 max-w-xs">
              Read More. Grow Every Day. Get Recognized.<br />
              Building a reading community across Ethiopia.
            </p>

            {/* Small decoration */}
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-gold-500 to-forest-300 opacity-50" />
              <span className="text-xs text-cream-50/35 uppercase tracking-widest font-medium">Ethiopia</span>
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links], gi) => (
            <motion.div
              key={group}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.08 * gi }}
            >
              <h3 className="text-xs font-bold uppercase tracking-widest text-cream-50/40 mb-5">
                {group}
              </h3>
              <ul className="space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-cream-50/60 hover:text-cream-50 transition-colors duration-200
                                 hover:translate-x-0.5 inline-flex items-center gap-1.5 group"
                    >
                      <span className="w-0 group-hover:w-2 h-px bg-gold-400 transition-all duration-200 flex-shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <div
          className="h-px mb-8"
          style={{ background: 'linear-gradient(to right, transparent, rgba(44,112,84,0.25), transparent)' }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-cream-50/35">
          <p>© {currentYear} ReadRise. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Built with <Heart className="w-3 h-3 text-gold-500/70" fill="currentColor" /> for readers across Ethiopia
          </p>
        </div>
      </div>
    </footer>
  );
}
