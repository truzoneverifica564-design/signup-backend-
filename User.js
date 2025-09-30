const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  truId: { type: String, unique: true, index: true },
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, index: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
}, { collection: process.env.USERS_COLLECTION || 'users' });

module.exports = mongoose.model('User', userSchema);
