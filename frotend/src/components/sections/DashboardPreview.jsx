import { useState } from 'react';
import { Clock, BookCheck, Flame, Target, Award, Play } from 'lucide-react';
import { books } from '../../data/readrise-data';
import { BookCover } from '../ui/BookCover';
import { Reveal, SectionHeading, ProgressBar, DemoTag } from '../ui/primitives';

const week = { 'This week': [25, 40, 15, 55, 30, 70, 45], 'Last week': [20, 10, 35, 30, 50, 25, 40] };
const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function DashboardPreview() {
  const [range, setRange] = useState('This week');
  const data = week[range];
  const max = Math.max(...data);
  const stats = [
    { I: Clock, l: 'Total reading time', v: '42h 15m' },
    { I: BookCheck, l: 'Books completed', v: '12' },
    { I: Flame, l: 'Current streak', v: '9 days' },
    { I: Target, l: 'Daily goal', v: '20 min' },
  ];

  const currentBooks = [
    books?.[0] ? [books[0], 64] : null,
    books?.[1] ? [books[1], 22] : (books?.[0] ? [books[0], 22] : null),
  ].filter(Boolean);

  const historySessions = [
    ['Today, 7:40 PM', books?.[0]?.title || 'Doctrine Martin Luther on Baptist', '25 min'],
    ['Yesterday', books?.[1]?.title || 'How to Invest Money', '18 min'],
    ['Tue', books?.[0]?.title || 'Doctrine Martin Luther on Baptist', '32 min'],
  ];

  return (
    <section id="dashboard" className="relative overflow-hidden bg-forest-gradient py-28 md:py-36">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <Reveal><SectionHeading light eyebrow="Your dashboard" title="Your Reading Journey, Beautifully Tracked" /></Reveal>
        <Reveal delay={150} className="mt-16">
          <div className="rounded-3xl border border-cream/10 bg-cream p-4 shadow-glow md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <p className="text-sm text-muted-foreground">Good evening,</p>
                <p className="font-display text-3xl text-forest-deep">Abeba</p>
              </div>
              <DemoTag className="text-forest" />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.l} className="rounded-2xl bg-sage/50 p-5">
                  <s.I className="h-5 w-5 text-forest" />
                  <p className="mt-4 font-display text-3xl text-forest-deep">{s.v}</p>
                  <p className="text-xs text-muted-foreground">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-3">
              <div className="rounded-2xl border border-border p-6 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-forest-deep">Weekly activity <span className="text-xs font-normal text-muted-foreground">(minutes)</span></p>
                  <div className="flex rounded-full bg-muted p-1 text-xs" role="tablist">
                    {(Object.keys(week)).map((k) => (
                      <button key={k} role="tab" aria-selected={range === k} onClick={() => setRange(k)} className={`rounded-full px-3 py-1.5 font-medium transition${range === k ? ' bg-forest text-cream' : ' text-muted-foreground'}`}>{k}</button>
                    ))}
                  </div>
                </div>
                <div className="mt-8 flex h-48 items-end gap-3">
                  {data.map((v, i) => (
                    <div key={i} className="flex h-full flex-1 flex-col items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">{v}</span>
                      <div className="flex w-full flex-1 items-end"><div className={`w-full rounded-t-md transition-all duration-700${v === max ? ' bg-gold-gradient' : ' bg-forest/80'}`} style={{ height: `${(v / max) * 100}%` }} /></div>
                      <span className="text-xs text-muted-foreground">{days[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <p className="font-semibold text-forest-deep">Currently reading</p>
                <div className="mt-5 space-y-5">
                  {currentBooks.map(([b, p]) => (
                    <div key={b.id || p} className="flex gap-4">
                      <div className="w-14 shrink-0 text-[6px]"><BookCover book={b} tilt={false} /></div>
                      <div className="flex-1">
                        <p className="font-display text-lg leading-tight text-forest-deep">{b.title || 'Untitled'}</p>
                        <p className="text-xs text-muted-foreground">{b.author || 'Unknown'}</p>
                        <ProgressBar value={p} className="mt-3" />
                        <p className="mt-1 text-[11px] text-muted-foreground">{p}% complete</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border p-6">
                <p className="font-semibold text-forest-deep">Recent achievements</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  {['First Chapter', 'Week Warrior', 'Night Owl', 'Genre Explorer'].map((a, i) => (
                    <span key={a} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm${i === 0 ? ' bg-gold-gradient text-forest-deep' : ' bg-sage text-forest-deep'}`}><Award className="h-4 w-4" /> {a}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <p className="font-semibold text-forest-deep">Session history</p>
                <ul className="mt-4 divide-y divide-border text-sm">
                  {historySessions.map(([d, t, m]) => (
                    <li key={d} className="flex items-center justify-between py-3"><span className="flex items-center gap-3"><Play className="h-3.5 w-3.5 text-gold" /><span className="text-forest-deep">{t}</span></span><span className="text-muted-foreground">{d} · {m}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
