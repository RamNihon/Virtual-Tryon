const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const Replicate = require("replicate");
const Seller = require("../models/seller");
const { sendLimitWarningEmail } = require("../config/email");
const TryonHistory = require("../models/TryonHistory");

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// ─── Cloudinary Upload Helper ─────────────
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

// ─── Option 1: Direct Anthropic Claude ────
const getStyleAdviceClaude = async (imageUrl) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.CLAUDE_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "url",
                  url: imageUrl,
                },
              },
              {
                type: "text",
                text: `Tu ek expert fashion stylist hai.
Is try-on image ko dekh kar Hindi mein batao:

1. 🎨 Color Rating: /10
2. ✅ Kya achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karein
5. 🎯 Kis occasion ke liye perfect

Short aur friendly jawab do!`,
              },
            ],
          },
        ],
      }),
    });

    const data = await response.json();
    console.log("Claude Direct Response:", data);

    // Direct Anthropic ka response structure
    return data.content[0].text;
  } catch (error) {
    console.log("Claude Direct Error:", error.message);
    return null;
  }
};

// ─── Option 2: OpenRouter Se Claude ───────
const getStyleAdviceOpenRouter = async (imageUrl) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.FRONTEND_URL || "http://localhost:3000",
          "X-Title": "Virtual TryOn",
        },
        body: JSON.stringify({
          model: "anthropic/claude-3-haiku",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl,
                  },
                },
                {
                  type: "text",
                  text: `Tu ek expert fashion stylist hai.
Is try-on image ko dekh kar Hindi mein batao:

1. 🎨 Color Rating: /10
2. ✅ Kya achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karein
5. 🎯 Kis occasion ke liye perfect

Short aur friendly jawab do!`,
                },
              ],
            },
          ],
        }),
      },
    );

    const data = await response.json();
    console.log("OpenRouter Response:", data);

    // OpenRouter ka response structure
    return data.choices[0].message.content;
  } catch (error) {
    console.log("OpenRouter Error:", error.message);
    return null;
  }
};

// ─── Main Try-On Route ─────────────────────
router.post(
  "/",
  upload.fields([
    { name: "humanImage", maxCount: 1 },
    { name: "garmentImage", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // API Key se seller identify karo
      const apiKey = req.headers["x-api-key"];
      const seller = await Seller.findOne({ apiKey });

      if (!seller) {
        return res.status(401).json({
          message: "Invalid API key!",
        });
      }

      // Limit check karo
      if (seller.tryonCount >= seller.tryonLimit) {
        // Limit khatam email bhejo
        await sendLimitWarningEmail(seller);
        return res.status(403).json({
          message: "Try-on limit khatam! Plan upgrade karo.",
        });
      }

      const newCount = seller.tryonCount + 1;
      const limitPercent = (newCount / seller.tryonLimit) * 100;

      if (limitPercent >= 90) {
        await sendLimitWarningEmail({
          ...seller.toObject(),
          tryonCount: newCount,
        });
      }

      console.log("📸 Images upload ho rahi hain...");

      // Human image Cloudinary par upload karo
      const humanUrl = await uploadToCloudinary(
        req.files["humanImage"][0].buffer,
        "tryon/humans",
      );

      // Garment image - file ya URL
      let garmentUrl;
      if (req.files["garmentImage"]) {
        garmentUrl = await uploadToCloudinary(
          req.files["garmentImage"][0].buffer,
          "tryon/garments",
        );
      } else if (req.body.garmentUrl) {
        garmentUrl = req.body.garmentUrl;
      }

      console.log("✅ Cloudinary upload done!");
      console.log("🤖 Replicate AI processing...");

      // Replicate IDM-VTON call
      const output = await replicate.run(
        "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
        {
          input: {
            human_img: humanUrl,
            garm_img: garmentUrl,
            garment_des: req.body.description || "clothing item",
            is_checked: true,
            is_checked_crop: false,
            denoise_steps: 30,
            seed: 42,
          },
        },
      );

      console.log("🎉 Try-on result ready!");
      console.log("✨ Style advice le rahe hain...");

      // Style Advice - Jo .env mein key ho wahi use hogi
      let styleAdvice = null;

      if (process.env.CLAUDE_API_KEY) {
        // Direct Anthropic use karo
        console.log("Using: Direct Anthropic Claude");
        styleAdvice = await getStyleAdviceClaude(output);
      } else if (process.env.OPENROUTER_API_KEY) {
        // OpenRouter use karo
        console.log("Using: OpenRouter Claude");
        styleAdvice = await getStyleAdviceOpenRouter(output);
      }

      // Try-on count badhao
      await Seller.findByIdAndUpdate(seller._id, {
        $inc: { tryonCount: 1 },
      });

      console.log("✅ Sab done!");

      res.json({
        success: true,
        resultImage: output,
        styleAdvice,
        humanImage: humanUrl,
        garmentImage: garmentUrl,
      });

      await TryonHistory.create({
        seller: seller._id,
        resultImage: output,
        humanImage: humanUrl,
      });
    } catch (error) {
      console.error("❌ Error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

module.exports = router;
