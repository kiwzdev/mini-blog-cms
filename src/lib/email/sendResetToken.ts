// lib/email.ts
import nodemailer from "nodemailer";

// Create transporter (configure based on your email service)
const createTransporter = () => {
  // For Gmail
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use App Password for Gmail
    },
  });
};

export const sendPasswordResetEmail = async (email: string, resetUrl: string) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@yourapp.com",
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Reset Your Password</h2>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          If you didn't request this, please ignore this email. This link will expire in 1 hour.
        </p>
        <p style="color: #666; font-size: 12px;">
          If the button doesn't work, copy and paste this URL into your browser:
          <br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// Alternative: Simple text email
export const sendPasswordResetEmailText = async (email: string, resetUrl: string) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || "noreply@yourapp.com",
    to: email,
    subject: "Reset Your Password",
    text: `
      You requested to reset your password. 
      
      Click the link below to reset it:
      ${resetUrl}
      
      If you didn't request this, please ignore this email. 
      This link will expire in 1 hour.
    `,
  };

  await transporter.sendMail(mailOptions);
};