import { motion } from 'framer-motion';

const sources = {
  library: '/images/readrise-digital-library.svg',
  reader: '/images/readrise-digital-reader.svg',
  community: '/images/readrise-digital-community.svg',
};

export default function LandingBackdrop({ variant = 'library', dark = false }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.img
        src={sources[variant] || sources.library}
        alt=""
        className={`h-full w-full object-cover ${dark ? 'opacity-60' : 'opacity-42'}`}
        animate={{ scale: [1.02, 1.06, 1.02], x: [0, -10, 0], y: [0, -6, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: dark
            ? 'linear-gradient(90deg, rgba(4,20,14,0.76), rgba(4,20,14,0.42), rgba(4,20,14,0.7))'
            : 'linear-gradient(90deg, rgba(255,252,246,0.63), rgba(255,252,246,0.25), rgba(255,252,246,0.6))',
        }}
      />
    </div>
  );
}
