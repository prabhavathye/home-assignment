// In-memory blacklist for logged-out access tokens.
// This is sufficient for a simulation; a production system would use
// Redis (or short-lived tokens + refresh rotation) instead.
const blacklist = new Set();

const blacklistToken = (token) => blacklist.add(token);
const isTokenBlacklisted = (token) => blacklist.has(token);

module.exports = { blacklistToken, isTokenBlacklisted };
