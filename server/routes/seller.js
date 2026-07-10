const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Seller = require("../models/seller");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const TryonHistory = require("../models/TryonHistory");
const Order = require("../models/Order");
const OrderRequest = require("../models/OrderRequest");
const {
  sendWelcomeEmail,
  sendLimitWarningEmail,
  sendLoginAlertEmail,
} = require("../config/email");

// ─── AUTH MIDDLEWARE ─────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token nahi hai!" });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.sellerId = decoded.sellerId;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid!" });
  }
};

// ─── REGISTER ────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await Seller.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already registered!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword,
    });
    sendWelcomeEmail(seller);
    res.json({
      success: true,
      message: "Registration successful!",
      sellerId: seller.sellerId,
      apiKey: seller.apiKey,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── LOGIN ───────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const seller = await Seller.findOne({ email });
    if (!seller) {
      return res.status(400).json({
        message: "Email nahi mila!",
      });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password galat hai!",
      });
    }

    const token = jwt.sign({ sellerId: seller._id }, process.env.JWT_SECRET, {
      expiresIn: "48h",
    });
    // Login alert email
    const loginTime = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
    sendLoginAlertEmail(seller, {
      time: loginTime + " IST",
    }).catch((err) => {
      console.log("Login alert error:", err.message);
    });

    res.json({
      success: true,
      token,
      seller: {
        name: seller.name,
        email: seller.email,
        sellerId: seller.sellerId,
        apiKey: seller.apiKey,
        plan: seller.plan,
        tryonCount: seller.tryonCount,
        tryonLimit: seller.tryonLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PRODUCT ADD ─────────────────────────
router.post(
  "/products",
  authMiddleware,
  upload.array("productImages", 5),
  async (req, res) => {
    try {
      // ── FIELD-SPECIFIC VALIDATION ────────────────────────────
      const fieldErrors = {};

      if (!req.body.name || req.body.name.trim().length < 2) {
        fieldErrors.name = "Product name kam se kam 2 characters ka hona chahiye!";
      }

      const price = parseFloat(req.body.price);
      if (!req.body.price || isNaN(price) || price <= 0) {
        fieldErrors.price = "Valid price daalna zaroori hai!";
      }

      if (!req.body.description || req.body.description.trim().length < 10) {
        fieldErrors.description = "Description kam se kam 10 characters ki honi chahiye!";
      }

      if (!req.body.category) {
        fieldErrors.category = "Category select karna zaroori hai!";
      }

      // Images check
      let imageUrls = [];
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "products" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                },
              );
              stream.end(file.buffer);
            }),
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = [...uploadedUrls];
      }

      // URL images
      if (req.body.imageUrls) {
        const urlArray = Array.isArray(req.body.imageUrls)
          ? req.body.imageUrls
          : [req.body.imageUrls];
        const validUrls = urlArray.filter(
          (url) => url && url.startsWith("http"),
        );
        imageUrls = [...imageUrls, ...validUrls];
      }

      if (imageUrls.length < 2) {
        fieldErrors.images = "Kam se kam 2 product photos zaroori hain!";
      }

      // Agar koi bhi field error ho to return karo
      if (Object.keys(fieldErrors).length > 0) {
        return res.status(400).json({
          message: "Error in some fields!",
          fieldErrors,
        });
      }

      // Parse sizes
      let sizes = [];
      if (req.body.sizes) {
        sizes = Array.isArray(req.body.sizes)
          ? req.body.sizes
          : JSON.parse(req.body.sizes);
      }

      // Parse highlights
      let highlights = {};
      if (req.body.highlights) {
        highlights =
          typeof req.body.highlights === "string"
            ? JSON.parse(req.body.highlights)
            : req.body.highlights;
      }

      // Discount calculate
      const originalPrice = parseFloat(req.body.originalPrice) || 0;
      const discountPercent =
        originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      const product = await Product.create({
        seller: req.sellerId,
        brandName: req.body.brandName || "",
        name: req.body.name,
        description: req.body.description || "",
        originalPrice,
        price,
        discountPercent,
        category: req.body.category || "upper_body",
        sizes,
        highlights,
        productUrl: req.body.productUrl || "",
        imageUrl: imageUrls[0],
        images: imageUrls,
      });

      res.json({ success: true, product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// ─── PRODUCTS LIST ───────────────────────
router.get("/products", authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.sellerId,
      isActive: true,
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── EDIT PRODUCT ────────────────────────
// Same field-specific validation and Cloudinary upload pattern
// as the "add product" route above, so editing feels identical
// to adding — just pre-filled. Existing images the seller kept
// are passed back as `existingImages` (URLs); any new files are
// uploaded and appended after them, so ordering is preserved.
router.put(
  "/products/:productId",
  authMiddleware,
  upload.array("productImages", 5),
  async (req, res) => {
    try {
      const product = await Product.findOne({
        _id: req.params.productId,
        seller: req.sellerId,
      });

      if (!product) {
        return res.status(404).json({ message: "Product nahi mila!" });
      }

      // ── FIELD-SPECIFIC VALIDATION ────────────────────────────
      const fieldErrors = {};

      if (!req.body.name || req.body.name.trim().length < 2) {
        fieldErrors.name = "Product name kam se kam 2 characters ka hona chahiye!";
      }

      const price = parseFloat(req.body.price);
      if (!req.body.price || isNaN(price) || price <= 0) {
        fieldErrors.price = "Valid price daalna zaroori hai!";
      }

      if (!req.body.description || req.body.description.trim().length < 10) {
        fieldErrors.description = "Description kam se kam 10 characters ki honi chahiye!";
      }

      if (!req.body.category) {
        fieldErrors.category = "Category select karna zaroori hai!";
      }

      // Existing images the seller chose to keep (sent back as URLs)
      let imageUrls = [];
      if (req.body.existingImages) {
        const existingArray = Array.isArray(req.body.existingImages)
          ? req.body.existingImages
          : [req.body.existingImages];
        imageUrls = existingArray.filter(
          (url) => url && url.startsWith("http"),
        );
      }

      // Newly uploaded files get appended after the kept images
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(
          (file) =>
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "products" },
                (error, result) => {
                  if (error) reject(error);
                  else resolve(result.secure_url);
                },
              );
              stream.end(file.buffer);
            }),
        );
        const uploadedUrls = await Promise.all(uploadPromises);
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      if (imageUrls.length < 2) {
        fieldErrors.images = "Kam se kam 2 product photos zaroori hain!";
      }

      if (Object.keys(fieldErrors).length > 0) {
        return res.status(400).json({
          message: "Kuch fields mein error hai!",
          fieldErrors,
        });
      }

      // Parse sizes
      let sizes = [];
      if (req.body.sizes) {
        sizes = Array.isArray(req.body.sizes)
          ? req.body.sizes
          : JSON.parse(req.body.sizes);
      }

      // Parse highlights
      let highlights = {};
      if (req.body.highlights) {
        highlights =
          typeof req.body.highlights === "string"
            ? JSON.parse(req.body.highlights)
            : req.body.highlights;
      }

      // Discount calculate
      const originalPrice = parseFloat(req.body.originalPrice) || 0;
      const discountPercent =
        originalPrice > price
          ? Math.round(((originalPrice - price) / originalPrice) * 100)
          : 0;

      product.brandName = req.body.brandName || "";
      product.name = req.body.name;
      product.description = req.body.description || "";
      product.originalPrice = originalPrice;
      product.price = price;
      product.discountPercent = discountPercent;
      product.category = req.body.category || "upper_body";
      product.sizes = sizes;
      product.highlights = highlights;
      product.productUrl = req.body.productUrl || "";
      product.imageUrl = imageUrls[0];
      product.images = imageUrls;

      await product.save();

      res.json({ success: true, product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// ─── DASHBOARD ───────────────────────────
router.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    const products = await Product.find({ seller: req.sellerId });

    res.json({
      success: true,
      seller: {
        name: seller.name,
        email: seller.email,
        apiKey: seller.apiKey,
        sellerId: seller.sellerId,
        plan: seller.plan,

        // Credit system
        credits: seller.credits || 0,
        totalCreditsUsed: seller.totalCreditsUsed || 0,
        monthlyCreditsUsed: seller.monthlyCreditsUsed || 0,
        monthlyCreditsLimit: seller.monthlyCreditsLimit || 100,

        // Legacy
        tryonCount: seller.tryonCount || 0,
        tryonLimit: seller.tryonLimit || 100,

        whatsapp: seller.whatsapp,
        upiId: seller.upiId,
      },
      totalProducts: products.length,
      shopUrl: `${process.env.FRONTEND_URL}/shop/${seller.sellerId}`,
      widgetCode: `<script src="${process.env.WIDGET_URL}/widget.js" data-seller-id="${seller.sellerId}" data-api-key="${seller.apiKey}"></script>`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// SETTINGS SAVE KARNE KE LIYE POST ROUTE
router.post("/settings", authMiddleware, async (req, res) => {
  try {
    const { whatsapp, upiId } = req.body;

    // Database me seller ko dhoondkar uski details update karein
    const updatedSeller = await Seller.findByIdAndUpdate(
      req.sellerId, // authMiddleware se aane wali id
      { whatsapp, upiId },
      { new: true }, // Isse updated data return hoga
    );

    if (!updatedSeller) {
      return res
        .status(404)
        .json({ success: false, message: "Seller nahi mila!" });
    }

    res.json({
      success: true,
      message: "Settings successfully save ho gayi hain!",
      seller: updatedSeller,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Analytics route - dashboard route ke baad add karo
router.get("/analytics", authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    const products = await Product.find({ seller: req.sellerId, isActive: true });

    if (!seller) {
      return res.status(404).json({
        message: "Seller nahi mila!",
      });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    let recentTryons = [];
    let previousTryons = [];
    let totalOrders = 0;
    let recentOrders = [];
    let previousOrders = [];
    let fabricGenCount = 0;
    let fabricTryonCount = 0;

    try {
      recentTryons = await TryonHistory.find({
        seller: req.sellerId,
        createdAt: { $gte: sevenDaysAgo },
      }).sort({ createdAt: -1 });
    } catch (e) {
      console.log("TryonHistory err:", e.message);
    }

    try {
      previousTryons = await TryonHistory.find({
        seller: req.sellerId,
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      });
    } catch (e) {
      console.log("Previous TryonHistory err:", e.message);
    }

    try {
      const OrderRequest = require("../models/OrderRequest");
      totalOrders = await OrderRequest.countDocuments({
        seller: req.sellerId,
      });

      recentOrders = await OrderRequest.find({
        seller: req.sellerId,
        createdAt: { $gte: sevenDaysAgo },
      }).sort({ createdAt: -1 });

      previousOrders = await OrderRequest.find({
        seller: req.sellerId,
        createdAt: { $gte: fourteenDaysAgo, $lt: sevenDaysAgo },
      });
    } catch (e) {
      console.log("OrderRequest err:", e.message);
    }

    try {
      const CreditTransaction = require("../models/CreditTransaction");
      fabricGenCount = await CreditTransaction.countDocuments({
        seller: req.sellerId,
        action: "fabricGen",
      });
      fabricTryonCount = await CreditTransaction.countDocuments({
        seller: req.sellerId,
        action: "fabricTryon",
      });
    } catch (e) {
      console.log("CreditTransaction err:", e.message);
    }

    // Daily data - SAHI LOOP
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      let dayTryons = 0;
      let dayOrders = 0;

      try {
        dayTryons = await TryonHistory.countDocuments({
          seller: req.sellerId,
          createdAt: { $gte: date, $lt: nextDate },
        });
      } catch (e) {
        dayTryons = 0;
      }

      try {
        const OrderRequest = require("../models/OrderRequest");
        dayOrders = await OrderRequest.countDocuments({
          seller: req.sellerId,
          createdAt: { $gte: date, $lt: nextDate },
        });
      } catch (e) {
        dayOrders = 0;
      }

      dailyData.push({
        date: date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        tryons: Number(dayTryons),
        orders: Number(dayOrders),
        fabricGens: 0,
      });
    }

    const totalTryons = Number(seller.tryonCount || recentTryons.length || 0);
    const recentTryonsCount = recentTryons.length || 0;
    const previousTryonsCount = previousTryons.length || 0;
    const recentOrdersCount = recentOrders.length || 0;
    const previousOrdersCount = previousOrders.length || 0;

    const conversionRate =
      totalTryons > 0 ? (totalOrders / totalTryons) * 100 : 0;

    const tryonGrowth =
      previousTryonsCount > 0
        ? ((recentTryonsCount - previousTryonsCount) / previousTryonsCount) * 100
        : recentTryonsCount > 0
          ? 100
          : 0;

    const orderGrowth =
      previousOrdersCount > 0
        ? ((recentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100
        : recentOrdersCount > 0
          ? 100
          : 0;

    const bestDay = [...dailyData].sort(
      (a, b) => Number(b.tryons || 0) - Number(a.tryons || 0)
    )[0];

    const worstDay = [...dailyData].sort(
      (a, b) => Number(a.tryons || 0) - Number(b.tryons || 0)
    )[0];

    const topProductDoc = await Product.findOne({
      seller: req.sellerId,
      isActive: true,
    }).sort({ reviewCount: -1, avgRating: -1, createdAt: -1 });

    const topProducts = await Product.aggregate([
      { $match: { seller: req.sellerId, isActive: true } },
      {
        $lookup: {
          from: "tryonhistories",
          localField: "_id",
          foreignField: "product",
          as: "tryonDocs",
        },
      },
      {
        $addFields: {
          tryonCount: { $size: "$tryonDocs" },
        },
      },
      { $sort: { tryonCount: -1, createdAt: -1 } },
      { $limit: 5 },
      {
        $project: {
          name: 1,
          brandName: 1,
          imageUrl: 1,
          tryonCount: 1,
          price: 1,
          category: 1,
        },
      },
    ]);

    const topProduct =
      topProducts?.[0] || (topProductDoc
        ? {
            name: topProductDoc.name,
            brandName: topProductDoc.brandName || "",
            imageUrl: topProductDoc.imageUrl || "",
            tryonCount: 0,
            price: topProductDoc.price || 0,
            category: topProductDoc.category || "",
          }
        : null);

    let healthScore = 0;
    healthScore += Math.min(30, totalTryons > 0 ? 15 : 0);
    healthScore += Math.min(30, conversionRate * 3);
    healthScore += Math.min(20, recentTryonsCount > 0 ? 15 : 0);
    healthScore += Math.min(20, totalOrders > 0 ? 15 : 0);

    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    let grade = "C";
    if (healthScore >= 90) grade = "A+";
    else if (healthScore >= 80) grade = "A";
    else if (healthScore >= 70) grade = "B+";
    else if (healthScore >= 60) grade = "B";
    else if (healthScore >= 50) grade = "C+";
    else grade = "C";

    const insights = [
      totalTryons > 0
        ? `Customers have completed ${totalTryons} try-ons so far.`
        : "No try-ons recorded yet. Promote the try-on CTA more visibly.",
      conversionRate >= 8
        ? "Conversion looks strong. Keep the current product presentation."
        : conversionRate >= 4
          ? "Conversion is healthy but can improve with stronger product images."
          : "Conversion is low. Try highlighting best-selling products first.",
      topProduct?.name
        ? `${topProduct.name} is your most important product right now.`
        : "Top product data will appear after more try-ons are recorded.",
      bestDay?.date
        ? `${bestDay.date} was your best-performing day for try-ons.`
        : "Best day insights will appear once more data is collected.",
      recentTryonsCount > previousTryonsCount
        ? "Try-on momentum is increasing compared to the previous week."
        : recentTryonsCount < previousTryonsCount
          ? "Try-on momentum is slightly lower than the previous week."
          : "Try-on momentum is stable compared to the previous week.",
    ];

    return res.json({
      success: true,
      stats: {
        totalTryons,
        totalProducts: products.length || 0,
        recentTryons: recentTryonsCount,
        previousTryons: previousTryonsCount,
        totalOrders: totalOrders || 0,
        recentOrders: recentOrdersCount,
        previousOrders: previousOrdersCount,
        fabricGenCount: fabricGenCount || 0,
        fabricTryonCount: fabricTryonCount || 0,
        plan: seller.plan,
        credits: seller.credits || 0,
        monthlyCreditsUsed: seller.monthlyCreditsUsed || 0,
        monthlyCreditsLimit: seller.monthlyCreditsLimit || 100,
        conversionRate: Number(conversionRate.toFixed(1)),
        tryonGrowth: Number(tryonGrowth.toFixed(1)),
        orderGrowth: Number(orderGrowth.toFixed(1)),
        healthScore,
        grade,
      },
      dailyData,
      productTryons: topProducts,
      insights,
      summary: {
        bestDay: bestDay?.date || null,
        worstDay: worstDay?.date || null,
        topProduct: topProduct
          ? {
              name: topProduct.name,
              brandName: topProduct.brandName || "",
              imageUrl: topProduct.imageUrl || "",
              tryonCount: topProduct.tryonCount || 0,
              price: topProduct.price || 0,
              category: topProduct.category || "",
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return res.status(500).json({ message: error.message });
  }
});

// Public route - koi bhi call kar sakta hai
router.post("/track-order", async (req, res) => {
  try {
    const { sellerId, productId, productName, productPrice, orderType } =
      req.body;

    const seller = await Seller.findOne({ sellerId });
    if (!seller) {
      return res.status(404).json({
        message: "Seller nahi mila",
      });
    }

    await OrderRequest.create({
      seller: seller._id,
      product: productId || null,
      productName: productName || "Unknown",
      productPrice: productPrice || 0,
      orderType: orderType || "whatsapp",
      customerInfo: {
        sessionId: Date.now().toString(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Product delete route add karo
router.delete("/products/:productId", authMiddleware, async (req, res) => {
  try {
    await Product.findOneAndUpdate(
      {
        _id: req.params.productId,
        seller: req.sellerId,
      },
      { isActive: false },
    );
    res.json({
      success: true,
      message: "Product delete ho gaya!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Settings route ke baad add karo:
router.put("/update-profile", authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        message: "Name kam se kam 2 characters ka hona chahiye!",
      });
    }

    const seller = await Seller.findByIdAndUpdate(
      req.sellerId,
      { name: name.trim() },
      { new: true },
    );

    res.json({
      success: true,
      message: "Name update ho gaya!",
      seller: {
        name: seller.name,
        email: seller.email,
        sellerId: seller.sellerId,
        apiKey: seller.apiKey,
        plan: seller.plan,
        tryonCount: seller.tryonCount,
        tryonLimit: seller.tryonLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── CHANGE PASSWORD ─────────────────────
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current aur new password dono zaroori hain!",
      });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "New password kam se kam 8 characters ka hona chahiye!",
      });
    }

    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller nahi mila!" });
    }

    const isMatch = await bcrypt.compare(currentPassword, seller.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Current password galat hai!",
      });
    }

    seller.password = await bcrypt.hash(newPassword, 10);
    await seller.save();

    res.json({ success: true, message: "Password badal gaya!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── NOTIFICATION PREFERENCES ────────────
// Stored directly on the Seller doc (no new model needed) —
// each key defaults to true if the seller has never set one,
// so existing sellers don't silently lose alerts after this
// feature ships.
router.get("/notification-preferences", authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);
    const defaults = {
      newOrders: true,
      lowCreditAlerts: true,
      weeklySummary: true,
    };
    res.json({
      success: true,
      preferences: { ...defaults, ...(seller.notificationPreferences || {}) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/notification-preferences", authMiddleware, async (req, res) => {
  try {
    const { newOrders, lowCreditAlerts, weeklySummary } = req.body;

    const seller = await Seller.findByIdAndUpdate(
      req.sellerId,
      {
        notificationPreferences: {
          newOrders: !!newOrders,
          lowCreditAlerts: !!lowCreditAlerts,
          weeklySummary: !!weeklySummary,
        },
      },
      { new: true },
    );

    res.json({
      success: true,
      message: "Preferences saved!",
      preferences: seller.notificationPreferences,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── DELETE ACCOUNT ──────────────────────
// Requires the seller to type their password to confirm — the
// same protection banks/SaaS products use before anything
// irreversible. Related data (products, fabric products) is
// cleaned up so nothing orphaned is left behind; try-on history
// and orders are kept for the seller's own records trail (the
// account itself becomes unreachable once deleted, so this data
// is no longer linked to anyone who can access it).
router.delete("/delete-account", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        message: "Password confirm karna zaroori hai!",
      });
    }

    const seller = await Seller.findById(req.sellerId);
    if (!seller) {
      return res.status(404).json({ message: "Seller nahi mila!" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password galat hai!" });
    }

    await Product.deleteMany({ seller: req.sellerId });

    try {
      const FabricProduct = require("../models/FabricProduct");
      await FabricProduct.deleteMany({ seller: req.sellerId });
    } catch (e) {
      // Model may not be required elsewhere in this file — safe to skip.
    }

    await Seller.findByIdAndDelete(req.sellerId);

    res.json({ success: true, message: "Account deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PUBLIC SHOP ─────────────────────────
// Seller ki website nahi hai to
// yeh page unka shop hoga!
router.get("/shop/:sellerId", async (req, res) => {
  try {
    const seller = await Seller.findOne({
      sellerId: req.params.sellerId,
    });

    if (!seller) {
      return res.status(404).json({
        message: "Shop nahi mila!",
      });
    }

    const products = await Product.find({
      seller: seller._id,
      isActive: true,
    });

    res.json({
      success: true,
      shop: {
        name: seller.name,
        sellerId: seller.sellerId,
        apiKey: seller.apiKey, // ← Yeh hai?
        whatsapp: seller.whatsapp || "",
        upiId: seller.upiId || "",
        plan: seller.plan,
      },
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/products/:productId/stock", authMiddleware, async (req, res) => {
  try {
    const { inStock, stockNote } = req.body;

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.productId,
        seller: req.sellerId,
      },
      { inStock, stockNote: stockNote || "" },
      { new: true },
    );

    if (!product) {
      return res.status(404).json({
        message: "Product nahi mila!",
      });
    }

    res.json({
      success: true,
      message: inStock
        ? "✅ Product in stock!"
        : "❌ Product out of stock marked!",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Seller ke orders
router.get("/orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      seller: req.sellerId,
    })
      .sort({ createdAt: -1 })
      .populate("customer", "name email mobile");

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Order status update
// Status sequence define karo
const STATUS_SEQUENCE = [
  "placed",
  "accepted",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

router.patch("/orders/:orderId/status", authMiddleware, async (req, res) => {
  try {
    const { status, message, trackingId, logistics, cancelReason } = req.body;

    const order = await Order.findOne({
      _id: req.params.orderId,
      seller: req.sellerId,
    });

    if (!order) {
      return res.status(404).json({
        message: "Order nahi mila!",
      });
    }

    // Cancelled order update nahi ho sakta
    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        message:
          "The system does not allow changes to the status of a cancelled order.",
      });
    }

    // Sequence check - pichhe nahi ja sakte
    if (status !== "cancelled") {
      const currentIndex = STATUS_SEQUENCE.indexOf(order.orderStatus);
      const newIndex = STATUS_SEQUENCE.indexOf(status);

      // Must be next in sequence
      if (newIndex !== currentIndex + 1) {
        return res.status(400).json({
          message: `Invalid status! Current: ${order.orderStatus}. You can only go to the next step.`,
        });
      }
    }

    const updateData = {
      orderStatus: status,
      $push: {
        trackingUpdates: {
          status,
          message: message || `Order ${status}`,
          time: new Date(),
        },
      },
    };

    if (trackingId) updateData.trackingId = trackingId;
    if (logistics) updateData.logistics = logistics;
    if (cancelReason) updateData.cancelReason = cancelReason;

    await Order.findByIdAndUpdate(order._id, updateData);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Credit transaction history
router.get("/credit-history", authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);

    // MongoDB mein transactions store nahi hain abhi
    // Isliye basic info return karte hain
    res.json({
      success: true,
      currentCredits: seller.credits,
      totalUsed: seller.totalCreditsUsed,
      monthlyUsed: seller.monthlyCreditsUsed,
      monthlyLimit: seller.monthlyCreditsLimit,
      plan: seller.plan,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const CreditTransaction = require("../models/CreditTransaction");

// Credit transaction history
router.get("/credit-transactions", authMiddleware, async (req, res) => {
  try {
    const transactions = await CreditTransaction.find({
      seller: req.sellerId,
    })
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, transactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, authMiddleware };