const jwt = require('jsonwebtoken');

// Short-lived token issued after password step; only lets the holder attempt the PIN step
const generatePreAuthToken = (customerId) => {
  return jwt.sign({ id: customerId, stage: 'pin' }, process.env.JWT_PREAUTH_SECRET, {
    expiresIn: process.env.PREAUTH_TOKEN_EXPIRY || '5m',
  });
};

// Full access token issued after PIN step succeeds
const generateAccessToken = (customerId) => {
  return jwt.sign({ id: customerId, stage: 'full' }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '1h',
  });
};

module.exports = { generatePreAuthToken, generateAccessToken };
