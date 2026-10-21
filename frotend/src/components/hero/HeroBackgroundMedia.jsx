import { motion } from 'framer-motion';

/**
 * The hero visual is kept local so the landing page still feels complete
 * when external image hosts are blocked or unavailable. A slow, restrained
 * camera drift gives the still artwork the same calm motion as a video loop.
 */
export default function HeroBackgroundMedia() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.img
        src="/images/readrise-digital-reader.svg"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[58%_center] opacity-100"
        loading="eager"
        fetchPriority="high"
        initial={{ opacity: 0, scale: 1.04 }}
        animate={{ opacity: 1, scale: [1.04, 1.08, 1.04], x: [0, -10, 0], y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.8, ease: 'easeOut' },
          scale: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
          x: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 24, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,20,14,0.88)_0%,rgba(4,20,14,0.69)_35%,rgba(4,20,14,0.26)_68%,rgba(4,20,14,0.42)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,20,14,0.15)_0%,transparent_38%,rgba(4,20,14,0.34)_100%)]" />
      <div className="absolute right-[8%] top-[17%] h-72 w-72 rounded-full bg-gold-400/20 blur-3xl" />
    </div>
  );
}
