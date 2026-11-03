const router = require('express').Router();
const ctrl = require('../controllers/dashboard.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, ctrl.get);
module.exports = router;