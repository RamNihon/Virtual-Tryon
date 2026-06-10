const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");
const Seller = require("../models/seller");
const { authMiddleware } = require("./seller");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Plans ────────────────────────────────
const PLANS = {
  basic: {
    amount: 99900, // ₹999
    credits: 1500,
    monthlyCreditsLimit: 1500,
    name: "Basic Plan",
    description: "1500 credits = ~150 try-ons",
  },
  pro: {
    amount: 249900, // ₹2,499
    credits: 3000,
    monthlyCreditsLimit: 3000,
    name: "Pro Plan",
    description: "5000 credits = fabric shop + try-ons",
  },
  elite: {
    amount: 499900, // ₹4,999
    credits: 10000,
    monthlyCreditsLimit: 10000,
    name: "Elite Plan",
    description: "12000 credits = everything unlimited",
  },
};

// ─── Top-Up Packs ─────────────────────────
const TOPUP_PACKS = {
  mini: {
    amount: 14900, // ₹149
    credits: 200,
    name: "Mini Pack",
    description: "~20 try-ons",
  },
  starter: {
    amount: 29900, // ₹299
    credits: 450,
    name: "Starter Pack",
    description: "~45 try-ons",
  },
  growth: {
    amount: 59900, // ₹599
    credits: 1000,
    name: "Growth Pack",
    description: "~100 try-ons",
  },
  power: {
    amount: 99900, // ₹999
    credits: 1800,
    name: "Power Pack",
    description: "~180 try-ons",
  },
  mega: {
    amount: 199900, // ₹1,999
    credits: 4000,
    name: "Mega Pack",
    description: "~400 try-ons",
  },
};

// ─── Plan Order Create ────────────────────
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body;
    if (!PLANS[plan]) {
      return res.status(400).json({
        message: "Invalid plan!",
      });
    }

    const order = await razorpay.orders.create({
      amount: PLANS[plan].amount,
      currency: "INR",
      receipt: `plan_${Date.now()}`,
      notes: { plan, sellerId: req.sellerId.toString() },
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: PLANS[plan].amount,
      planName: PLANS[plan].name,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Plan Payment Verify ──────────────────
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verify nahi hua!",
      });
    }

    await Seller.findByIdAndUpdate(req.sellerId, {
      plan,
      $inc: { credits: PLANS[plan].credits },
      monthlyCreditsLimit: PLANS[plan].monthlyCreditsLimit,
      monthlyCreditsUsed: 0,
      tryonLimit: 999999, // Legacy
    });

    res.json({
      success: true,
      message: `${PLANS[plan].name} activate ho gaya! 🎉`,
      creditsAdded: PLANS[plan].credits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Top-Up Order Create ──────────────────
router.post("/topup-order", authMiddleware, async (req, res) => {
  try {
    const { pack } = req.body;
    if (!TOPUP_PACKS[pack]) {
      return res.status(400).json({
        message: "Invalid pack!",
      });
    }

    const order = await razorpay.orders.create({
      amount: TOPUP_PACKS[pack].amount,
      currency: "INR",
      receipt: `topup_${Date.now()}`,
    });

    res.json({
      success: true,
      orderId: order.id,
      amount: TOPUP_PACKS[pack].amount,
      packName: TOPUP_PACKS[pack].name,
      credits: TOPUP_PACKS[pack].credits,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Top-Up Verify ────────────────────────
router.post("/topup-verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, pack } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verify nahi hua!",
      });
    }

    const seller = await Seller.findByIdAndUpdate(
      req.sellerId,
      { $inc: { credits: TOPUP_PACKS[pack].credits } },
      { new: true },
    );

    res.json({
      success: true,
      message: `${TOPUP_PACKS[pack].credits} credits add ho gaye! 🎉`,
      newBalance: seller.credits,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
