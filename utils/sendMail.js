import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const transporterConfig = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
}

export function sendMailOTP(address, otp, transporter) {
  // Create a Nodemailer transporter using the provided transporter object
  const mailTransporter = nodemailer.createTransport(transporter);

  // HTML content for the OTP email
  const htmlContent = `
    <h1>Your OTP Code</h1>
    <p>Your one-time password (OTP) is: <strong>${otp}</strong></p>
    <p>Please use this code to verify your identity.</p>
  `;

  // Mail options
  const mailOptions = {
    from: transporter.auth.user, // Sender email address
    to: address, // Receiver email address
    subject: 'OTP Verification - JDGreenz', // Email subject
    html: htmlContent, // HTML content for the email body
  };
  console.log(transporter);
  // Send the email
  mailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP email:', error);
    } else {
      console.log('OTP email sent:', info.response);
    }
  });
}

export function sendMagicLink(address, magicLink, transporter) {
  // Create a Nodemailer transporter using the provided transporter object
  const mailTransporter = nodemailer.createTransport(transporter);

  // HTML content for the OTP email
  const htmlContent = `
    <h1>Your forget password link.</h1>
    <p>Your forget password link is: <strong><a href="${magicLink}">Click me</a></strong></p>
  `;

  // Mail options
  const mailOptions = {
    from: transporter.auth.user, // Sender email address
    to: address, // Receiver email address
    subject: 'Magic Link - JDGreenz', // Email subject
    html: htmlContent, // HTML content for the email body
  };

  // Send the email
  mailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending OTP email:', error);
    } else {
      console.log('OTP email sent:', info.response);
    }
  });
}

export { transporterConfig };

// Example usage:

// Replace the following with your actual email configuration


// Replace 'user@example.com' with the recipient's email address
// Replace '123456' with the generated OTP code
// sendMailOTP('user@example.com', '123456', transporterConfig);
