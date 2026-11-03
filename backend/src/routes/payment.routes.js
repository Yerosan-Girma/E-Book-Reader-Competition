const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { requireAuth } = require('../middleware/auth');

router.get('/check-access/:bookId', requireAuth, ctrl.checkAccess);
router.post('/chapa/initialize', requireAuth, ctrl.initializeChapa);
router.post('/chapa/verify', requireAuth, ctrl.verifyChapa);
router.get('/my-purchases', requireAuth, ctrl.myPurchases);

module.exports = router;
