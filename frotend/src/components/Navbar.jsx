import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="border-b border-cream-200 bg-cream-50/80 backdrop-blur sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl text-forest-700">
          <BookOpen className="w-5 h-5" /> ReadRise
        </Link>
        <div className="flex items-center gap-6 text-sm text-forest-700">
          <Link to="/books" className="hover:text-forest-800">Explore Books</Link>
          {user ? (
            <>
              <span className="hidden sm:inline">Hi, {user.display_name}</span>
              <button onClick={logout} className="text-gold-500 hover:text-gold-400">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    className="hover:text-forest-800">Login</Link>
              <Link
                to="/register"
                className="rounded-full bg-forest-600 text-cream-50 px-4 py-2 hover:bg-forest-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}