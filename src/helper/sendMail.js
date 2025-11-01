const nodemailer = require("nodemailer");

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.titan.email",
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

const sendMail = async (email, subject, text, html) => {
  const info = await transporter.sendMail({
    from: "Developing SMTP <test@nextstopmorocco.ch>",
    to: email,
    subject,
    text, // plain‑text body
    html, // HTML body
  });

  console.log("Message sent:", info.messageId);
};

module.exports = sendMail;
