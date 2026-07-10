const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Seller = require("../models/seller");
const Product = require("../models/Product");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Auth Middleware
const customerAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Login karo pehle!",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.customerId = decoded.customerId;
    next();
  } catch {
    res.status(401).json({ message: "Token invalid!" });
  }
};

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Check if seller is trying to register as customer
    const sellerExists = await Seller.findOne({ email });
    if (sellerExists) {
      return res.status(400).json({
        message: "SELLER_EMAIL",
        detail:
          "Yeh email seller account ke liye registered hai. Apne seller dashboard mein login karein.",
      });
    }

    const exists = await Customer.findOne({ email });
    if (exists) {
      return res.status(400).json({
        message: "Email already registered!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const customer = await Customer.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );
    res.json({
      success: true,
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        addresses: [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Seller email check
    const sellerExists = await Seller.findOne({ email });
    if (sellerExists) {
      return res.status(400).json({
        message: "SELLER_EMAIL",
        detail:
          "Yeh email seller account ke liye registered hai. Apne seller dashboard mein login karein.",
      });
    }

    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(400).json({
        message: "Email nahi mila!",
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password galat hai!",
      });
    }
    const token = jwt.sign(
      { customerId: customer._id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" },
    );
    res.json({
      success: true,
      token,
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        mobile: customer.mobile,
        gender: customer.gender,
        addresses: customer.addresses,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Profile
router.get("/profile", customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId).select(
      "-password",
    );
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile
router.put("/profile", customerAuth, async (req, res) => {
  try {
    const { name, lastName, mobile, gender } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.customerId,
      { name, lastName, mobile, gender },
      { new: true },
    ).select("-password");
    res.json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add Address
router.post("/address", customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId);
    if (req.body.isDefault) {
      customer.addresses.forEach((a) => (a.isDefault = false));
    }
    customer.addresses.push({
      ...req.body,
      isDefault:
        customer.addresses.length === 0 ? true : req.body.isDefault || false,
    });
    await customer.save();
    res.json({ success: true, addresses: customer.addresses });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete Address
router.delete("/address/:addressId", customerAuth, async (req, res) => {
  try {
    await Customer.findByIdAndUpdate(req.customerId, {
      $pull: { addresses: { _id: req.params.addressId } },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create Order
router.post("/orders", customerAuth, async (req, res) => {
  try {
    const {
      sellerId,
      productId,
      address,
      paymentMethod,
      quantity = 1,
      selectedSize = "",
    } = req.body;

    const seller = await Seller.findOne({ sellerId });
    const product = await Product.findById(productId);

    if (!seller || !product) {
      return res.status(404).json({
        message: "Seller/Product not found",
      });
    }

    const productPrice = product.price * quantity;
    const deliveryFee = productPrice >= 499 ? 0 : 60;
    const totalAmount = productPrice + deliveryFee;

    let razorpayOrderId = null;
    if (paymentMethod === "razorpay") {
      const rzpOrder = await razorpay.orders.create({
        amount: totalAmount * 100,
        currency: "INR",
        receipt: "receipt_" + Date.now(),
      });
      razorpayOrderId = rzpOrder.id;
    }

    const order = await Order.create({
      customer: req.customerId,
      seller: seller._id,
      product: productId,
      productName: product.name,
      productImage: product.imageUrl,
      productPrice: product.price,
      quantity,
      selectedSize,
      deliveryFee,
      totalAmount,
      address,
      paymentMethod,
      razorpayOrderId,
      trackingUpdates: [
        {
          status: "placed",
          message: "Order successfully placed!",
        },
      ],
    });
    // Admin notification email
    try {
      const { sendOrderNotificationEmail } = require("../config/email");
      const sellerDoc = await Seller.findById(seller._id);
      sendOrderNotificationEmail(order, sellerDoc).catch(console.log);
    } catch (e) {
      console.log("Email error:", e.message);
    }

    // Push notification — instant alert on the seller's device(s).
    // Wrapped separately from the email above so a push failure
    // (e.g. VAPID not configured yet) never blocks order creation
    // or the email notification.
    try {
      const { sendPushToSeller } = require("../config/webpush");
      sendPushToSeller(seller._id, {
        title: "New Order Received! 🎉",
        body: `${order.productName} — ₹${order.totalAmount}`,
        url: "/dashboard",
        tag: "new-order",
      }).catch((e) => console.log("Push error:", e.message));
    } catch (e) {
      console.log("Push error:", e.message);
    }
    res.json({
      success: true,
      order,
      razorpayOrderId,
      amount: totalAmount * 100,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify Payment
router.post("/orders/verify-payment", customerAuth, async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed!",
      });
    }

    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "paid",
      razorpayPaymentId: razorpay_payment_id,
      orderStatus: "accepted",
      $push: {
        trackingUpdates: {
          status: "accepted",
          message: "Payment received! Order accepted.",
        },
      },
    });
    // Admin ko email bhejo
    try {
      const { sendOrderNotificationEmail } = require("../config/email");
      const seller = await Seller.findById(order.seller);
      sendOrderNotificationEmail(order, seller).catch(console.log);
    } catch (e) {
      console.log("Email notification error:", e.message);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get My Orders
router.get("/orders", customerAuth, async (req, res) => {
  try {
    const orders = await Order.find({
      customer: req.customerId,
    })
      .sort({ createdAt: -1 })
      .populate("seller", "name")
      .populate(
        "product",
        "brandName description originalPrice highlights sizes",
      );

    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Return Request
router.post("/orders/:orderId/return", customerAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    await Order.findOneAndUpdate(
      { _id: req.params.orderId, customer: req.customerId },
      {
        orderStatus: "return_requested",
        returnReason: reason,
        $push: {
          trackingUpdates: {
            status: "return_requested",
            message: "Return request submitted.",
          },
        },
      },
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Save Measurements
router.post("/measurements", customerAuth, async (req, res) => {
  try {
    const measurements = {
      ...req.body,
      updatedAt: new Date(),
    };
    const customer = await Customer.findByIdAndUpdate(
      req.customerId,
      { measurements },
      { new: true },
    ).select("-password");

    res.json({
      success: true,
      measurements: customer.measurements,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Measurements
router.get("/measurements", customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customerId).select(
      "measurements",
    );

    res.json({
      success: true,
      measurements: customer.measurements || null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Delete Account
router.delete("/account", customerAuth, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.customerId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// Single order details
router.get("/orders/:orderId", customerAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.customerId,
    });
    if (!order) {
      return res.status(404).json({
        message: "Order nahi mila!",
      });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Customer cancel order
router.post("/orders/:orderId/cancel", customerAuth, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.orderId,
      customer: req.customerId,
    }).populate("product", "brandName description originalPrice highlights");

    if (!order) {
      return res.status(404).json({
        message: "Order nahi mila!",
      });
    }

    if (!["placed", "accepted"].includes(order.orderStatus)) {
      return res.status(400).json({
        message:
          "Yeh order ab cancel nahi ho sakta! Shipped ya delivered orders cancel nahi hote.",
      });
    }

    const cancelReason = `Cancelled by customer: ${reason}`;

    await Order.findByIdAndUpdate(order._id, {
      orderStatus: "cancelled",
      cancelReason,
      $push: {
        trackingUpdates: {
          status: "cancelled",
          message: cancelReason,
          time: new Date(),
        },
      },
    });

    // Auto Refund if paid online
    let refundDone = false;
    if (
      order.paymentStatus === "paid" &&
      order.razorpayPaymentId &&
      order.paymentMethod === "razorpay"
    ) {
      try {
        const Razorpay = require("razorpay");
        const rzp = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        await rzp.payments.refund(order.razorpayPaymentId, {
          amount: order.totalAmount * 100,
          speed: "normal",
          notes: {
            reason: cancelReason,
            orderId: order.orderId,
          },
        });

        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: "refunded",
        });
        refundDone = true;
      } catch (refundErr) {
        console.log("Refund error:", refundErr.message);
        // Mark for manual refund
        await Order.findByIdAndUpdate(order._id, {
          paymentStatus: "refund_pending",
        });
      }
    }

    res.json({
      success: true,
      message: refundDone
        ? "Order cancelled! Refund 5-7 din mein aayega."
        : "Order cancelled!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, customerAuth };