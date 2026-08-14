const express = require('express');
const { getProfile } = require('../controllers/accountController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/profile', requireAuth, getProfile);

module.exports = router;
