import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import loginImg from '../assets/login.jpg';
import { Logo } from '../components/ui/primitives';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register({
        username: name.trim(),
        email: email.trim(),
        password,
        displayName: name.trim() || undefined,
      });
      nav('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const input = "w-full rounded-xl border border-border bg-card px-4 py-3 text-foreground outline-none focus:border-gold";

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest-deep lg:block">
        <img src={loginImg} alt="Readers competing online on phones and tablets" width={1024} height={1280} className="absolute inset-0 h-full w-full object-cover animate-kenburns" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="relative flex h-full flex-col justify-between p-12 text-cream">
          <Link to="/"><Logo /></Link>
          <div>
            <p className="eyebrow text-gold">Online reading competition</p>
            <h2 className="mt-4 text-5xl leading-tight">Read more. Rank higher. <em className="text-gold-soft">Rise.</em></h2>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md animate-rise">
          <Link to="/" className="text-forest lg:hidden"><Logo /></Link>
          <h1 className="mt-6 text-4xl text-foreground">Join the competition</h1>
          <p className="mt-2 text-muted-foreground">Create your free reader account.</p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="mt-8 grid gap-4">
            <input required placeholder="Display name" value={name} onChange={(e) => setName(e.target.value)} className={input} />
            <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
            <input required type="password" minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={input} />
            <button disabled={submitting} className="rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition hover:bg-forest-soft disabled:opacity-60">
              {submitting ? "Please wait…" : "Create account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-forest hover:text-gold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}