const express = require("express");
const router = express.Router();
const PushSubscription = require("../models/PushSubscription");
const { VAPID_PUBLIC_KEY } = require("../config/webpush");
const { authMiddleware } = require("./seller");

/*
  ─── PUSH SUBSCRIPTION ROUTES ───────────────────────────────
  Frontend flow:
    1. GET /vapid-public-key  → browser needs this to create a subscription
    2. Browser's Push API returns a subscription object
    3. POST /subscribe        → save it against the logged-in seller
    4. POST /unsubscribe      → remove it (e.g. seller disables notifications)

  Sending pushes happens elsewhere (triggered by order creation,
  low-credit checks, etc.) — this file only manages subscriptions.
--------------------------------------------------------------*/

router.get("/vapid-public-key", (req, res) => {
  if (!VAPID_PUBLIC_KEY) {
    return res.status(500).json({ message: "Push notifications not configured." });
  }
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

router.post("/subscribe", authMiddleware, async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ message: "Invalid subscription data." });
    }

    // Upsert: if this exact endpoint is already saved (e.g. the
    // seller re-enabled notifications on the same browser), just
    // make sure it's linked to their account rather than erroring
    // on the unique constraint.
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { seller: req.sellerId, endpoint, keys },
      { upsert: true, new: true },
    );

    res.json({ success: true, message: "Subscribed to notifications!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/unsubscribe", authMiddleware, async (req, res) => {
  try {
    const { endpoint } = req.body;
    if (endpoint) {
      await PushSubscription.deleteOne({ endpoint, seller: req.sellerId });
    } else {
      // No specific endpoint given — remove all of this seller's
      // subscriptions (e.g. a "turn off on all devices" action).
      await PushSubscription.deleteMany({ seller: req.sellerId });
    }
    res.json({ success: true, message: "Unsubscribed." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;