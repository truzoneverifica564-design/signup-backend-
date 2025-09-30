const Counter = require('./Counter');

async function nextId() {
  const res = await Counter.findOneAndUpdate(
    { name: 'truzoneId' },
    { $inc: { value: 1 } },
    { new: true, upsert: true }
  );
  const n = res.value;
  return 'Tru' + String(n).padStart(9, '0');
}

module.exports = { nextId };
