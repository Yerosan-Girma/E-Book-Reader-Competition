import { motion } from 'framer-motion';
import { useMemo } from 'react';

const seededRandom = (seed) => {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
};

export default function AmbientBackground() {
  const particles = useMemo(() =>
    [...Array(20)].map((_, i) => ({
      id: i,
      width:  seededRandom(i) * 5 + 2,
      height: seededRandom(i + 100) * 5 + 2,
      left:   seededRandom(i + 200) * 100,
      top:    seededRandom(i + 300) * 100,
      isGold: i % 3 === 0,
      opacity: seededRandom(i + 350) * 0.4 + 0.2,
      animDelay:    seededRandom(i + 400) * 8,
      animDuration: 16 + seededRandom(i + 500) * 12,
    })),
    []
  );

  const specks = useMemo(() =>
    [...Array(14)].map((_, i) => ({
      id: i,
      left:     15 + seededRandom(i + 600) * 70,
      top:      10 + seededRandom(i + 700) * 80,
      size:     seededRandom(i + 750) * 3 + 1.5,
      duration: 3 + seededRandom(i + 800) * 4,
      delay:    seededRandom(i + 900) * 3,
    })),
    []
  );

  const floatingShapes = useMemo(() =>
    [...Array(5)].map((_, i) => ({
      id: i,
      width:    seededRandom(i + 1000) * 80 + 40,
      height:   seededRandom(i + 1100) * 120 + 60,
      left:     seededRandom(i + 1200) * 80 + 5,
      top:      seededRandom(i + 1300) * 80 + 5,
      rotate:   seededRandom(i + 1400) * 60 - 30,
      duration: 20 + seededRandom(i + 1500) * 15,
      delay:    seededRandom(i + 1600) * 5,
    })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">

      {/* Aurora layer 1 — large gold blob top-right */}
      <motion.div
        className="absolute -top-32 -right-32 w-[700px] h-[700px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(216,170,91,0.18) 0%, rgba(216,170,91,0.06) 40%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        animate={{
          scale:   [1, 1.12, 1.04, 1],
          x:       [0, 30, -10, 0],
          y:       [0, -20, 10, 0],
          opacity: [0.35, 0.5, 0.4, 0.35],
        }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Aurora layer 2 — sage blob bottom-left */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(44,112,84,0.2) 0%, rgba(44,112,84,0.07) 45%, transparent 70%)',
          filter: 'blur(90px)',
        }}
        animate={{
          scale:   [1, 1.18, 1.08, 1],
          x:       [0, -20, 15, 0],
          y:       [0, 25, -15, 0],
          opacity: [0.28, 0.42, 0.32, 0.28],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />

      {/* Aurora layer 3 — center atmospheric glow */}
      <motion.div
        className="absolute top-1/3 left-1/3 w-[500px] h-[400px]"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(23,76,56,0.12) 0%, transparent 65%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale:   [1, 1.15, 0.95, 1],
          opacity: [0.2, 0.35, 0.22, 0.2],
          x:       [0, 40, -20, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />

      {/* Floating paper-like rectangular shapes */}
      {floatingShapes.map((s) => (
        <motion.div
          key={s.id}
          className="absolute"
          style={{
            width:  s.width,
            height: s.height,
            left:   `${s.left}%`,
            top:    `${s.top}%`,
            rotate: `${s.rotate}deg`,
            background: s.id % 2 === 0
              ? 'rgba(255, 252, 246, 0.04)'
              : 'rgba(216, 170, 91, 0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '4px',
            backdropFilter: 'blur(2px)',
          }}
          animate={{
            y:       [0, -25, 8, 0],
            rotate:  [`${s.rotate}deg`, `${s.rotate + 6}deg`, `${s.rotate - 3}deg`, `${s.rotate}deg`],
            opacity: [0.3, 0.55, 0.35, 0.3],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width:  p.width,
            height: p.height,
            left:   `${p.left}%`,
            top:    `${p.top}%`,
            background: p.isGold
              ? `rgba(216, 170, 91, ${p.opacity})`
              : `rgba(44, 112, 84, ${p.opacity * 0.8})`,
            filter: 'blur(0.5px)',
          }}
          animate={{
            x:       [0, seededRandom(p.id + 2000) * 30 - 15, 0],
            y:       [0, -(seededRandom(p.id + 2100) * 40 + 10), 0],
            opacity: [p.opacity * 0.5, p.opacity, p.opacity * 0.6, p.opacity * 0.5],
          }}
          transition={{
            duration: p.animDuration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: p.animDelay,
          }}
        />
      ))}

      {/* Floating light specks */}
      {specks.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            width:  s.size,
            height: s.size,
            left:   `${s.left}%`,
            top:    `${s.top}%`,
            background: 'rgba(255, 255, 255, 0.75)',
            filter: 'blur(0.5px)',
            boxShadow: '0 0 4px rgba(255,255,255,0.4)',
          }}
          animate={{
            y:       [0, -40, 0],
            opacity: [0.2, 0.7, 0.2],
            scale:   [1, 1.3, 1],
          }}
          transition={{
            duration: s.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: s.delay,
          }}
        />
      ))}

      {/* Subtle paper grain */}
      <div className="grain-overlay" />

      {/* Radial vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,16,12,0.35) 100%)',
        }}
      />
    </div>
  );
}
