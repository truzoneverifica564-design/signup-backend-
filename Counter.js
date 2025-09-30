const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const counterSchema = new Schema({
  name: { type: String, unique: true },
  value: { type: Number, default: 0 }
}, { collection: process.env.COUNTER_COLLECTION || 'counters' });

module.exports = mongoose.model('Counter', counterSchema);
