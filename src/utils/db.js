const mongoose = require('mongoose');
require('dotenv').config();

const {
  MONGODB_HOST,
  MONGODB_PORT,
  MONGODB_USER,
  MONGODB_PASS,
  MONGODB_DB,
} = process.env;

let mongoUri = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}`;
if (MONGODB_USER && MONGODB_PASS) {
  mongoUri = `mongodb://${encodeURIComponent(MONGODB_USER)}:${encodeURIComponent(MONGODB_PASS)}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}?authSource=admin`;
}

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
