const nodeMailer = require("nodemailer");

const sendEmail = async(options) => {
    const transporter = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        // host: "smtp.gmail.com",
        // port:465,
        // service: process.env.SMTP_SERVICE,
        auth: {
            user: "54e360541bbde3",
            pass: "dcb3f82d782e27"
            // user: process.env.SMPT_MAIL,
            // pass: process.env.SMPT_PASS
        }
    });

    const mailOptions = {
        from: process.env.SMPT_MAIL,
        to: options.email,
        subject:options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;