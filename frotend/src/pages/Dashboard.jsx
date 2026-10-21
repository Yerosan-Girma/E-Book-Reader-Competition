import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, BookOpen, Flame, Trophy, ArrowRight, PlayCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Footer from '../components/layout/Footer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then(({ data }) => setData(data)).catch(() => {});
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-cream-100 flex flex-col justify-between">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-forest-700/85 via-forest-600/50 to-transparent pointer-events-none z-10" />
        <Navbar />
        <div className="pt-36 pb-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-forest-500 animate-spin" />
          <p className="text-sm font-medium text-ink-muted">Loading your reading sanctuary…</p>
        </div>
        <Footer />
      </div>
    );
  }

  const totalMinutes = Math.round((data.totals?.total_seconds || 0) / 60);
  const maxWeek = Math.max(1, ...(data.weekly || []).map((w) => w.seconds || 0));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    {
      icon: Clock,
      label: 'Reading time',
      value: `${totalMinutes}m`,
      accent: 'forest',
      hint: 'Accepted sessions',
    },
    {
      icon: BookOpen,
      label: 'Books touched',
      value: data.totals?.books_touched ?? 0,
      accent: 'gold',
      hint: 'Total library explored',
    },
    {
      icon: Flame,
      label: 'Current streak',
      value: `${data.streak || 0}d`,
      accent: 'gold',
      hint: (data.streak || 0) > 0 ? 'Keep it alive!' : 'Start today',
    },
    {
      icon: Trophy,
      label: 'Finished',
      value: data.totals?.sessions_finished ?? 0,
      accent: 'forest',
      hint: 'Completed milestones',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-cream-100/60 to-sage-100/40 relative overflow-hidden flex flex-col justify-between">
      {/* Background decorations */}
      <div className="bg-blobs" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      {/* Top ambient banner to frame navbar */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-forest-700/85 via-forest-600/50 to-transparent pointer-events-none z-10" />

      <Navbar />

      <main className="relative z-20 max-w-6xl mx-auto px-6 pt-24 pb-16 w-full flex-1">
        {/* Animated greeting section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-wrap items-end justify-between gap-4 mt-6"
        >
          <div>
            <div className="section-eyebrow mb-1">
              {getGreeting()}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl text-ink font-bold tracking-tight">
              Hi, {user.display_name || user.username}.
            </h1>
            <p className="text-sm text-ink-light mt-1">
              Your reading sanctuary is ready. Continue your journey today.
            </p>
          </div>
          {data.activeSession && (
            <Link
              to={`/read/${data.activeSession.book_id}`}
              className="btn btn-gold shadow-gold flex items-center gap-2 group"
            >
              <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span>Resume Session</span>
            </Link>
          )}
        </motion.div>

        {/* Active session banner with gold gradient and pulse animation */}
        {data.activeSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 relative overflow-hidden rounded-2xl p-5 border border-gold-400/40 shadow-gold"
            style={{
              background: 'linear-gradient(135deg, rgba(232, 201, 130, 0.25) 0%, rgba(216, 170, 91, 0.15) 50%, rgba(196, 150, 62, 0.2) 100%)',
            }}
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gold-400/20 blur-2xl animate-pulse" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center">
                  <span className="w-3.5 h-3.5 rounded-full bg-gold-500 animate-ping absolute opacity-75" />
                  <span className="w-3 h-3 rounded-full bg-gold-500 relative" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-600">Active Reading Session</span>
                    <span className="chip chip-gold text-[10px] py-0.5 px-2">In Progress</span>
                  </div>
                  <p className="text-sm font-semibold text-ink mt-0.5">
                    Session in progress for <span className="italic">{data.activeSession.book_title || 'your book'}</span>
                  </p>
                </div>
              </div>
              <Link
                to={`/read/${data.activeSession.book_id}`}
                className="btn btn-gold text-xs px-4 py-2 flex items-center gap-2 shadow-sm"
              >
                <PlayCircle className="w-4 h-4" /> Resume Reading
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stat cards grid with Framer Motion staggered entrance */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, i) => (
            <StatCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              accent={card.accent}
              hint={card.hint}
              index={i}
            />
          ))}
        </div>

        {/* Two-column layout: Weekly chart & Recently read */}
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          {/* Weekly chart section in a premium card */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-cream-200/70">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl text-ink font-semibold">Weekly Rhythm</h2>
                    <span className="chip chip-forest text-[11px]">Last 7 Days</span>
                  </div>
                  <p className="text-xs text-ink-light mt-1">Your daily reading investment in minutes</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-ink-muted">Weekly total</span>
                  <p className="text-sm font-bold text-forest-400">
                    {Math.round((data.weekly || []).reduce((acc, r) => acc + (r.seconds || 0), 0) / 60)} mins
                  </p>
                </div>
              </div>

              {/* Chart area */}
              <div className="mt-8 flex items-end justify-between gap-2 sm:gap-4 h-52 pb-2 px-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayLabel, i) => {
                  const row = data.weekly?.find((r) => r.label.trim() === dayLabel);
                  const rowSec = row ? row.seconds : 0;
                  const h = Math.max(8, Math.round((rowSec / maxWeek) * 100));
                  const min = Math.round(rowSec / 60);

                  return (
                    <div
                      key={`weekly-${dayLabel}`}
                      className="flex-1 flex flex-col items-center gap-2.5 group relative h-full justify-end"
                    >
                      {/* Tooltip on hover showing minutes */}
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                        <div className="bg-forest-600 text-cream-50 text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap border border-forest-400/30">
                          {min}m
                        </div>
                      </div>

                      {/* Bar container */}
                      <div className="w-full max-w-[42px] h-[160px] flex items-end justify-center rounded-lg bg-cream-100/80 p-1">
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: [0.2, 0.8, 0.2, 1] }}
                          className="w-full rounded-md bg-gradient-to-t from-forest-500 via-forest-400 to-forest-300 group-hover:from-gold-500 group-hover:to-gold-300 transition-colors shadow-sm"
                        />
                      </div>

                      {/* Day label */}
                      <span className="text-xs font-medium text-ink-light group-hover:text-forest-400 transition-colors">
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-cream-200/50 flex items-center justify-between text-xs text-ink-muted">
              <span>Consistency is the secret of mastery</span>
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-forest-400 inline-block" />
                Minutes read
              </span>
            </div>
          </motion.div>

          {/* Recently read section */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="card p-6 sm:p-7 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-cream-200/70">
                <div>
                  <h2 className="font-display text-xl text-ink font-semibold">Recently Read</h2>
                  <p className="text-xs text-ink-light mt-1">Jump right back into your current books</p>
                </div>
                <Link
                  to="/books"
                  className="text-xs font-semibold text-forest-400 hover:text-gold-500 transition-colors flex items-center gap-1"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {data.recentBooks.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex w-16 h-16 rounded-2xl bg-cream-100 items-center justify-center mb-3 shadow-inner">
                    <BookOpen className="w-7 h-7 text-forest-400/50" />
                  </div>
                  <p className="text-sm font-medium text-ink mb-1">No reading sessions yet</p>
                  <p className="text-xs text-ink-muted max-w-xs mx-auto mb-4">
                    Discover a title from our curated catalog and start your reading streak.
                  </p>
                  <Link to="/books" className="btn btn-primary text-xs px-4 py-2">
                    Find a Book
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-2">
                  {data.recentBooks.map((b) => (
                    <li key={`recent-${b.id}`}>
                      <Link
                        to={`/books/${b.id}`}
                        className="group flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 hover:bg-cream-100/70 border border-transparent hover:border-cream-200"
                      >
                        {/* Mini gradient cover */}
                        <div className="relative w-10 h-14 rounded-md bg-gradient-to-br from-forest-500 via-forest-400 to-forest-600 shadow-md flex items-center justify-center text-cream-50 flex-shrink-0 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                          <div className="book-spine" style={{ width: 4 }} />
                          <BookOpen className="w-4 h-4 text-cream-50/90 relative z-10" />
                          <div className="book-cover-sheen" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-ink group-hover:text-forest-400 transition-colors truncate">
                            {b.title}
                          </p>
                          <p className="text-xs text-ink-light truncate mt-0.5">
                            {b.author}
                          </p>
                        </div>

                        <div className="w-7 h-7 rounded-full flex items-center justify-center bg-cream-100 text-ink-muted group-hover:bg-gold-400/20 group-hover:text-gold-600 transition-all flex-shrink-0">
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-cream-200/50 text-right">
              <Link to="/books" className="text-xs text-ink-light hover:text-ink font-medium">
                Explore entire catalog →
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Motivational banner at bottom: dark forest gradient with ambient gold glow, text + CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-forest-600 via-forest-500 to-forest-700 text-cream-50 p-8 sm:p-10 shadow-xl border border-forest-400/30 flex flex-wrap items-center justify-between gap-6"
        >
          {/* Ambient gold glow */}
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gold-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-forest-300/20 blur-3xl pointer-events-none" />

          <div className="relative max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cream-50/10 border border-cream-50/15 text-gold-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <Flame className="w-3.5 h-3.5 text-gold-400" />
              Daily Momentum
            </div>
            <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-cream-50">
              Keep the flame burning bright.
            </h3>
            <p className="text-cream-50/75 mt-2 text-sm sm:text-base leading-relaxed">
              Even 15 minutes of immersive reading today expands your horizon, sharpens your focus, and sustains your streak.
            </p>
          </div>

          <Link
            to="/books"
            className="relative btn btn-gold shadow-gold flex items-center gap-2 group flex-shrink-0"
          >
            <span>Find a Book</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}