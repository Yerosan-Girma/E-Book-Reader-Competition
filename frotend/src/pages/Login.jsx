import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import loginImg from '../assets/login.jpg';
import { Logo } from '../components/ui/primitives';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

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

  // Handle Google Sign-in Callback
  const handleGoogleCallback = async (response) => {
    try {
      setGoogleLoading(true);
      setError('');
      await loginWithGoogle({ credential: response.credential });
      nav(loc.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      console.error('Google login error:', err);
      setError(
        err.response?.data?.error ||
          'Google authentication could not be completed. Please try again or use email login.'
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
            cancel_on_tap_outside: true,
          });

          // Render official Google button inside container
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            shape: 'pill',
            text: 'continue_with',
            logo_alignment: 'center',
            width: 320,
          });
        } catch (e) {
          console.warn('Google button render notice:', e);
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

  // Standard Email + Password submit
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      nav(loc.state?.from || '/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Quick fill admin credentials for pairing convenience
  const fillAdminCredentials = () => {
    setEmail('yerosang463@gmail.com');
    setPassword('yeroadmin123');
    setError('');
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

        {/* Top Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-block hover:opacity-90 transition">
            <Logo />
          </Link>
        </div>

        {/* Center Quote / Feature highlights */}
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold-400/20 border border-gold-300/30 text-gold-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Your Intelligent Reading Sanctuary
          </div>

          <h2 className="font-display text-4xl sm:text-5xl font-bold leading-tight tracking-tight text-white">
            Read deeply. Track effortlessly. <em className="italic text-gold-300 font-normal">Rise.</em>
          </h2>

          <p className="text-cream-100/80 text-sm leading-relaxed">
            ReadRise automatically counts your daily, weekly, and monthly reading minutes, saves your exact page, and seamlessly resumes where you left off.
          </p>

          <div className="pt-4 grid grid-cols-2 gap-3 text-xs text-cream-100/90">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Auto Reading Time Tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Multi-Format PDF, Word & Image</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Resume Reading Anywhere</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Single Sign-On with Google</span>
            </div>
          </div>
        </div>

        {/* Bottom footer credit */}
        <div className="relative z-10 text-xs text-cream-200/50 flex items-center justify-between">
          <span>© {new Date().getFullYear()} ReadRise Platform</span>
          <span>Verified Encrypted Authentication</span>
        </div>
      </div>

      {/* ── Right Login Form Column ── */}
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-ink-light">
            Sign in to continue your reading journey and access your books.
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

          {/* ── Google Sign-in Section ── */}
          <div className="mt-8 space-y-3">
            {/* Native Google Identity Services Button */}
            <div className="flex justify-center min-h-[44px]">
              <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
            </div>

            {googleLoading && (
              <div className="flex items-center justify-center gap-2 text-xs text-forest-600 font-medium py-1">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Signing in with your Google Account…</span>
              </div>
            )}
          </div>

          {/* ── Divider ── */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-cream-200" />
            </div>
            <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider text-ink-muted">
              <span className="bg-cream-50 px-3">or continue with email</span>
            </div>
          </div>

          {/* ── Email & Password Form ── */}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                Email Address
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
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

            {/* Quick Admin Auto-fill Helper (Dev only) */}
            {import.meta.env.DEV && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-ink-muted">Need quick admin login?</span>
                <button
                  type="button"
                  onClick={fillAdminCredentials}
                  className="font-semibold text-forest-600 hover:text-gold-600 hover:underline transition"
                >
                  Use Admin Demo
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary w-full py-3.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying credentials…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* ── Footer Link to Register ── */}
          <p className="mt-8 text-center text-xs sm:text-sm text-ink-muted">
            New to ReadRise?{' '}
            <Link to="/register" className="font-bold text-forest-600 hover:text-gold-600 hover:underline transition">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </main>
  );
}
