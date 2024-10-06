const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const connection = require('./db');
require('dotenv').config();


// Function to send email using OAuth2 and Gmail for Google users, or regular SMTP for non-Google users
async function sendEmail(to, subject, htmlContent, userId) {
    try {
        // Get user's tokens from the database
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
                host: 'smtp.gmail.com', // or your SMTP host
                port: 587,
                secure: false, // use TLS
                auth: {
                    user: process.env.AUTH_MAIL_ADDRESS, // Your Gmail address or SMTP user
                    pass: process.env.AUTH_PASSWORD_MAIL,  // Your Gmail App Password
                },
            });

            const mailOptions = {
                from: process.env.AUTH_MAIL_ADDRESS, // Sender address
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

module.exports = {
    sendEmail
};
