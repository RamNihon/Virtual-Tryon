const mongoose = require("mongoose");

const creditTransactionSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    type: {
      type: String,
      enum: ["debit", "credit"],
      required: true,
    },
    action: {
      type: String,
      enum: [
        "readyTryon",
        "fabricGen",
        "fabricTryon",
        "styleAdvice",
        "planPurchase",
        "topupPurchase",
        "adminCredit",
      ],
    },
    credits: { type: Number, required: true },
    balanceBefore: Number,
    balanceAfter: Number,
    description: String,
    metadata: {
      productId: String,
      garmentType: String,
      planName: String,
      packName: String,
    },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.CreditTransaction ||
  mongoose.model("CreditTransaction", creditTransactionSchema);
