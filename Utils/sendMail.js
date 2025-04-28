import nodemailer from 'nodemailer';
import crypto from 'crypto';

export const sendEmail = async (to, subject) => {
    const confirmationCode = crypto.randomInt(10000, 99999);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text: `Your confirmation code is: ${confirmationCode}`,
    };

    await transporter.sendMail(mailOptions);

    return confirmationCode; // return it so the controller can save it
};
