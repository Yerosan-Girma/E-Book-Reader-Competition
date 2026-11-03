const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');

const ctrl = require('../controllers/admin.controller');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `book-${uniqueSuffix}${ext}`);
  }
});

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.epub', '.txt', '.rtf', '.jpg', '.jpeg', '.png', '.webp'];

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      const err = new Error(`Unsupported file type "${ext}". Allowed formats: PDF, DOCX, DOC, EPUB, TXT, RTF, JPG, PNG, WEBP.`);
      err.status = 400;
      return cb(err, false);
    }
    cb(null, true);
  }
});

// Authenticated route to serve book files
router.get('/books/:id/file', requireAuth, ctrl.serveBookFile);

// All subsequent routes require authentication
router.use(requireAuth);

// Upload material to Book Library (available to all logged-in members)
router.post('/books/upload', upload.single('file'), ctrl.uploadBook);

// Subsequent management routes strictly require Admin role
router.use(requireAdmin);

// Books Management (Admin)
router.get('/books', ctrl.getAllBooks);
router.patch('/books/:id/publish', ctrl.togglePublish);
router.put('/books/:id', ctrl.updateBook);
router.delete('/books/:id', ctrl.deleteBook);

// Users Management
router.get('/users', ctrl.getAllUsers);
router.patch('/users/:id/role', ctrl.updateUserRole);
router.delete('/users/:id', ctrl.deleteUser);

// Platform Analytics & System Overview
router.get('/analytics', ctrl.getPlatformAnalytics);

module.exports = router;
