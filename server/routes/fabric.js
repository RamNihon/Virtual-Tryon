const express = require("express");
const router = express.Router();
const FabricProduct = require("../models/FabricProduct");
const Seller = require("../models/seller");
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const Replicate = require("replicate");
const { generateGarmentFromFabric, useCredits } = require("../config/openai");
const { authMiddleware } = require("./seller");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ─── Cloudinary Upload Helper ──────────────
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

// ─── Upload Cloudinary as Base64 ──────────
const getBase64FromUrl = async (url) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
};

// ─── Garment Type Labels ──────────────────
const GARMENT_LABELS = {
  shirt_full: "Full Sleeve Shirt",
  shirt_half: "Half Sleeve Shirt",
  pant: "Formal Pant",
  kurta: "Kurta",
  salwar_suit: "Salwar Suit",
  kurti: "Kurti",
  saree: "Saree",
};

// ─── Add Fabric Product ───────────────────
router.post(
  "/products",
  authMiddleware,
  upload.array("fabricImages", 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "Fabric ki kam se kam ek photo zaroori hai!",
        });
      }

      // Upload fabric images to cloudinary
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, "fabric/products"),
      );
      const imageUrls = await Promise.all(uploadPromises);

      // Parse availableGarments
      let availableGarments = req.body.availableGarments;
      if (typeof availableGarments === "string") {
        availableGarments = [availableGarments];
      }

      const product = await FabricProduct.create({
        seller: req.sellerId,
        name: req.body.name,
        description: req.body.description || "",
        fabricType: req.body.fabricType || "",
        price: parseFloat(req.body.price),
        pricePerMeter: parseFloat(req.body.pricePerMeter) || 0,
        fabricImages: imageUrls,
        fabricImageUrl: imageUrls[0],
        availableGarments: availableGarments || ["shirt_full"],
      });

      res.json({ success: true, product });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
);

