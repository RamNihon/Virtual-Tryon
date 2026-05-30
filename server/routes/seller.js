const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Seller = require('../models/Seller')
const Product = require('../models/Product')
const cloudinary = require('../config/cloudinary')
const upload = require('../middleware/upload')

// ─── AUTH MIDDLEWARE ─────────────────────
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'Token nahi hai!' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.sellerId = decoded.sellerId
    next()
  } catch {
    res.status(401).json({ message: 'Token invalid!' })
  }
}

// ─── REGISTER ────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body

    const exists = await Seller.findOne({ email })
    if (exists) {
      return res.status(400).json({ 
        message: 'Email already registered!' 
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const seller = await Seller.create({
      name,
      email,
      password: hashedPassword
    })

    res.json({
      success: true,
      message: 'Registration successful!',
      sellerId: seller.sellerId,
      apiKey: seller.apiKey
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── LOGIN ───────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const seller = await Seller.findOne({ email })
    if (!seller) {
      return res.status(400).json({ 
        message: 'Email nahi mila!' 
      })
    }

    const isMatch = await bcrypt.compare(password, seller.password)
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Password galat hai!' 
      })
    }

    const token = jwt.sign(
      { sellerId: seller._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

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
        tryonLimit: seller.tryonLimit
      }
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── PRODUCT ADD ─────────────────────────
router.post(
  '/products',
  authMiddleware,
  upload.single('productImage'),
  async (req, res) => {
    try {
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'products' },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        stream.end(req.file.buffer)
      })

      const product = await Product.create({
        seller: req.sellerId,
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category || 'upper_body',
        productUrl: req.body.productUrl,
        imageUrl: uploadResult.secure_url
      })

      res.json({ success: true, product })

    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

// ─── PRODUCTS LIST ───────────────────────
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.sellerId,
      isActive: true
    })
    res.json({ success: true, products })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── DASHBOARD ───────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId)
    const products = await Product.find({ seller: req.sellerId })

    res.json({
      success: true,
      seller: {
        name: seller.name,
        apiKey: seller.apiKey,
        sellerId: seller.sellerId,
        plan: seller.plan,
        tryonCount: seller.tryonCount,
        tryonLimit: seller.tryonLimit
      },
      totalProducts: products.length,
      shopUrl: `${process.env.FRONTEND_URL}/shop/${seller.sellerId}`,
      widgetCode: `<script src="${process.env.WIDGET_URL}/widget.js" data-seller-id="${seller.sellerId}" data-api-key="${seller.apiKey}"></script>`
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── PUBLIC SHOP ─────────────────────────
// Seller ki website nahi hai to
// yeh page unka shop hoga!
router.get('/shop/:sellerId', async (req, res) => {
  try {
    const seller = await Seller.findOne({ 
      sellerId: req.params.sellerId 
    })
    
    if (!seller) {
      return res.status(404).json({ 
        message: 'Shop nahi mila!' 
      })
    }

    const products = await Product.find({
      seller: seller._id,
      isActive: true
    })

    res.json({
      success: true,
      shop: {
        name: seller.name,
        sellerId: seller.sellerId
      },
      products
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = { router, authMiddleware }