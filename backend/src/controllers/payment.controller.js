const db = require('../config/db');
const bookService = require('../services/book.service');

const DEFAULT_BOOK_PRICE = 50.00;
const CURRENCY = 'ETB';

/**
 * Check if the authenticated user has download access to a book
 */
exports.checkAccess = async (req, res, next) => {
  try {
    const bookId = Number(req.params.bookId);
    const userId = Number(req.user.sub);

    const book = await bookService.getBook(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const isOwner = Number(book.created_by) === userId;
    const isAdmin = req.user.role === 'admin';

    if (isOwner || isAdmin) {
      return res.json({
        hasAccess: true,
        isOwner,
        isAdmin,
        price: DEFAULT_BOOK_PRICE,
        currency: CURRENCY,
        book: {
          id: book.id,
          title: book.title,
          author: book.author,
          cover_url: book.cover_url,
        },
      });
    }

    const purchaseRes = await db.query(
      `SELECT id, payment_status, created_at, tx_ref 
       FROM book_purchases 
       WHERE user_id = $1 AND book_id = $2 AND payment_status = 'completed'`,
      [userId, bookId]
    );

    const hasAccess = purchaseRes.rows.length > 0;

    res.json({
      hasAccess,
      isOwner: false,
      isAdmin: false,
      price: DEFAULT_BOOK_PRICE,
      currency: CURRENCY,
      purchase: hasAccess ? purchaseRes.rows[0] : null,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Initialize payment with Chapa (or Sandbox/Simulation fallback)
 */
exports.initializeChapa = async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const { bookId, paymentMethod = 'telebirr' } = req.body;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    const book = await bookService.getBook(Number(bookId));
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if user already owns or has access
    const isOwner = Number(book.created_by) === userId;
    const isAdmin = req.user.role === 'admin';

    if (isOwner || isAdmin) {
      return res.json({
        alreadyPurchased: true,
        hasAccess: true,
        message: 'You already have full download access to this book.',
      });
    }

    const existingPurchase = await db.query(
      `SELECT id FROM book_purchases WHERE user_id = $1 AND book_id = $2 AND payment_status = 'completed'`,
      [userId, bookId]
    );

    if (existingPurchase.rows.length > 0) {
      return res.json({
        alreadyPurchased: true,
        hasAccess: true,
        message: 'You have already purchased this book.',
      });
    }

    // Fetch user details
    const userRes = await db.query(
      `SELECT id, email, display_name, username FROM users WHERE id = $1`,
      [userId]
    );
    const user = userRes.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const names = (user.display_name || user.username || 'Reader User').trim().split(' ');
    const firstName = names[0] || 'Reader';
    const lastName = names.slice(1).join(' ') || 'ReadRise';
    // Chapa requires tx_ref to be <= 20 characters
    const txRef = `R${bookId}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`.slice(0, 20);
    const amount = DEFAULT_BOOK_PRICE;

    // Upsert pending purchase in DB
    await db.query(
      `INSERT INTO book_purchases (user_id, book_id, amount, currency, payment_method, payment_status, tx_ref, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, NOW(), NOW())
       ON CONFLICT (user_id, book_id)
       DO UPDATE SET 
         tx_ref = EXCLUDED.tx_ref,
         amount = EXCLUDED.amount,
         payment_method = EXCLUDED.payment_method,
         payment_status = CASE WHEN book_purchases.payment_status = 'completed' THEN 'completed' ELSE 'pending' END,
         updated_at = NOW()`,
      [userId, bookId, amount, CURRENCY, paymentMethod, txRef]
    );

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    const isLiveChapa = chapaSecretKey && !chapaSecretKey.includes('placeholder') && chapaSecretKey.length > 10;

    if (isLiveChapa) {
      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        // Chapa strictly requires https:// scheme for redirect and callback URLs
        const safeReturnUrl = frontendUrl.startsWith('https://')
          ? `${frontendUrl}/books/${bookId}?payment=success&tx_ref=${txRef}`
          : `https://localhost:5173/books/${bookId}?payment=success&tx_ref=${txRef}`;

        const payload = {
          amount: amount.toFixed(2),
          currency: CURRENCY,
          email: user.email,
          first_name: firstName,
          last_name: lastName,
          tx_ref: txRef,
          return_url: safeReturnUrl,
          customization: {
            title: `ReadRise - ${book.title}`,
            description: `Download access payment for "${book.title}"`,
          },
        };

        if (backendUrl.startsWith('https://')) {
          payload.callback_url = `${backendUrl}/api/payment/chapa/webhook`;
        }

        console.log(`[Chapa] Initializing payment with tx_ref: ${txRef} for book: "${book.title}"`);
        
        // Try Chapa Global API first, then fallback to Chapa CO API
        const endpoints = [
          'https://api.chapa.global/v1/transaction/initialize',
          'https://api.chapa.co/v1/transaction/initialize',
        ];

        let chapaData = null;
        for (const endpoint of endpoints) {
          try {
            const chapaResponse = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${chapaSecretKey.trim()}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(payload),
            });
            chapaData = await chapaResponse.json();
            if (chapaData?.status === 'success' && chapaData.data?.checkout_url) {
              console.log(`[Chapa] Successfully initialized on ${endpoint}:`, chapaData.data.checkout_url);
              break;
            }
          } catch (e) {
            console.warn(`[Chapa] Request to ${endpoint} failed:`, e.message);
          }
        }

        if (chapaData?.status === 'success' && chapaData.data?.checkout_url) {
          return res.json({
            mode: 'chapa',
            checkoutUrl: chapaData.data.checkout_url,
            tx_ref: txRef,
            amount,
            currency: CURRENCY,
            bookTitle: book.title,
          });
        } else {
          console.warn('[Chapa] Initialize returned non-success:', chapaData?.message || chapaData);
        }
      } catch (err) {
        console.warn('Chapa API call failed, falling back to sandbox modal:', err.message);
      }
    }

    // Default to seamless Chapa Sandbox simulation (Telebirr, CBEBirr, Chapa)
    res.json({
      mode: 'sandbox',
      tx_ref: txRef,
      amount,
      currency: CURRENCY,
      bookTitle: book.title,
      userEmail: user.email,
      supportedMethods: [
        { id: 'telebirr', name: 'Telebirr', icon: 'phone' },
        { id: 'cbebirr', name: 'CBEBirr', icon: 'building' },
        { id: 'card', name: 'Debit / Credit Card', icon: 'credit-card' },
        { id: 'awash', name: 'Awash Bank', icon: 'wallet' },
      ],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Verify payment transaction (called after Chapa redirect or sandbox confirmation)
 */
exports.verifyChapa = async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);
    const { tx_ref } = req.body;

    if (!tx_ref) {
      return res.status(400).json({ error: 'Transaction reference is required' });
    }

    const purchaseRes = await db.query(
      `SELECT * FROM book_purchases WHERE tx_ref = $1 AND user_id = $2`,
      [tx_ref, userId]
    );

    if (purchaseRes.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction record not found' });
    }

    const purchase = purchaseRes.rows[0];

    if (purchase.payment_status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment already verified! You can download the book.',
        bookId: purchase.book_id,
      });
    }

    const chapaSecretKey = process.env.CHAPA_SECRET_KEY;
    const isLiveChapa = chapaSecretKey && !chapaSecretKey.includes('placeholder') && chapaSecretKey.length > 10;

    let chapaReference = null;
    let paymentVerified = false;

    if (isLiveChapa) {
      console.log(`[Chapa] Verifying transaction tx_ref: ${tx_ref}`);
      const verifyEndpoints = [
        `https://api.chapa.global/v1/transaction/verify/${tx_ref}`,
        `https://api.chapa.co/v1/transaction/verify/${tx_ref}`,
      ];

      for (const endpoint of verifyEndpoints) {
        try {
          const verifyRes = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${chapaSecretKey.trim()}`,
            },
          });
          const verifyData = await verifyRes.json();
          if (verifyData?.status === 'success' && verifyData.data) {
            chapaReference = verifyData.data.reference || `CHAPA-${Date.now()}`;
            paymentVerified = true;
            console.log(`[Chapa] Verification confirmed on ${endpoint}:`, chapaReference);
            break;
          }
        } catch (e) {
          console.warn(`[Chapa] Verification check on ${endpoint} failed:`, e.message);
        }
      }

      if (!paymentVerified) {
        return res.status(400).json({
          error: 'Payment verification failed. The transaction has not been confirmed by Chapa.',
          verified: false,
        });
      }
    } else {
      // Sandbox fallback mode for development without live Chapa API keys
      chapaReference = `SANDBOX-${Date.now()}`;
      paymentVerified = true;
    }

    // Mark purchase as completed
    await db.query(
      `UPDATE book_purchases 
       SET payment_status = 'completed', 
           chapa_reference = $1, 
           updated_at = NOW() 
       WHERE tx_ref = $2 AND user_id = $3`,
      [chapaReference, tx_ref, userId]
    );

    res.json({
      success: true,
      message: 'Payment completed successfully! Download unlocked.',
      bookId: purchase.book_id,
      tx_ref,
      reference: chapaReference,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get user's purchased books
 */
exports.myPurchases = async (req, res, next) => {
  try {
    const userId = Number(req.user.sub);

    const result = await db.query(
      `SELECT p.id as purchase_id, p.amount, p.currency, p.payment_method, p.updated_at as purchased_at,
              b.id as book_id, b.title, b.author, b.cover_url, b.file_type
       FROM book_purchases p
       JOIN books b ON b.id = p.book_id
       WHERE p.user_id = $1 AND p.payment_status = 'completed'
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    res.json({ purchases: result.rows });
  } catch (err) {
    next(err);
  }
};
