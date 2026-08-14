const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/db');

class Customer extends Model {
  isLocked() {
    return !!(this.lockUntil && new Date(this.lockUntil).getTime() > Date.now());
  }

  // Never leak sensitive fields in API responses
  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      accountNumber: this.accountNumber,
      balance: this.balance,
      createdAt: this.createdAt,
    };
  }
}

Customer.init(
  {
    name: { type: DataTypes.STRING, allowNull: false },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value) {
        this.setDataValue('email', value.toLowerCase().trim());
      },
    },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    pinHash: { type: DataTypes.STRING, allowNull: false },
    accountNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    balance: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },

    // Security / lockout tracking
    failedAttempts: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lockUntil: { type: DataTypes.DATE, allowNull: true, defaultValue: null },

    // Simple daily withdrawal tracking
    withdrawnToday: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    withdrawnOn: { type: DataTypes.STRING, allowNull: true, defaultValue: null }, // YYYY-MM-DD
  },
  {
    sequelize,
    modelName: 'Customer',
    tableName: 'customers',
  }
);

module.exports = Customer;
