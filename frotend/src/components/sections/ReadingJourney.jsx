import { motion } from 'framer-motion';
import { BookOpen, Target, Trophy } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import LandingBackdrop from '../ui/LandingBackdrop';

const steps = [
  {
    icon: BookOpen,
    num: '01',
    title: 'Discover',
    description: 'Find books that match your curiosity — fiction, self-development, science, and more.',
    color: 'from-forest-400 to-forest-500',
    accentColor: 'rgba(23,76,56,0.12)',
  },
  {
    icon: Target,
    num: '02',
    title: 'Build your rhythm',
    description: 'Set goals, track your progress, and develop a consistent reading habit that sticks.',
    color: 'from-[#1a5c45] to-forest-500',
    accentColor: 'rgba(26,92,69,0.12)',
  },
  {
    icon: Trophy,
    num: '03',
    title: 'Celebrate your growth',
    description: 'Complete challenges, earn recognition, and celebrate every milestone you reach.',
    color: 'from-gold-500 to-gold-600',
    accentColor: 'rgba(196,150,62,0.12)',
  },
];

export default function ReadingJourney() {
  return (
    <section
      id="reading-journey"
      className="py-28 relative overflow-hidden scroll-mt-24"
      style={{ background: 'linear-gradient(160deg, #F8F5ED 0%, #F5F9F5 60%, #F8F5ED 100%)' }}
    >
      <LandingBackdrop variant="reader" />
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-200 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sage-200 to-transparent" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(ellipse, rgba(44,112,84,0.06) 0%, transparent 65%)',
            filter: 'blur(40px)',
          }}
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
            eyebrow="How It Works"
            heading="Make reading a part of your life."
            description="Three simple steps to build a lasting reading habit."
            align="center"
            className="mx-auto mb-20"
          />
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
          {/* Connecting line — desktop */}
          <div
            className="hidden md:block absolute top-16 left-[22%] right-[22%] h-px"
            style={{
              background: 'linear-gradient(to right, rgba(23,76,56,0.2), rgba(216,170,91,0.4), rgba(23,76,56,0.2))',
            }}
            aria-hidden="true"
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, delay: index * 0.15, ease: [0.2, 0.8, 0.2, 1] }}
              className="relative group"
            >
              {/* Card */}
              <div
                className="relative rounded-2xl p-8 transition-all duration-300
                            hover:shadow-lg hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(240,232,220,0.8)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Large step number watermark */}
                <span
                  className="absolute top-4 right-5 font-display text-7xl font-bold select-none pointer-events-none"
                  style={{ color: step.accentColor, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {step.num}
                </span>

                {/* Icon */}
                <div
                  className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color}
                               text-cream-50 flex items-center justify-center shadow-md mb-6 z-10`}
                >
                  <step.icon className="w-6 h-6" strokeWidth={2} />
                </div>

                {/* Step number pill */}
                <span
                  className="inline-block text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: step.num === '03' ? '#A67F2D' : '#174C38' }}
                >
                  Step {step.num}
                </span>

                <h3 className="font-display text-xl md:text-2xl text-ink mb-3">{step.title}</h3>
                <p className="text-ink-light leading-relaxed text-sm md:text-base">{step.description}</p>

                {/* Bottom accent line */}
                <div
                  className={`absolute bottom-0 left-8 right-8 h-0.5 rounded-full bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  aria-hidden="true"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
