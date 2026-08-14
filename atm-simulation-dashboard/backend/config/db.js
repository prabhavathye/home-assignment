const path = require('path');
const { Sequelize } = require('sequelize');

const storagePath = process.env.SQLITE_STORAGE_PATH
  ? path.resolve(process.env.SQLITE_STORAGE_PATH)
  : path.join(__dirname, '..', 'data', 'atm_simulation.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: storagePath,
  logging: false,
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    // Creates tables on first run if they don't exist yet; safe to call on every boot.
    await sequelize.sync();
    console.log(`SQLite connected: ${storagePath}`);
  } catch (err) {
    console.error(`SQLite connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
