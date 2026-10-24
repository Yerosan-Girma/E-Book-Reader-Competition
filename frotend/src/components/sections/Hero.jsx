import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import hero from '../../assets/hero.jpg';
import { books } from '../../data/readrise-data';
import { BookCover } from '../ui/BookCover';
import { Particles } from '../ui/primitives';

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen items-center overflow-hidden bg-forest-deep pt-20">
      <img src={hero} alt="A woman reading an e-book on a tablet in the evening" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[70%_center] animate-kenburns" />
      <div className="absolute inset-0 bg-hero-overlay" />
      <div aria-hidden className="absolute -left-20 top-10 h-[30rem] w-[30rem] rounded-full bg-gold/20 blur-3xl animate-shimmer" />
      <Particles count={26} />

      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-24 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-gold animate-rise">Ethiopia's online reading competition</p>
          <h1 className="mt-6 text-5xl leading-[0.98] text-cream sm:text-6xl lg:text-8xl animate-rise" style={{ animationDelay: '120ms' }}>
            Your Next <em className="text-gold-soft">Chapter</em> Starts Here.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-cream/75 animate-rise" style={{ animationDelay: '260ms' }}>
            Read e-books on any device, log every session, earn points per page and climb the live leaderboard with readers across Ethiopia.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 animate-rise" style={{ animationDelay: '400ms' }}>
            <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-semibold text-forest-deep shadow-glow transition-transform hover:scale-[1.03]">
              Join the Competition <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a href="#books" className="inline-flex items-center rounded-full border border-cream/30 px-7 py-4 font-semibold text-cream transition hover:border-gold hover:text-gold">Explore Library</a>
          </div>
        </div>

        <div aria-hidden className="relative hidden h-[30rem] lg:col-span-5 lg:block">
          {books?.[0] && (
            <div className="absolute right-4 top-0 w-44 animate-float text-[15px]" style={{ ['--r']: '6deg' }}>
              <BookCover book={books[0]} />
            </div>
          )}
          {(books?.[2] || books?.[0]) && (
            <div className="absolute left-6 top-32 w-36 animate-float text-[13px]" style={{ ['--r']: '-8deg', animationDelay: '1.5s' }}>
              <BookCover book={books[2] || books[0]} />
            </div>
          )}
          {(books?.[1] || books?.[0]) && (
            <div className="absolute bottom-0 right-24 w-40 animate-float text-[14px]" style={{ ['--r']: '3deg', animationDelay: '3s' }}>
              <BookCover book={books[1] || books[0]} />
            </div>
          )}
        </div>
      </div>

      <a href="#how" className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-cream/60" aria-label="Scroll to learn more">
        <span className="eyebrow text-[10px]">Scroll</span>
        <span className="flex h-10 w-6 justify-center rounded-full border border-cream/40 pt-2"><span className="h-2 w-1 rounded-full bg-gold animate-scrolldot" /></span>
      </a>
    </section>
  );
}
