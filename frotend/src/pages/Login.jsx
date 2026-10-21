import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import AuthSidePanel from '../components/auth/AuthSidePanel';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.2, 0.8, 0.2, 1],
    },
  },
};

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      nav(loc.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      <Navbar />

      <main
        id="main-content"
        className="flex-1 flex flex-col lg:flex-row min-h-screen"
      >
        {/* Left decorative panel (split layout on desktop) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 sticky top-0 h-screen overflow-hidden">
          <AuthSidePanel
            badgeText="Daily Reading Ritual"
            quote="A reader lives a thousand lives before he dies. The man who never reads lives only one."
            author="George R.R. Martin"
            authorRole="A Dance with Dragons"
            initials="GR"
          />
        </div>

        {/* Right side with login form */}
        <div className="w-full lg:w-1/2 xl:w-7/12 flex-1 flex flex-col justify-center items-center px-6 sm:px-10 py-20 pt-28 sm:pt-32 lg:pt-24 relative overflow-hidden bg-cream-50 min-h-screen lg:min-h-0">
          {/* Subtle ambient blobs behind the card */}
          <div className="bg-blobs" aria-hidden="true" />
          <div
            className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(216, 170, 91, 0.18) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />
          <div
            className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(44, 112, 84, 0.12) 0%, transparent 65%)',
              filter: 'blur(50px)',
            }}
          />

          {/* Mobile branding header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 z-10">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-forest-500 to-forest-700 text-cream-50 flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5 text-cream-50" strokeWidth={2.2} />
            </div>
            <span className="font-display text-2xl font-bold text-forest-800 tracking-tight">
              ReadRise
            </span>
          </div>

          {/* Glassmorphic Form Card with Framer Motion Staggered Entrance */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative w-full max-w-md bg-white/70 backdrop-blur-xl border border-cream-200/80 shadow-xl rounded-3xl p-8 sm:p-10 z-10"
          >
            {/* 1. Icon badge */}
            <motion.div variants={itemVariants}>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-forest-500 to-forest-700 text-white flex items-center justify-center shadow-lg shadow-forest-900/20 ring-4 ring-forest-500/10">
                <LogIn className="w-6 h-6 text-cream-50" strokeWidth={2.2} />
              </div>
            </motion.div>

            {/* 2. Heading & Eyebrow */}
            <motion.div variants={itemVariants} className="mt-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-forest-500/10 text-forest-600 text-xs font-semibold tracking-wide mb-2">
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
                <span>Member Access</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-forest-800 tracking-tight">
                Welcome back
              </h1>
            </motion.div>

            {/* 3. Description */}
            <motion.p
              variants={itemVariants}
              className="text-sm text-forest-700/70 mt-1.5 leading-relaxed"
            >
              Continue your reading journey where you left off.
            </motion.p>

            {/* 4. Error state with AnimatePresence fade-in */}
            <AnimatePresence>
              {error && (
                <motion.div
                  role="alert"
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -8, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="mt-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm px-4 py-3 flex items-start gap-2.5 shadow-xs overflow-hidden"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
                  <span className="flex-1 font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={onSubmit} className="mt-6">
              {/* 5. Email field */}
              <motion.div variants={itemVariants}>
                <label htmlFor="login-email" className="label">
                  Email address
                </label>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </motion.div>

              {/* 6. Password field */}
              <motion.div variants={itemVariants} className="mt-4">
                <label htmlFor="login-password" className="label">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </motion.div>

              {/* 7. Submit button */}
              <motion.div variants={itemVariants} className="mt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full group py-3 text-base flex items-center justify-center gap-2 shadow-md shadow-forest-900/20"
                >
                  <span>{submitting ? 'Signing in…' : 'Sign in'}</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </motion.div>

              {/* 8. Link to create account */}
              <motion.p
                variants={itemVariants}
                className="mt-6 text-center text-sm text-forest-700/70"
              >
                New here?{' '}
                <Link
                  to="/register"
                  className="text-gold-500 font-semibold hover:text-gold-600 hover:underline transition-colors"
                >
                  Create account
                </Link>
              </motion.p>
            </form>
          </motion.div>
        </div>
      </main>
    </div>
  );
}