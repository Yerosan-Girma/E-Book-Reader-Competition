import { motion } from 'framer-motion';
import SectionHeading from '../ui/SectionHeading';
import LandingBackdrop from '../ui/LandingBackdrop';

const languages = [
  { label: 'English',      flag: '🇬🇧', note: 'Available', color: 'rgba(23,76,56,0.1)', accent: '#174C38' },
  { label: 'Amharic',      flag: '🇪🇹', note: 'Coming Soon', color: 'rgba(216,170,91,0.1)', accent: '#A67F2D' },
  { label: 'Afaan Oromo',  flag: '🇪🇹', note: 'Coming Soon', color: 'rgba(44,112,84,0.08)', accent: '#2C7054' },
];

const abstractShapes = [
  { w: 120, h: 80,  top: '10%', left: '5%',  r: 15, opacity: 0.06 },
  { w: 80,  h: 120, top: '70%', left: '88%', r: 12, opacity: 0.05 },
  { w: 60,  h: 60,  top: '50%', left: '15%', r: 50, opacity: 0.07 },
  { w: 40,  h: 100, top: '20%', left: '80%', r: 8,  opacity: 0.05 },
  { w: 100, h: 40,  top: '85%', left: '40%', r: 10, opacity: 0.06 },
];

export default function CommunitySection() {
  return (
    <section
      id="community"
      className="py-28 relative overflow-hidden scroll-mt-24"
      style={{
        background: 'linear-gradient(160deg, #F5F9F5 0%, #DDE8D9 40%, #F5F9F5 100%)',
      }}
    >
      <LandingBackdrop variant="community" />
      {/* Abstract decorative shapes */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {abstractShapes.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              width: s.w, height: s.h,
              top: s.top, left: s.left,
              borderRadius: s.r,
              background: '#174C38',
              opacity: s.opacity,
            }}
            animate={{ rotate: [0, 8, -4, 0], y: [0, -12, 6, 0] }}
            transition={{ duration: 14 + i * 3, repeat: Infinity, ease: 'easeInOut', delay: i * 1.5 }}
          />
        ))}

        {/* Large background glow blobs */}
        <div
          className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(23,76,56,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}
        />
        <div
          className="absolute bottom-1/4 left-1/5 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(216,170,91,0.1) 0%, transparent 70%)', filter: 'blur(50px)' }}
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
            eyebrow="Ethiopian Reading Community"
            heading="Many voices. Endless stories."
            description="A reading community for people across Ethiopia, bringing together different interests, experiences, and languages."
            align="center"
            className="mx-auto mb-14"
          />
        </motion.div>

        <div className="max-w-3xl mx-auto">
          {/* Language cards */}
          <div className="grid grid-cols-3 gap-5 mb-12">
            {languages.map((lang, index) => (
              <motion.div
                key={lang.label}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="relative rounded-2xl p-6 text-center"
                style={{
                  background: 'rgba(255,255,255,0.7)',
                  border: `1px solid rgba(255,255,255,0.9)`,
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 4px 20px rgba(23,76,56,0.08), 0 1px 4px rgba(23,76,56,0.05)',
                }}
              >
                {/* Available badge */}
                <div
                  className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                  style={{ background: lang.color, color: lang.accent }}
                >
                  {lang.note}
                </div>

                <span className="text-4xl mb-3 block">{lang.flag}</span>
                <p className="font-display text-base text-ink font-medium">{lang.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Community message */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-center"
          >
            <div
              className="inline-block rounded-2xl px-8 py-6"
              style={{
                background: 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.8)',
                boxShadow: '0 2px 12px rgba(23,76,56,0.06)',
              }}
            >
              <p className="font-display text-xl italic text-ink/80 leading-relaxed mb-4">
                "Reading connects us — across cities, highlands,<br />
                and languages. Everyone has a story."
              </p>
              <div className="section-divider section-divider-center" />
              <p className="text-sm text-ink-light leading-relaxed mt-4 max-w-lg">
                We're building a platform that celebrates Ethiopia's rich literary
                heritage and diverse reading culture. Multilingual support and
                region-specific content coming soon.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
