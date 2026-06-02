const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Seller = require("../models/seller");
const passport = require('../config/passport')
const jwt = require('jsonwebtoken')
const { sendWelcomeEmail, sendResetPasswordEmail } = require("../config/email");


// ─── Forgot Password ──────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Enter email!",
      });
    }

    // Seller dhundo
    const seller = await Seller.findOne({ email });

    // Security: Email mile ya na mile
    // Same response do
    // (Taki koi guess na kar sake)
    if (!seller) {
      return res.json({
        success: true,
        message: "If the email is registered, a reset link will be sent!",
      });
    }

    // Reset token banao
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token hash karke save karo
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // 1 ghante ki expiry
    const expiry = new Date(Date.now() + 60 * 60 * 1000);

    await Seller.findByIdAndUpdate(seller._id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: expiry,
    });

     res.json({
      success: true,
      message: "Reset link has been sent to your gmail!",
    });

    // Reset URL banao
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Email bhejo
    await sendResetPasswordEmail(seller, resetUrl).catch(err => {
      console.log('Email send error:', err.message)
    })

   
  }
   catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
});

// ─── Reset Password ───────────────────────
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long!",
      });
    }

    // Token hash karo
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Seller dhundo valid token se
    const seller = await Seller.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!seller) {
      return res.status(400).json({
        message: "The reset link is expired or invalid! Please try again.",
      });
    }

    // Naya password save karo
    const hashedPassword = await bcrypt.hash(password, 10);

    await Seller.findByIdAndUpdate(seller._id, {
      password: hashedPassword,
      resetPasswordToken: undefined,
      resetPasswordExpiry: undefined,
    });

    res.json({
      success: true,
      message: "Password reset successfully! Log in now.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/contact", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        message: "All are fields required!",
      });
    }

    // Admin ko email bhejo
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER,
      subject: `📩 Contact Form: ${subject} - ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    });

    res.json({
      success: true,
      message: "Message Received!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google Login Routes:

// Google par redirect karo
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

// Google callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed`
  }),
  async (req, res) => {
    try {
      // JWT token banao
      const token = jwt.sign(
        { sellerId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Seller data
      const sellerData = {
        name: req.user.name,
        email: req.user.email,
        sellerId: req.user.sellerId,
        apiKey: req.user.apiKey,
        plan: req.user.plan,
        tryonCount: req.user.tryonCount,
        tryonLimit: req.user.tryonLimit
      }

      // Frontend par redirect karo
      // Token URL mein pass karo
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/success?token=${token}&seller=${encodeURIComponent(JSON.stringify(sellerData))}`

      res.redirect(redirectUrl)

    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`)
    }
  }
)

module.exports = router;
