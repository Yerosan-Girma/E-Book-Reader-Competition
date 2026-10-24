import { Clock, LineChart, Award } from 'lucide-react';
import library from '../../assets/library.jpg';
import { Reveal, SectionHeading, Particles } from '../ui/primitives';

export default function ReadingJourney() {
  const items = [
    { I: Clock, t: 'Build a consistent reading habit.', d: 'Short daily sessions add up to real change.' },
    { I: LineChart, t: 'See your progress over time.', d: 'Minutes, pages, and streaks — all in one view.' },
    { I: Award, t: 'Celebrate every completed milestone.', d: 'Badges that mark how far you have come.' },
  ];
  return (
    <section className="relative overflow-hidden bg-forest-deep py-32 md:py-44">
      <img src={library} alt="" loading="lazy" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep via-forest-deep/70 to-forest-deep" />
      <Particles count={14} />
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><SectionHeading light center eyebrow="The reading journey" title="Small Reading Moments. Lasting Change." subtitle="A few intentional minutes each day can help you build a reading routine that lasts." /></Reveal>
        <div className="mt-20 grid gap-px overflow-hidden rounded-2xl bg-cream/10 md:grid-cols-3">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 150} className="bg-forest-deep/80 p-10 backdrop-blur-sm transition hover:bg-forest/60">
              <it.I className="h-8 w-8 text-gold" strokeWidth={1.4} />
              <h3 className="mt-8 text-2xl text-cream">{it.t}</h3>
              <p className="mt-3 text-cream/60">{it.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
