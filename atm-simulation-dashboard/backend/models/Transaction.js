const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');
const Customer = require('./Customer');

class Transaction extends Model {}

Transaction.init(
  {
    type: {
      type: DataTypes.ENUM('deposit', 'withdraw', 'transfer-out', 'transfer-in'),
      allowNull: false,
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    balanceAfter: { type: DataTypes.FLOAT, allowNull: false },
    counterpartyAccount: { type: DataTypes.STRING, allowNull: true, defaultValue: null },
    note: { type: DataTypes.STRING, allowNull: true, defaultValue: '' },
    status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'success' },
  },
  {
    sequelize,
    modelName: 'Transaction',
    tableName: 'transactions',
  }
);

// A customer has many transactions; each transaction belongs to one customer
Customer.hasMany(Transaction, { foreignKey: 'customerId', onDelete: 'CASCADE' });
Transaction.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Transaction;
