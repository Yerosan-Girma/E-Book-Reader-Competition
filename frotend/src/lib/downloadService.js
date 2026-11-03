import api from '../api/client';

export const DEFAULT_BOOK_PRICE = 50.00;
export const CURRENCY = 'ETB';

/**
 * Check if the user has access to download a book
 */
export async function checkBookAccess(bookId) {
  try {
    const token = localStorage.getItem('readrise.token');
    if (!token) {
      return { hasAccess: false, price: DEFAULT_BOOK_PRICE, currency: CURRENCY };
    }
    const { data } = await api.get(`/payment/check-access/${bookId}`);
    return data;
  } catch (err) {
    console.error('Error checking book download access:', err);
    return { hasAccess: false, price: DEFAULT_BOOK_PRICE, currency: CURRENCY };
  }
}

/**
 * Initialize payment with Chapa
 */
export async function initializeChapaPayment({ bookId, paymentMethod = 'telebirr' }) {
  const { data } = await api.post('/payment/chapa/initialize', {
    bookId,
    paymentMethod,
  });
  return data;
}

/**
 * Verify payment with Chapa
 */
export async function verifyChapaPayment(tx_ref) {
  const { data } = await api.post('/payment/chapa/verify', { tx_ref });
  return data;
}

/**
 * Securely download book file after payment verification
 */
export async function downloadSecureBook(bookId, fallbackTitle = 'book') {
  const token = localStorage.getItem('readrise.token');
  if (!token) {
    const err = new Error('Please log in to download this book.');
    err.authRequired = true;
    throw err;
  }

  const response = await api.get(`/books/${bookId}/download`, {
    responseType: 'blob',
    validateStatus: (status) => status < 500,
  });

  if (response.status === 402) {
    const err = new Error('Payment required to download this book via Chapa.');
    err.paymentRequired = true;
    err.status = 402;
    throw err;
  }

  if (response.status !== 200) {
    const err = new Error('Failed to download book file.');
    err.status = response.status;
    throw err;
  }

  // Extract filename from Content-Disposition header if available
  const disposition = response.headers['content-disposition'] || '';
  let filename = `${fallbackTitle.replace(/[^a-zA-Z0-9_\-\s]/g, '_')}`;
  const filenameMatch = disposition.match(/filename="?([^";]+)"?/i);
  if (filenameMatch && filenameMatch[1]) {
    filename = decodeURIComponent(filenameMatch[1]);
  } else {
    // Guess extension from blob type
    const mimeType = response.data?.type || '';
    if (mimeType.includes('pdf')) filename += '.pdf';
    else if (mimeType.includes('word') || mimeType.includes('docx')) filename += '.docx';
    else if (mimeType.includes('epub')) filename += '.epub';
    else if (mimeType.includes('text')) filename += '.txt';
    else filename += '.pdf';
  }

  // Trigger browser download via Blob URL
  const blob = new Blob([response.data], { type: response.headers['content-type'] });
  const downloadUrl = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);

  return { success: true, filename };
}
