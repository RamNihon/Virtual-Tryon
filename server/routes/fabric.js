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

// ─── Fashn.ai Helper ─────────────────────
const runFashnTryon = async (humanUrl, garmentUrl, category) => {
  if (!process.env.FASHN_API_KEY) throw new Error("FASHN_API_KEY missing!");
  if (!category || category === "auto")
    throw new Error("Fashn category required! (bottoms/one-pieces)");

  console.log(`🎯 Fashn.ai starting... category: ${category}`);
  const submitRes = await fetch("https://api.fashn.ai/v1/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_name: "tryon-v1.6",

      inputs: {
        model_image: humanUrl,
        garment_image: garmentUrl,
        category: category,
        mode: "quality",
        garment_photo_type: "flat-lay",
        segmentation_free: true,
      },
    }),
  });

  const submitData = await submitRes.json();
  console.log("Fashn submit:", submitData);

  if (!submitData.id) {
    throw new Error(`Fashn error: ${JSON.stringify(submitData)}`);
  }

  let attempts = 0;
  while (attempts < 40) {
    await new Promise((r) => setTimeout(r, 2000));
    const statusRes = await fetch(
      `https://api.fashn.ai/v1/status/${submitData.id}`,
      { headers: { Authorization: `Bearer ${process.env.FASHN_API_KEY}` } },
    );
    const s = await statusRes.json();
    console.log(`Fabric Fashn poll ${attempts + 1}: ${s.status}`);
    if (s.status === "completed") {
      const url = s.output?.[0];
      if (!url) throw new Error("Fashn: output URL missing!");
      return url;
    }
    if (s.status === "failed")
      throw new Error(`Fashn failed: ${JSON.stringify(s.error || "")}`);
    attempts++;
  }
  throw new Error("Fashn timeout");
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

      // Colors parse karo
      let colors = [];
      if (req.body.colors) {
        try {
          colors =
            typeof req.body.colors === "string"
              ? JSON.parse(req.body.colors)
              : req.body.colors;
        } catch (e) {
          colors = [req.body.colors];
        }
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
        colors: colors || [],
        brand: req.body.brand || "",
        material: req.body.material || "",
        occasion: req.body.occasion || "any",
        pattern: req.body.pattern || "solid",
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

    // Query build karo
    const query = {
      seller: seller._id,
      isActive: true,
      inStock: true,
    };

    // Color filter
    if (req.query.color) {
      query.colors = {
        $in: [new RegExp(req.query.color, "i")],
      };
    }

    // Brand filter
    if (req.query.brand) {
      query.brand = new RegExp(req.query.brand, "i");
    }

    // Material filter
    if (req.query.material) {
      query.material = new RegExp(req.query.material, "i");
    }

    // Occasion filter
    if (req.query.occasion && req.query.occasion !== "all") {
      query.occasion = req.query.occasion;
    }

    // Pattern filter
    if (req.query.pattern && req.query.pattern !== "all") {
      query.pattern = req.query.pattern;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) {
        query.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        query.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Sort
    let sortOption = { createdAt: -1 }; // Default: newest
    if (req.query.sort === "price_asc") sortOption = { price: 1 };
    if (req.query.sort === "price_desc") sortOption = { price: -1 };
    if (req.query.sort === "name_asc") sortOption = { name: 1 };
    if (req.query.sort === "newest") sortOption = { createdAt: -1 };

    const products = await FabricProduct.find(query).sort(sortOption);

    // Unique values for filter dropdowns
    const allProducts = await FabricProduct.find({
      seller: seller._id,
      isActive: true,
    });

    const filterMeta = {
      colors: [...new Set(allProducts.flatMap((p) => p.colors || []))].filter(
        Boolean,
      ),
      brands: [...new Set(allProducts.map((p) => p.brand).filter(Boolean))],
      materials: [
        ...new Set(allProducts.map((p) => p.material).filter(Boolean)),
      ],
      priceRange: {
        min: Math.min(...allProducts.map((p) => p.price)),
        max: Math.max(...allProducts.map((p) => p.price)),
      },
      occasions: [
        ...new Set(allProducts.map((p) => p.occasion).filter(Boolean)),
      ],
      patterns: [...new Set(allProducts.map((p) => p.pattern).filter(Boolean))],
    };

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
      filterMeta,
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
    const garmentUrl =
      typeof garmentImageUrl === "string"
        ? garmentImageUrl
        : garmentImageUrl?.url || String(garmentImageUrl);

    console.log("Garment URL type:", typeof garmentImageUrl);
    console.log("Garment URL value:", garmentUrl);

    if (!garmentUrl || !garmentUrl.startsWith("http")) {
      return res.status(400).json({
        message: "Valid garment image URL nahi mili!",
      });
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

    // Fabric ke liye bhi garment type detect karo
    const fabricDesc = (req.body.garmentType || "").toLowerCase();

    const fabricLowerKeywords = [
      "pant",
      "pants",
      "trouser",
      "trousers",
      "jeans",
      "salwar",
      "bottom",
      "lower",
      "skirt",
      "legging",
    ];
    const fabricDressKeywords = [
      "dress",
      "saree",
      "kurti",
      "kurta",
      "salwar_suit",
      "salwar suit",
      "suit",
      "gown",
      "jumpsuit",
      "lehenga",
      "lehnga",
      "anarkali",
    ];

    let fabricGarmentType = "upper body shirt clothing";
    let fabricIsCrop = false;

    const isFabricLower = fabricLowerKeywords.some((k) =>
      fabricDesc.includes(k),
    );
    const isFabricDress = fabricDressKeywords.some((k) =>
      fabricDesc.includes(k),
    );

    if (isFabricLower) {
      fabricGarmentType = "lower body pants trousers";
      fabricIsCrop = true;
    } else if (isFabricDress) {
      fabricGarmentType = "full body dress outfit";
      fabricIsCrop = false;
    } else {
      fabricGarmentType = "upper body shirt top clothing";
      fabricIsCrop = false;
    }

    console.log("Fabric garment type:", fabricGarmentType);

    // Human image upload
    console.log("📸 Fabric try-on started...");

    // Human image upload
    const humanUrl = await uploadToCloudinary(req.file.buffer, "fabric/humans");

    // Category for Fashn.ai
    let fashnCategory = "tops";
    if (isFabricLower) fashnCategory = "bottoms";
    else if (isFabricDress) fashnCategory = "one-pieces";

    let savedImageUrl = "";

    // ─── SMART ROUTING ───────────────────────────────────────────
    // Upper body → SIRF IDM-VTON (Fashn stomach distort karta hai)
    // Lower body + Dress/Full → SIRF Fashn.ai
    // ─────────────────────────────────────────────────────────────

    if (isFabricLower || isFabricDress) {
      // ── FASHN.AI (Lower + Dress only) ──────────────────────────
      if (!process.env.FASHN_API_KEY) {
        return res.status(500).json({
          message:
            "FASHN_API_KEY missing! Lower/Dress try-on ke liye zaroori hai.",
        });
      }
      console.log(
        `🎯 Fashn.ai route: ${isFabricLower ? "bottoms" : "one-pieces"}`,
      );
      savedImageUrl = await runFashnTryon(humanUrl, garmentUrl, fashnCategory);
      console.log("✅ Fabric Fashn result:", savedImageUrl);
    } else {
      // ── IDM-VTON (Upper body ONLY) ──────────────────────────────
      console.log("👕 IDM-VTON route: upper body");
      const output = await replicate.run(
        "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
        {
          input: {
            human_img: humanUrl,
            garm_img: garmentUrl,
            garment_des: fabricGarmentType,
            is_checked: true,
            is_checked_crop: fabricIsCrop,
            denoise_steps: 30,
            seed: 42,
          },
        },
      );
      if (typeof output === "string") {
        savedImageUrl = output;
      } else if (Array.isArray(output)) {
        const item = output[0];
        if (typeof item === "string") {
          savedImageUrl = item;
        } else if (item && item.href) {
          savedImageUrl = item.href;
        } else if (item && typeof item.url === "function") {
          savedImageUrl = item.url();
        } else {
          savedImageUrl = String(item);
        }
      } else if (output && output.href) {
        savedImageUrl = output.href;
      } else if (output && typeof output.url === "function") {
        savedImageUrl = output.url();
      }
      console.log("✅ IDM-VTON result:", savedImageUrl);
    }

    console.log("🎉 Fabric try-on done!");

    // // Replicate URL ko Cloudinary par save karo
    // let savedImageUrl = output;
    // try {
    //   const imageResponse = await fetch(output);
    //   const imageBuffer = await imageResponse.arrayBuffer();
    //   const buffer = Buffer.from(imageBuffer);

    //   savedImageUrl = await new Promise((resolve, reject) => {
    //     const stream = cloudinary.uploader.upload_stream(
    //       { folder: "fabric/tryons" },
    //       (error, result) => {
    //         if (error) reject(error);
    //         else resolve(result.secure_url);
    //       },
    //     );
    //     stream.end(buffer);
    //   });
    //   console.log("✅ Tryon saved to Cloudinary!");
    // } catch (saveError) {
    //   console.log("Cloudinary save error:", saveError.message);
    //   // Fallback: original URL use karo
    //   savedImageUrl = output;
    // }

    // console.log("🎉 Fabric try-on done!");

    // Style advice (optional - 1 credit)
    let styleAdvice = null;
    try {
      await useCredits(Seller, seller._id, "styleAdvice");

      // Kaunsi key hai check karo
      let styleEndpoint = "";
      let styleHeaders = {};
      let styleBody = {};

      if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) {
        // Direct Anthropic
        styleEndpoint = "https://api.anthropic.com/v1/messages";
        styleHeaders = {
          "Content-Type": "application/json",
          "x-api-key":
            process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY,
          "anthropic-version": "2023-06-01",
        };
        styleBody = {
          model: "claude-haiku-4-5",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "url", url: savedImageUrl },
                },
                {
                  type: "text",
                  text: `aap ek expert fashion stylist hai.
Is try-on image ko dekh kar Hindi mein batao:

1. 🎨 Color Rating: /10
2. ✅ Kya yah achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karna chahiye
5. 🎯 Kis occasion ke liye perfect
6. 🎯 skin color kaisi hai and  skin color ke hisab se aur konse color combination achha dikhega.
7. ✨ aur konse dress combination achhe rahenge.
8. 🎯 Aur kya hand accesories or hairstyle or other improvement kar sakte hain, taki confident and smart dikhen

Short aur friendly jawab den!`,
                },
              ],
            },
          ],
        };
      } else if (process.env.OPENROUTER_API_KEY) {
        // OpenRouter
        styleEndpoint = "https://openrouter.ai/api/v1/chat/completions";
        styleHeaders = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
        };
        styleBody = {
          model: "anthropic/claude-3-haiku",
          max_tokens: 800,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: savedImageUrl },
                },
                {
                  type: "text",
                  text: `Tum ek expert fashion stylist hai.
Is try-on image ko dekh kar Hindi mein batao:

1. 🎨 Color Rating: /10
2. ✅ Kya yah achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karna chahiye
5. 🎯 Kis occasion ke liye perfect
6. 🎯 skin color kaisi hai and  skin color ke hisab se aur konse color combination achha dikhega.
7. ✨ aur konse dress combination achhe rahenge.
8. 🎯 Aur kya hand accesories or hairstyle or other improvement kar sakte hain, taki confident and smart dikhen

Short aur friendly jawab den!`,
                },
              ],
            },
          ],
        };
      }

      if (styleEndpoint) {
        const styleRes = await fetch(styleEndpoint, {
          method: "POST",
          headers: styleHeaders,
          body: JSON.stringify(styleBody),
        });
        const styleData = await styleRes.json();

        // Response parse karo
        if (styleData.content) {
          // Anthropic format
          styleAdvice = styleData.content?.[0]?.text || null;
        } else if (styleData.choices) {
          // OpenRouter format
          styleAdvice = styleData.choices?.[0]?.message?.content || null;
        }
      }
    } catch (e) {
      console.log("Style advice skip:", e.message);
      console.error("❌ Style advice error details:", e);
    }

    // Legacy count
    await Seller.findByIdAndUpdate(seller._id, {
      $inc: { tryonCount: 1 },
    });

    res.json({
      success: true,
      resultImage: savedImageUrl,
      styleAdvice: styleAdvice,
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
