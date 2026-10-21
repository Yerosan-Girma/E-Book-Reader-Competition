import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BookOpen, LayoutDashboard, LogOut, ChevronDown, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avator';

const navLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition-colors duration-200 group ${
    isActive ? 'text-forest-300' : 'text-cream-50/80 hover:text-cream-50'
  }`;

const scrolledNavLinkClass = ({ isActive }) =>
  `relative text-sm font-medium transition-colors duration-200 group ${
    isActive ? 'text-forest-400' : 'text-ink-light hover:text-ink'
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleMobileLinkClick = () => setMobileOpen(false);

  const lightNav = scrolled || pathname !== '/';

  const navStyle = lightNav
    ? {
        background: 'rgba(255, 252, 246, 0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(240, 232, 220, 0.7)',
        boxShadow: '0 4px 24px rgba(8, 26, 19, 0.06)',
      }
    : {
        background: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none',
      };

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={navStyle}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
    >
      <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm
                          group-hover:scale-110 transition-transform duration-300
                          ${lightNav
                            ? 'bg-gradient-to-br from-forest-400 to-forest-500 text-cream-50'
                            : 'bg-cream-50/15 border border-cream-50/25 text-cream-50 backdrop-blur-sm'
                          }`}>
            <BookOpen className="w-4.5 h-4.5" strokeWidth={2.2} />
          </div>
          <span className={`font-display text-xl tracking-tight transition-colors duration-300 ${
            lightNav ? 'text-ink' : 'text-cream-50'
          }`}>
            ReadRise
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          {['Explore', 'Challenges', 'Leaderboard', 'About'].map((label, i) => {
            const paths = ['/explore', '/challenges', '/leaderboard', '/about'];
            const LinkClass = lightNav ? scrolledNavLinkClass : navLinkClass;
            return (
              <NavLink key={label} to={paths[i]} className={LinkClass}>
                {label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-400 group-hover:w-full transition-all duration-300" />
              </NavLink>
            );
          })}
          {user && (
            <NavLink to="/dashboard" className={lightNav ? scrolledNavLinkClass : navLinkClass}>
              Dashboard
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-gold-400 group-hover:w-full transition-all duration-300" />
            </NavLink>
          )}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div ref={ref} className="relative">
              <button
                onClick={() => setOpen((o) => !o)}
                className={`flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1.5 transition-colors ${
                  lightNav ? 'hover:bg-cream-100' : 'hover:bg-cream-50/10'
                }`}
                aria-label="User menu"
              >
                <Avatar name={user.display_name || user.username} />
                <span className={`text-sm font-medium transition-colors ${lightNav ? 'text-ink' : 'text-cream-50'}`}>
                  {user.display_name || user.username}
                </span>
                <ChevronDown className={`w-4 h-4 transition-colors ${lightNav ? 'text-ink-light' : 'text-cream-50/60'}`} />
              </button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white
                               border border-cream-200 shadow-xl overflow-hidden"
                  >
                    <Link
                      to="/dashboard"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm
                                 text-ink hover:bg-cream-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-forest-400" /> Dashboard
                    </Link>
                    <button
                      onClick={() => { logout(); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm
                                 text-ink hover:bg-cream-50 border-t border-cream-100 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-ink-light" /> Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-sm font-medium transition-colors ${
                  lightNav ? 'text-ink-light hover:text-ink' : 'text-cream-50/75 hover:text-cream-50'
                }`}
              >
                Log In
              </Link>
              <Link
                to="/register"
                className={`btn text-sm px-5 py-2.5 flex items-center gap-2 ${
                  lightNav ? 'btn-primary' : 'btn-gold'
                }`}
              >
                Start Reading
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${
            lightNav ? 'hover:bg-cream-100' : 'hover:bg-cream-50/10'
          }`}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen
            ? <X className={`w-5 h-5 ${lightNav ? 'text-ink' : 'text-cream-50'}`} />
            : <Menu className={`w-5 h-5 ${lightNav ? 'text-ink' : 'text-cream-50'}`} />
          }
        </button>
      </nav>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="md:hidden border-t border-cream-200/60 bg-cream-50/95 backdrop-blur-xl"
          >
            <nav className="px-6 py-5 space-y-4">
              {[
                { label: 'Explore', path: '/explore' },
                { label: 'Challenges', path: '/challenges' },
                { label: 'Leaderboard', path: '/leaderboard' },
                { label: 'About', path: '/about' },
              ].map(({ label, path }) => (
                <NavLink
                  key={path}
                  to={path}
                  onClick={handleMobileLinkClick}
                  className={({ isActive }) =>
                    `block text-base font-medium transition-colors ${
                      isActive ? 'text-forest-400' : 'text-ink-light hover:text-ink'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              {user && (
                <NavLink
                  to="/dashboard"
                  onClick={handleMobileLinkClick}
                  className={({ isActive }) =>
                    `block text-base font-medium transition-colors ${
                      isActive ? 'text-forest-400' : 'text-ink-light hover:text-ink'
                    }`
                  }
                >
                  Dashboard
                </NavLink>
              )}

              <div className="pt-4 border-t border-cream-200 space-y-3">
                {user ? (
                  <>
                    <div className="flex items-center gap-3 px-1">
                      <Avatar name={user.display_name || user.username} />
                      <span className="text-sm font-medium text-ink">
                        {user.display_name || user.username}
                      </span>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-3 px-1 py-2 text-sm text-ink-light hover:text-ink transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={handleMobileLinkClick}
                      className="block text-base font-medium text-ink-light hover:text-ink transition-colors"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={handleMobileLinkClick}
                      className="btn btn-primary w-full text-base py-3 justify-center"
                    >
                      Start Reading <ArrowRight className="w-4 h-4" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
