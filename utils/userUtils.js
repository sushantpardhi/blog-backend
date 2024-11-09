import jwt from "jsonwebtoken";
import tokenModel from "../models/token.js";
import nodemailer from "nodemailer";

export const generateToken = (obj) =>
  jwt.sign({ id: obj._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

export const storeInCookie = async (res, token) => {
  await res.cookie("token", token, { httpOnly: true, secure: true });
};

export const manageTokenCount = async () => {
  try {
    const count = await tokenModel.countDocuments();
    if (count > 10) {
      const oldestToken = await tokenModel.findOne().sort({ createdAt: 1 });
      if (oldestToken) await tokenModel.deleteOne({ _id: oldestToken._id });
    }
  } catch (err) {
    console.error("Error managing token count:", err);
  }
};

export const sendResetTokenEmail = async (email, resetToken) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset",
    text: `You requested a password reset. Please use the following token to reset your password: ${resetToken}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) console.error("Error sending email:", error);
    else console.log("Email sent: " + info.response);
  });
};
