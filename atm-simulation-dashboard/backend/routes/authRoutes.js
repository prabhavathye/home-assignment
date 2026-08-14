const express = require('express');
const rateLimit = require('express-rate-limit');
const { signup, loginStepPassword, loginStepPin, logout } = require('../controllers/authController');
const { requireAuth, requirePreAuth } = require('../middleware/auth');

const router = express.Router();

// Slow down brute-force attempts at the network level too
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: 'Too many login attempts from this device. Please try again later.' },
});

router.post('/signup', signup);
router.post('/login/password', loginLimiter, loginStepPassword);
router.post('/login/pin', loginLimiter, requirePreAuth, loginStepPin);
router.post('/logout', requireAuth, logout);

module.exports = router;
