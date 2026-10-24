import { Compass, BookOpenText, Sprout, Trophy } from 'lucide-react';
import { Reveal, SectionHeading } from '../ui/primitives';

const steps = [
  { n: '01', t: 'Discover', d: 'Find books that inspire your curiosity.', I: Compass },
  { n: '02', t: 'Read', d: 'Enjoy books and record your reading sessions.', I: BookOpenText },
  { n: '03', t: 'Grow', d: 'Build streaks, reach reading goals, and join challenges.', I: Sprout },
  { n: '04', t: 'Celebrate', d: 'Track achievements and share your reading milestones.', I: Trophy },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative bg-cream py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><SectionHeading eyebrow="How ReadRise works" title="Turn Every Page Into Progress" subtitle="A simple way to discover books, build consistency, and celebrate how far you have come." /></Reveal>
        <div className="relative mt-20 grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div aria-hidden className="absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-gold to-transparent lg:block" />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120} className="relative">
              <div className="relative grid h-20 w-20 place-items-center rounded-full border border-gold/40 bg-cream shadow-card transition-transform duration-500 hover:-translate-y-1">
                <s.I className="h-7 w-7 text-forest" strokeWidth={1.5} />
              </div>
              <p className="mt-8 font-display text-6xl text-gold/40">{s.n}</p>
              <h3 className="mt-2 text-3xl text-forest-deep">{s.t}</h3>
              <p className="mt-3 max-w-xs text-muted-foreground">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
