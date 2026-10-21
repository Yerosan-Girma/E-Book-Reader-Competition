import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import SectionHeading from '../components/ui/SectionHeading';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="pt-28 pb-20 max-w-3xl mx-auto px-6">
        <SectionHeading
          eyebrow="About ReadRise"
          heading="Built for readers who want to grow."
          description="ReadRise is a reading platform in development — helping you discover books, build habits, and celebrate progress. This site uses sample content until the live catalog launches."
        />
        <div className="mt-10 space-y-4 text-ink-light leading-relaxed">
          <p>
            We are focused on a thoughtful reading experience for communities across Ethiopia,
            with multilingual support and regional content planned for future releases.
          </p>
          <p className="text-sm text-ink-muted italic">
            No live user metrics or testimonials are shown on this preview site.
          </p>
        </div>
        <Link to="/register" className="btn btn-primary mt-10 inline-flex">
          Start Reading
        </Link>
      </main>
      <Footer />
    </div>
  );
}
