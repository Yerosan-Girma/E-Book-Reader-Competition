const router = require('express').Router();
const ctrl = require('../controllers/user.controller');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { changePasswordSchema, updateProfileSchema } = require('../validators/user.validator');

router.use(requireAuth);

router.get('/profile', ctrl.getProfile);
router.put('/profile', validate(updateProfileSchema), ctrl.updateProfile);
router.put('/password', validate(changePasswordSchema), ctrl.changePassword);
router.get('/uploaded-books', ctrl.getUploadedBooks);

module.exports = router;
