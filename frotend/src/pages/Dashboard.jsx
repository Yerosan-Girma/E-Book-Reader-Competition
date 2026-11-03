import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Clock,
  BookOpen,
  Flame,
  Trophy,
  ArrowRight,
  PlayCircle,
  Loader2,
  Calendar,
  CheckCircle2,
  BarChart3,
  Bookmark,
  Sparkles,
  History,
  TrendingUp,
  Upload,
  User,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';
import Footer from '../components/layout/Footer';
import { BookCover } from '../components/ui/BookCover';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const formatDuration = (sec) => {
  const s = Math.max(0, Number(sec) || 0);
  if (s === 0) return '0m';
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem > 0 ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const remM = m % 60;
  return remM > 0 ? `${h}h ${remM}m` : `${h}h`;
};

const formatMins = (mins) => {
  if (!mins || mins <= 0) return '0m';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hrs}h ${rem}m` : `${hrs}h`;
};

const formatBadgeColors = {
  pdf: 'bg-red-100 text-red-700 border-red-200',
  docx: 'bg-blue-100 text-blue-700 border-blue-200',
  doc: 'bg-sky-100 text-sky-700 border-sky-200',
  image: 'bg-purple-100 text-purple-700 border-purple-200',
  epub: 'bg-purple-100 text-purple-700 border-purple-200',
  chapter: 'bg-forest-100 text-forest-700 border-forest-200',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState('weekly'); // 'weekly' | 'monthly'

  useEffect(() => {
    api
      .get('/dashboard')
      .then(({ data }) => setData(data))
      .catch((err) => console.error('Error fetching dashboard data:', err));
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const dailyMinutes = data.daily?.today_minutes || 0;
  const weeklyMinutes = data.weekly?.this_week_minutes || 0;
  const monthlyMinutes = data.monthly?.this_month_minutes || 0;
  const totalHours = data.totals?.total_hours || '0.0';

  const weeklyBreakdown = data.weekly?.breakdown || [];
  const maxWeeklySec = Math.max(60, ...weeklyBreakdown.map((w) => w.seconds || 0));

  const monthlyBreakdown = data.monthly?.breakdown || [];
  const maxMonthlySec = Math.max(60, ...monthlyBreakdown.map((m) => m.seconds || 0));

  const continueBooks = data.continueReading || [];
  const recentHistory = data.recentHistory || [];

  const todayVal = data.daily?.today_formatted || formatDuration(data.daily?.today_seconds);
  const weekVal = data.weekly?.this_week_formatted || formatDuration(data.weekly?.this_week_seconds);
  const monthVal = data.monthly?.this_month_formatted || formatDuration(data.monthly?.this_month_seconds);
  const lastWeekVal = data.weekly?.last_week_formatted || formatDuration(data.weekly?.last_week_seconds);
  const lastMonthVal = data.monthly?.last_month_formatted || formatDuration(data.monthly?.last_month_seconds);

  const statCards = [
    {
      icon: Clock,
      label: 'Today (Daily)',
      value: todayVal,
      accent: 'forest',
      hint: (data.daily?.today_seconds || 0) > 0 ? 'Logged reading today' : 'Ready to start today',
    },
    {
      icon: Calendar,
      label: 'This Week (Weekly)',
      value: weekVal,
      accent: 'gold',
      hint: `Last week: ${lastWeekVal}`,
    },
    {
      icon: TrendingUp,
      label: 'This Month (Monthly)',
      value: monthVal,
      accent: 'forest',
      hint: `Last month: ${lastMonthVal}`,
    },
    {
      icon: Flame,
      label: 'Reading Streak',
      value: `${data.streak || 0}d`,
      accent: 'gold',
      hint: `${data.totals?.books_completed || 0} books completed`,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-cream-100/60 to-sage-100/40 relative overflow-hidden flex flex-col justify-between">
      {/* Background decorations */}
      <div className="bg-blobs" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-forest-700/85 via-forest-600/50 to-transparent pointer-events-none z-10" />

      <Navbar />

      <main className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full flex-1">
        {/* Animated Greeting & Summary */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-6"
        >
          <div>
            <div className="section-eyebrow mb-1">{getGreeting()}</div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl text-ink font-bold tracking-tight">
              Hi, {user.display_name || user.username}.
            </h1>
            <p className="text-sm text-ink-light mt-1">
              Your reading dashboard records your daily, weekly, and monthly investment and lets you continue exactly where you stopped.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/upload"
              className="btn btn-primary text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Material</span>
            </Link>
            <Link
              to="/books"
              className="btn btn-outline-dark text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-forest-500" />
              <span>Browse Library</span>
            </Link>
            <Link
              to="/profile"
              className="btn btn-outline-dark text-xs px-3.5 py-2.5 rounded-xl inline-flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5 text-forest-600" />
              <span>My Profile</span>
            </Link>
          </div>
        </motion.div>

        {/* Active Session Notification Banner (if any) */}
        {data.activeSession && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 relative overflow-hidden rounded-2xl p-4 sm:p-5 border border-gold-400/40 shadow-gold"
            style={{
              background: 'linear-gradient(135deg, rgba(232, 201, 130, 0.25) 0%, rgba(216, 170, 91, 0.15) 50%, rgba(196, 150, 62, 0.2) 100%)',
            }}
          >
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-gold-500 animate-ping absolute opacity-75" />
                  <span className="w-3 h-3 rounded-full bg-gold-500 relative" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-gold-600">Active Reading Session</span>
                    <span className="chip chip-gold text-[10px] py-0.5 px-2">Timer Running</span>
                  </div>
                  <p className="text-sm font-semibold text-ink mt-0.5 truncate">
                    Currently reading <span className="italic">{data.activeSession.book_title || 'your book'}</span>
                  </p>
                </div>
              </div>
              <Link
                to={`/read/${data.activeSession.book_id}`}
                className="btn btn-gold text-xs px-4 py-2.5 flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <PlayCircle className="w-4 h-4" /> Return to Reader
              </Link>
            </div>
          </motion.div>
        )}

        {/* ── Daily, Weekly, Monthly KPI Stat Cards ── */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
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

        {/* ── SECTION 1: CONTINUE READING (Resume Exactly Where Stopped) ── */}
        <section className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200/80 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl sm:text-2xl text-ink font-bold">Continue Reading</h2>
                <span className="chip chip-forest text-[11px] font-semibold">
                  {continueBooks.length} Active {continueBooks.length === 1 ? 'Book' : 'Books'}
                </span>
              </div>
              <p className="text-xs text-ink-light mt-0.5">
                Resume from your exact page, chapter, and scroll position saved on the database
              </p>
            </div>

            <Link
              to="/books"
              className="text-xs font-semibold text-forest-600 hover:text-gold-600 transition-colors flex items-center gap-1"
            >
              Explore Library <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {continueBooks.length === 0 ? (
            <div className="card p-8 sm:p-12 text-center rounded-2xl bg-white/70 border border-cream-200">
              <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <BookOpen className="w-7 h-7 text-forest-500/60" />
              </div>
              <h3 className="font-display text-lg text-ink font-semibold mb-1">Your bookshelf is waiting</h3>
              <p className="text-xs text-ink-muted max-w-sm mx-auto mb-5">
                Open any book or document in the library. Your reading time and position will be tracked automatically.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/books" className="btn btn-primary text-xs px-5 py-2.5 rounded-xl shadow-sm">
                  Discover Books to Read
                </Link>
                <Link to="/upload" className="btn btn-outline text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Your Own Material</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {continueBooks.map((item, idx) => {
                const targetUrl = `/read/${item.bookId}?pos=${encodeURIComponent(item.position || '')}&chapter=${item.chapterId || ''}`;
                const pct = Math.min(100, Math.max(0, Math.round(item.scrollPercent || 0)));
                const fmt = (item.format || 'pdf').toLowerCase();

                return (
                  <motion.div
                    key={`continue-${item.bookId}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                    className="group card p-4 sm:p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition-all border border-cream-200 bg-white"
                  >
                    <div>
                      {/* Top Bar: Format Badge & Last Read */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            formatBadgeColors[fmt] || formatBadgeColors.chapter
                          }`}
                        >
                          {fmt.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-ink-muted font-medium">
                          {formatRelativeTime(item.lastReadAt)}
                        </span>
                      </div>

                      {/* Cover & Title */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="w-14 h-20 shrink-0 rounded-lg overflow-hidden shadow-sm border border-black/10 bg-cream-100 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                          {item.coverUrl ? (
                            <img
                              src={item.coverUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <BookCover
                              book={{
                                id: item.bookId,
                                title: item.title,
                                author: item.author,
                                category: item.category,
                              }}
                              tilt={false}
                              showBadge={false}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="font-display font-semibold text-sm sm:text-base text-ink line-clamp-2 group-hover:text-forest-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-xs text-ink-light truncate mt-0.5">by {item.author}</p>
                          <span className="inline-block text-[10px] font-medium text-ink-muted mt-1 bg-cream-100 px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                        </div>
                      </div>

                      {/* Reading Progress Indicator */}
                      <div className="space-y-1.5 my-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-ink-muted flex items-center gap-1 text-[11px]">
                            {item.position ? (
                              <span>Position: <strong>Page {item.position}</strong></span>
                            ) : item.chapterTitle ? (
                              <span>{item.chapterTitle}</span>
                            ) : (
                              <span>Progress</span>
                            )}
                          </span>
                          <span className="font-bold text-forest-600 text-xs">{pct}%</span>
                        </div>

                        <div className="w-full h-1.5 bg-cream-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-forest-500 to-gold-400 rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-ink-muted pt-0.5">
                          <span>Time invested: <strong>{item.timeFormatted || formatDuration(item.totalSecondsSpent)}</strong></span>
                          {item.isCompleted && (
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Finished
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Button: Continue Reading */}
                    <div className="pt-2 border-t border-cream-100 mt-2">
                      <Link
                        to={targetUrl}
                        className="btn btn-primary w-full py-2 text-xs rounded-xl flex items-center justify-center gap-2 group-hover:bg-forest-600 transition-colors shadow-xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Continue Reading</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── SECTION 2: READING TIME ANALYTICS & RHYTHM CHART ── */}
        <div className="mt-8 sm:mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: Interactive Rhythm Chart (Weekly / Monthly Tabs) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="card p-5 sm:p-6 lg:p-7 flex flex-col justify-between rounded-2xl bg-white border border-cream-200"
          >
            <div>
              <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-cream-200">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-forest-500" />
                    <h2 className="font-display text-lg sm:text-xl text-ink font-semibold">
                      Reading Rhythm & Time
                    </h2>
                  </div>
                  <p className="text-xs text-ink-light mt-0.5">
                    Calculated and persisted in real time on PostgreSQL
                  </p>
                </div>

                {/* Tab Switcher: Weekly vs Monthly */}
                <div className="inline-flex rounded-lg bg-cream-100 p-0.5 text-xs font-semibold">
                  <button
                    onClick={() => setActiveChartTab('weekly')}
                    className={`px-3 py-1.5 rounded-md transition ${
                      activeChartTab === 'weekly'
                        ? 'bg-white text-forest-700 shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    Weekly Rhythm
                  </button>
                  <button
                    onClick={() => setActiveChartTab('monthly')}
                    className={`px-3 py-1.5 rounded-md transition ${
                      activeChartTab === 'monthly'
                        ? 'bg-white text-forest-700 shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    Monthly Rhythm
                  </button>
                </div>
              </div>

              {/* Weekly View */}
              {activeChartTab === 'weekly' ? (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Daily investment (last 7 days)
                    </span>
                    <span className="text-xs font-bold text-forest-600">
                      Total: {data.weekly?.this_week_formatted || formatDuration(data.weekly?.this_week_seconds)}
                    </span>
                  </div>

                  {/* 7-day Bar Chart */}
                  <div className="flex items-end justify-between gap-2 sm:gap-3 h-44 sm:h-52 pb-2 px-1">
                    {weeklyBreakdown.map((item, idx) => {
                      const h = Math.max(6, Math.round(((item.seconds || 0) / maxWeeklySec) * 100));
                      const isToday = idx === weeklyBreakdown.length - 1;

                      return (
                        <div
                          key={`day-${item.day}-${idx}`}
                          className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end"
                        >
                          {/* Tooltip on hover */}
                          <div className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap">
                            <div className="bg-forest-700 text-cream-50 text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg border border-forest-500/30">
                              {item.date_label}: {item.formatted || formatDuration(item.seconds)}
                            </div>
                          </div>

                          {/* Bar */}
                          <div className="w-full max-w-[36px] sm:max-w-[46px] h-[130px] sm:h-[160px] flex items-end justify-center rounded-xl bg-cream-100/90 p-1">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.05 }}
                              className={`w-full rounded-lg transition-colors shadow-xs ${
                                isToday
                                  ? 'bg-gradient-to-t from-gold-500 to-gold-300'
                                  : 'bg-gradient-to-t from-forest-600 via-forest-500 to-forest-400 group-hover:from-gold-500 group-hover:to-gold-300'
                              }`}
                            />
                          </div>

                          <span className={`text-[11px] font-medium transition-colors ${
                            isToday ? 'text-forest-700 font-bold' : 'text-ink-muted'
                          }`}>
                            {item.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Monthly View */
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      Weekly totals (past 30 days)
                    </span>
                    <span className="text-xs font-bold text-forest-600">
                      Total: {data.monthly?.this_month_formatted || formatDuration(data.monthly?.this_month_seconds)}
                    </span>
                  </div>

                  {monthlyBreakdown.length === 0 ? (
                    <div className="h-44 flex items-center justify-center text-xs text-ink-muted">
                      No monthly sessions recorded yet. Keep reading to generate charts!
                    </div>
                  ) : (
                    <div className="flex items-end justify-around gap-4 h-44 sm:h-52 pb-2 px-2">
                      {monthlyBreakdown.map((item, idx) => {
                        const h = Math.max(8, Math.round(((item.seconds || 0) / maxMonthlySec) * 100));
                        return (
                          <div
                            key={`month-week-${idx}`}
                            className="flex-1 flex flex-col items-center gap-2 group relative h-full justify-end max-w-[64px]"
                          >
                            <div className="absolute -top-9 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 whitespace-nowrap">
                              <div className="bg-forest-700 text-cream-50 text-[11px] font-semibold py-1 px-2 rounded-lg shadow-lg">
                                {item.formatted || formatDuration(item.seconds)}
                              </div>
                            </div>

                            <div className="w-full h-[130px] sm:h-[160px] flex items-end justify-center rounded-xl bg-cream-100/90 p-1">
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${h}%` }}
                                transition={{ duration: 0.6, delay: idx * 0.08 }}
                                className="w-full rounded-lg bg-gradient-to-t from-forest-600 via-forest-500 to-gold-400"
                              />
                            </div>

                            <span className="text-[11px] font-medium text-ink-muted">
                              {item.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-cream-200/60 flex items-center justify-between text-xs text-ink-muted">
              <span>Automatic time counting enabled on all readers</span>
              <span className="flex items-center gap-1.5 font-medium text-ink">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-500 inline-block" />
                Verified reading time
              </span>
            </div>
          </motion.div>

          {/* Right: Reading Stats & Highlights Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="card p-5 sm:p-6 flex flex-col justify-between rounded-2xl bg-white border border-cream-200"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-cream-200 mb-4">
                <h3 className="font-display font-semibold text-lg text-ink">Summary Milestones</h3>
                <Trophy className="w-4 h-4 text-gold-500" />
              </div>

              <div className="space-y-3.5">
                <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink-muted uppercase">Lifetime Reading</p>
                    <p className="text-xl font-bold font-display text-forest-700 mt-0.5">{data.totals?.total_formatted || `${totalHours} hrs`}</p>
                  </div>
                  <Clock className="w-6 h-6 text-forest-500/40" />
                </div>

                <div className="p-3.5 rounded-xl bg-cream-50 border border-cream-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink-muted uppercase">Completed Books</p>
                    <p className="text-xl font-bold font-display text-forest-700 mt-0.5">{data.totals?.books_completed || 0}</p>
                  </div>
                  <CheckCircle2 className="w-6 h-6 text-forest-500/40" />
                </div>

                <div data-testid="goal-card" className="p-3.5 rounded-xl bg-cream-50 border border-cream-200/80 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink-muted uppercase">Daily Reading Goal</p>
                    <p className="text-xs text-ink-light mt-0.5">
                      {dailyMinutes >= 20 ? 'Goal achieved today! 🎉' : `${Math.max(0, 20 - dailyMinutes)} mins to reach 20m goal`}
                    </p>
                  </div>
                  <span data-testid="goal-progress" className="text-sm font-bold text-forest-600">
                    {Math.min(100, Math.round((dailyMinutes / 20) * 100))}%
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-cream-200/80">
              <Link
                to="/books"
                className="btn btn-gold w-full py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Find New Materials</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── SECTION 3: RECENT READING HISTORY ── */}
        {recentHistory.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <div className="flex items-center justify-between pb-3 border-b border-cream-200/80 mb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-forest-500" />
                <h2 className="font-display text-xl text-ink font-bold">Recent Reading Sessions</h2>
              </div>
              <span className="text-xs text-ink-muted">{recentHistory.length} Recorded Sessions</span>
            </div>

            <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-cream-100/70 border-b border-cream-200 text-ink-muted font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Book Title</th>
                      <th className="py-3 px-4">Format</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-100">
                    {recentHistory.map((s) => (
                      <tr key={`history-${s.id}`} data-testid="recent-session" className="hover:bg-cream-50/70 transition-colors">
                        <td className="py-3 px-4 font-semibold text-ink">
                          <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-forest-500 shrink-0" />
                            <span className="truncate max-w-xs">{s.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              formatBadgeColors[(s.format || 'pdf').toLowerCase()] || formatBadgeColors.chapter
                            }`}
                          >
                            {(s.format || 'PDF').toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-ink-muted">
                          {new Date(s.startedAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-forest-700">
                          {s.timeFormatted || formatDuration(s.durationSeconds)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            to={`/read/${s.bookId}`}
                            className="text-xs font-semibold text-forest-600 hover:text-gold-600 transition"
                          >
                            Open Reader →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
