const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: 'ziadmohamed997@gmail.com',
        pass: 'unmx fzrp gklo zigo'
    }
});

const sendMail = (to, subject, text) => {
    const mailOptions = {
        from: 'ziadmohamed997@gmail.com',
        to: 'ahmedhossam1294@gmail.com',
        subject:'Response Email',
        text: 'Alooooooooo'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = { sendMail };
