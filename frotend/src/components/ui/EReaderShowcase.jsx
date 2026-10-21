import { motion } from 'framer-motion';

export default function EReaderShowcase({ className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
      className={`relative ${className}`}
    >
      <div className="absolute inset-10 rounded-full bg-gold-400/20 blur-3xl" aria-hidden="true" />
      <motion.img
        src="/images/readrise-digital-reader.svg"
        alt="An illustration of the ReadRise digital reading experience"
        className="relative w-full rounded-3xl border border-sage-200/80 shadow-2xl"
        animate={{ y: [0, -12, 0], rotate: [-0.7, 0.7, -0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
