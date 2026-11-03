import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, Upload, User, ChevronDown, Shield } from 'lucide-react';
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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition rounded-full bg-gold-500/20 text-gold-300 border border-gold-400/30 hover:bg-gold-500/30"
                >
                  Admin
                </Link>
              )}

              <Link
                to="/upload"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition rounded-full border border-gold-400/50 hover:bg-gold-400/15"
                style={{ color: 'var(--gold, #D8AA5B)' }}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Upload</span>
              </Link>

              <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-transform hover:scale-105"
                style={{ background: 'var(--gradient-gold, linear-gradient(135deg, #D8AA5B, #E8C982))', color: '#0B2920' }}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>

              {/* User Avatar & Dropdown Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition cursor-pointer hover:bg-white/10"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.25)' }}
                  aria-label="User account menu"
                >
                  <div className="w-7 h-7 rounded-full overflow-hidden bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-forest-900 font-bold text-xs shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(user.display_name || user.username || 'R')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium max-w-[110px] truncate" style={{ color: 'oklch(0.97 0.012 90)' }}>
                    {user.display_name || user.username}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform opacity-70 ${userMenuOpen ? 'rotate-180' : ''}`}
                    style={{ color: 'oklch(0.97 0.012 90)' }}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 text-left">
                    <div className="px-4 py-2.5 border-b border-cream-100">
                      <p className="text-xs font-bold text-ink truncate">{user.display_name || user.username}</p>
                      <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cream-100 text-forest-800">
                        {user.role === 'admin' ? 'Administrator' : 'Reader'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-cream-50 transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-forest-600" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-cream-50 transition-colors"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-forest-600" />
                        <span>Reading Dashboard</span>
                      </Link>

                      <Link
                        to="/upload"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-ink hover:bg-cream-50 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-forest-600" />
                        <span>Upload Material</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gold-700 hover:bg-gold-50 transition-colors"
                        >
                          <Shield className="w-3.5 h-3.5 text-gold-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-cream-100 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-600" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
            <div className="pt-4 pb-5 border-b mb-4" style={{ borderColor: 'oklch(0.97 0.012 90 / 0.10)' }}>
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-forest-900 font-bold text-lg shrink-0">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{(user.display_name || user.username || 'R')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-semibold truncate" style={{ color: 'oklch(0.97 0.012 90)' }}>
                      {user.display_name || user.username}
                    </p>
                    <p className="text-xs truncate" style={{ color: 'oklch(0.97 0.012 90 / 0.6)' }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gold-400 font-semibold shrink-0">Profile →</span>
              </Link>
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
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border text-sm font-semibold transition-all hover:bg-cream-50/5"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.20)', color: 'oklch(0.97 0.012 90)' }}
                >
                  <User className="w-4 h-4 text-gold-400" />
                  My Profile
                </Link>
                <Link
                  to="/upload"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border text-sm font-semibold transition-all hover:bg-cream-50/5"
                  style={{ borderColor: 'oklch(0.97 0.012 90 / 0.20)', color: 'var(--gold, #D8AA5B)' }}
                >
                  <Upload className="w-4 h-4" />
                  Upload Material
                </Link>
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
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl border border-rose-500/40 text-rose-300 font-semibold bg-rose-500/10 hover:bg-rose-500/20 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
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
