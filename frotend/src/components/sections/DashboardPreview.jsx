import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Award, Clock, CheckCircle } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import LandingBackdrop from '../ui/LandingBackdrop';

const stats = [
  { icon: BookOpen,   label: 'Books Read',      value: '12',     sub: 'this year' },
  { icon: Clock,      label: 'Reading Time',     value: '48h',    sub: 'total' },
  { icon: TrendingUp, label: 'Current Streak',   value: '12',     sub: 'days' },
  { icon: Award,      label: 'Badges Earned',    value: '8',      sub: 'achievements' },
];

const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const weekHeights = [40, 65, 30, 82, 55, 90, 72];

export default function DashboardPreview() {
  return (
    <section
      id="dashboard-preview"
      className="py-28 relative overflow-hidden scroll-mt-24"
      style={{ background: 'linear-gradient(to bottom, #F5F9F5, #F8F5ED)' }}
    >
      <LandingBackdrop variant="reader" />
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(44,112,84,0.07) 0%, transparent 65%)', filter: 'blur(60px)' }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <SectionHeading
            eyebrow="Coming Soon"
            heading="Your reading journey, in one place."
            description="Track progress, celebrate streaks, and see your growth at a glance."
            align="center"
            className="mx-auto mb-14"
          />
        </motion.div>

        <p className="text-center text-xs font-semibold uppercase tracking-widest text-forest-400 mb-4">
          Preview data — not your account
        </p>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className="dashboard-frame max-w-4xl mx-auto"
          aria-label="Dashboard preview with sample data"
        >
          {/* Browser chrome */}
          <div className="dashboard-header">
            <div className="flex gap-2">
              <div className="dashboard-dot dashboard-dot-red" />
              <div className="dashboard-dot dashboard-dot-yellow" />
              <div className="dashboard-dot dashboard-dot-green" />
            </div>
            <div className="flex-1 mx-4">
              <div
                className="h-5 rounded-md flex items-center gap-2 max-w-xs mx-auto px-3"
                style={{ background: 'rgba(240,232,220,0.7)', border: '1px solid rgba(232,219,202,0.8)' }}
              >
                <div className="w-2 h-2 rounded-full bg-forest-400/50 flex-shrink-0" />
                <div className="h-1.5 rounded-full flex-1" style={{ background: 'rgba(32,43,37,0.1)' }} />
              </div>
            </div>
            <span className="text-xs text-ink-muted font-medium">Preview</span>
          </div>

          {/* Dashboard content */}
          <div className="p-5 md:p-7" style={{ background: '#F8F5ED' }}>

            {/* Greeting row */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-xl text-ink">Good morning, Selam ✨</h3>
                <p className="text-sm text-ink-light mt-0.5">You're on a 12-day streak. Keep it up!</p>
              </div>
              <div
                className="px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5"
                style={{ background: 'rgba(23,76,56,0.1)', color: '#174C38', border: '1px solid rgba(23,76,56,0.15)' }}
              >
                🔥 12 days
              </div>
            </div>

            {/* Stat cards row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {stats.map((stat, index) => (
                <motion.div
                  key={`preview-stat-${index}`}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-xl p-4"
                  style={{
                    background: 'white',
                    border: '1px solid rgba(240,232,220,0.8)',
                    boxShadow: '0 1px 4px rgba(8,26,19,0.05)',
                  }}
                >
                  <stat.icon className="w-4 h-4 mb-2.5" style={{ color: '#174C38', opacity: 0.75 }} />
                  <p className="text-2xl font-bold text-ink leading-none">{stat.value}</p>
                  <p className="text-[10px] text-ink-muted mt-1 uppercase tracking-wide">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Bottom two panels */}
            <div className="grid md:grid-cols-2 gap-4">

              {/* Currently reading */}
              <div
                className="rounded-xl p-5"
                style={{ background: 'white', border: '1px solid rgba(240,232,220,0.8)', boxShadow: '0 1px 4px rgba(8,26,19,0.05)' }}
              >
                <h4 className="font-display text-base text-ink mb-4">Currently Reading</h4>
                <div className="flex gap-4">
                  <div
                    className="w-16 h-22 rounded-lg flex-shrink-0 flex items-end p-2"
                    style={{ background: 'linear-gradient(135deg, #174C38, #0B2920)', minHeight: 88 }}
                  >
                    <div className="book-cover-sheen" aria-hidden="true" />
                    <p className="font-display text-[9px] text-cream-50/80 leading-tight">The Art of Consistent Habit</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm text-ink leading-snug">The Art of Consistent Habit</p>
                    <p className="text-xs text-ink-muted mt-0.5 mb-3">Dr. Alemseged Tesfaye</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(240,232,220,0.8)' }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: '26%', background: 'linear-gradient(to right, #174C38, #2C7054)' }}
                        />
                      </div>
                      <span className="text-xs text-ink-muted flex-shrink-0">26%</span>
                    </div>
                    <p className="text-xs text-ink-muted mt-1">84 / 320 pages</p>
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-medium" style={{ color: '#174C38' }}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Reading session active
                    </div>
                  </div>
                </div>
              </div>

              {/* Weekly activity chart */}
              <div
                className="rounded-xl p-5"
                style={{ background: 'white', border: '1px solid rgba(240,232,220,0.8)', boxShadow: '0 1px 4px rgba(8,26,19,0.05)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-base text-ink">Weekly Activity</h4>
                  <span className="text-xs text-ink-muted">This week</span>
                </div>
                <div className="flex items-end justify-between h-28 gap-1.5">
                  {weekDays.map((day, index) => (
                    <div key={`day-${index}`} className="flex-1 flex flex-col items-center gap-1.5">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${weekHeights[index]}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: index * 0.06, ease: 'easeOut' }}
                        className="w-full rounded-t-md"
                        style={{
                          background: index === 5
                            ? 'linear-gradient(to top, #174C38, #2C7054)'
                            : index === 3
                              ? 'linear-gradient(to top, #174C38, #2C7054)'
                              : 'rgba(23,76,56,0.25)',
                        }}
                      />
                      <span className="text-[10px] text-ink-muted font-medium">{day}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-ink-muted mt-3 text-center">Total: 4h 20m this week</p>
              </div>
            </div>
          </div>
        </motion.div>

        <p className="text-center text-xs text-ink-muted mt-6 italic">
          Preview only — connect your account to see real data
        </p>
      </div>
    </section>
  );
}
