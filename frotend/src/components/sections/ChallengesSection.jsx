import { useState } from 'react';
import { Clock, Flame, BookCheck, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Reveal, SectionHeading, ProgressBar, DemoTag } from '../ui/primitives';

const initialChallenges = [
  { id: 'daily', t: 'Daily Reader', goal: 'Read for 15 minutes.', progress: 60, status: 'In Progress', I: Clock, meta: '9 / 15 min' },
  { id: 'streak', t: 'Five-Day Streak', goal: 'Read on five days this week.', progress: 80, status: 'In Progress', I: Flame, meta: '4 / 5 days' },
  { id: 'finish', t: 'Finish a Book', goal: 'Complete a book.', progress: 100, status: 'Completed', I: BookCheck, meta: '1 / 1 book' },
  { id: 'explore', t: 'Explore Something New', goal: 'Read from a new category.', progress: 0, status: 'Available', I: Sparkles, meta: 'Science · History · Tech' },
];

export default function ChallengesSection() {
  const [items, setItems] = useState(initialChallenges);
  const join = (id) => {
    setItems((xs) => xs.map((x) => (x.id === id ? { ...x, status: 'In Progress', progress: 8, meta: 'Just started' } : x)));
    toast.success('Challenge joined', { description: 'Demo only — progress is not saved.' });
  };
  return (
    <section id="challenges" className="bg-cream py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal><SectionHeading eyebrow="Reading challenges" title="Make Reading a Daily Adventure" subtitle="Set your own pace, take on new challenges, and celebrate every milestone." /></Reveal>
          <DemoTag className="text-forest" />
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {items.map((c, i) => (
            <Reveal key={c.id} delay={i * 100}>
              <article className={`group flex h-full flex-col rounded-2xl border p-7 transition duration-500 hover:-translate-y-1 hover:shadow-card${c.status === 'Completed' ? ' border-gold/50 bg-forest-deep text-cream' : ' border-forest/10 bg-card'}`}>
                <div className="flex items-center justify-between">
                  <span className={`grid h-12 w-12 place-items-center rounded-full${c.status === 'Completed' ? ' bg-gold-gradient text-forest-deep' : ' bg-sage text-forest'}`}><c.I className="h-5 w-5" /></span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider${c.status === 'Completed' && ' bg-gold/20 text-gold-soft'}${c.status === 'In Progress' && ' bg-forest/10 text-forest'}${c.status === 'Available' && ' bg-muted text-muted-foreground'}`}>{c.status}</span>
                </div>
                <h3 className={`mt-8 text-2xl${c.status === 'Completed' ? ' text-cream' : ' text-forest-deep'}`}>{c.t}</h3>
                <p className={`mt-2 text-sm${c.status === 'Completed' ? ' text-cream/60' : ' text-muted-foreground'}`}>Goal: {c.goal}</p>
                <div className="mt-auto pt-8">
                  <div className="mb-2 flex justify-between text-xs font-medium opacity-70"><span>{c.meta}</span><span>{c.progress}%</span></div>
                  <ProgressBar value={c.progress} className={c.status === 'Completed' ? 'bg-cream/10' : undefined} />
                  {c.status === 'Available' && (
                    <button onClick={() => join(c.id)} className="mt-5 w-full rounded-full bg-forest py-2.5 text-sm font-semibold text-cream transition hover:bg-forest-soft">Join challenge</button>
                  )}
                  {c.status === 'Completed' && <p className="mt-5 flex items-center gap-2 text-sm text-gold"><Check className="h-4 w-4" /> Badge earned</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
