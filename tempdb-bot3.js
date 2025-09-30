const TempUser = require('./TempUser');
const User = require('./User');

module.exports.saveTemp = async function(userData) {
  try {
    const temp = new TempUser(Object.assign({}, userData, { savedAt: new Date() }));
    await temp.save();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
};

module.exports.moveToPermanent = async function(email, truId) {
  try {
    const temp = await TempUser.findOne({ email });
    if (!temp) return { ok: false, message: 'temp not found' };
    const existing = await User.findOne({ email });
    if (existing) return { ok: false, message: 'already exists' };
    const user = new User({
      truId,
      firstName: temp.firstName,
      lastName: temp.lastName,
      email: temp.email,
      password: temp.password,
      createdAt: new Date()
    });
    await user.save();
    await TempUser.deleteOne({ _id: temp._id });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message || String(err) };
  }
};
