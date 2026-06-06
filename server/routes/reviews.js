const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Product = require("../models/Product");
const Seller = require("../models/seller");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");

// ─── Helper: Cloudinary Upload ─────────────
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
};

// ─── Review Add Karo ──────────────────────
router.post("/", upload.array("reviewImages", 3), async (req, res) => {
  try {
    const { productId, sellerId, customerName, rating, review } = req.body;

    if (!productId || !customerName || !rating) {
      return res.status(400).json({
        message: "Product, naam aur rating zaroori hai!",
      });
    }

    let seller = await Seller.findOne({ sellerId });
    if (!seller && sellerId) {
      const mongoose = require("mongoose");
      if (mongoose.Types.ObjectId.isValid(sellerId)) {
        seller = await Seller.findById(sellerId);
      }
    }

    if (!seller) {
      return res.status(404).json({
        message: "Seller nahi mila!",
      });
    }

    // Images upload karo
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file) =>
        uploadToCloudinary(file.buffer, "reviews"),
      );
      imageUrls = await Promise.all(uploads);
    }

    const newReview = await Review.create({
      product: productId,
      seller: seller._id,
      customerName: customerName.trim(),
      rating: parseInt(rating),
      review: review || "",
      images: imageUrls,
    });

    // Product ka average rating update karo
    const allReviews = await Review.find({
      product: productId,
    });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Product.findByIdAndUpdate(productId, {
      avgRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    });

    res.json({
      success: true,
      review: newReview,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Product Ki Reviews Get Karo ──────────
router.get("/product/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({
      product: req.params.productId,
    }).sort({ createdAt: -1 });

    // Rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      breakdown[r.rating] = (breakdown[r.rating] || 0) + 1;
    });

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      reviews,
      avgRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: reviews.length,
      breakdown,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
