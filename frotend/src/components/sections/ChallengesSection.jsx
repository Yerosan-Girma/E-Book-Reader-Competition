import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, BookOpen, Compass, ArrowRight } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { demoChallenges } from '../../data/demoChallenges';
import LandingBackdrop from '../ui/LandingBackdrop';

const iconMap = { flame: Flame, book: BookOpen, compass: Compass };

const cardAccents = [
  { top: 'from-forest-400 to-[#1a5c45]', light: 'rgba(23,76,56,0.08)', border: 'rgba(23,76,56,0.15)' },
  { top: 'from-gold-500 to-gold-400',      light: 'rgba(196,150,62,0.08)', border: 'rgba(196,150,62,0.2)' },
  { top: 'from-[#2C7054] to-forest-400',   light: 'rgba(44,112,84,0.08)', border: 'rgba(44,112,84,0.15)' },
];

export default function ChallengesSection() {
  return (
    <section
      id="challenges"
      className="py-28 relative overflow-hidden scroll-mt-24"
      style={{ background: 'linear-gradient(to bottom, #FFFCF6, #F5F9F5)' }}
    >
      <LandingBackdrop variant="reader" />
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-200 to-transparent" />
        <div
          className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full"
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
            eyebrow="Reading Goals"
            heading="Small habits. Meaningful milestones."
            description="Join challenges, track your progress, and celebrate your achievements."
            align="center"
            className="mx-auto mb-16"
          />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {demoChallenges.map((challenge, index) => {
            const Icon = iconMap[challenge.icon];
            const accent = cardAccents[index % cardAccents.length];
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6, delay: index * 0.12, ease: [0.2, 0.8, 0.2, 1] }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="group relative rounded-2xl overflow-hidden"
                style={{
                  background: 'white',
                  border: `1px solid ${accent.border}`,
                  boxShadow: '0 2px 12px rgba(8,26,19,0.06), 0 1px 3px rgba(8,26,19,0.04)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                {/* Top accent stripe */}
                <div className={`h-1 bg-gradient-to-r ${accent.top}`} />

                {/* Card content */}
                <div className="p-7">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`w-13 h-13 rounded-2xl bg-gradient-to-br ${accent.top}
                                   text-cream-50 flex items-center justify-center shadow-md`}
                      style={{ width: 52, height: 52 }}
                    >
                      <Icon className="w-6 h-6" strokeWidth={2} />
                    </div>
                    {/* Decorative badge dot */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ background: accent.light, color: index === 1 ? '#A67F2D' : '#174C38' }}
                    >
                      {['★', '◎', '◈'][index]}
                    </div>
                  </div>

                  <h3 className="font-display text-xl text-ink mb-2 leading-snug">{challenge.title}</h3>
                  <p className="text-ink-light text-sm leading-relaxed mb-6">{challenge.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center justify-between text-xs mb-5">
                    <span className="text-ink-muted font-medium">{challenge.duration}</span>
                    <span className="chip chip-forest text-[10px] py-0.5">Demo challenge</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden mb-6" style={{ background: 'rgba(240,232,220,0.8)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${challenge.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${accent.top}`}
                    />
                  </div>

                  <Link
                    to="/register"
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
                               transition-all duration-200 group-hover:shadow-sm"
                    style={{
                      background: accent.light,
                      color: index === 1 ? '#A67F2D' : '#174C38',
                      border: `1px solid ${accent.border}`,
                    }}
                  >
                    Join Challenge
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ink-muted mt-10 italic">
          Preview data — Join to track real progress
        </p>
      </div>
    </section>
  );
}
