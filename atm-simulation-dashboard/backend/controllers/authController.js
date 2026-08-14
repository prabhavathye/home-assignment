const bcrypt = require('bcryptjs');
const Customer = require('../models/Customer');
const generateAccountNumber = require('../utils/accountNumber');
const { generatePreAuthToken, generateAccessToken } = require('../utils/generateToken');
const { blacklistToken } = require('../utils/tokenBlacklist');

const MAX_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOCK_MINUTES = Number(process.env.LOCK_DURATION_MINUTES || 15);

const isValidPin = (pin) => /^\d{4}$/.test(pin);

// @route  POST /api/auth/signup
// @desc   Register a new customer
const signup = async (req, res, next) => {
  try {
    const { name, email, password, pin, confirmPin, initialDeposit } = req.body;

    if (!name || !email || !password || !pin) {
      return res.status(400).json({ message: 'Name, email, password and a 4-digit PIN are required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (!isValidPin(pin)) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits.' });
    }
    if (confirmPin && confirmPin !== pin) {
      return res.status(400).json({ message: 'PIN and confirmation do not match.' });
    }

    const existing = await Customer.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists. Please log in instead.' });
    }

    const deposit = Number(initialDeposit) || 0;
    if (deposit < 0) {
      return res.status(400).json({ message: 'Initial deposit cannot be negative.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const pinHash = await bcrypt.hash(pin, 10);
    const accountNumber = await generateAccountNumber();

    const customer = await Customer.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      pinHash,
      accountNumber,
      balance: deposit,
    });

    res.status(201).json({
      message: 'Account created successfully. You can now log in.',
      accountNumber: customer.accountNumber,
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login/password
// @desc   Step 1 of login — verify email + password, issue pre-auth token
const loginStepPassword = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const customer = await Customer.findOne({ where: { email: email.toLowerCase() } });

    // Use a generic message so we don't reveal whether the email exists
    const genericFail = () => res.status(401).json({ message: 'Invalid email or password.' });

    if (!customer) return genericFail();

    if (customer.isLocked()) {
      const minutesLeft = Math.ceil((customer.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account temporarily locked due to repeated failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const match = await bcrypt.compare(password, customer.passwordHash);
    if (!match) {
      customer.failedAttempts += 1;
      if (customer.failedAttempts >= MAX_ATTEMPTS) {
        customer.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        customer.failedAttempts = 0;
        await customer.save();
        return res.status(423).json({
          message: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`,
        });
      }
      await customer.save();
      return genericFail();
    }

    // Password correct — do not reset failedAttempts yet, PIN step still required
    const preAuthToken = generatePreAuthToken(customer.id);

    res.json({
      message: 'Password verified. Enter your 4-digit PIN to continue.',
      preAuthToken,
      maskedAccount: `**** **** ${customer.accountNumber.slice(-4)}`,
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/login/pin
// @desc   Step 2 of login — verify PIN using pre-auth token, issue full access token
const loginStepPin = async (req, res, next) => {
  try {
    const { pin } = req.body;
    if (!isValidPin(pin || '')) {
      return res.status(400).json({ message: 'PIN must be exactly 4 digits.' });
    }

    const customer = await Customer.findByPk(req.preAuthCustomerId);
    if (!customer) {
      return res.status(401).json({ message: 'Account no longer exists.' });
    }

    if (customer.isLocked()) {
      const minutesLeft = Math.ceil((customer.lockUntil - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account temporarily locked. Try again in ${minutesLeft} minute(s).`,
      });
    }

    const match = await bcrypt.compare(pin, customer.pinHash);
    if (!match) {
      customer.failedAttempts += 1;
      if (customer.failedAttempts >= MAX_ATTEMPTS) {
        customer.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
        customer.failedAttempts = 0;
        await customer.save();
        return res.status(423).json({
          message: `Too many failed attempts. Account locked for ${LOCK_MINUTES} minutes.`,
        });
      }
      await customer.save();
      return res.status(401).json({ message: 'Incorrect PIN.' });
    }

    // Success — clear lockout counters and issue full session token
    customer.failedAttempts = 0;
    customer.lockUntil = null;
    await customer.save();

    const accessToken = generateAccessToken(customer.id);

    res.json({
      message: 'Login successful.',
      accessToken,
      customer: customer.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/auth/logout
const logout = async (req, res) => {
  if (req.token) blacklistToken(req.token);
  res.json({ message: 'Logged out successfully.' });
};

module.exports = { signup, loginStepPassword, loginStepPin, logout };
