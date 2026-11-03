const path = require('path');
const fs = require('fs/promises');
const mime = require('mime-types');
const db = require('../config/db');
const svc = require('../services/book.service');
const { convertDocumentToHtml } = require('../services/file-converter.service');

exports.list = async (req, res, next) => {
  try {
    res.json(await svc.listBooks(req.validated.query));
  } catch (e) {
    next(e);
  }
};

exports.detail = async (req, res, next) => {
  try {
    res.json(await svc.getBook(req.validated.params.id));
  } catch (e) {
    next(e);
  }
};

exports.chapters = async (req, res, next) => {
  try {
    res.json(await svc.getChapters(req.validated.params.id));
  } catch (e) {
    next(e);
  }
};

exports.chapter = async (req, res, next) => {
  try {
    res.json(
      await svc.getChapter(
        req.validated.params.id,
        req.validated.params.chapterId,
      )
    );
  } catch (e) {
    next(e);
  }
};

exports.file = async (req, res, next) => {
  try {
    const book = await svc.getBook(req.validated.params.id);
    if (!book.file_url) {
      const err = new Error('No file available for this book');
      err.status = 404;
      throw err;
    }

    let resolvedPath = path.resolve(book.file_url);
    try {
      await fs.access(resolvedPath);
    } catch {
      const fallbackPath = path.join(__dirname, '../../', book.file_url);
      try {
        await fs.access(fallbackPath);
        resolvedPath = fallbackPath;
      } catch {
        const uploadsPath = path.join(__dirname, '../../uploads', path.basename(book.file_url));
        try {
          await fs.access(uploadsPath);
          resolvedPath = uploadsPath;
        } catch {
          const err = new Error('File not found on server storage');
          err.status = 404;
          throw err;
        }
      }
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const mimeType = mime.lookup(resolvedPath) || book.file_type || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(book.title || 'book')}${ext}"`);
    res.setHeader('Accept-Ranges', 'bytes');

    res.sendFile(resolvedPath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Failed to stream book file' });
      }
    });
  } catch (e) {
    next(e);
  }
};

exports.converted = async (req, res, next) => {
  try {
    const book = await svc.getBook(req.validated.params.id);
    if (!book.file_url) {
      const err = new Error('No file available for this book');
      err.status = 404;
      throw err;
    }

    let resolvedPath = path.resolve(book.file_url);
    try {
      await fs.access(resolvedPath);
    } catch {
      const fallbackPath = path.join(__dirname, '../../', book.file_url);
      try {
        await fs.access(fallbackPath);
        resolvedPath = fallbackPath;
      } catch {
        const uploadsPath = path.join(__dirname, '../../uploads', path.basename(book.file_url));
        try {
          await fs.access(uploadsPath);
          resolvedPath = uploadsPath;
        } catch {
          const err = new Error('File not found on server storage');
          err.status = 404;
          throw err;
        }
      }
    }

    const conversion = await convertDocumentToHtml(resolvedPath);
    res.json({
      ok: true,
      title: book.title,
      author: book.author,
      ...conversion,
    });
  } catch (e) {
    next(e);
  }
};

exports.download = async (req, res, next) => {
  try {
    const bookId = req.validated.params.id;
    const userId = req.user.sub;

    const book = await svc.getBook(bookId);
    if (!book.file_url) {
      const err = new Error('No file available for this book');
      err.status = 404;
      throw err;
    }

    const isOwner = Number(book.created_by) === Number(userId);
    const isAdmin = req.user.role === 'admin';

    let hasPurchased = false;
    if (!isOwner && !isAdmin) {
      const purchaseRes = await db.query(
        `SELECT id FROM book_purchases WHERE user_id = $1 AND book_id = $2 AND payment_status = 'completed'`,
        [userId, bookId]
      );
      hasPurchased = purchaseRes.rows.length > 0;
    }

    if (!isOwner && !isAdmin && !hasPurchased) {
      return res.status(402).json({
        error: 'Payment required to download this book. Please complete payment via Chapa.',
        paymentRequired: true,
        bookId,
        price: 50.00,
        currency: 'ETB',
      });
    }

    let resolvedPath = path.resolve(book.file_url);
    try {
      await fs.access(resolvedPath);
    } catch {
      const fallbackPath = path.join(__dirname, '../../', book.file_url);
      try {
        await fs.access(fallbackPath);
        resolvedPath = fallbackPath;
      } catch {
        const uploadsPath = path.join(__dirname, '../../uploads', path.basename(book.file_url));
        try {
          await fs.access(uploadsPath);
          resolvedPath = uploadsPath;
        } catch {
          const err = new Error('File not found on server storage');
          err.status = 404;
          throw err;
        }
      }
    }

    const ext = path.extname(resolvedPath).toLowerCase();
    const mimeType = mime.lookup(resolvedPath) || book.file_type || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(book.title || 'book')}${ext}"`);

    res.sendFile(resolvedPath, (err) => {
      if (err && !res.headersSent) {
        res.status(500).json({ error: 'Failed to download book file' });
      }
    });
  } catch (e) {
    next(e);
  }
};
