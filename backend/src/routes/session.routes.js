const router = require('express').Router();
const ctrl = require('../controllers/session.controller');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const {
  startSchema,
  sessionIdSchema,
  progressSchema,
  bookIdParamsSchema,
} = require('../validators/session.validator');

router.use(requireAuth);

router.post('/',           validate(startSchema), ctrl.start);
router.post('/:id/pause',  validate(sessionIdSchema, 'params'), ctrl.pause);
router.post('/:id/resume', validate(sessionIdSchema, 'params'), ctrl.resume);
router.post('/:id/finish', validate(sessionIdSchema, 'params'), ctrl.finish);
router.post('/:id/heartbeat', validate(sessionIdSchema, 'params'), ctrl.heartbeat);
router.get('/history',     ctrl.history);

router.post('/progress', validate(progressSchema), ctrl.saveProgress);
router.get(
  '/progress/:bookId',
  validate(bookIdParamsSchema, 'params'),
  ctrl.getProgress,
);

module.exports = router;
