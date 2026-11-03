import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  Shield,
  Clock,
  BookOpen,
  Upload,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Sparkles,
  ArrowRight,
  Flame,
  Globe,
  Loader2,
  ExternalLink,
  Download,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import Footer from '../components/layout/Footer';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { downloadSecureBook } from '../lib/downloadService';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'security' | 'uploads'
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit Form State
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profilePublic, setProfilePublic] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState(null);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  // Uploaded Books State
  const [uploadedBooks, setUploadedBooks] = useState([]);
  const [loadingUploads, setLoadingUploads] = useState(false);

  // Purchased Books State
  const [purchases, setPurchases] = useState([]);
  const [loadingPurchases, setLoadingPurchases] = useState(false);
  const [downloadingBookId, setDownloadingBookId] = useState(null);

  // Fetch full profile and statistics
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/user/profile');
      setProfileData(data.user);
      setStats(data.stats);

      setDisplayName(data.user.display_name || '');
      setUsername(data.user.username || '');
      setAvatarUrl(data.user.avatar_url || '');
      setProfilePublic(Boolean(data.user.profile_public));
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch books uploaded by this user
  useEffect(() => {
    if (activeTab === 'uploads') {
      setLoadingUploads(true);
      api
        .get('/user/uploaded-books')
        .then(({ data }) => setUploadedBooks(data.books || []))
        .catch((err) => console.error('Failed to load uploaded books:', err))
        .finally(() => setLoadingUploads(false));
    } else if (activeTab === 'purchases') {
      setLoadingPurchases(true);
      api
        .get('/payment/my-purchases')
        .then(({ data }) => setPurchases(data.purchases || []))
        .catch((err) => console.error('Failed to load purchases:', err))
        .finally(() => setLoadingPurchases(false));
    }
  }, [activeTab]);

  const handleDownloadPurchased = async (bookId, title) => {
    try {
      setDownloadingBookId(bookId);
      await downloadSecureBook(bookId, title);
      toast.success(`"${title}" downloaded successfully!`);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    } finally {
      setDownloadingBookId(null);
    }
  };

  // Handle Profile Update
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const { data } = await api.put('/user/profile', {
        display_name: displayName,
        username,
        avatar_url: avatarUrl,
        profile_public: profilePublic,
      });

      setProfileData(data.user);
      updateUser(data.user);
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update profile. Please try again.';
      setProfileMessage({ type: 'error', text: msg });
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Change
  const handleSavePassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSavingPassword(true);
    setPasswordMessage(null);

    try {
      await api.put('/user/password', {
        currentPassword,
        newPassword,
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update password. Please check your current password.';
      setPasswordMessage({ type: 'error', text: msg });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex flex-col justify-between">
        <Navbar />
        <div className="pt-36 pb-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-forest-500 animate-spin" />
          <p className="text-sm font-medium text-ink-muted">Loading your reader profile…</p>
        </div>
        <Footer />
      </div>
    );
  }

  const userInitial = (displayName || username || user?.email || 'R')[0].toUpperCase();

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-between relative overflow-x-hidden">
      {/* Decorative ambient background */}
      <div
        className="absolute top-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(216,170,91,0.12) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute top-1/3 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(23,76,56,0.08) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div className="grain-overlay" aria-hidden="true" />

      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-28 pb-16 relative z-10">
        {/* Profile Header Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm relative overflow-hidden mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 text-center sm:text-left">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-cream-300 shadow-md flex items-center justify-center bg-gradient-to-br from-forest-600 via-forest-500 to-forest-700 text-cream-50 font-display font-bold text-3xl">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName || username}
                      className="w-full h-full object-cover"
                      onError={() => setAvatarUrl('')}
                    />
                  ) : (
                    <span>{userInitial}</span>
                  )}
                </div>
              </div>

              {/* Identity details */}
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h1 className="font-display text-2xl sm:text-3xl text-ink font-bold">
                    {displayName || username}
                  </h1>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      profileData?.role === 'admin'
                        ? 'bg-gold-100 text-gold-800 border-gold-300'
                        : 'bg-forest-100 text-forest-800 border-forest-200'
                    }`}
                  >
                    {profileData?.role === 'admin' ? 'Administrator' : 'Reader'}
                  </span>
                </div>

                <p className="text-xs text-ink-muted mt-1 font-mono">@{username}</p>

                <div className="flex items-center justify-center sm:justify-start gap-3 mt-3 text-xs text-ink-light flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-forest-500" />
                    {profileData?.email}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-forest-500" />
                    Member since {new Date(profileData?.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                  {profileData?.google_id && (
                    <>
                      <span>•</span>
                      <span className="chip chip-gold text-[10px] py-0.5 px-2 font-semibold">
                        Google Account
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions (Dashboard, Upload, Sign Out) */}
            <div className="flex flex-row sm:flex-col items-center gap-2.5 w-full sm:w-auto shrink-0">
              <Link
                to="/dashboard"
                className="btn btn-outline-dark text-xs px-4 py-2 rounded-xl w-full sm:w-auto text-center"
              >
                Go to Dashboard
              </Link>

              <button
                onClick={handleSignOut}
                className="btn text-xs px-4 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-8 pt-6 border-t border-cream-200 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3.5 h-3.5 text-forest-500" /> Reading Time
              </span>
              <p className="font-display text-xl font-bold text-forest-700 mt-1">
                {stats?.totalFormatted || '0m'}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center justify-center sm:justify-start gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-500" /> Books Finished
              </span>
              <p className="font-display text-xl font-bold text-forest-700 mt-1">
                {stats?.completedBooks || 0}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center justify-center sm:justify-start gap-1">
                <Upload className="w-3.5 h-3.5 text-forest-500" /> Uploaded Books
              </span>
              <p className="font-display text-xl font-bold text-forest-700 mt-1">
                {stats?.uploadedBooks || 0}
              </p>
            </div>

            <div className="text-center sm:text-left">
              <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center justify-center sm:justify-start gap-1">
                <Flame className="w-3.5 h-3.5 text-gold-500" /> Active Days
              </span>
              <p className="font-display text-xl font-bold text-forest-700 mt-1">
                {stats?.activeDays || 0}d
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-cream-200/80 mb-8 pb-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'general'
                ? 'bg-forest-600 text-cream-50 shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-cream-100'
            }`}
          >
            Edit Profile
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'security'
                ? 'bg-forest-600 text-cream-50 shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-cream-100'
            }`}
          >
            Password & Security
          </button>

          <button
            onClick={() => setActiveTab('uploads')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'uploads'
                ? 'bg-forest-600 text-cream-50 shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-cream-100'
            }`}
          >
            My Uploaded Materials ({stats?.uploadedBooks || 0})
          </button>

          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'purchases'
                ? 'bg-forest-600 text-cream-50 shadow-xs'
                : 'text-ink-muted hover:text-ink hover:bg-cream-100'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Purchased Downloads ({purchases.length})</span>
          </button>
        </div>

        {/* ── TAB 1: EDIT PROFILE ── */}
        {activeTab === 'general' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
              <h2 className="font-display text-xl text-ink font-semibold mb-1">
                Personal Information
              </h2>
              <p className="text-xs text-ink-muted mb-6">
                Update your display name, username, and avatar visible across ReadRise.
              </p>

              {profileMessage && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm font-medium mb-6 flex items-center gap-2.5 ${
                    profileMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  {profileMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30"
                      placeholder="e.g. Maya Angelou"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                      Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30 font-mono"
                      placeholder="e.g. maya"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData?.email || ''}
                    disabled
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-200 bg-cream-100/60 text-ink-muted cursor-not-allowed"
                  />
                  <p className="text-[11px] text-ink-muted mt-1">
                    Your email is associated with your account authentication and cannot be changed here.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30"
                    placeholder="https://example.com/avatar.jpg"
                  />
                  
                  {/* Preset Avatar Suggestions */}
                  <div className="mt-3">
                    <span className="text-[11px] font-semibold text-ink-muted block mb-2">
                      Or choose a preset literary avatar:
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {PRESET_AVATARS.map((av, idx) => (
                        <button
                          key={av}
                          type="button"
                          onClick={() => setAvatarUrl(av)}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all hover:scale-110 ${
                            avatarUrl === av ? 'border-forest-600 ring-2 ring-forest-400' : 'border-cream-300 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={av} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Privacy setting */}
                <div className="pt-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={profilePublic}
                      onChange={(e) => setProfilePublic(e.target.checked)}
                      className="w-4 h-4 rounded text-forest-600 focus:ring-forest-500 border-cream-300"
                    />
                    <div>
                      <span className="text-xs font-bold text-ink">Public Reader Profile</span>
                      <p className="text-[11px] text-ink-muted">
                        Allow other readers to see your reading achievements and uploaded books in the library.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="pt-4 border-t border-cream-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Changes…</span>
                      </>
                    ) : (
                      <span>Save Profile</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── TAB 2: PASSWORD & SECURITY ── */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
              <h2 className="font-display text-xl text-ink font-semibold mb-1">
                Account Security & Password
              </h2>
              <p className="text-xs text-ink-muted mb-6">
                Keep your reading sanctuary secure by updating your password regularly.
              </p>

              {profileData?.google_id && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm mb-6 flex items-start gap-3">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-semibold">Connected with Google Account</strong>
                    <p className="text-xs text-amber-800 mt-0.5">
                      You are signed in via Google OAuth. You can set or update an optional ReadRise password below if you wish to log in via email and password as well.
                    </p>
                  </div>
                </div>
              )}

              {passwordMessage && (
                <div
                  className={`p-4 rounded-xl text-xs sm:text-sm font-medium mb-6 flex items-center gap-2.5 ${
                    passwordMessage.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border border-rose-200 text-rose-900'
                  }`}
                >
                  {passwordMessage.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-5 max-w-md">
                {!profileData?.google_id && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30 pr-10"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30"
                    placeholder="At least 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-cream-300 focus:border-forest-500 focus:outline-none bg-cream-50/30"
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="btn btn-primary text-xs sm:text-sm px-6 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password…</span>
                      </>
                    ) : (
                      <span>Update Password</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* ── TAB 3: MY UPLOADED MATERIALS ── */}
        {activeTab === 'uploads' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-cream-200">
                <div>
                  <h2 className="font-display text-xl text-ink font-semibold">
                    My Uploaded Materials
                  </h2>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Documents and books you uploaded for yourself and the ReadRise community
                  </p>
                </div>

                <Link
                  to="/upload"
                  className="btn btn-primary text-xs px-4 py-2 rounded-xl inline-flex items-center gap-2 shadow-xs shrink-0"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload New Material</span>
                </Link>
              </div>

              {loadingUploads ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-ink-muted text-xs">
                  <Loader2 className="w-6 h-6 animate-spin text-forest-500" />
                  <span>Loading your uploaded books…</span>
                </div>
              ) : uploadedBooks.length === 0 ? (
                <div className="py-16 text-center max-w-sm mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-3 text-forest-400">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-semibold text-ink text-base mb-1">
                    No books uploaded yet
                  </h3>
                  <p className="text-xs text-ink-muted mb-5">
                    Have a book or document you want to read? Upload it here to start reading and share with others!
                  </p>
                  <Link
                    to="/upload"
                    className="btn btn-primary text-xs px-5 py-2.5 rounded-xl inline-flex items-center gap-2 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload First Book</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uploadedBooks.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-cream-200 bg-cream-50/40 hover:bg-cream-50/90 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-16 rounded-lg bg-cream-100 border border-black/10 overflow-hidden shrink-0 shadow-2xs flex items-center justify-center">
                          {b.cover_url ? (
                            <img src={b.cover_url} alt={b.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-forest-500/60" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-100 px-2 py-0.5 rounded-md">
                            {b.category}
                          </span>
                          <h4 className="font-display font-bold text-sm text-ink truncate mt-1">
                            {b.title}
                          </h4>
                          <p className="text-xs text-ink-muted truncate">by {b.author}</p>
                          <span className="text-[10px] text-ink-muted mt-1 inline-block">
                            Uploaded {new Date(b.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-cream-200/80 flex items-center justify-between">
                        <Link
                          to={`/books?search=${encodeURIComponent(b.title)}`}
                          className="text-xs font-semibold text-ink-muted hover:text-ink inline-flex items-center gap-1"
                        >
                          <span>In Library</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>

                        <Link
                          to={`/read/${b.id}`}
                          className="btn btn-primary text-xs px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>Read Now</span>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── TAB 4: PURCHASED DOWNLOADS ── */}
        {activeTab === 'purchases' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200/80 shadow-2xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-cream-200/80 gap-3">
              <div>
                <h2 className="font-display font-bold text-lg text-ink flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-forest-600" />
                  Purchased Books & Materials
                </h2>
                <p className="text-xs text-ink-muted mt-0.5">
                  All books you purchased via Chapa are permanently unlocked for unlimited downloads.
                </p>
              </div>

              <Link
                to="/books"
                className="btn btn-primary text-xs font-semibold px-4 py-2 rounded-xl inline-flex items-center gap-1.5 self-start sm:self-auto shadow-xs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Browse Store</span>
              </Link>
            </div>

            {loadingPurchases ? (
              <div className="py-16 text-center">
                <Loader2 className="w-8 h-8 text-forest-500 animate-spin mx-auto mb-2" />
                <p className="text-xs text-ink-muted">Loading your purchased books…</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-cream-100 flex items-center justify-center mx-auto mb-3 text-ink-muted">
                  <ShoppingBag className="w-7 h-7 text-forest-500/50" />
                </div>
                <h3 className="font-display font-semibold text-ink text-base">
                  No Purchases Yet
                </h3>
                <p className="text-xs text-ink-muted mt-1 leading-relaxed">
                  When you download books with Chapa payment, they will be listed here with lifetime download access.
                </p>
                <Link
                  to="/books"
                  className="btn btn-outline text-xs px-4 py-2 mt-4 rounded-xl inline-flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Explore Available Books</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purchases.map((p) => (
                  <div
                    key={p.purchase_id}
                    className="p-4 rounded-2xl border border-cream-200 bg-cream-50/40 hover:bg-cream-50/80 transition-all flex flex-col justify-between"
                  >
                    <div className="flex gap-3.5 items-start">
                      <div className="w-14 h-20 rounded-xl bg-forest-900/10 flex-shrink-0 overflow-hidden border border-cream-200 shadow-2xs">
                        {p.cover_url ? (
                          <img
                            src={p.cover_url}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-forest-700 text-xs">
                            {p.title?.slice(0, 3)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Paid via Chapa ({p.amount} {p.currency})
                        </span>
                        <h4 className="font-semibold text-ink text-sm truncate mt-1">
                          {p.title}
                        </h4>
                        <p className="text-xs text-ink-muted truncate">by {p.author || 'Unknown'}</p>
                        <span className="text-[10px] text-ink-muted mt-1 block">
                          Purchased on {new Date(p.purchased_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-cream-200 flex items-center justify-between gap-2">
                      <Link
                        to={`/read/${p.book_id}`}
                        className="btn btn-outline text-xs px-3 py-1.5 rounded-lg inline-flex items-center gap-1.5"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>Read</span>
                      </Link>

                      <button
                        onClick={() => handleDownloadPurchased(p.book_id, p.title)}
                        disabled={downloadingBookId === p.book_id}
                        className="btn btn-primary text-xs px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        {downloadingBookId === p.book_id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── LOG OUT SECTION ── */}
        <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-base text-ink flex items-center gap-2">
              <LogOut className="w-4 h-4 text-rose-600" />
              Sign Out of ReadRise
            </h3>
            <p className="text-xs text-ink-muted mt-0.5 max-w-xl">
              Log out of your current session. All your accumulated reading time, book positions, and library uploads remain securely stored in the database.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            className="btn text-xs font-semibold px-5 py-2.5 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all shrink-0 inline-flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Confirm Log Out</span>
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
