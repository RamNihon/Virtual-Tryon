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
    whatsapp: { type: Number, default: "" },
    googleId: { type: String },
    upiId: { type: String, default: "" },

    // ─── Yeh 2 naye fields add karo ───────────
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Seller || mongoose.model("Seller", sellerSchema);
