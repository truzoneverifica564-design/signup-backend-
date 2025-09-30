const Counter = require('./Counter');

module.exports.generate = async function() {
  try {
    const res = await Counter.findOneAndUpdate(
      { name: 'truzoneId' },
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );
    const n = res.value;
    const id = 'Tru' + String(n).padStart(9, '0');
    // simulate slight delay
    await new Promise(r => setTimeout(r, Math.floor(Math.random()*150)));
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
};
