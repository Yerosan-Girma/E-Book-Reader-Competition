import { motion } from 'framer-motion';

export default function StatCard({
  icon: Icon,
  label,
  value,
  accent = 'forest',
  hint,
  index = 0,
  delay,
}) {
  const isGold = accent === 'gold';
  const gradientClass = isGold
    ? 'from-gold-300 to-gold-500'
    : 'from-forest-400 to-forest-500';

  const animDelay = delay !== undefined ? delay : index * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: animDelay, ease: [0.2, 0.8, 0.2, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="card card-hover p-6 rounded-xl relative overflow-hidden flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-cream-50 shadow-md flex-shrink-0`}
          >
            {Icon && <Icon className="w-5 h-5 text-cream-50" strokeWidth={2.2} />}
          </div>
          {isGold ? (
            <span className="chip chip-gold text-[11px] font-semibold">Active</span>
          ) : (
            <span className="chip chip-forest text-[11px] font-semibold">Tracked</span>
          )}
        </div>

        <div>
          <div className="font-display text-3xl font-bold text-ink tracking-tight">
            {value}
          </div>
          <p className="text-sm text-ink-light font-medium mt-1">
            {label}
          </p>
        </div>
      </div>

      {hint && (
        <div className="mt-4 pt-3 border-t border-cream-200/60 text-xs text-ink-muted italic">
          {hint}
        </div>
      )}
    </motion.div>
  );
}