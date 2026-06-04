const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Seller",
      required: true,
    },
    name: String,
    description: String,
    price: Number,
    imageUrl: String,
    images: [String],
    category: {
      type: String,
      enum: ["upper_body", "lower_body", "dress"],
      default: "upper_body",
    },
    productUrl: String,
    isActive: { type: Boolean, default: true },
    inStock: { type: Boolean, default: true },
    stockNote: { type: String, default: "" },
    avgRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
