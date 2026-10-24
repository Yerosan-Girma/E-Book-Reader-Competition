import { useEffect, useRef, useState } from 'react';
import { BookOpen } from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export function useInView() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setVisible(true); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, visible };
}

export function Reveal({ children, className = '', delay = 0 }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={`reveal${visible ? ' is-visible' : ''}${className ? ' ' + className : ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 font-display text-xl font-semibold text-cream${className ? ' ' + className : ''}`}>
      <span className="grid h-8 w-8 place-items-center rounded-full bg-gold-gradient text-forest-deep">
        <BookOpen className="h-4 w-4" />
      </span>
      Read<span className="italic text-gold">Rise</span>
    </span>
  );
}

export function SectionHeading({ eyebrow, title, subtitle, light = false, center = false }) {
  return (
    <div className={`max-w-2xl${center ? ' mx-auto text-center' : ''}`}>
      {eyebrow && <p className={`eyebrow mb-4${light ? ' text-gold' : ' text-forest-soft'}`}>{eyebrow}</p>}
      <h2 className={`text-4xl leading-[1.05] md:text-5xl lg:text-6xl${light ? ' text-cream' : ' text-forest-deep'}`}>
        {title}
      </h2>
      {subtitle && <p className={`mt-5 text-lg leading-relaxed${light ? ' text-cream/70' : ' text-muted-foreground'}`}>{subtitle}</p>}
    </div>
  );
}

export function DemoTag({ className = '' }) {
  return <span className={`rounded-full border border-current/30 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest opacity-70${className ? ' ' + className : ''}`}>Demo data</span>;
}

export function Particles({ count = 18 }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`absolute rounded-full bg-gold-soft animate-drift${i % 3 === 0 ? ' hidden md:block' : ''}`}
          style={{
            left: `${(i * 53) % 100}%`,
            top: `${40 + ((i * 37) % 60)}%`,
            width: `${2 + (i % 3)}px`,
            height: `${2 + (i % 3)}px`,
            animationDuration: `${9 + (i % 7)}s`,
            animationDelay: `${(i * 0.7) % 8}s`,
          }}
        />
      ))}
    </div>
  );
}

export function ProgressBar({ value, className = '' }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={`h-1.5 w-full overflow-hidden rounded-full bg-forest/10${className ? ' ' + className : ''}`} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-gold-gradient transition-[width] duration-[1400ms] ease-out" style={{ width: visible ? `${value}%` : '0%' }} />
    </div>
  );
}
