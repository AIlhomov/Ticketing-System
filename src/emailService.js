const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const connection = require('./db');
require('dotenv').config();


// Function to send email using OAuth2 and Gmail for Google users, or regular SMTP for non-Google users
async function sendEmail(to, subject, htmlContent, userId) {
    try {
        const query = 'SELECT google_access_token, google_refresh_token, email FROM users WHERE id = ?';
        const [user] = await new Promise((resolve, reject) => {
            connection.query(query, [userId], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        if (user && user.google_access_token && user.google_refresh_token) {
            // If Google OAuth tokens are available, send email via Google OAuth2
            const oAuth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );
            oAuth2Client.setCredentials({
                access_token: user.google_access_token,
                refresh_token: user.google_refresh_token
            });

            const accessToken = await oAuth2Client.getAccessToken();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.AUTH_MAIL_ADDRESS,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: user.google_refresh_token,
                    accessToken: accessToken.token
                }
            });

            const mailOptions = {
                from: process.env.AUTH_MAIL_ADDRESS,
                to: to,
                subject: subject,
                html: htmlContent
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent via Gmail OAuth2:', result);

        } else {
            // If no OAuth tokens, fallback to SMTP
            console.log('User does not have Google OAuth tokens, sending via regular SMTP');
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: {
                    user: process.env.AUTH_MAIL_ADDRESS,
                    pass: process.env.AUTH_PASSWORD_MAIL,
                },
            });

            const mailOptions = {
                from: process.env.AUTH_MAIL_ADDRESS,
                to: to,
                subject: subject,
                html: htmlContent
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Email sent via regular SMTP:', result);
        }

    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Function to send password reset email
async function sendPasswordResetEmail(to, token) {
    const resetLink = `http://${process.env.HOST}/reset-password/${token}`;
    const subject = 'Password Reset Request';
    const htmlContent = `
        <h1>Password Reset</h1>
        <p>You requested a password reset for your account. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
    `;

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.AUTH_MAIL_ADDRESS,
                pass: process.env.AUTH_PASSWORD_MAIL,
            },
        });

        const mailOptions = {
            from: process.env.AUTH_MAIL_ADDRESS,
            to: to,
            subject: subject,
            html: htmlContent,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent via regular SMTP:', result);

    } catch (error) {
        console.error('Error sending password reset email:', error);
    }
}


module.exports = {
    sendEmail,
    sendPasswordResetEmail
};
