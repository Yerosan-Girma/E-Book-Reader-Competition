import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Languages, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BookDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);

  useEffect(() => {
    api.get(`/books/${id}`).then(({ data }) => setBook(data)).catch(() => {});
    api.get(`/books/${id}/chapters`).then(({ data }) => setChapters(data)).catch(() => {});
  }, [id]);

  const startReading = () => {
    if (!user) return nav('/login');
    const first = chapters[0]?.id;
    nav(first ? `/read/${book.id}?chapter=${first}` : `/read/${book.id}`);
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-36 pb-32 flex flex-col items-center justify-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-forest-400/15 animate-ping absolute" />
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-cream-200/80 flex items-center justify-center relative z-10">
              <Loader2 className="w-6 h-6 text-forest-400 animate-spin" />
            </div>
          </div>
          <p className="text-sm font-medium text-ink-light animate-pulse mt-1">
            Loading book details…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  const detailsContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.12,
      },
    },
  };

  const detailItemVariants = {
    hidden: { opacity: 0, x: 25 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
    },
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient background with soft gradient blobs (forest and gold, blurred) */}
      <div
        className="absolute top-20 right-[-100px] w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(216, 170, 91, 0.15) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute top-1/2 left-[-120px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(23, 76, 56, 0.1) 0%, transparent 70%)',
          filter: 'blur(100px)',
        }}
        aria-hidden="true"
      />
      <div className="grain-overlay" aria-hidden="true" />

      {/* Navigation */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-28 md:pt-36 pb-20 flex-1 w-full relative z-10">
        {/* Animated back button with ArrowLeft */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-light hover:text-forest-400 transition-colors mb-10 group"
          aria-label="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to library</span>
        </motion.button>

        {/* Two-column layout: left = 3D book cover with book-glow behind it, right = details */}
        <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr] gap-12 lg:gap-16 items-start">
          {/* Left Column: 3D Book Cover with book-glow */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="mx-auto md:mx-0 w-full max-w-[280px] md:max-w-full relative"
          >
            {/* book-glow halo */}
            <div className="book-glow" aria-hidden="true" />

            <div className="book-3d">
              <div className="book-3d-inner relative aspect-[3/4] w-full">
                <div className="book-spine" aria-hidden="true" />
                <div className="book-pages" aria-hidden="true" />
                <div
                  className={`book-cover-img w-full h-full bg-gradient-to-br ${
                    book.coverGradient || 'from-forest-600 via-forest-700 to-forest-900'
                  } relative flex flex-col justify-between p-6 sm:p-7 overflow-hidden text-cream-50`}
                >
                  <div className="book-cover-sheen" aria-hidden="true" />

                  {book.cover_url ? (
                    <>
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                      <div
                        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-1"
                        aria-hidden="true"
                      />
                      <div className="relative z-2 flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <p className="text-cream-50/70 text-[10px] uppercase tracking-[0.25em] font-semibold">
                            ReadRise
                          </p>
                          <BookOpen className="w-4 h-4 text-gold-400/80" />
                        </div>
                        <div>
                          <div className="w-10 h-0.5 bg-gold-400 mb-3" />
                          <h2 className="font-display text-2xl md:text-3xl leading-tight text-cream-50 drop-shadow-md">
                            {book.title}
                          </h2>
                          <p className="text-xs text-cream-50/70 mt-2 font-medium">by {book.author}</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="relative z-2 flex flex-col justify-between h-full">
                      <div className="flex items-center justify-between">
                        <p className="text-cream-50/60 text-[10px] uppercase tracking-[0.25em] font-semibold">
                          ReadRise
                        </p>
                        <BookOpen className="w-6 h-6 text-gold-400" />
                      </div>
                      <div>
                        <div className="w-10 h-0.5 bg-gradient-to-r from-gold-400 to-gold-300 mb-3" />
                        <h2 className="font-display text-2xl md:text-3xl leading-tight text-cream-50">
                          {book.title}
                        </h2>
                        <p className="text-xs text-cream-50/70 mt-2 font-medium">by {book.author}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Details entrance from right with stagger */}
          <motion.div
            variants={detailsContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* 1. Language and Category badge */}
            <motion.div variants={detailItemVariants} className="flex items-center gap-2.5 flex-wrap">
              {book.language && (
                <span className="chip chip-gold text-xs font-semibold uppercase tracking-wider">
                  <Languages className="w-3.5 h-3.5" />
                  {book.language}
                </span>
              )}
              {book.category && (
                <span className="chip chip-forest text-xs font-medium">
                  {book.category}
                </span>
              )}
            </motion.div>

            {/* 2. Title */}
            <motion.h1
              variants={detailItemVariants}
              className="mt-3 font-display text-3xl sm:text-4xl lg:text-5xl text-ink font-semibold leading-[1.14] tracking-tight"
            >
              {book.title}
            </motion.h1>

            {/* 3. Author */}
            <motion.p
              variants={detailItemVariants}
              className="text-ink-light text-base sm:text-lg mt-2.5 font-medium"
            >
              by <span className="text-forest-400 font-semibold">{book.author}</span>
            </motion.p>

            {/* 4. Metadata chips row: chapters count, language, self-paced */}
            <motion.div
              variants={detailItemVariants}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <div className="chip bg-white border border-cream-200 py-2 px-3.5 shadow-xs text-ink gap-2">
                <BookOpen className="w-4 h-4 text-forest-400 shrink-0" />
                <span className="text-sm font-medium">
                  <strong className="text-ink font-semibold">{book.total_chapters || chapters.length}</strong> chapters
                </span>
              </div>

              <div className="chip bg-white border border-cream-200 py-2 px-3.5 shadow-xs text-ink gap-2">
                <Languages className="w-4 h-4 text-forest-400 shrink-0" />
                <span className="text-sm font-medium">{book.language || 'English'}</span>
              </div>

              <div className="chip bg-white border border-cream-200 py-2 px-3.5 shadow-xs text-ink gap-2">
                <Clock className="w-4 h-4 text-forest-400 shrink-0" />
                <span className="text-sm font-medium">Self-paced</span>
              </div>
            </motion.div>

            {/* 5. Description with section-divider above */}
            {book.description && (
              <motion.div variants={detailItemVariants} className="mt-8">
                <div className="section-divider" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">
                  Overview
                </h2>
                <p className="text-ink-light font-reader leading-relaxed text-base sm:text-lg max-w-2xl">
                  {book.description}
                </p>
              </motion.div>
            )}

            {/* 6. CTA: btn btn-primary with golden shadow on hover */}
            <motion.div variants={detailItemVariants} className="mt-8">
              <button
                onClick={startReading}
                className="btn btn-primary text-base px-8 py-3.5 shadow-md hover:shadow-gold flex items-center gap-3 group transition-all duration-300"
              >
                <span>Start Reading</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>
            </motion.div>

            {/* 7. Chapters list: numbered with leading zeros, hover highlight, gold accent on number, animated stagger entrance */}
            {chapters.length > 0 && (
              <motion.div variants={detailItemVariants} className="mt-14">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl text-ink font-semibold">Table of Contents</h2>
                    <p className="text-xs text-ink-muted mt-1">
                      Select a chapter to jump straight into reading
                    </p>
                  </div>
                  <span className="chip chip-forest text-xs font-semibold">
                    {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                </div>

                <div className="divide-y divide-cream-200 rounded-2xl border border-cream-200 bg-white shadow-sm overflow-hidden">
                  {chapters.map((ch, idx) => (
                    <motion.div
                      key={ch.id}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: idx * 0.04 }}
                    >
                      <Link
                        to={`/read/${book.id}?chapter=${ch.id}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-cream-100/60 transition-colors duration-200 group text-sm"
                      >
                        <span className="flex items-center gap-3.5 text-ink group-hover:text-forest-400 font-medium transition-colors min-w-0">
                          <span className="text-gold-500 font-bold tabular-nums text-xs px-2.5 py-1 rounded-md bg-gold-400/10 border border-gold-400/20 group-hover:bg-gold-400/20 transition-colors shrink-0">
                            {String(ch.chapter_number).padStart(2, '0')}
                          </span>
                          <span className="truncate">{ch.title}</span>
                        </span>

                        <div className="flex items-center gap-3 shrink-0 ml-4">
                          {ch.word_count ? (
                            <span className="text-ink-muted text-xs tabular-nums">
                              {ch.word_count.toLocaleString()} words
                            </span>
                          ) : null}
                          <ArrowRight className="w-4 h-4 text-ink-muted/40 group-hover:text-forest-400 group-hover:translate-x-1 transition-all duration-200" />
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}