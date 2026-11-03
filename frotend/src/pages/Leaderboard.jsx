import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Medal,
  Star,
  Bell,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';

const ambientParticles = [
  { id: 1, top: '22%', left: '10%', size: 6, delay: 0 },
  { id: 2, top: '38%', right: '12%', size: 8, delay: 2 },
  { id: 3, top: '58%', left: '15%', size: 5, delay: 3.8 },
  { id: 4, top: '75%', right: '18%', size: 7, delay: 1.4 },
  { id: 5, top: '45%', left: '88%', size: 6, delay: 2.5 },
];

const rankStyles = {
  1: {
    badge: '🥇',
    color: '#A67F2D',
    bg: 'linear-gradient(135deg, #D8AA5B, #E8C982)',
    border: 'rgba(216, 170, 91, 0.6)',
    glow: '0 0 20px rgba(216, 170, 91, 0.35)',
    rowBg: 'rgba(216, 170, 91, 0.05)',
  },
  2: {
    badge: '🥈',
    color: '#737A70',
    bg: 'linear-gradient(135deg, #B0B8C0, #C8D0D8)',
    border: 'rgba(180, 185, 190, 0.6)',
    glow: '0 0 14px rgba(180, 185, 190, 0.25)',
    rowBg: 'transparent',
  },
  3: {
    badge: '🥉',
    color: '#A86D38',
    bg: 'linear-gradient(135deg, #C89660, #D8AA80)',
    border: 'rgba(200, 150, 90, 0.5)',
    glow: 'none',
    rowBg: 'transparent',
  },
};

const placeholderLeaderboard = [
  {
    rank: 1,
    name: 'Bethlehem Tilahun',
    initials: 'BT',
    category: 'Historical Fiction',
    streak: '42d streak',
    points: 4850,
  },
  {
    rank: 2,
    name: 'Kassahun Woldemariam',
    initials: 'KW',
    category: 'Philosophy & Science',
    streak: '35d streak',
    points: 4210,
  },
  {
    rank: 3,
    name: 'Selamawit Desta',
    initials: 'SD',
    category: 'African Literature',
    streak: '28d streak',
    points: 3940,
  },
  {
    rank: 4,
    name: 'Dawit Gebre',
    initials: 'DG',
    category: 'Ethiopian Poetry',
    streak: '21d streak',
    points: 3580,
  },
  {
    rank: 5,
    name: 'Marta Tadesse',
    initials: 'MT',
    category: 'Non-Fiction & Biography',
    streak: '18d streak',
    points: 3220,
  },
];

