// @route  GET /api/account/profile
const getProfile = async (req, res) => {
  res.json({ customer: req.customer.toSafeObject() });
};

module.exports = { getProfile };
