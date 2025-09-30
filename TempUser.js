const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tempSchema = new Schema({
  truId: String,
  firstName: String,
  lastName: String,
  email: { type: String, index: true },
  password: String,
  code: String,
  status: { type: String, default: 'pending' },
  flagged: { type: Boolean, default: false },
  reason: String,
  createdAt: { type: Date, default: Date.now, expires: 600 }
}, { collection: process.env.TEMP_COLLECTION || 'temp_users' });

module.exports = mongoose.model('TempUser', tempSchema);
