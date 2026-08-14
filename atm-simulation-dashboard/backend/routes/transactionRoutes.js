const express = require('express');
const { deposit, withdraw, transfer, history } = require('../controllers/transactionController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);
router.post('/deposit', deposit);
router.post('/withdraw', withdraw);
router.post('/transfer', transfer);
router.get('/history', history);

module.exports = router;
