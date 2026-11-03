const router = require('express').Router();
const path = require('path');
const fs = require('fs/promises');
const multer = require('multer');
const ctrl = require('../controllers/book.controller');
const adminCtrl = require('../controllers/admin.controller');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const {
  listBooksQuerySchema,
  bookIdParamsSchema,
  chapterIdParamsSchema,
} = require('../validators/book.validator');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});

// Configure multer for material uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `book-${uniqueSuffix}${ext}`);
  },
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
  },
});

// Member & Reader Upload endpoint: Any authenticated user can upload books & materials
router.post('/upload', requireAuth, upload.single('file'), adminCtrl.uploadBook);

router.get('/', validate(listBooksQuerySchema, 'query'), ctrl.list);
router.get(
  '/:id/chapters/:chapterId',
  validate(chapterIdParamsSchema, 'params'),
  ctrl.chapter,
);
router.get('/:id/chapters', validate(bookIdParamsSchema, 'params'), ctrl.chapters);
router.get('/:id/file', requireAuth, validate(bookIdParamsSchema, 'params'), ctrl.file);
router.get('/:id/converted', requireAuth, validate(bookIdParamsSchema, 'params'), ctrl.converted);
router.get('/:id/download', requireAuth, validate(bookIdParamsSchema, 'params'), ctrl.download);
router.get('/:id', validate(bookIdParamsSchema, 'params'), ctrl.detail);

module.exports = router;
