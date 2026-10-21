import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { Link } from 'react-router-dom';

export default function StaticPlaceholder({ title, description }) {
  return (
    <div className="min-h-screen bg-cream-50">
      <Navbar />
      <main className="pt-28 pb-20 max-w-xl mx-auto px-6 text-center">
        <h1 className="font-display text-3xl text-ink mb-4">{title}</h1>
        <p className="text-ink-light leading-relaxed mb-8">
          {description || 'This page is coming soon. Check back as ReadRise grows.'}
        </p>
        <Link to="/" className="btn btn-outline-dark inline-flex">
          Back to home
        </Link>
      </main>
      <Footer />
    </div>
  );
}
