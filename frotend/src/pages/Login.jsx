import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/books');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <>
      <Navbar />
      <form onSubmit={onSubmit} className="max-w-md mx-auto mt-16 bg-white border border-cream-200 rounded-2xl p-8">
        <h1 className="font-display text-2xl text-forest-700 mb-4">Welcome back</h1>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <label className="block text-sm text-forest-700 mb-1">Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
               className="w-full mb-4 rounded-lg border border-cream-200 px-3 py-2" required />

        <label className="block text-sm text-forest-700 mb-1">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
               className="w-full mb-6 rounded-lg border border-cream-200 px-3 py-2" required />

        <button className="w-full rounded-full bg-forest-600 text-cream-50 py-2.5 hover:bg-forest-700 transition">
          Login
        </button>

        <p className="mt-4 text-center text-sm text-forest-700/70">
          No account? <Link to="/register" className="text-gold-500">Sign up</Link>
        </p>
      </form>
    </>
  );
}