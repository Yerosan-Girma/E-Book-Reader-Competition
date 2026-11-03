import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import loginImg from '../assets/login.jpg';
import { Logo } from '../components/ui/primitives';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register, loginWithGoogle } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const googleBtnContainerRef = useRef(null);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '585209617382-o97k5mo44b21nj2ln0rjusim6rinat0r.apps.googleusercontent.com';

  // Handle Google Sign-up Callback
  const handleGoogleCallback = async (response) => {
    try {
      setGoogleLoading(true);
      setError('');
      await loginWithGoogle({ credential: response.credential });
      nav('/dashboard', { replace: true });
    } catch (err) {
      console.error('Google register error:', err);
      setError(
        err.response?.data?.error ||
          'Google registration could not be completed. Please try again or create an account with email.'
      );
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize Google Identity Services SDK
  useEffect(() => {
    const initGoogle = () => {
      if (window.google?.accounts?.id && googleBtnContainerRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleCallback,
            auto_select: false,
          });

          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'signup_with',
            logo_alignment: 'center',
            width: 320,
          });
        } catch (e) {
          console.warn('Google button notice:', e);
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGoogle;
      document.body.appendChild(script);
    }
  }, [googleClientId]);

  // Standard Email + Password Register
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    let cleanUser = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 40);
    if (!cleanUser || cleanUser.length < 3) {
      cleanUser = 'reader_' + Math.floor(Math.random() * 10000);
    }

    try {
      await register({
        username: cleanUser,
        email: email.trim(),
        password,
        displayName: name.trim() || undefined,
      });
      nav('/dashboard', { replace: true });
    } catch (err) {
      const details = err.response?.data?.details;
      let errMsg = err.response?.data?.error || 'Registration failed. Please check your details.';
      if (details && typeof details === 'object') {
        const firstField = Object.keys(details)[0];
        if (firstField && Array.isArray(details[firstField]) && details[firstField][0]) {
          errMsg = `${details[firstField][0]}`;
        }
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-2 bg-cream-50 selection:bg-forest-200">
      {/* ── Left Showcase Banner ── */}
      <div className="relative hidden overflow-hidden bg-forest-900 lg:flex flex-col justify-between p-12 text-cream-50">
        <img
          src={loginImg}
          alt="Readers immersed in digital literature"
          width={1024}
          height={1280}
          className="absolute inset-0 h-full w-full object-cover opacity-35 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-900/80 to-forest-800/60" />

        <div className="relative z-10">
          <Link to="/" className="inline-block hover:opacity-90 transition">
            <Logo />
          </Link>
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 border border-gold-300/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Join the Community
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
            Cultivate your daily <em className="italic text-gold-300 font-normal">reading habit.</em>
          </h2>

          <p className="text-cream-100/80 text-sm leading-relaxed">
            Create your account in seconds. Read PDF manuscripts, Word papers, and eBooks with automatic progress recording and reading analytics.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-cream-100/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Free Reader Account</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automatic Time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Resume Progress on Any Device</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Google One-Click Setup</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-cream-200/50 flex items-center justify-between">
          <span>© {new Date().getFullYear()} ReadRise Platform</span>
          <span>Verified Security Standards</span>
        </div>
      </div>

      {/* ── Right Registration Form ── */}
      <div className="flex items-center justify-center px-6 sm:px-12 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-ink font-bold tracking-tight">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-ink-light">
            Start tracking your reading time and explore the digital library.
          </p>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm px-4 py-3 flex items-start gap-2.5"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
              <div className="flex-1">{error}</div>
            </motion.div>
          )}

          {/* ── Google Sign-up Button ── */}
          <div className="mt-8 space-y-3">
            <div className="flex justify-center min-h-[44px]">
              <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
            </div>

            {googleLoading && (
              <div className="flex items-center justify-center gap-2 text-xs text-forest-600 font-medium py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Creating your account with Google…</span>
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-200" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <span className="bg-cream-50 px-3">or register with email</span>
            </div>
          </div>

          {/* ── Email & Password Form ── */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Full Name / Display Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="text"
                  placeholder="Yerosan Girma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-cream-300 bg-white text-ink placeholder:text-ink-muted/50 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/15 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type="email"
                  placeholder="reader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl border border-cream-300 bg-white text-ink placeholder:text-ink-muted/50 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/15 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Create Password (min 8 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl border border-cream-300 bg-white text-ink placeholder:text-ink-muted/50 focus:border-forest-500 focus:ring-2 focus:ring-forest-500/15 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink transition p-0.5"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99] disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating your account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Footer Link to Login ── */}
          <p className="mt-8 text-center text-xs sm:text-sm text-ink-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-forest-600 hover:text-gold-600 hover:underline transition">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
