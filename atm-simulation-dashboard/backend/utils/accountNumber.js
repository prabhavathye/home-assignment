const Customer = require('../models/Customer');

// Generates a unique 10-digit account number, e.g. 4821093456
const generateAccountNumber = async () => {
  let accountNumber;
  let exists = true;

  while (exists) {
    accountNumber = String(Math.floor(1000000000 + Math.random() * 9000000000));
    const count = await Customer.count({ where: { accountNumber } });
    exists = count > 0;
  }

  return accountNumber;
};

module.exports = generateAccountNumber;
