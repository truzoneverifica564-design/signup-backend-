const { sendMail } = require('./mailer');

module.exports.sendCode = async function(email, code) {
  try {
    // small random delay to simulate different bots
    await new Promise(r => setTimeout(r, Math.floor(Math.random()*200)));
    await sendMail(email, code);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
};
