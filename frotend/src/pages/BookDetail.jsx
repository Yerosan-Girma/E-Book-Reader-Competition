import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Clock,
  Languages,
  ArrowRight,
  ArrowLeft,
  Loader2,
  FileText,
  Download,
  Bookmark,
  BookmarkCheck,
  HardDrive,
  ShieldCheck,
  Share2,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import { BookCover } from '../components/ui/BookCover';
import ChapaPaymentModal from '../components/payment/ChapaPaymentModal';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getBook } from '../data/readrise-data';
import {
  detectMaterialFormat,
  formatFileSize,
  estimateReadingTime,
  getMaterialLengthLabel,
} from '../lib/materialUtils';
import {
  checkBookAccess,
  downloadSecureBook,
  verifyChapaPayment,
} from '../lib/downloadService';

export default function BookDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const fallback = getBook(id);
  const numericId = fallback?.id || (isNaN(Number(id)) ? null : Number(id));

  const [book, setBook] = useState(() => fallback || null);
  const [chapters, setChapters] = useState(() => fallback?.chapters || []);
  const [loading, setLoading] = useState(() => !fallback);
  const [isSaved, setIsSaved] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(() =>
    !numericId && !fallback ? 'The requested book or document could not be found.' : null
  );

  useEffect(() => {
    const tx = searchParams.get('tx_ref');
    const payment = searchParams.get('payment');
    if (payment === 'success' && tx) {
      verifyChapaPayment(tx)
        .then((res) => {
          if (res.success) {
            setHasAccess(true);
            toast.success('Chapa payment verified! Download access unlocked.');
          }
        })
        .catch(() => {});
    }
  }, [searchParams]);

  useEffect(() => {
    if (!numericId || !user) {
      setHasAccess(false);
      return;
    }
    setCheckingAccess(true);
    checkBookAccess(numericId)
      .then((data) => {
        setHasAccess(Boolean(data.hasAccess));
      })
      .catch(() => setHasAccess(false))
      .finally(() => setCheckingAccess(false));
  }, [numericId, user]);

  useEffect(() => {
    let cancelled = false;
    if (!numericId) return;

    Promise.all([
      api.get(`/books/${numericId}`).then(({ data }) => data).catch(() => null),
      api.get(`/books/${numericId}/chapters`).then(({ data }) => data).catch(() => null),
    ]).then(([liveBook, liveChapters]) => {
      if (cancelled) return;
      if (liveBook) {
        setBook((prev) => ({ ...(prev || fallback), ...liveBook }));
      } else if (!fallback) {
        setError('Failed to load material details.');
      }
      if (Array.isArray(liveChapters) && liveChapters.length > 0) {
        setChapters(liveChapters);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [numericId]); // eslint-disable-line

  const format = detectMaterialFormat(book);
  const lengthLabel = getMaterialLengthLabel(book);
  const fileSizeLabel = formatFileSize(book?.file_size);
  const readTimeLabel = estimateReadingTime(book);
  const categoryName = book?.category || (Array.isArray(book?.categories) ? book.categories[0] : null);

  const handleDownload = async () => {
    if (!user) {
      toast.error('Please log in first to download or purchase books.');
      nav('/login');
      return;
    }
    if (!hasAccess) {
      setIsPaymentModalOpen(true);
      return;
    }
    try {
      setDownloading(true);
      await downloadSecureBook(book.id, book.title);
      toast.success(`"${book.title}" downloaded successfully!`);
    } catch (err) {
      if (err.paymentRequired) {
        setHasAccess(false);
        setIsPaymentModalOpen(true);
      } else {
        toast.error(err.message || 'Download failed');
      }
    } finally {
      setDownloading(false);
    }
  };

  const startReading = () => {
    const bookId = book?.id || id;
    if (chapters.length > 0) {
      const first = chapters[0]?.id;
      nav(first ? `/read/${bookId}?chapter=${first}` : `/read/${bookId}`);
    } else {
      nav(`/read/${bookId}`);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const toggleBookmark = () => {
    setIsSaved(!isSaved);
    if (!isSaved) {
      toast.success(`Saved "${book?.title}" to your reading list`);
    } else {
      toast(`Removed "${book?.title}" from your reading list`);
    }
  };

  if (!book && loading) {
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
            Loading book & document details…
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!book && !loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-36 pb-32 flex flex-col items-center justify-center text-center px-6">
          <BookOpen className="w-14 h-14 text-forest-400/60 mb-4" />
          <h1 className="font-display text-3xl text-ink mb-2">Material Not Found</h1>
          <p className="text-sm text-ink-light max-w-md mb-8">
            {error || "We couldn't find the requested book or document in the library."}
          </p>
          <div className="flex gap-4">
            <Link to="/" className="btn btn-primary px-6 py-2.5">
              Go to Home
            </Link>
            <Link to="/explore" className="btn btn-outline px-6 py-2.5">
              Explore Library
            </Link>
          </div>
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
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
    },
  };

  const downloadUrl = book?.file_url
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/books/${book.id}/file`
    : null;

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between relative overflow-x-hidden">
      {/* Ambient background glows */}
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

      <Navbar />

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-24 sm:pt-28 md:pt-36 pb-20 flex-1 w-full relative z-10">
        {/* Back Link */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-ink-light hover:text-forest-400 transition-colors mb-8 group cursor-pointer"
          aria-label="Back to previous page"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
          <span>Back to library</span>
        </motion.button>

        {/* ── Scribd Two-Column Document Overview ── */}
        <div className="grid md:grid-cols-[300px_1fr] lg:grid-cols-[340px_1fr] gap-8 md:gap-12 lg:gap-16 items-start">
          {/* Left Column: High-Fidelity Tactile Cover & Technical Specs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
            className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-full mx-auto"
          >
            {/* Ambient Halo behind cover */}
            <div className="relative">
              <div className="book-glow" aria-hidden="true" />
              <div className="relative transition-transform duration-300 hover:scale-[1.01]">
                <BookCover book={book} tilt={false} showBadge={true} aspectRatio="aspect-[1/1.42]" />
              </div>
            </div>

            {/* Scribd Document Technical Specs Card */}
            <div className="mt-6 bg-white rounded-2xl p-5 border border-cream-200/90 shadow-xs space-y-3.5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-cream-200/70">
                <span className="text-ink-muted">Format</span>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold uppercase ${format.badgeClass}`}>
                  <FileText className="w-2.5 h-2.5" />
                  {format.label}
                </span>
              </div>

              {fileSizeLabel && (
                <div className="flex items-center justify-between pb-3 border-b border-cream-200/70">
                  <span className="text-ink-muted">File Size</span>
                  <span className="font-semibold text-ink flex items-center gap-1">
                    <HardDrive className="w-3 h-3 text-forest-500" />
                    {fileSizeLabel}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pb-3 border-b border-cream-200/70">
                <span className="text-ink-muted">Length</span>
                <span className="font-semibold text-ink">{lengthLabel}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-cream-200/70">
                <span className="text-ink-muted">Language</span>
                <span className="font-semibold text-ink">{book.language || 'English'}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-cream-200/70">
                <span className="text-ink-muted">Reading Access</span>
                <span className="font-semibold text-forest-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Free Online
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Download Access</span>
                {hasAccess ? (
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="font-semibold text-amber-600 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5 text-amber-500" />
                    50 ETB (Chapa)
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Title, Author, CTAs, Summary, Chapters */}
          <motion.div
            variants={detailsContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            {/* Format & Category Badges */}
            <motion.div variants={detailItemVariants} className="flex items-center gap-2.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${format.badgeClass}`}>
                <FileText className="w-3 h-3" />
                {format.label} Document
              </span>

              {categoryName && (
                <span className="chip chip-forest text-xs font-medium">
                  {categoryName}
                </span>
              )}

              {book.language && (
                <span className="chip chip-gold text-xs font-semibold uppercase tracking-wider">
                  <Languages className="w-3.5 h-3.5" />
                  {book.language}
                </span>
              )}
            </motion.div>

            {/* Document Title */}
            <motion.h1
              variants={detailItemVariants}
              className="mt-3.5 font-display text-3xl sm:text-4xl lg:text-5xl text-ink font-semibold leading-[1.14] tracking-tight"
            >
              {book.title}
            </motion.h1>

            {/* Author */}
            <motion.p
              variants={detailItemVariants}
              className="text-ink-light text-base sm:text-lg mt-2.5 font-medium"
            >
              by <span className="text-forest-400 font-semibold">{book.author || 'Unknown'}</span>
            </motion.p>

            {/* Key Metric Chips Row */}
            <motion.div
              variants={detailItemVariants}
              className="mt-5 flex flex-wrap items-center gap-3"
            >
              <div className="chip bg-white border border-cream-200 py-2 px-3.5 shadow-xs text-ink gap-2 text-xs sm:text-sm">
                <BookOpen className="w-4 h-4 text-forest-400 shrink-0" />
                <span><strong>{lengthLabel}</strong></span>
              </div>

              <div className="chip bg-white border border-cream-200 py-2 px-3.5 shadow-xs text-ink gap-2 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-gold-500 shrink-0" />
                <span>{readTimeLabel}</span>
              </div>

              {fileSizeLabel && (
                <div className="chip bg-white border border-cream-200 py-2 px-3.5 shadow-xs text-ink gap-2 text-xs sm:text-sm">
                  <HardDrive className="w-4 h-4 text-blue-500 shrink-0" />
                  <span>{fileSizeLabel}</span>
                </div>
              )}
            </motion.div>

            {/* Primary Action Buttons */}
            <motion.div variants={detailItemVariants} className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                onClick={startReading}
                className="btn btn-primary text-base px-8 py-3.5 shadow-md hover:shadow-gold flex items-center gap-3 group transition-all duration-300"
              >
                <span>Read Online Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-200" />
              </button>

              {book?.file_url && (
                hasAccess ? (
                  <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className="btn btn-outline-dark text-base px-6 py-3.5 flex items-center gap-2.5 transition-all duration-300"
                  >
                    {downloading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-forest-600" />
                    ) : (
                      <Download className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>Download Book</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDownload}
                    className="btn btn-outline-dark text-base px-6 py-3.5 flex items-center gap-2.5 transition-all duration-300 border-gold-500/70 hover:bg-gold-50/50 group"
                    title="Pay 50 ETB via Chapa to download this book"
                  >
                    <Lock className="w-4 h-4 text-gold-600 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-ink">Download (50 ETB)</span>
                  </button>
                )
              )}

              <button
                onClick={toggleBookmark}
                aria-label="Bookmark"
                className={`p-3.5 rounded-full border transition-all duration-200 ${
                  isSaved
                    ? 'bg-gold-500 text-cream-50 border-gold-500 shadow-xs'
                    : 'bg-white border-cream-200 text-ink-muted hover:text-ink hover:border-forest-300'
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-5 h-5 fill-current" /> : <Bookmark className="w-5 h-5" />}
              </button>

              <button
                onClick={handleShare}
                aria-label="Share material"
                className="p-3.5 rounded-full border bg-white border-cream-200 text-ink-muted hover:text-ink hover:border-forest-300 transition-all shadow-xs"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Description / Overview Section */}
            {book.description && (
              <motion.div variants={detailItemVariants} className="mt-10">
                <div className="section-divider mb-4" />
                <h2 className="text-xs font-bold uppercase tracking-widest text-ink-muted mb-3">
                  Document Overview & Summary
                </h2>
                <p className="text-ink-light font-reader leading-relaxed text-base sm:text-lg max-w-2xl whitespace-pre-line">
                  {book.description}
                </p>
              </motion.div>
            )}

            {/* Table of Contents / Chapters */}
            {chapters.length > 0 && (
              <motion.div variants={detailItemVariants} className="mt-12">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-display text-2xl text-ink font-semibold">Table of Contents</h2>
                    <p className="text-xs text-ink-muted mt-0.5">
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
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                    >
                      <Link
                        to={`/read/${book.id}?chapter=${ch.id}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-cream-100/60 transition-colors duration-200 group text-sm"
                      >
                        <span className="flex items-center gap-3.5 text-ink group-hover:text-forest-400 font-medium transition-colors min-w-0">
                          <span className="text-gold-600 font-bold tabular-nums text-xs px-2.5 py-1 rounded-md bg-gold-400/15 border border-gold-400/25 group-hover:bg-gold-400/25 transition-colors shrink-0">
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

      {book && (
        <ChapaPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          book={book}
          onSuccess={() => {
            setHasAccess(true);
            setIsPaymentModalOpen(false);
          }}
        />
      )}

      <Footer />
    </div>
  );
}
