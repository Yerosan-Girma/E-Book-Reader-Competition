import { Crown, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Reveal, SectionHeading, DemoTag } from '../ui/primitives';

const readers = [
  { n: 'Reader Tsion', b: 18, c: 9, s: 1240 },
  { n: 'Reader Kidus', b: 15, c: 11, s: 1185 },
  { n: 'Reader Mahlet', b: 14, c: 7, s: 1020 },
  { n: 'Reader Nahom', b: 11, c: 8, s: 910 },
  { n: 'Reader Bethel', b: 9, c: 6, s: 780 },
];

export default function LeaderboardPreview() {
  return (
    <section id="leaderboard" className="bg-cream py-28 md:py-36">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><SectionHeading eyebrow="Recognition" title="Celebrate the Love of Reading" subtitle="Recognize progress, share milestones, and be inspired by fellow readers." /></Reveal>
        <div className="mt-16 grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <div className="flex items-center justify-between"><p className="font-semibold text-forest-deep">Monthly leaderboard</p><DemoTag className="text-forest" /></div>
              <ol className="mt-6 space-y-2">
                {readers.map((r, i) => (
                  <li key={r.n} className={`flex items-center gap-4 rounded-xl px-4 py-3 transition hover:bg-sage/50${i === 0 && ' bg-sage/60'}`}>
                    <span className={`w-6 font-display text-2xl${i < 3 ? ' text-gold' : ' text-muted-foreground'}`}>{i + 1}</span>
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-forest font-display text-cream">{r.n.split(' ')[1]?.[0]}</span>
                    <span className="flex-1"><span className="block font-medium text-forest-deep">{r.n}</span><span className="text-xs text-muted-foreground">{r.b} books · {r.c} challenges</span></span>
                    <span className="font-display text-xl text-forest">{r.s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">Sample scoring: 50 pts per book completed + 20 pts per challenge + 1 pt per reading minute (illustrative only).</p>
            </div>
          </Reveal>
          <Reveal delay={150} className="lg:col-span-2">
            <div className="relative h-full overflow-hidden rounded-3xl bg-forest-deep p-10 text-cream">
              <div aria-hidden className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/25 blur-3xl animate-shimmer" />
              <Crown className="relative h-10 w-10 text-gold" strokeWidth={1.3} />
              <p className="eyebrow relative mt-8 text-gold">Coming soon</p>
              <h3 className="relative mt-3 text-4xl md:text-5xl">Reader of the Year</h3>
              <p className="relative mt-5 text-cream/70">A future opportunity to celebrate dedication, consistency, and a passion for reading.</p>
              <button onClick={() => toast("We'll let you know", { description: 'Details will be shared when the program is announced.' })} className="relative mt-10 inline-flex items-center gap-2 rounded-full border border-gold/50 px-6 py-3 text-sm font-semibold text-gold transition hover:bg-gold hover:text-forest-deep">Notify me <ArrowRight className="h-4 w-4" /></button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
