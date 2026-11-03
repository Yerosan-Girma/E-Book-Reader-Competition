import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  X,
  CreditCard,
  Smartphone,
  Building,
  Wallet,
  Lock,
  Loader2,
  CheckCircle2,
  Download,
  AlertCircle,
  ExternalLink,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { initializeChapaPayment, verifyChapaPayment, downloadSecureBook } from '../../lib/downloadService';

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    tagline: 'Ethio Telecom Mobile Money',
    icon: Smartphone,
    color: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    activeBadge: 'bg-emerald-600 text-white',
  },
  {
    id: 'cbebirr',
    name: 'CBEBirr',
    tagline: 'Commercial Bank of Ethiopia',
    icon: Building,
    color: 'bg-purple-500/10 text-purple-700 border-purple-300',
    activeBadge: 'bg-purple-700 text-white',
  },
  {
    id: 'card',
    name: 'Debit / Credit Card',
    tagline: 'Visa, Mastercard & Local Cards',
    icon: CreditCard,
    color: 'bg-blue-500/10 text-blue-700 border-blue-300',
    activeBadge: 'bg-blue-600 text-white',
  },
  {
    id: 'awash',
    name: 'Awash Bank',
    tagline: 'Awash Birr Wallet',
    icon: Wallet,
    color: 'bg-amber-500/10 text-amber-700 border-amber-300',
    activeBadge: 'bg-amber-600 text-white',
  },
];

