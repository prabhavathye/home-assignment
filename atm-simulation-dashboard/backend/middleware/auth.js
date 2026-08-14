const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { isTokenBlacklisted } = require('../utils/tokenBlacklist');

// Requires a full access token (issued only after both password + PIN steps)
const requireAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing.' });
    }

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: 'Session has been logged out. Please log in again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    if (decoded.stage !== 'full') {
      return res.status(401).json({ message: 'Two-factor login not completed.' });
    }

    const customer = await Customer.findByPk(decoded.id);
    if (!customer) {
      return res.status(401).json({ message: 'Account no longer exists.' });
    }

    req.customer = customer;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please log in again.' });
  }
};

// Requires the short-lived pre-auth token (issued after password step only)
const requirePreAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: 'Pre-authentication token missing. Please log in again.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_PREAUTH_SECRET);

    if (decoded.stage !== 'pin') {
      return res.status(401).json({ message: 'Invalid login stage.' });
    }

    req.preAuthCustomerId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Login session expired. Please start over.' });
  }
};

module.exports = { requireAuth, requirePreAuth };
