const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendMail(to, code) {
    const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject: 'Truzone Verification Code',
        text: `Your Truzone verification code is: ${code}`
    });
    return info;
}

module.exports = { sendMail };
