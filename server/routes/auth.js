const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Seller = require("../models/seller");
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const {
  sendWelcomeEmail,
  sendResetPasswordEmail,
  sendEmail,
} = require("../config/email");

/*
  ─── SIMPLE RATE LIMITER (no external package) ──────────────
  Prevents forgot-password spam (repeatedly triggering reset
  emails to the same address, or hammering the endpoint from one
  IP). Keyed by IP + email together so it can't be used to lock
  a specific seller out of requesting their own reset — only
  the same (attacker IP, target email) pair gets throttled.

  In-memory is fine for a single-instance deployment; if this
  app ever runs multiple server instances behind a load balancer,
  this would need to move to Redis or similar shared storage —
  worth remembering if that becomes the deployment setup later.
--------------------------------------------------------------*/
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX = 3; // 3 requests per window

function isRateLimited(key) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(key, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

// Periodic cleanup so this Map doesn't grow unbounded over the
// server's lifetime — old entries are harmless but pointless to keep.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.delete(key);
      }
    }
  },
  30 * 60 * 1000,
).unref();

// ─── Forgot Password ──────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Enter email!",
      });
    }

    const rateLimitKey = `${req.ip}:${email.toLowerCase()}`;
    if (isRateLimited(rateLimitKey)) {
      // Same generic message as the "not found" case below — no
      // reason to reveal that rate limiting specifically triggered,
      // that's an implementation detail an attacker doesn't need.
      return res.status(429).json({
        success: true,
        message: "If the email is registered, a reset link will be sent!",
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
    await sendResetPasswordEmail(seller, resetUrl).catch((err) => {
      console.log("Email send error:", err.message);
    });
  } catch (error) {
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

    // Admin ko email bhejo (Using your official working Brevo helper)
    console.log("📨 Sending contact us mail using email.js helper...");

    const adminHtml = `
      <div style="font-family: Arial, sans-serif; padding: 25px; color: #333; background: #f9f9f9; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea;">
        <h2 style="color: #7C3AED; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">
          📩 New Contact Form Submission
        </h2>
        <p style="margin: 10px 0;"><strong style="color: #4b5563;">Name:</strong> ${name}</p>
        <p style="margin: 10px 0;"><strong style="color: #4b5563;">Email:</strong> ${email}</p>
        <p style="margin: 10px 0;"><strong style="color: #4b5563;">Subject:</strong> ${subject}</p>
        <div style="margin-top: 20px; background: white; padding: 15px; border-radius: 12px; border-left: 4px solid #7C3AED; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <p style="margin: 0; font-weight: bold; color: #1f2937; margin-bottom: 8px;">Message:</p>
          <p style="margin: 0; color: #6b7280; line-height: 1.6; font-size: 14px;">${message}</p>
        </div>
      </div>
    `;

    // Calls the shared email helper — sends straight to the
    // admin inbox (EMAIL_USER)
    await sendEmail(
      process.env.EMAIL_USER,
      `📩 Contact Form: ${subject} - ${name}`,
      adminHtml,
    );

    res.json({
      success: true,
      message: "Message Received!",
    });
  } catch (error) {
    console.error("❌ Auth Contact Mail Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

// Google Login Routes:

// Google par redirect karo
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// Google callback
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user, info) => {
      if (err || !user) {
        // info.message comes from the specific done(null, false, {...})
        // case in passport.js (e.g. "email already registered without
        // Google"), so the frontend can show that instead of a generic
        // failure. Falls back to the old generic error if none given.
        const reason = info?.message
          ? encodeURIComponent(info.message)
          : "google_failed";
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=${reason}`,
        );
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  async (req, res) => {
    try {
      // JWT token banao
      const token = jwt.sign(
        { sellerId: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" },
      );

      // Seller data — matches the credit-based system (see
      // models/seller.js). The previous version sent
      // tryonCount/tryonLimit here; tryonLimit was never actually
      // a field on the schema at all, so Google-login sellers were
      // always getting `tryonLimit: undefined` in this response,
      // while sellers who registered/logged in normally via
      // /api/seller routes got the correct credits-based fields.
      const sellerData = {
        name: req.user.name,
        email: req.user.email,
        sellerId: req.user.sellerId,
        apiKey: req.user.apiKey,
        plan: req.user.plan,
        credits: req.user.credits,
        monthlyCreditsUsed: req.user.monthlyCreditsUsed,
        monthlyCreditsLimit: req.user.monthlyCreditsLimit,
      };

      // Frontend par redirect karo
      // Token URL mein pass karo
      const redirectUrl = `${process.env.FRONTEND_URL}/auth/google/success?token=${token}&seller=${encodeURIComponent(JSON.stringify(sellerData))}`;

      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
    }
  },
);

module.exports = router;