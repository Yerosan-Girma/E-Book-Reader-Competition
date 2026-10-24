import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MobileBottomNav from './components/MobileBottomNav';

import Landing      from './pages/Landing';

const Books = lazy(() => import('./pages/Books'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Reading = lazy(() => import('./pages/Reading'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Challenges = lazy(() => import('./pages/Challenges'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const About = lazy(() => import('./pages/About'));
const Admin = lazy(() => import('./pages/Admin'));
const StaticPlaceholder = lazy(() => import('./pages/StaticPlaceholder'));

function RouteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-50">
      <div
        className="w-8 h-8 rounded-full border-2 border-cream-300 border-t-forest-400 animate-spin"
        role="status"
        aria-label="Loading page"
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <MotionConfig reducedMotion="user">
          <div id="main-content">
            <Suspense fallback={<RouteLoading />}>
              <Routes>
            <Route path="/"            element={<Landing />} />
            <Route path="/explore"     element={<Books />} />
            <Route path="/books"       element={<Books />} />
            <Route path="/about"       element={<About />} />
            <Route path="/contact"     element={<StaticPlaceholder title="Contact" description="Contact options will be published here soon." />} />
            <Route path="/privacy"     element={<StaticPlaceholder title="Privacy Policy" description="Our privacy policy is being prepared and will be posted here." />} />
            <Route path="/terms"       element={<StaticPlaceholder title="Terms of Service" description="Terms of service are coming soon." />} />
            <Route path="/books/:id"    element={<BookDetail />} />
            <Route path="/challenges"  element={<Challenges />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login"        element={<Login />} />
            <Route path="/register"     element={<Register />} />

            <Route
              path="/dashboard"
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
            />
            <Route
              path="/admin"
              element={<ProtectedRoute><Admin /></ProtectedRoute>}
            />
            <Route
              path="/read/:id"
              element={<ProtectedRoute><Reading /></ProtectedRoute>}
            />

            <Route path="*" element={<Landing />} />
              </Routes>
            </Suspense>
            <MobileBottomNav />
          </div>
        </MotionConfig>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
