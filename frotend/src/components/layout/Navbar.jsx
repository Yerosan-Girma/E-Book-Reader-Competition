import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { Logo } from '../ui/primitives';
import { useAuth } from '../../context/AuthContext';

const links = [
  { label: 'Home', href: '/#top', path: '/' },
  { label: 'Book Library', href: '/explore', path: '/explore' },
  { label: 'Competitions', href: '/challenges', path: '/challenges' },
  { label: 'Leaderboard', href: '/leaderboard', path: '/leaderboard' },
  { label: 'About', href: '/about', path: '/about' },
];

export default function Navbar({ solid = false }) {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const lastScrollY = useRef(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;

      // Always show at the top of the page
      if (current <= 60) {
        setVisible(true);
      } else if (current > lastScrollY.current && current - lastScrollY.current > 6) {
        // Scrolling DOWN -> hide navbar
        setVisible(false);
      } else if (current < lastScrollY.current && lastScrollY.current - current > 4) {
        // Scrolling UP -> reveal navbar
        setVisible(true);
      }

      setScrolled(current > 30);
      lastScrollY.current = Math.max(0, current);
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

  const showNavbar = visible || open;
  const isFilled = solid || scrolled || location.pathname !== '/';

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-in-out ${
        showNavbar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
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
          className="h-[calc(100svh-4.5rem)] overflow-y-auto border-t px-5 pb-8 lg:hidden animate-in fade-in slide-in-from-top-2"
          style={{ borderColor: 'oklch(0.97 0.012 90 / 0.10)', backgroundColor: '#0B2920' }}
        >
          <ul className="flex flex-col pt-2">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.href}
                  onClick={(e) => handleLinkClick(e, l)}
                  className="block border-b py-4 font-display text-2xl"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.10)', color: 'oklch(0.97 0.012 90)' }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid gap-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-full border py-3 text-center text-sm font-medium"
                    style={{ borderColor: 'oklch(0.97 0.012 90 / 0.30)', color: 'oklch(0.97 0.012 90)' }}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className="rounded-full py-3 text-center text-sm font-semibold"
                  style={{ background: 'var(--gradient-gold, linear-gradient(135deg, #D8AA5B, #E8C982))', color: '#0B2920' }}
                >
                  Dashboard
                </Link>
                <button
                  onClick={signOut}
                  className="rounded-full border py-3 text-sm font-medium cursor-pointer"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.30)', color: 'oklch(0.97 0.012 90)' }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-full border py-3 text-center text-sm font-medium"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.30)', color: 'oklch(0.97 0.012 90)' }}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-full py-3 text-center text-sm font-semibold"
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
