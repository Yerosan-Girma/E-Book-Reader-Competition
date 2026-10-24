import { Users, ArrowRight } from 'lucide-react';
import community from '../../assets/community.jpg';
import { Reveal } from '../ui/primitives';

export default function CommunitySection() {
  return (
    <section id="community" className="relative flex min-h-[80vh] items-center overflow-hidden bg-forest-deep">
      <img src={community} alt="Readers sharing books together outdoors in Addis Ababa" loading="lazy" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest-deep/20" />
      <div className="relative mx-auto w-full max-w-7xl px-5 py-28 md:px-8">
        <Reveal className="max-w-xl">
          <Users className="h-8 w-8 text-gold" strokeWidth={1.4} />
          <h2 className="mt-6 text-4xl leading-[1.05] text-cream md:text-6xl">A Community United by Stories</h2>
          <p className="mt-6 text-lg text-cream/75">Discover new perspectives, celebrate reading progress, and connect with people who share your love of books.</p>
          <a href="#start" className="mt-10 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-7 py-4 font-semibold text-forest-deep transition-transform hover:scale-[1.03]">Join the Community <ArrowRight className="h-4 w-4" /></a>
        </Reveal>
      </div>
    </section>
  );
}
