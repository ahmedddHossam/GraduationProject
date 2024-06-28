const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables from .env file

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS,
    },
});

module.exports = transporter;