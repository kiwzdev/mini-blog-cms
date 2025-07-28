import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Use App Password for Gmail
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "ยืนยันอีเมลของคุณ - To-Do App",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ยืนยันอีเมลของคุณ</h2>
        <p>สวัสดี,</p>
        <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #007bff; color: white; padding: 12px 30px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            ยืนยันอีเมล
          </a>
        </div>
        <p>หรือคัดลอกลิงก์นี้ไปที่เบราว์เซอร์:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>ลิงก์นี้จะหมดอายุภายใน 24 ชั่วโมง</p>
        <p>หากคุณไม่ได้สมัครสมาชิก กรุณาเพิกเฉยอีเมลนี้</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
