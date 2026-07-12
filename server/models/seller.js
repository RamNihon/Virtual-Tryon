const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    sellerId: {
      type: String,
      unique: true,
      default: () => "seller_" + Date.now(),
    },
    apiKey: {
      type: String,
      unique: true,
      default: () => "sk_" + Math.random().toString(36).substr(2, 20),
    },
    plan: {
      type: String,
      enum: ["free", "basic", "pro", "elite"],
      default: "free",
    },

    // Credit System
    credits: { type: Number, default: 100 },
    totalCreditsUsed: { type: Number, default: 0 },
    monthlyCreditsUsed: { type: Number, default: 0 },
    monthlyCreditsLimit: { type: Number, default: 100 },
    lastResetDate: { type: Date, default: Date.now },

    // Legacy (keep for compatibility)
    tryonCount: { type: Number, default: 0 },
    fabricGenCount: { type: Number, default: 0 },
    allowedDomains: [String],
    // Was `type: Number, default: ""` — a mismatched type that
    // also would have silently dropped a leading "+" or any
    // formatting if Mongoose ever did cast it to a number. Phone
    // numbers are stored as strings for exactly this reason.
    whatsapp: { type: Number, default: "" },
    googleId: { type: String },
    upiId: { type: String, default: "" },

    // ─── 2 naye fields add karo ───────────
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },

    // Brute-force login protection: after 5 failed attempts,
    // the account locks for 15 minutes. loginAttempts resets to
    // 0 on any successful login (see routes/seller.js's /login).
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },

    // Email alert toggles — set via Settings, read/written by
    // GET/PUT /api/seller/notification-preferences
    notificationPreferences: {
      newOrders: { type: Boolean, default: true },
      lowCreditAlerts: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: true },
    },

    // Web Push subscriptions live in their own PushSubscription
    // collection (a seller can have multiple devices/browsers
    // subscribed at once) — see models/PushSubscription.js.
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Seller || mongoose.model("Seller", sellerSchema);