export default function ChapaPaymentModal({
  isOpen,
  onClose,
  book,
  onSuccess,
}) {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('telebirr');
  const [phoneNumber, setPhoneNumber] = useState('0912345678');
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('initial'); // 'initial' | 'processing' | 'chapa_redirect' | 'success' | 'downloading'
  const [error, setError] = useState(null);
  const [txRef, setTxRef] = useState(null);
  const [chapaCheckoutUrl, setChapaCheckoutUrl] = useState(null);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen || !book) return null;

  const handleStartPayment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in first to purchase and download books.');
      return;
    }

    setLoading(true);
    setError(null);
    setStage('processing');

    try {
      const initRes = await initializeChapaPayment({
        bookId: book.id,
        paymentMethod: selectedMethod,
      });

      if (initRes.alreadyPurchased) {
        setStage('success');
        toast.success('You already own this book! Downloading now...');
        await handleDownload();
        return;
      }

      setTxRef(initRes.tx_ref);

      if (initRes.mode === 'chapa' && initRes.checkoutUrl) {
        setChapaCheckoutUrl(initRes.checkoutUrl);
        setStage('chapa_redirect');
        window.open(initRes.checkoutUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      // Sandbox / Test Mode Simulation
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const verifyRes = await verifyChapaPayment(initRes.tx_ref);
      if (verifyRes.success) {
        setStage('success');
        toast.success('Chapa payment confirmed! Book download unlocked.');
        if (onSuccess) onSuccess();
      } else {
        throw new Error(verifyRes.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || err.message || 'Payment processing failed');
      setStage('initial');
      toast.error(err.response?.data?.error || 'Payment could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyManual = async () => {
    if (!txRef) return;
    setLoading(true);
    try {
      const verifyRes = await verifyChapaPayment(txRef);
      if (verifyRes.success) {
        setStage('success');
        toast.success('Payment verified! Download ready.');
        if (onSuccess) onSuccess();
      } else {
        toast.error('Payment not confirmed yet. Please complete checkout on Chapa.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Verification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setLoading(true);
      await downloadSecureBook(book.id, book.title);
      toast.success(`"${book.title}" downloaded successfully!`);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to download file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center p-3 sm:p-6"
        onClick={(e) => {
          // Close when clicking dark backdrop outside the modal
          if (e.target === e.currentTarget && !loading) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-lg my-auto bg-white rounded-3xl shadow-2xl border border-cream-200 overflow-hidden flex flex-col max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Banner - Fixed top, never clipped */}
          <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-forest-600 px-6 py-4 sm:py-5 text-white flex-shrink-0 relative">
            <div className="flex items-center justify-between gap-3 mb-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading && stage === 'processing'}
                className="inline-flex items-center gap-1.5 text-xs text-cream-200 hover:text-white transition-colors cursor-pointer py-1 px-2 -ml-2 rounded-lg hover:bg-white/10"
                aria-label="Go back"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="font-medium">Back</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-gold-400 text-forest-900 flex items-center gap-1 shadow-xs">
                  <Lock className="w-2.5 h-2.5" /> Chapa Pay
                </span>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading && stage === 'processing'}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition cursor-pointer shadow-2xs"
                  aria-label="Cancel and close dialog"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-cream-50 leading-tight">
              Download Authorization
            </h2>
            <p className="text-xs text-cream-200/90 mt-0.5">
              Pay securely via Chapa to download and keep the original file.
            </p>
          </div>

          {/* Modal Body - Scrollable content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">
            {stage === 'initial' && (
              <form onSubmit={handleStartPayment} className="space-y-4 sm:space-y-5">
                {/* Book Summary Card */}
                <div className="flex items-center gap-3.5 p-3.5 bg-cream-50 rounded-2xl border border-cream-200/80">
                  <div className="w-12 h-16 rounded-lg bg-forest-900/10 flex-shrink-0 overflow-hidden flex items-center justify-center border border-cream-200 shadow-xs">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-forest-700 text-xs text-center px-1">
                        {book.title?.slice(0, 4)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-ink text-sm truncate">{book.title}</h3>
                    <p className="text-xs text-ink-muted truncate">by {book.author || 'Unknown'}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-forest-700 uppercase bg-forest-100/70 px-2 py-0.5 rounded">
                      Lifetime Download Access
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] text-ink-muted block line-through">100 ETB</span>
                    <span className="font-display font-bold text-lg text-forest-700">
                      50 <span className="text-xs font-semibold">ETB</span>
                    </span>
                  </div>
                </div>

                {/* Free Online Reading Notification */}
                <div className="p-3 rounded-xl bg-forest-50/70 border border-forest-200/70 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 text-forest-900 min-w-0">
                    <BookOpen className="w-4 h-4 text-forest-600 flex-shrink-0" />
                    <span className="truncate">Online reading is 100% free!</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-bold text-forest-700 hover:text-forest-900 hover:underline cursor-pointer flex-shrink-0"
                  >
                    Read Online Instead →
                  </button>
                </div>

                {/* Payment Gateway Options */}
                <div>
                  <label className="block text-xs font-bold text-ink uppercase tracking-wider mb-2">
                    Select Ethiopian Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                    {PAYMENT_METHODS.map((pm) => {
                      const Icon = pm.icon;
                      const isSelected = selectedMethod === pm.id;
                      return (
                        <button
                          key={pm.id}
                          type="button"
                          onClick={() => setSelectedMethod(pm.id)}
                          className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all flex flex-col justify-between relative cursor-pointer ${
                            isSelected
                              ? 'border-forest-600 bg-forest-50/70 shadow-xs ring-2 ring-forest-500/20'
                              : 'border-cream-200 hover:border-forest-300 bg-white hover:bg-cream-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span
                              className={`p-1.5 rounded-lg border text-xs ${pm.color} flex items-center justify-center`}
                            >
                              <Icon className="w-4 h-4" />
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-forest-600 fill-forest-100" />
                            )}
                          </div>
                          <div className="mt-1.5 sm:mt-2">
                            <span className="text-xs font-bold text-ink block">{pm.name}</span>
                            <span className="text-[10px] text-ink-muted block leading-tight truncate">
                              {pm.tagline}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Account / Phone Input for Mobile Wallets */}
                {(selectedMethod === 'telebirr' || selectedMethod === 'cbebirr' || selectedMethod === 'awash') && (
                  <div>
                    <label className="block text-xs font-medium text-ink-light mb-1">
                      {selectedMethod === 'telebirr'
                        ? 'Telebirr Phone Number'
                        : selectedMethod === 'cbebirr'
                        ? 'CBE Account or Phone'
                        : 'Awash Wallet Phone'}
                    </label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="09..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-50/50 text-ink text-sm font-medium focus:outline-none focus:border-forest-500 focus:bg-white"
                      required
                    />
                  </div>
                )}

                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Checkout Footer & Action Buttons */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <Lock className="w-4 h-4 text-gold-400 group-hover:scale-110 transition-transform" />
                    <span>Pay 50 ETB via Chapa</span>
                  </button>

                  {/* Explicit Cancel / Go Back Button */}
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl border border-cream-200 hover:border-cream-300 hover:bg-cream-100 text-ink-muted hover:text-ink font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel & Return to Book</span>
                  </button>

                  <p className="text-[10px] text-center text-ink-muted">
                    Powered by <strong>Chapa Financial Technologies</strong> • 256-Bit SSL Encrypted
                  </p>
                </div>
              </form>
            )}

            {stage === 'processing' && (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-forest-500/10 animate-ping absolute inset-0" />
                  <div className="w-16 h-16 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center relative z-10 text-forest-700">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-ink">
                  Contacting Chapa Gateway…
                </h3>
                <p className="text-xs text-ink-muted max-w-xs mt-1">
                  Connecting to Ethiopian payment switch via{' '}
                  <span className="font-semibold text-forest-700 capitalize">{selectedMethod}</span>.
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 text-xs text-ink-muted hover:text-ink font-semibold px-4 py-2 rounded-lg border border-cream-200 hover:bg-cream-100 cursor-pointer"
                >
                  Cancel Payment
                </button>
              </div>
            )}

            {stage === 'chapa_redirect' && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-600">
                  <ExternalLink className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    Chapa Checkout Window Opened
                  </h3>
                  <p className="text-xs text-ink-muted max-w-xs mx-auto mt-1">
                    Please finish your payment in the Chapa tab. Once completed, click the button below to verify.
                  </p>
                </div>
                <div className="w-full space-y-2 pt-2">
                  <button
                    onClick={handleVerifyManual}
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>I Have Completed Payment</span>
                  </button>

                  {chapaCheckoutUrl && (
                    <a
                      href={chapaCheckoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-forest-600 hover:underline"
                    >
                      Re-open Chapa Checkout Link
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-xl border border-cream-200 hover:bg-cream-100 text-ink-muted hover:text-ink font-semibold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel & Return</span>
                  </button>
                </div>
              </div>
            )}

            {stage === 'success' && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shadow-sm"
                >
                  <CheckCircle2 className="w-9 h-9" />
                </motion.div>

                <div>
                  <h3 className="font-display text-xl font-bold text-ink">
                    Payment Verified!
                  </h3>
                  <p className="text-xs text-emerald-700 font-medium mt-1">
                    Chapa Transaction Confirmed • 50 ETB Paid
                  </p>
                  <p className="text-xs text-ink-muted max-w-xs mx-auto mt-1.5">
                    You have unlocked permanent download access for <strong>{book.title}</strong>.
                  </p>
                </div>

                <div className="w-full pt-3 space-y-2">
                  <button
                    onClick={handleDownload}
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-2xl bg-forest-600 hover:bg-forest-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    <span>Download Book Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 px-4 rounded-xl border border-cream-200 hover:bg-cream-100 text-ink-muted hover:text-ink font-semibold text-xs transition cursor-pointer"
                  >
                    Close & Return to Library
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