export default function Leaderboard() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section with forest gradient background & grain-overlay */}
        <section className="relative hero-gradient pt-36 pb-24 md:pb-28 px-6 overflow-hidden">
          <div className="grain-overlay" aria-hidden="true" />

          {/* Radial ambient glow */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(216, 170, 91, 0.16) 0%, rgba(23, 76, 56, 0.22) 50%, transparent 75%)',
              filter: 'blur(70px)',
            }}
            aria-hidden="true"
          />

          {/* Ambient particle dots (3-5 small floating dots) */}
          {ambientParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                top: p.top,
                left: p.left,
                right: p.right,
                width: p.size,
                height: p.size,
                background:
                  'radial-gradient(circle, rgba(232, 201, 130, 0.8) 0%, rgba(216, 170, 91, 0.2) 100%)',
                boxShadow: '0 0 12px rgba(216, 170, 91, 0.5)',
              }}
              animate={{
                y: [-12, 12, -12],
                x: [-6, 6, -6],
                opacity: [0.35, 0.85, 0.35],
                scale: [1, 1.25, 1],
              }}
              transition={{
                duration: 6 + p.id * 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: p.delay,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Floating animated decorations: Trophy decoration */}
          <motion.div
            className="hidden md:flex absolute top-36 right-8 lg:right-24 w-24 h-24 rounded-3xl glass-dark items-center justify-center pointer-events-none border border-gold-400/30 shadow-book-glow z-10"
            animate={{
              y: [-12, 12, -12],
              rotate: [0, 8, -8, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          >
            <Trophy className="w-12 h-12 text-gold-300 drop-shadow" />
          </motion.div>

          {/* Floating animated decorations: Medal decoration */}
          <motion.div
            className="hidden md:flex absolute top-48 left-8 lg:left-24 w-20 h-20 rounded-2xl glass-dark items-center justify-center pointer-events-none border border-cream-50/20 shadow-xl z-10"
            animate={{
              y: [12, -12, 12],
              rotate: [-6, 6, -6],
            }}
            transition={{
              duration: 9,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          >
            <Medal className="w-10 h-10 text-gold-400" />
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-20 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <span className="hero-eyebrow-pill mb-6">Community Recognition</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream-50 font-bold tracking-tight mb-3"
            >
              Reader Leaderboard
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.2, 0.8, 0.2, 1] }}
              className="mb-6"
            >
              <span className="gradient-text-gold font-display text-2xl sm:text-3xl md:text-4xl font-semibold italic tracking-wide">
                Coming Soon
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
              className="text-base sm:text-lg text-cream-50/80 max-w-2xl mx-auto leading-relaxed mb-10"
            >
              Celebrate consistency, curiosity, and the dedication behind every page. Earn points for completed
              reading sessions, climb the monthly ranks, and gain national recognition across the ReadRise community.
            </motion.p>

            {/* Email notification signup: decorative input + button 'Notify Me' */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
              className="max-w-md mx-auto"
            >
              {submitted ? (
                <div className="glass-dark border border-gold-400/40 rounded-2xl p-4 flex items-center justify-center gap-3 text-cream-50 text-sm shadow-gold">
                  <CheckCircle className="w-5 h-5 text-gold-400 flex-shrink-0" />
                  <span>You're on the list! We'll notify you when Leaderboards launch.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Bell className="w-4 h-4 text-gold-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email to get notified on launch..."
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-full bg-cream-50/10 backdrop-blur-md border border-cream-50/25 text-cream-50 placeholder:text-cream-50/50 text-sm focus:outline-none focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-gold px-6 py-3.5 shadow-gold text-sm flex items-center justify-center gap-2 group flex-shrink-0"
                  >
                    <span>Notify Me</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </form>
              )}
              <p className="text-xs text-cream-50/50 mt-3 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                Early access members will receive priority onboarding and exclusive founder badges.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mockup Leaderboard Preview Section */}
        <section className="py-20 px-6 relative bg-gradient-to-b from-cream-100/70 via-cream-50 to-cream-100/40">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <div className="section-eyebrow section-divider-center mb-2">Sneak Peek</div>
              <h2 className="font-display text-3xl sm:text-4xl text-ink font-bold tracking-tight">
                Podium Preview
              </h2>
              <p className="text-ink-light text-sm sm:text-base max-w-lg mx-auto mt-2">
                A fair, verified points system rewarding focused reading time, books completed, and consistency.
              </p>
            </motion.div>

            {/* Mockup Leaderboard Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="max-w-2xl mx-auto rounded-2xl overflow-hidden card shadow-lg"
            >
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between bg-gradient-to-r from-forest-500 via-forest-400 to-forest-600 text-cream-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gold-400/20 flex items-center justify-center text-gold-300">
                    <Trophy className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-cream-50">Top Readers This Month</h3>
                    <p className="text-[11px] text-cream-50/70">Verified reading activity simulation</p>
                  </div>
                </div>
                <span className="chip chip-gold text-[10px] font-bold">Preview Data</span>
              </div>

              {/* 5 Mockup Rows */}
              <div className="divide-y divide-cream-200/70">
                {placeholderLeaderboard.map((reader, index) => {
                  const isTop3 = reader.rank <= 3;
                  const rankConfig = isTop3 ? rankStyles[reader.rank] : null;

                  return (
                    <motion.div
                      data-testid="leaderboard-row"
                      key={reader.rank}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.45, delay: index * 0.08 }}
                      className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-cream-100/60"
                      style={{
                        background: rankConfig?.rowBg || 'transparent',
                      }}
                    >
                      {/* Rank Number / Badge */}
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        {isTop3 ? (
                          <span className="text-2xl" role="img" aria-label={`Rank ${reader.rank}`}>
                            {rankConfig.badge}
                          </span>
                        ) : (
                          <span className="text-sm font-bold text-ink-muted">#{reader.rank}</span>
                        )}
                      </div>

                      {/* Avatar Circle with gradient */}
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-cream-50 flex-shrink-0 shadow-sm"
                        style={{
                          background: isTop3
                            ? rankConfig.bg
                            : 'linear-gradient(135deg, #174C38, #0B2920)',
                          border: isTop3 ? `2px solid ${rankConfig.border}` : '2px solid transparent',
                          boxShadow: isTop3 ? rankConfig.glow : 'none',
                        }}
                      >
                        {reader.initials}
                      </div>

                      {/* Name & Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-semibold text-sm truncate ${reader.rank === 1 ? 'text-forest-500' : 'text-ink'}`}>
                            {reader.name}
                          </p>
                          {reader.rank === 1 && (
                            <span className="chip chip-gold text-[9px] py-0 px-1.5 font-bold">
                              Rank #1
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-ink-light mt-0.5">
                          <span className="truncate">{reader.category}</span>
                          <span className="text-cream-300">•</span>
                          <span className="text-forest-400 font-medium whitespace-nowrap">{reader.streak}</span>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className="font-bold text-base"
                          style={{
                            color: isTop3 ? rankConfig.color : '#174C38',
                          }}
                        >
                          {reader.points.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-ink-muted font-medium">pts</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3.5 bg-cream-100/50 border-t border-cream-200/70 flex items-center justify-between text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-400" />
                  Ranks reset on the 1st of each month
                </span>
                <span className="font-semibold text-forest-400">All Ethiopian Regions</span>
              </div>
            </motion.div>

            {/* Bottom info banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-600 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Reader of the Year Competition
              </div>
              <p className="text-xs sm:text-sm text-ink-light max-w-lg mx-auto leading-relaxed">
                Top monthly achievers qualify for the annual ReadRise Gala and literary mentorship awards.
                All sessions verified with in-reader focus tracking to guarantee fairness.
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