// ─── Get Seller's Fabric Products ─────────
router.get("/products", authMiddleware, async (req, res) => {
  try {
    const products = await FabricProduct.find({
      seller: req.sellerId,
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Public Shop Fabric Products ──────────
router.get("/shop/:sellerId", async (req, res) => {
  try {
    const seller = await Seller.findOne({
      sellerId: req.params.sellerId,
    });
    if (!seller) {
      return res.status(404).json({
        message: "Shop nahi mili!",
      });
    }

    const products = await FabricProduct.find({
      seller: seller._id,
      isActive: true,
      inStock: true,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      shop: {
        name: seller.name,
        sellerId: seller.sellerId,
        apiKey: seller.apiKey,
        whatsapp: seller.whatsapp || "",
        upiId: seller.upiId || "",
      },
      products,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Generate Garment from Fabric ─────────
router.post("/generate", async (req, res) => {
  try {
    const { productId, garmentType, apiKey } = req.body;

    // Seller identify karo
    const seller = await Seller.findOne({ apiKey });
    if (!seller) {
      return res.status(401).json({
        message: "Invalid API key!",
      });
    }

    // Plan check - Pro/Elite only
    if (seller.plan === "free" || seller.plan === "basic") {
      return res.status(403).json({
        message: "Fabric generation Pro/Elite plan mein available hai!",
        type: "plan_required",
      });
    }

    // Product dhundo
    const product = await FabricProduct.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: "Product nahi mila!",
      });
    }

    // Check cached preview
    const cached = product.generatedPreviews.find(
      (p) => p.garmentType === garmentType,
    );
    if (cached) {
      return res.json({
        success: true,
        imageUrl: cached.imageUrl,
        cached: true,
      });
    }

    // Credit deduct karo
    try {
      await useCredits(Seller, seller._id, "fabricGen");
    } catch (creditError) {
      return res.status(403).json({
        message: creditError.message,
        type: "insufficient_credits",
      });
    }

    console.log("🧵 Fabric generation started..");

    // Fabric image base64 lo
    const fabricBase64 = await getBase64FromUrl(product.fabricImageUrl);

    // GPT Image 2 se garment generate karo
    const generatedBase64 = await generateGarmentFromFabric(
      fabricBase64,
      garmentType,
      product.description,
    );

    // Cloudinary par upload karo
    const imageBuffer = Buffer.from(generatedBase64, "base64");
    const imageUrl = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "fabric/generated",
          resource_type: "image",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        },
      );
      stream.end(imageBuffer);
    });

    // Cache mein save karo
    await FabricProduct.findByIdAndUpdate(productId, {
      $push: {
        generatedPreviews: {
          garmentType,
          imageUrl,
        },
      },
    });

    console.log("✅ Garment generated!");

    res.json({
      success: true,
      imageUrl,
      garmentType,
      label: GARMENT_LABELS[garmentType],
      cached: false,
    });
  } catch (error) {
    console.error("❌ Generation error:", error.message);
    res.status(500).json({
      message: error.message,
    });
  }
});

// ─── Fabric Try-On ────────────────────────
router.post("/tryon", upload.single("humanImage"), async (req, res) => {
  try {
    const { garmentImageUrl, apiKey, productId } = req.body;


    // garmentImageUrl string check karo
const garmentUrl = typeof garmentImageUrl === 'string'
  ? garmentImageUrl
  : garmentImageUrl?.url || String(garmentImageUrl)

console.log('Garment URL type:', typeof garmentImageUrl)
console.log('Garment URL value:', garmentUrl)

if (!garmentUrl || !garmentUrl.startsWith('http')) {
  return res.status(400).json({
    message: 'Valid garment image URL nahi mili!'
  })
}

    // Seller identify
    const seller = await Seller.findOne({ apiKey });
    if (!seller) {
      return res.status(401).json({
        message: "Invalid API key!",
      });
    }

    // Plan check
    if (seller.plan === "free" || seller.plan === "basic") {
      return res.status(403).json({
        message: "Fabric try-on Pro/Elite mein available hai!",
        type: "plan_required",
      });
    }

    // Credit deduct
    try {
      await useCredits(Seller, seller._id, "fabricTryon");
    } catch (creditError) {
      return res.status(403).json({
        message: creditError.message,
        type: "insufficient_credits",
      });
    }

    console.log("📸 Fabric try-on started...");

    // Human image upload
    const humanUrl = await uploadToCloudinary(req.file.buffer, "fabric/humans");

    // IDM-VTON for try-on
    const output = await replicate.run(
      "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
      {
        input: {
          human_img: humanUrl,
          garm_img: garmentUrl,
          garment_des: "clothing item",
          is_checked: true,
          is_checked_crop: false,
          denoise_steps: 30,
          seed: 42,
        },
      }
    );

    // Replicate URL ko Cloudinary par save karo
    let savedImageUrl = output;
    try {
      const imageResponse = await fetch(output);
      const imageBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(imageBuffer);

      savedImageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'fabric/tryons' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(buffer);
      });
      console.log('✅ Tryon saved to Cloudinary!');
    } catch (saveError) {
      console.log('Cloudinary save error:', saveError.message);
      // Fallback: original URL use karo
      savedImageUrl = output;
    }

    console.log("🎉 Fabric try-on done!");

    // Style advice (optional - 1 credit)
    let styleAdvice = null
try {
  await useCredits(Seller, seller._id, 'styleAdvice')

  // Kaunsi key hai check karo
  let styleEndpoint = ''
  let styleHeaders = {}
  let styleBody = {}

  if (process.env.ANTHROPIC_API_KEY ||
      process.env.CLAUDE_API_KEY) {
    // Direct Anthropic
    styleEndpoint = 'https://api.anthropic.com/v1/messages'
    styleHeaders = {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY ||
                   process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    }
    styleBody = {
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: resultImage }
          },
          {
            type: 'text',
            text: `Tu ek expert fashion stylist hai.
Is try-on image ko dekh kar Hindi mein batao:

1. 🎨 Color Rating: /10
2. ✅ Kya yah achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karna chahiye
5. 🎯 Kis occasion ke liye perfect
6. 🎯 skin color kaisi hai and  skin color ke hisab se aur konse color combination achha dikhega.
7. ✨ aur konse dress combination achhe rahenge.
8. 🎯 Aur kya hand accesories or hairstyle or other improvement kar sakte hain, taki confident and smart dikhen

Short aur friendly jawab den!`
          }
        ]
      }]
    }
  } else if (process.env.OPENROUTER_API_KEY) {
    // OpenRouter
    styleEndpoint = 'https://openrouter.ai/api/v1/chat/completions'
    styleHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000'
    }
    styleBody = {
      model: 'anthropic/claude-3-haiku',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: resultImage }
          },
          {
            type: 'text',
            text: `Tu ek expert fashion stylist hai.
Is try-on image ko dekh kar Hindi mein batao:

1. 🎨 Color Rating: /10
2. ✅ Kya yah achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karna chahiye
5. 🎯 Kis occasion ke liye perfect
6. 🎯 skin color kaisi hai and  skin color ke hisab se aur konse color combination achha dikhega.
7. ✨ aur konse dress combination achhe rahenge.
8. 🎯 Aur kya hand accesories or hairstyle or other improvement kar sakte hain, taki confident and smart dikhen

Short aur friendly jawab den!`
          }
        ]
      }]
    }
  }

  if (styleEndpoint) {
    const styleRes = await fetch(styleEndpoint, {
      method: 'POST',
      headers: styleHeaders,
      body: JSON.stringify(styleBody)
    })
    const styleData = await styleRes.json()

    // Response parse karo
    if (styleData.content) {
      // Anthropic format
      styleAdvice = styleData.content?.[0]?.text || null
    } else if (styleData.choices) {
      // OpenRouter format
      styleAdvice = styleData.choices?.[0]?.message?.content || null
    }
  }
} catch (e) {
  console.log('Style advice skip:', e.message)
}

    // Legacy count
    await Seller.findByIdAndUpdate(seller._id, {
      $inc: { tryonCount: 1 },
    });

    res.json({
      success: true,
      resultImage: savedImageUrl,
      styleAdvice :styleAdvice,
      humanImage: humanUrl,
    });
  } catch (error) {
    console.error("❌ Fabric tryon error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Stock toggle
router.patch("/products/:productId/stock", authMiddleware, async (req, res) => {
  try {
    await FabricProduct.findOneAndUpdate(
      { _id: req.params.productId, seller: req.sellerId },
      { inStock: req.body.inStock },
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Delete Fabric Product ────────────────
router.delete("/products/:productId", authMiddleware, async (req, res) => {
  try {
    await FabricProduct.findOneAndUpdate(
      { _id: req.params.productId, seller: req.sellerId },
      { isActive: false },
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
