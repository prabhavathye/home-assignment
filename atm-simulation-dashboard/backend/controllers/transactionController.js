const { sequelize } = require('../config/db');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');

const DAILY_WITHDRAWAL_LIMIT = Number(process.env.DAILY_WITHDRAWAL_LIMIT || 50000);
const todayKey = () => new Date().toISOString().slice(0, 10);

const isPositiveAmount = (amount) => typeof amount === 'number' && isFinite(amount) && amount > 0;

// @route  POST /api/transactions/deposit
const deposit = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!isPositiveAmount(amount)) {
      return res.status(400).json({ message: 'Enter a valid deposit amount greater than 0.' });
    }

    const customer = req.customer;
    customer.balance += amount;
    await customer.save();

    const txn = await Transaction.create({
      customerId: customer.id,
      type: 'deposit',
      amount,
      balanceAfter: customer.balance,
      note: 'Cash deposit',
    });

    res.status(201).json({ message: 'Deposit successful.', balance: customer.balance, transaction: txn });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/transactions/withdraw
const withdraw = async (req, res, next) => {
  try {
    const amount = Number(req.body.amount);
    if (!isPositiveAmount(amount)) {
      return res.status(400).json({ message: 'Enter a valid withdrawal amount greater than 0.' });
    }

    const customer = req.customer;

    if (amount > customer.balance) {
      return res.status(400).json({ message: 'Insufficient funds for this withdrawal.' });
    }

    // Reset the daily counter if it's a new day
    if (customer.withdrawnOn !== todayKey()) {
      customer.withdrawnOn = todayKey();
      customer.withdrawnToday = 0;
    }

    if (customer.withdrawnToday + amount > DAILY_WITHDRAWAL_LIMIT) {
      const remaining = Math.max(DAILY_WITHDRAWAL_LIMIT - customer.withdrawnToday, 0);
      return res.status(400).json({
        message: `Daily withdrawal limit reached. You can withdraw up to ${remaining} more today.`,
      });
    }

    customer.balance -= amount;
    customer.withdrawnToday += amount;
    await customer.save();

    const txn = await Transaction.create({
      customerId: customer.id,
      type: 'withdraw',
      amount,
      balanceAfter: customer.balance,
      note: 'Cash withdrawal',
    });

    res.status(201).json({ message: 'Withdrawal successful.', balance: customer.balance, transaction: txn });
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/transactions/transfer
const transfer = async (req, res, next) => {
  const amount = Number(req.body.amount);
  const { toAccountNumber } = req.body;

  if (!isPositiveAmount(amount)) {
    return res.status(400).json({ message: 'Enter a valid transfer amount greater than 0.' });
  }
  if (!toAccountNumber || typeof toAccountNumber !== 'string') {
    return res.status(400).json({ message: 'Recipient account number is required.' });
  }

  const sender = req.customer;

  if (toAccountNumber === sender.accountNumber) {
    return res.status(400).json({ message: 'You cannot transfer funds to your own account.' });
  }
  if (amount > sender.balance) {
    return res.status(400).json({ message: 'Insufficient funds for this transfer.' });
  }

  try {
    // sequelize.transaction() rolls back every write inside the callback if
    // anything throws — sender's debit and recipient's credit either both
    // land or neither does.
    const outTxn = await sequelize.transaction(async (t) => {
      const recipient = await Customer.findOne({ where: { accountNumber: toAccountNumber }, transaction: t });
      if (!recipient) {
        const err = new Error('Recipient account not found.');
        err.statusCode = 404;
        throw err;
      }

      sender.balance -= amount;
      recipient.balance += amount;
      await sender.save({ transaction: t });
      await recipient.save({ transaction: t });

      const senderTxn = await Transaction.create(
        {
          customerId: sender.id,
          type: 'transfer-out',
          amount,
          balanceAfter: sender.balance,
          counterpartyAccount: recipient.accountNumber,
          note: `Transfer to ${recipient.accountNumber}`,
        },
        { transaction: t }
      );

      await Transaction.create(
        {
          customerId: recipient.id,
          type: 'transfer-in',
          amount,
          balanceAfter: recipient.balance,
          counterpartyAccount: sender.accountNumber,
          note: `Transfer from ${sender.accountNumber}`,
        },
        { transaction: t }
      );

      return senderTxn;
    });

    res.status(201).json({ message: 'Transfer successful.', balance: sender.balance, transaction: outTxn });
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/transactions/history
const history = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    const { rows: transactions, count: total } = await Transaction.findAndCountAll({
      where: { customerId: req.customer.id },
      order: [['createdAt', 'DESC']],
      offset: (page - 1) * limit,
      limit,
    });

    res.json({ transactions, page, totalPages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

module.exports = { deposit, withdraw, transfer, history };
