const express = require("express");
const router = express.Router();
const cloudinary = require("../config/cloudinary");
const upload = require("../middleware/upload");
const Replicate = require("replicate");
const Seller = require("../models/seller");
const { useCredits } = require("../config/openai");
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
Is try-on image ko dekh kar Hindi mein batayen:

1. 🎨 Color Rating: /10
2. ✅ Kya yah achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karein
5. 🎯 Kis occasion ke liye perfect
6. 🎯 skin color kaisi hai and  skin color ke hisab se aur konse color combination achha dikhega
7. 🎯 Aur kya accesories or hairstyle or other improvement kar sakte hain, taki bold and confident dikhen

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
2. ✅ Kya yah achha lag raha hai
3. 👖 Best combination (pant/bottom)
4. ❌ Kya avoid karein
5. 🎯 Kis occasion ke liye perfect
6. 🎯 skin color kaisi hai and  skin color ke hisab se aur konse color combination achha dikhega
7. 🎯 Aur kya accesories or hairstyle or other improvement kar sakte hain, taki bold and confident dikhen

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
      const apiKey = req.headers["x-api-key"];

      if (!apiKey) {
        return res.status(401).json({
          message: "API key missing!",
        });
      }

      const seller = await Seller.findOne({ apiKey });
      if (!seller) {
        return res.status(401).json({
          message: "Invalid API key!",
        });
      }

      // Credit check
      try {
        await useCredits(Seller, seller._id, "readyTryon");
      } catch (creditError) {
        return res.status(403).json({
          message: creditError.message,
          type: "insufficient_credits",
        });
      }

      if (!req.files?.humanImage?.[0]) {
        return res.status(400).json({
          message: "Photo upload karo!",
        });
      }

      // Human image cloudinary par upload karo
      const humanUrl = await uploadToCloudinary(
        req.files.humanImage[0].buffer,
        "tryon/humans",
      );

      const garmentUrl = req.body.garmentUrl;

      if (!garmentUrl) {
        return res.status(400).json({
          message: "Garment image URL missing!",
        });
      }

      console.log("🚀 IDM-VTON starting...");
      console.log("Human URL:", humanUrl);
      console.log("Garment URL:", garmentUrl);

      // IDM-VTON run karo
      const rawOutput = await replicate.run(
        "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
        {
          input: {
            human_img: humanUrl,
            garm_img: garmentUrl,
            garment_des: req.body.description || "clothing",
            is_checked: true,
            is_checked_crop: false,
            denoise_steps: 30,
            seed: 42,
          },
        },
      );

     // Neeche yeh add karo:
console.log('RAW OUTPUT:', output)
console.log('OUTPUT TYPE:', typeof output)

// ReadableStream handle karo (Replicate new format)
let resultUrl = ''

if (typeof rawOutput === 'string') {
  resultUrl = rawOutput
} else if (Array.isArray(rawOutput)) {
  const first = rawOutputt[0]
resultUrl = typeof item === 'string' ? item
    : (typeof item?.url === 'function' ? item.url()
    : item?.url || String(item))
} else if (rawOutput?.url) {
  resultUrl = typeof rawOutput.url === 'function'
    ? rawOutput.url()
    : rawOutput.url
} else {
  // ReadableStream - iterate karo
  try {
    let lastValue = ''
    for await (const event of rawOutput) {
      console.log('Stream event:', event)
      lastValue = event
    }
    resultUrl = typeof lastValue === 'string'
      ? lastValue
      : (lastValue?.url ? lastValue.url() : String(lastValue))
  } catch (e) {
    console.log('Stream iteration error:', e.message)
  }
}

console.log('Final result URL:', resultUrl)

if (!resultUrl || !resultUrl.startsWith('http')) {
  return res.status(500).json({
    message: 'Try-on result URL nahi mili! Replicate issue.'
  })
}

console.log('EXTRACTED URL:', resultUrl)

console.log('FINAL URL:', resultUrl)

      // Cloudinary par save karo
    let finalImageUrl = resultUrl
try {
  const imageResponse = await fetch(resultUrl)
  if (imageResponse.ok) {
    const arrayBuffer = await imageResponse.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    finalImageUrl = await uploadToCloudinary(
      buffer,
      'tryon/results'
    )
    console.log('✅ Saved to Cloudinary:', finalImageUrl)
  }
} catch (saveErr) {
  console.log('⚠️ Cloudinary save failed:', saveErr.message)
  finalImageUrl = resultUrl
}

      // Legacy count
      await Seller.findByIdAndUpdate(seller._id, {
        $inc: { tryonCount: 1 },
      });

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
      // Legacy count update
      await Seller.findByIdAndUpdate(seller._id, {
        $inc: { tryonCount: 1 },
      });

      console.log("✅ Sab done!");

      res.json({
        success: true,
        resultImage: finalImageUrl,
        styleAdvice,
        humanImage: humanUrl,
        garmentImage: garmentUrl,
      });

      await TryonHistory.create({
        seller: seller._id,
        resultImage: rawOutput,
        humanImage: humanUrl,
      });
    } catch (error) {
      console.error("❌Tryon Error:", error.message);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  },
);

module.exports = router;
