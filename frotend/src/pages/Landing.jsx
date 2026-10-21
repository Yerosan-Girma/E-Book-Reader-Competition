import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-3xl text-center py-24">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-display text-5xl md:text-6xl text-forest-700 leading-tight"
          >
            Every Page Takes You Further.
          </motion.h1>
          <p className="mt-6 text-lg text-forest-700/80">
            Track your reading, join challenges, earn badges, and grow your
            habit alongside thousands of readers across Ethiopia.
          </p>
          <div className="mt-10 flex justify-center gap-3">
            <Link
              to="/register"
              className="rounded-full bg-forest-600 text-cream-50 px-6 py-3 font-medium hover:bg-forest-700 transition"
            >
              Start Reading
            </Link>
            <Link
              to="/books"
              className="rounded-full border border-forest-600/20 text-forest-700 px-6 py-3 font-medium hover:border-forest-600/40 transition"
            >
              Explore Books
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-cream-200 px-6 py-6 text-center text-sm text-forest-700/70">
        © {new Date().getFullYear()} ReadRise — Read More. Grow Every Day. Get Recognized.
      </footer>
    </div>
  );
}