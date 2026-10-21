import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Flame,
  Compass,
  Trophy,
  BookOpen,
  Bell,
  CheckCircle,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Star,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';

const ambientParticles = [
  { id: 1, top: '18%', left: '12%', size: 6, delay: 0 },
  { id: 2, top: '32%', right: '15%', size: 8, delay: 1.8 },
  { id: 3, top: '60%', left: '18%', size: 5, delay: 3.5 },
  { id: 4, top: '78%', right: '20%', size: 7, delay: 1.2 },
  { id: 5, top: '48%', left: '85%', size: 6, delay: 2.7 },
];

const featureCards = [
  {
    id: 'streak',
    icon: Flame,
    title: '30-Day Streak',
    badge: 'Consistency Quest',
    target: '30 consecutive days • 15 mins/day',
    description:
      'Cultivate an unbreakable reading habit. Build daily momentum page by page, track your uninterrupted reading rhythm, and unlock exclusive consistency badges.',
    accentColor: 'from-gold-400 to-gold-500',
    iconBg: 'rgba(216, 170, 91, 0.15)',
    iconColor: '#E8C982',
  },
  {
    id: 'genre',
    icon: Compass,
    title: 'Genre Explorer',
    badge: 'Curiosity & Breadth',
    target: '5 diverse genres • 5 unique titles',
    description:
      'Step outside your literary comfort zone. Journey through Ethiopian classics, world philosophy, poetry, history, and science curated for inquisitive minds.',
    accentColor: 'from-forest-300 to-forest-400',
    iconBg: 'rgba(44, 112, 84, 0.25)',
    iconColor: '#8FB891',
  },
  {
    id: 'marathon',
    icon: Trophy,
    title: 'Reading Marathon',
    badge: 'Seasonal Grand Tour',
    target: '1,000 pages or 25 reading hours',
    description:
      'Test your reading stamina in seasonal community marathons. Conquer milestone goals, earn certified badges of honor, and celebrate with fellow readers.',
    accentColor: 'from-gold-300 to-forest-300',
    iconBg: 'rgba(232, 201, 130, 0.18)',
    iconColor: '#D8AA5B',
  },
];

export default function Challenges() {
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
        <section className="relative hero-gradient pt-36 pb-24 md:pb-32 px-6 overflow-hidden">
          <div className="grain-overlay" aria-hidden="true" />

          {/* Ambient radial glows */}
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(216, 170, 91, 0.14) 0%, rgba(23, 76, 56, 0.2) 50%, transparent 75%)',
              filter: 'blur(70px)',
            }}
            aria-hidden="true"
          />

          {/* Ambient floating particle dots (3-5 small floating dots) */}
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

          {/* Floating animated decorations: Trophy rotating slowly */}
          <motion.div
            className="hidden md:flex absolute top-36 right-10 lg:right-28 w-24 h-24 rounded-3xl glass-dark items-center justify-center pointer-events-none border border-gold-400/30 shadow-book-glow z-10"
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

          {/* Floating animated decorations: Book shapes floating */}
          <motion.div
            className="hidden md:flex absolute top-48 left-8 lg:left-24 w-20 h-28 rounded-2xl bg-gradient-to-br from-forest-400/35 via-forest-300/25 to-gold-400/20 backdrop-blur-md p-2.5 flex-col justify-between pointer-events-none border border-cream-50/20 shadow-xl z-10"
            animate={{
              y: [14, -14, 14],
              rotate: [-8, 6, -8],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            aria-hidden="true"
          >
            <div className="w-full h-1 bg-gold-400/60 rounded-full" />
            <BookOpen className="w-7 h-7 text-cream-50/80 mx-auto" />
            <div className="space-y-1">
              <div className="w-3/4 h-1 bg-cream-50/40 rounded" />
              <div className="w-1/2 h-1 bg-cream-50/25 rounded" />
            </div>
          </motion.div>

          {/* Hero Content */}
          <div className="relative z-20 max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            >
              <span className="hero-eyebrow-pill mb-6">Upcoming Platform Experience</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.2, 0.8, 0.2, 1] }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-cream-50 font-bold tracking-tight mb-3"
            >
              Reading Challenges
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
              Transform your reading journey into an inspiring daily ritual. Embark on curated quests,
              unlock coveted literary badges, and compete with a thriving community of readers across Ethiopia.
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
                  <span>You're on the list! We'll notify you when Challenges go live.</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Bell className="w-4 h-4 text-gold-300 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email for early access..."
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
                No spam ever. Only major feature launch announcements.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Feature Preview Cards Section */}
        <section className="py-20 px-6 relative bg-gradient-to-b from-cream-100/80 via-cream-50 to-cream-100/50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-14"
            >
              <div className="section-eyebrow section-divider-center mb-2">Sneak Peek</div>
              <h2 className="font-display text-3xl sm:text-4xl text-ink font-bold tracking-tight">
                What to Expect
              </h2>
              <p className="text-ink-light text-sm sm:text-base max-w-lg mx-auto mt-2">
                Designed to make reading an engaging habit with meaningful milestones and shared celebrations.
              </p>
            </motion.div>

            {/* 3 feature preview cards */}
            <div className="grid md:grid-cols-3 gap-7">
              {featureCards.map((card, index) => {
                const IconComponent = card.icon;
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
                    whileHover={{ y: -6, transition: { duration: 0.25 } }}
                    className="card card-hover p-7 rounded-2xl relative overflow-hidden flex flex-col justify-between"
                  >
                    {/* Top gradient accent line */}
                    <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor}`} />

                    <div>
                      {/* Icon & Badge Row */}
                      <div className="flex items-center justify-between mb-6">
                        <div
                          className="w-13 h-13 rounded-2xl flex items-center justify-center shadow-sm"
                          style={{
                            width: 52,
                            height: 52,
                            backgroundColor: card.iconBg,
                            color: card.iconColor,
                          }}
                        >
                          <IconComponent className="w-6 h-6" strokeWidth={2.2} />
                        </div>
                        <span className="chip chip-gold text-[11px] font-semibold">
                          {card.badge}
                        </span>
                      </div>

                      <h3 className="font-display text-2xl font-bold text-ink mb-2">
                        {card.title}
                      </h3>
                      <p className="text-xs font-semibold text-forest-400 mb-4 flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-400" />
                        {card.target}
                      </p>
                      <p className="text-sm text-ink-light leading-relaxed mb-6">
                        {card.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-cream-200/70 flex items-center justify-between text-xs text-ink-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-forest-400" /> Coming Q4
                      </span>
                      <span className="chip chip-forest text-[10px]">Preview</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
