const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBookingConfirmation = async (toEmail, userName, roomName, startTime, endTime) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Booking Confirmation - Refraction RRMP',
      html: `
        <h2>Booking Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Your reservation has been confirmed:</p>
        <ul>
          <li><strong>Room:</strong> ${roomName}</li>
          <li><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</li>
          <li><strong>End:</strong> ${new Date(endTime).toLocaleString()}</li>
        </ul>
        <p>Thank you for using Refraction RRMP!</p>
      `
    });
    console.log('Confirmation email sent to', toEmail);
  } catch (err) {
    console.error('Email error:', err);
  }
};

const sendCancellationConfirmation = async (toEmail, userName, roomName, startTime) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Booking Cancellation - Refraction RRMP',
      html: `
        <h2>Booking Cancelled</h2>
        <p>Hi ${userName},</p>
        <p>Your reservation has been cancelled:</p>
        <ul>
          <li><strong>Room:</strong> ${roomName}</li>
          <li><strong>Start:</strong> ${new Date(startTime).toLocaleString()}</li>
        </ul>
        <p>Your hours have been returned to your company balance.</p>
      `
    });
    console.log('Cancellation email sent to', toEmail);
  } catch (err) {
    console.error('Email error:', err);
  }
};

module.exports = { sendBookingConfirmation, sendCancellationConfirmation };