const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Menggunakan App Password
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📧 Attempting to send email to:", to);
    console.log("📧 Email subject:", subject);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("❌ Email configuration missing:");
      console.error(
        "- EMAIL_USER:",
        process.env.EMAIL_USER ? "Set" : "Not set"
      );
      console.error(
        "- EMAIL_PASS:",
        process.env.EMAIL_PASS ? "Set" : "Not set"
      );
      throw new Error(
        "Email configuration is missing. Please check your environment variables."
      );
    }

    const info = await transporter.sendMail({
      from: `"Poniran Kost Notifier" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
    console.log("📧 Response:", info.response);

    return info;
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error("- To:", to);
    console.error("- Subject:", subject);
    console.error("- Error:", error.message);
    console.error("- Stack:", error.stack);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Verify SMTP connection configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("❌ SMTP Connection Error:", error);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});

module.exports = { sendEmail };
