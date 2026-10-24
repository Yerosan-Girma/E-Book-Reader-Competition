import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Trophy, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: BookOpen, label: 'Books', href: '/books' },
    { icon: Trophy, label: 'Challenges', href: '/challenges' },
    ...(user ? [{ icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' }] : []),
  ];

  // Don't show on login/register/reading pages
  const hideOnPaths = ['/login', '/register', '/read'];
  if (hideOnPaths.some(path => location.pathname.startsWith(path))) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-lg border-t border-cream-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around h-16 sm:h-18 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              to={item.href}
              className={`flex flex-col items-center justify-center gap-1 min-w-[44px] h-full transition-all duration-200 ${
                isActive
                  ? 'text-forest-400'
                  : 'text-ink-muted hover:text-ink'
              }`}
              aria-label={item.label}
            >
              <div className={`relative transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}>
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-forest-400" />
                )}
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
