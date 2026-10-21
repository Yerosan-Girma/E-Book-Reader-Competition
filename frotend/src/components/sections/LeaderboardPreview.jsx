import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';
import SectionHeading from '../ui/SectionHeading';
import { demoLeaderboard } from '../../data/demoLeaderboard';
import LandingBackdrop from '../ui/LandingBackdrop';

const rankGlows = [
  { border: 'rgba(216,170,91,0.6)', bg: 'linear-gradient(135deg, #D8AA5B, #E8C982)', glow: '0 0 20px rgba(216,170,91,0.35)' },
  { border: 'rgba(180,185,190,0.6)', bg: 'linear-gradient(135deg, #B0B8C0, #C8D0D8)', glow: '0 0 12px rgba(180,185,190,0.25)' },
  { border: 'rgba(200,150,90,0.5)',  bg: 'linear-gradient(135deg, #C89660, #D8AA80)', glow: 'none' },
];

export default function LeaderboardPreview() {
  return (
    <section
      id="leaderboard"
      className="py-28 relative overflow-hidden scroll-mt-24"
      style={{ background: 'linear-gradient(to bottom, #F8F5ED, #FFFCF6)' }}
    >
      <LandingBackdrop variant="community" />
      {/* Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cream-300 to-transparent" />
        <div
          className="absolute -top-10 right-0 w-[450px] h-[350px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(216,170,91,0.08) 0%, transparent 65%)', filter: 'blur(50px)' }}
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
            eyebrow="Community"
            heading="Celebrate the joy of reading."
            description="Recognize consistency, curiosity, and the effort behind every page."
            align="center"
            className="mx-auto mb-14"
          />
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Leaderboard card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: 'white',
              border: '1px solid rgba(240,232,220,0.8)',
              boxShadow: '0 8px 32px rgba(8,26,19,0.08), 0 2px 8px rgba(8,26,19,0.04)',
            }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #174C38, #0B2920)' }}
            >
              <Trophy className="w-5 h-5 text-gold-400" />
              <span className="font-semibold text-cream-50">Top Readers This Month</span>
              <span className="ml-auto text-xs text-cream-50/60 italic">Demo data</span>
            </div>

            {/* Entries */}
            <div>
              {demoLeaderboard.map((reader, index) => {
                const isTop3 = reader.rank <= 3;
                const glowStyle = isTop3 ? rankGlows[reader.rank - 1] : null;
                return (
                  <motion.div
                    key={reader.rank}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.07 }}
                    className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-cream-50"
                    style={{
                      borderBottom: index < demoLeaderboard.length - 1 ? '1px solid rgba(240,232,220,0.6)' : 'none',
                      background: reader.rank === 1 ? 'rgba(216,170,91,0.04)' : undefined,
                    }}
                  >
                    {/* Rank */}
                    <div className="w-8 flex items-center justify-center flex-shrink-0">
                      {reader.rank === 1 && <span className="text-2xl" role="img" aria-label="Gold medal">🥇</span>}
                      {reader.rank === 2 && <span className="text-2xl" role="img" aria-label="Silver medal">🥈</span>}
                      {reader.rank === 3 && <span className="text-2xl" role="img" aria-label="Bronze medal">🥉</span>}
                      {reader.rank > 3 && (
                        <span className="text-sm font-bold text-ink-muted">#{reader.rank}</span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{
                        background: isTop3 ? glowStyle.bg : 'linear-gradient(135deg, #2C7054, #174C38)',
                        color: 'white',
                        boxShadow: isTop3 ? glowStyle.glow : 'none',
                        border: isTop3 ? `2px solid ${glowStyle.border}` : '2px solid transparent',
                      }}
                    >
                      {reader.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-ink truncate ${reader.rank === 1 ? 'font-semibold' : ''}`}>
                        {reader.name}
                      </p>
                      {reader.rank <= 3 && (
                        <p className="text-[10px] text-ink-muted flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 text-gold-400" />
                          Top reader
                        </p>
                      )}
                    </div>

                    {/* Points */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-bold text-sm"
                        style={{ color: reader.rank === 1 ? '#A67F2D' : '#174C38' }}
                      >
                        {reader.points.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-ink-muted">pts</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Reader of the Year */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 text-center"
          >
            <div
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full mb-4"
              style={{
                background: 'rgba(216,170,91,0.1)',
                border: '1px solid rgba(216,170,91,0.3)',
              }}
            >
              <Medal className="w-4 h-4" style={{ color: '#D8AA5B' }} />
              <span className="text-sm font-semibold" style={{ color: '#A67F2D' }}>Reader of the Year</span>
              <span className="text-xs text-ink-muted">coming soon</span>
            </div>
            <p className="text-sm text-ink-light max-w-md mx-auto leading-relaxed">
              An opportunity to celebrate remarkable reading journeys and inspire
              the next generation of readers across Ethiopia.
            </p>
            <p className="text-xs text-ink-muted mt-3 italic">
              Official competition and prizes subject to published rules and confirmed funding.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
