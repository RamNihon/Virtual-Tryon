const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Order = require("../models/Order");
const Seller = require("../models/Seller");
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
    } = req.body;

    const seller = await Seller.findOne({ sellerId });
    const product = await Product.findById(productId);

    if (!seller || !product) {
      return res.status(404).json({
        message: "Seller ya product nahi mila!",
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
        message: "Payment verify nahi hua!",
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
      .populate("seller", "name");

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

// Delete Account
router.delete("/account", customerAuth, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.customerId);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = { router, customerAuth };
