const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const security1 = require('./security-bot1');
const security2 = require('./security-bot2');
const security3 = require('./security-bot3');
const code1 = require('./code-bot1');
const code2 = require('./code-bot2');
const code3 = require('./code-bot3');
const id1 = require('./id-bot1');
const id2 = require('./id-bot2');
const id3 = require('./id-bot3');
const temp1 = require('./tempdb-bot1');
const temp2 = require('./tempdb-bot2');
const temp3 = require('./tempdb-bot3');

const User = require('./User');
const TempUser = require('./TempUser');
const Counter = require('./Counter');

const app = express();
app.use(bodyParser.json());

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: process.env.DB_NAME || undefined });
    console.log('Worker: MongoDB connected');
  } catch (err) {
    console.error('Worker Mongo connect error', err);
    process.exit(1);
  }
}
connectDB();

// Process signup: run security bots -> save temp -> send code
app.post('/process-signup', async (req, res) => {
  try {
    const data = req.body;
    // run 3 security bots in parallel
    const results = await Promise.all([security1.check(data), security2.check(data), security3.check(data)]);
    const suspiciousCount = results.filter(r => r.suspicious).length;
    if (suspiciousCount >= 2) {
      // save flagged temp user for review
      await TempUser.create({ firstName: data.firstName, lastName: data.lastName, email: data.email, flagged: true, reason: results.filter(r=>r.suspicious).map(r=>r.reason).join(','), createdAt: new Date() });
      return res.status(403).json({ success: false, message: 'Blocked: suspected bot', reasons: results });
    }

    // Hash password and save temp user with code
    const hashed = await bcrypt.hash(data.password, 10);
    const code = Math.floor(100000 + Math.random()*900000).toString();
    const temp = new TempUser({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: hashed, code, status: 'pending', createdAt: new Date() });
    await temp.save();

    // send code using code bots (try each until success)
    const codeResults = await Promise.all([code1.sendCode(data.email, code), code2.sendCode(data.email, code), code3.sendCode(data.email, code)]);
    const sent = codeResults.find(r => r && r.ok);
    if (!sent) {
      return res.status(500).json({ success: false, message: 'Failed to send verification code' });
    }

    // return a temporary token to store in frontend while verifying (short expiry)
    const tempToken = jwt.sign({ email: data.email, type: 'temp' }, process.env.JWT_SECRET, { expiresIn: '15m' });
    return res.json({ success: true, message: 'Verification code sent', tempToken });
  } catch (err) {
    console.error('process-signup error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify code: check temp entry, generate ID via id bots, create permanent user, return permanent JWT
app.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ success: false, message: 'Email and code required' });

    const temp = await TempUser.findOne({ email, code, status: 'pending' });
    if (!temp) return res.status(400).json({ success: false, message: 'Invalid code or expired' });

    // generate ID using id bots (try all, take first success)
    const idResults = await Promise.all([id1.generate(), id2.generate(), id3.generate()]);
    const idRes = idResults.find(r => r && r.ok);
    if (!idRes) return res.status(500).json({ success: false, message: 'Failed to generate ID' });

    // create permanent user
    const newUser = new User({ truId: idRes.id, firstName: temp.firstName, lastName: temp.lastName, email: temp.email, password: temp.password, createdAt: new Date() });
    await newUser.save();

    // remove temp entry
    await TempUser.deleteOne({ _id: temp._id });

    // return permanent JWT (longer expiry)
    const token = jwt.sign({ id: newUser._id, truId: newUser.truId, email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '30d' });
    return res.json({ success: true, message: 'Signup complete', token, truId: newUser.truId });
  } catch (err) {
    console.error('verify-code error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/resend-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });
    const temp = await TempUser.findOne({ email, status: 'pending' });
    if (!temp) return res.status(404).json({ success: false, message: 'No pending signup for this email' });

    const code = Math.floor(100000 + Math.random()*900000).toString();
    temp.code = code;
    temp.createdAt = new Date();
    await temp.save();

    const resArr = await Promise.all([code1.sendCode(email, code), code2.sendCode(email, code), code3.sendCode(email, code)]);
    const sent = resArr.find(r => r && r.ok);
    if (!sent) return res.status(500).json({ success: false, message: 'Failed to resend code' });

    return res.json({ success: true, message: 'Code resent' });
  } catch (err) {
    console.error('resend-code error', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/', (req, res) => res.send('Worker Server running'));

const PORT = process.env.WORKER_PORT || 5000;
app.listen(PORT, () => console.log(`Worker Server running on port ${PORT}`));
