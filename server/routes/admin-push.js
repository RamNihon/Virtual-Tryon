const express = require("express");
const router = express.Router();
const Seller = require("../models/seller");
const { sendPushToSeller } = require("../config/webpush");

/*
  ─── ADMIN PUSH ROUTES ──────────────────────────────────────
  Not tied to seller auth at all — this is you, not a seller.
  Protected by a single shared secret (ADMIN_SECRET in .env)
  sent as a header, checked before every route below.

  This is intentionally simple (no separate admin user system,
  no login flow) since it's a single-operator tool. If this ever
  needs to be used by more than just you, it should graduate to
  a real admin-user model with its own login — not extend this
  header-secret approach.
--------------------------------------------------------------*/

const adminAuth = (req, res, next) => {
  const secret = req.headers["x-admin-secret"];
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ message: "Unauthorized." });
  }
  next();
};

// List sellers to pick who to send to — minimal fields only,
// this is a targeting tool, not a full seller directory.
router.get("/sellers", adminAuth, async (req, res) => {
  try {
    const sellers = await Seller.find({})
      .select("name email plan credits createdAt")
      .sort({ createdAt: -1 });
    res.json({ success: true, sellers });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/*
  Send a push to a specific list of sellers, or to a plan-based
  segment (e.g. "all free-plan sellers"), or to everyone.
  Body shape:
    {
      title, body, url,
      target: "all" | "plan" | "selected",
      plan: "free" | "basic" | "pro" | "elite",   // when target === "plan"
      sellerIds: ["..."]                           // when target === "selected"
    }
*/
router.post("/send-push", adminAuth, async (req, res) => {
  try {
    const { title, body, url, target, plan, sellerIds } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: "Title and body are required." });
    }

    let query = {};
    if (target === "plan" && plan) {
      query = { plan };
    } else if (target === "selected" && Array.isArray(sellerIds) && sellerIds.length > 0) {
      query = { _id: { $in: sellerIds } };
    }
    // target === "all" leaves query as {} — everyone.

    const sellers = await Seller.find(query).select("_id");

    if (sellers.length === 0) {
      return res.status(400).json({ message: "No sellers matched this target." });
    }

    const payload = {
      title,
      body,
      url: url || "/dashboard",
      tag: "promotional",
    };

    const results = await Promise.all(
      sellers.map((s) => sendPushToSeller(s._id, payload)),
    );

    const successCount = results.flat().filter((r) => r.success).length;

    res.json({
      success: true,
      message: `Sent to ${sellers.length} seller(s), ${successCount} device(s) reached.`,
      sellersTargeted: sellers.length,
      devicesReached: successCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;