const mongoose = require("mongoose");

/*
  ─── PUSH SUBSCRIPTION ──────────────────────────────────────
  One document per browser/device a seller has enabled push
  notifications on. A seller can have several (phone, laptop,
  etc.) — each is a separate subscription the browser's Push
  API gives us when the seller grants permission.

  `endpoint` is unique because the browser generates a fresh
  one per subscription; re-subscribing the same device produces
  a new endpoint, so old/stale ones just stop being used rather
  than needing manual cleanup.
--------------------------------------------------------------*/
const pushSubscriptionSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.PushSubscription ||
  mongoose.model("PushSubscription", pushSubscriptionSchema);