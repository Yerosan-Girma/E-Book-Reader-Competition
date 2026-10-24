import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { books } from '../../data/readrise-data';
import { BookCover } from '../ui/BookCover';
import { Reveal, Particles } from '../ui/primitives';

export default function FinalCTA({ id = 'start' }) {
  const leftBook = books?.[1] || books?.[0] || null;
  const rightBook = books?.[2] || books?.[0] || null;

  return (
    <section id={id} className="relative overflow-hidden bg-forest-gradient py-36 md:py-48">
      <Particles count={20} />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/15 blur-3xl" />
      {leftBook && (
        <div aria-hidden className="absolute left-[6%] top-20 hidden w-28 animate-float text-[10px] md:block" style={{ ['--r']: '-12deg' }}>
          <BookCover book={leftBook} />
        </div>
      )}
      {rightBook && (
        <div aria-hidden className="absolute bottom-16 right-[8%] hidden w-32 animate-float text-[11px] md:block" style={{ ['--r']: '10deg', animationDelay: '2s' }}>
          <BookCover book={rightBook} />
        </div>
      )}
      <Reveal className="relative mx-auto max-w-3xl px-5 text-center">
        <p className="eyebrow text-gold">Begin today</p>
        <h2 className="mt-6 text-5xl leading-[1.02] text-cream md:text-7xl">Every Great Journey Begins with a <em className="text-gold-soft">Page.</em></h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-cream/70">Make reading part of your everyday life with ReadRise.</p>
        <Link to="/register" className="mt-12 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-9 py-5 text-lg font-semibold text-forest-deep shadow-glow transition-transform hover:scale-[1.03]">Begin Your Reading Journey <ArrowRight className="h-5 w-5" /></Link>
      </Reveal>
    </section>
  );
}
