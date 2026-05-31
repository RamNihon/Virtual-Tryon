const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const Seller = require("../models/seller");
const { sendPaymentSuccessEmail } = require("../config/email");
const { authMiddleware } = require("./seller");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan details
const PLANS = {
  starter: {
    amount: 199900, // ₹1,999 (paise mein)
    tryonLimit: 500,
    name: "Starter Plan",
  },
  pro: {
    amount: 499900, // ₹4,999
    tryonLimit: 999999,
    name: "Pro Plan",
  },
};

// Order create karo
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
      receipt: `order_${Date.now()}`,
      notes: {
        plan,
        sellerId: req.sellerId,
      },
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

// Payment verify karo
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;

    // Signature verify karo
    const crypto = require("crypto");
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

    // Plan upgrade karo
    await Seller.findByIdAndUpdate(req.sellerId, {
      plan: plan,
      tryonLimit: PLANS[plan].tryonLimit,
      tryonCount: 0, // Reset count
    });
    const updatedSeller = await Seller.findById(req.sellerId);
    await sendPaymentSuccessEmail(updatedSeller, plan);

    res.json({
      success: true,
      message: "Plan upgrade ho gaya! 🎉",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
