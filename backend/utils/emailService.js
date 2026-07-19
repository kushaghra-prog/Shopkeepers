const nodemailer = require('nodemailer');

// Use ethereal test account for development
let transporter;

const initTransporter = async () => {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_USER) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
  } else {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
  }
};

const sendOrderNotification = async (to, orderDetails) => {
  try {
    if (!transporter) await initTransporter();
    const info = await transporter.sendMail({
      from: '"Shopkeepers" <noreply@shopkeepers.com>',
      to,
      subject: `New Order ${orderDetails.orderNumber}`,
      html: `<h2>New Order Received!</h2>
        <p><strong>Order:</strong> ${orderDetails.orderNumber}</p>
        <p><strong>Amount:</strong> ₹${orderDetails.totalAmount}</p>
        <p><strong>Items:</strong> ${orderDetails.items?.map(i => i.name).join(', ')}</p>`,
    });
    console.log('Email sent:', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log('Email error (non-fatal):', error.message);
  }
};

module.exports = { sendOrderNotification, initTransporter };
