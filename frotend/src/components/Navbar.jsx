import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { Logo } from './ui/primitives';
import { useAuth } from '../context/AuthContext';

const links = [
  { label: 'Home', href: '/#top', path: '/' },
  { label: 'Book Library', href: '/explore', path: '/explore' },
  { label: 'Competitions', href: '/challenges', path: '/challenges' },
  { label: 'Leaderboard', href: '/leaderboard', path: '/leaderboard' },
  { label: 'About', href: '/about', path: '/about' },
];

export default function Navbar({ solid = false }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 30);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const signOut = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const handleLinkClick = (e, item) => {
    setOpen(false);
    if (item.href.startsWith('/#') && location.pathname === '/') {
      e.preventDefault();
      const id = item.href.slice(2);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isFilled = solid || scrolled || location.pathname !== '/';

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: isFilled ? 'oklch(0.20 0.04 165 / 0.95)' : 'oklch(0.20 0.04 165 / 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: isFilled ? '1px solid oklch(0.97 0.012 90 / 0.12)' : '1px solid transparent',
        boxShadow: scrolled ? '0 10px 30px -10px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 py-4 md:px-8">
        <Link
          to="/"
          className="shrink-0 flex items-center gap-2"
          style={{ color: 'oklch(0.97 0.012 90)' }}
          aria-label="ReadRise home"
          onClick={() => setOpen(false)}
        >
          <Logo />
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-7 lg:flex">
          {links.map((l) => {
            const isActive = location.pathname === l.path;
            return (
              <li key={l.label}>
                <Link
                  to={l.href}
                  onClick={(e) => handleLinkClick(e, l)}
                  className={`group relative text-sm font-medium transition-colors ${
                    isActive ? 'font-semibold' : ''
                  }`}
                  style={{
                    color: isActive ? 'var(--gold, #D8AA5B)' : 'oklch(0.97 0.012 90 / 0.88)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'oklch(0.97 0.012 90)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = 'oklch(0.97 0.012 90 / 0.88)';
                  }}
                >
                  {l.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-0.5 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                    style={{ background: 'var(--gold, #D8AA5B)' }}
                  />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="px-3 py-2 text-sm font-medium transition rounded-lg"
                  style={{ color: 'oklch(0.97 0.012 90 / 0.9)' }}
                >
                  Admin
                </Link>
              )}
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
                style={{ background: 'var(--gradient-gold, linear-gradient(135deg, #D8AA5B, #E8C982))', color: '#0B2920' }}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition cursor-pointer"
                style={{ color: 'oklch(0.97 0.012 90 / 0.9)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'oklch(0.97 0.012 90)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'oklch(0.97 0.012 90 / 0.9)')}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium transition"
                style={{ color: 'oklch(0.97 0.012 90 / 0.9)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'oklch(0.97 0.012 90)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'oklch(0.97 0.012 90 / 0.9)')}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:scale-105"
                style={{ background: 'var(--gradient-gold, linear-gradient(135deg, #D8AA5B, #E8C982))', color: '#0B2920' }}
              >
                Join Competition
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          className="grid h-10 w-10 place-items-center rounded-full border lg:hidden cursor-pointer"
          style={{ borderColor: 'oklch(0.97 0.012 90 / 0.20)', color: 'oklch(0.97 0.012 90)' }}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {open && (
        <div
          className="h-[calc(100svh-4.5rem)] overflow-y-auto border-t px-4 pb-8 lg:hidden animate-in fade-in slide-in-from-top-2"
          style={{ borderColor: 'oklch(0.97 0.012 90 / 0.10)', backgroundColor: '#0B2920' }}
        >
          {/* User Info Section */}
          {user && (
            <div className="pt-4 pb-6 border-b mb-4" style={{ borderColor: 'oklch(0.97 0.012 90 / 0.10)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-forest-900 font-bold text-lg">
                  {user.display_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-semibold" style={{ color: 'oklch(0.97 0.012 90)' }}>
                    {user.display_name || user.username}
                  </p>
                  <p className="text-xs" style={{ color: 'oklch(0.97 0.012 90 / 0.6)' }}>
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <ul className="flex flex-col space-y-1">
            {links.map((l) => {
              const isActive = location.pathname === l.path;
              return (
                <li key={l.label}>
                  <Link
                    to={l.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      isActive
                        ? 'bg-gold-400/20 text-gold-300'
                        : 'text-cream-50/80 hover:bg-cream-50/5'
                    }`}
                  >
                    <span className="text-lg">{l.label[0]}</span>
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Action Buttons */}
          <div className="mt-8 space-y-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border text-sm font-semibold transition-all hover:bg-cream-50/5"
                    style={{ borderColor: 'oklch(0.97 0.012 90 / 0.20)', color: 'oklch(0.97 0.012 90)' }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-transform active:scale-95"
                  style={{ background: 'var(--gradient-gold, linear-gradient(135deg, #D8AA5B, #E8C982))', color: '#0B2920' }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border text-sm font-medium transition-all hover:bg-cream-50/5 cursor-pointer"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.20)', color: 'oklch(0.97 0.012 90)' }}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border text-sm font-medium transition-all hover:bg-cream-50/5"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.20)', color: 'oklch(0.97 0.012 90)' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-transform active:scale-95"
                  style={{ background: 'var(--gradient-gold, linear-gradient(135deg, #D8AA5B, #E8C982))', color: '#0B2920' }}
                >
                  Join Competition
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
