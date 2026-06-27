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
        max_tokens: 800,
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
          max_tokens: 800,
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

// ─── Fashn.ai Try-On Helper ───────────────
const runFashnTryon = async (
  humanUrl,
  garmentUrl,
  category = "tops",
  isDress = false,
) => {
  console.log("🚀 FASH_AI starting...");
  if (!process.env.FASHN_API_KEY) {
    throw new Error("FASHN_API_KEY not configured!");
  }

  console.log(`🎯 Fashn.ai starting... category: ${category}`);

  // 1. तय करें कि कौन सा मॉडल और कौन सा पेलोड इस्तेमाल करना है
  let modelName = "tryon-v1.6"; // डिफ़ॉल्ट मॉडल
  let apiInputs = {};

  if (isDress) {
    // अगर लहंगा, साड़ी, सूट, गाउन है तो 2-क्रेडिट वाला PREMIUM TRYON-MAX मॉडल चलाएं
    modelName = "tryon-max";
    apiInputs = {
      product_image: garmentUrl,
      model_image: humanUrl,
    };
    console.log("🚀 Using PREMIUM MODEL: tryon-max (For Heavy Ethnic Wear)");
  } else {
    // अगर शर्ट, टी-शर्ट या पैंट है तो 1-क्रेडिट वाला ECONOMY V1.6 मॉडल सारे एडवांस्ड पैरामीटर्स के साथ चलाएं
    modelName = "tryon-v1.6";
    let photoType = "flat-lay";
    const lowerDesc = garmentDesc ? garmentDesc.toLowerCase() : "";

    // अगर डिस्क्रिप्शन में 'model' या 'worn by' या 'man' या 'woman' जैसे कीवर्ड्स हैं
    if (
      lowerDesc.includes("model") ||
      lowerDesc.includes("wear") ||
      lowerDesc.includes("man") ||
      lowerDesc.includes("woman") ||
      lowerDesc.includes("girl")
    ) {
      photoType = "model"; // अगर किसी इंसान ने पहना है तो खुद 'model' मोड पर स्विच हो जाएगा
    }
    apiInputs = {
      model_image: humanUrl,
      garment_image: garmentUrl,
      category: category, // "tops" या "bottoms"
      mode: "quality", // बेस्ट क्वालिटी
      garment_photo_type: photoType,
      segmentation_free: true, // पेट का शेप बचाने के लिए ज़रूरी
    };
    console.log(
      "🛡️ Using ECONOMY MODEL: tryon-v1.6 (For Upper/Lower body with Body Preservation)",
    );
  }

  // Step 1: Submit request
  const submitRes = await fetch("https://api.fashn.ai/v1/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
    },
    body: JSON.stringify({
      model_name: modelName,
      inputs: apiInputs,
    }),
  });

  const submitData = await submitRes.json();
  console.log("Fashn submit:", submitData);

  if (!submitData.id) {
    throw new Error(`Fashn submit failed: ${JSON.stringify(submitData)}`);
  }

  const predictionId = submitData.id;

  // Step 2: Poll for result
  let attempts = 0;
  const maxAttempts = 40; // 80 seconds

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 2000));

    const statusRes = await fetch(
      `https://api.fashn.ai/v1/status/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
        },
      },
    );

    const statusData = await statusRes.json();
    console.log(`Fashn poll ${attempts + 1}: ${statusData.status}`);

    if (statusData.status === "completed") {
      const outputUrl = statusData.output?.[0];
      if (!outputUrl) throw new Error("Fashn: output URL missing!");
      console.log("✅ Fashn result:", outputUrl);
      return outputUrl;
    } else if (statusData.status === "failed") {
      throw new Error(
        `Fashn failed: ${JSON.stringify(statusData.error || "")}`,
      );
    }

    attempts++;
  }

  throw new Error("Fashn timeout after 80 seconds");
};

// ─── IDM-VTON Helper (fallback) ──────────
const runIDMVTON = async (humanUrl, garmentUrl, garmentType, isCrop) => {
  console.log("🔄 IDM-VTON running...");
  const rawOutput = await replicate.run(
    "cuuupid/idm-vton:906425dbca90663ff5427624839572cc56ea7d380343d13e2a4c4b09d3f0c30f",
    {
      input: {
        human_img: humanUrl,
        garm_img: garmentUrl,
        garment_des: garmentType,
        is_checked: true,
        is_checked_crop: isCrop,
        denoise_steps: 30,
        seed: 42,
      },
    },
  );

  console.log("IDM raw output type:", typeof rawOutput);

  let url = "";

  if (typeof rawOutput === "string") {
    url = rawOutput;
  } else if (Array.isArray(rawOutput)) {
    const item = rawOutput[0];
    if (typeof item === "string") {
      url = item;
    } else if (item && typeof item.url === "function") {
      url = item.url();
    } else if (item && item.href) {
      // URL object - href se nikaalo
      url = item.href;
    } else if (item && item.url) {
      url = String(item.url);
    } else {
      url = String(item);
    }
  } else if (rawOutput && typeof rawOutput.url === "function") {
    url = rawOutput.url();
  } else if (rawOutput && rawOutput.href) {
    // URL object directly
    url = rawOutput.href;
  } else if (rawOutput && rawOutput.url) {
    url = String(rawOutput.url);
  } else {
    // ReadableStream
    try {
      let last = "";
      for await (const event of rawOutput) {
        last = event;
      }
      if (typeof last === "string") {
        url = last;
      } else if (last && last.href) {
        url = last.href;
      } else if (last && typeof last.url === "function") {
        url = last.url();
      } else {
        url = String(last);
      }
    } catch (e) {
      console.log("Stream error:", e.message);
    }
  }

  console.log("IDM extracted URL:", url);
  return url;
};

// This is tron.js code
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
      const garmentDesc = (req.body.description || "upper_body").toLowerCase();

      if (!garmentUrl) {
        return res.status(400).json({
          message: "Garment image URL missing!",
        });
      }

      // ─── Garment Category Detection ───────────
      // Lower body keywords
      const lowerKeywords = [
        "lower_body",
        "lower body",
        "pant",
        "pants",
        "trouser",
        "trousers",
        "jeans",
        "bottom",
        "legging",
        "leggings",
        "skirt",
        "shorts",
        "pajama",
        "dhoti",
        "lungi",
        "salwar",
      ];

      // Upper body keywords
      const upperKeywords = [
        "upper_body",
        "upper body",
        "shirt",
        "tshirt",
        "t-shirt",
        "top",
        "blouse",
        "jacket",
        "sweater",
        "hoodie",
        "coat",
        "blazer",
        "polo",
        "tank",
        "vest",
      ];

      // Dress keywords
      const dressKeywords = [
        "dress",
        "frock",
        "gown",
        "saree",
        "kurti",
        "kurta",
        "dupatta",
        "jumpsuit",
        "salwar_suit",
        "salwar suit",
        "suit",
        "lehenga",
        "anarkali",
      ];

      let garmentType = "upper body shirt clothing";
      let isCrop = false;
      let isLower = false;
      let isDress = false;

      const isLowerBody = lowerKeywords.some((k) => garmentDesc.includes(k));
      isDress = dressKeywords.some((k) => garmentDesc.includes(k));

      if (isLowerBody) {
        garmentType = "pants trousers lower body bottoms";
        isCrop = true;
      } else if (isDress) {
        garmentType = "full body dress";
        isCrop = false;
        let isDress = true;
      } else {
        garmentType = "upper body shirt";
        isCrop = false;
      }

      console.log(`Final garment_des: "${garmentType}", isCrop: ${isCrop}`);

      console.log(`Category: "${garmentDesc}" → ${garmentType}`);
      console.log(`isCrop: ${isCrop}`);

      // console.log("Human URL:", humanUrl);
      // console.log("Garment URL:", garmentUrl);

      // IDM-VTON run karo
      // ─── Smart Routing ────────────────────────
      let resultUrl = "";

      // Fashn.ai category determine karo
      let fashnCategory = "tops";
      if (isLowerBody) fashnCategory = "bottoms";
      else if (isDress) fashnCategory = "one-pieces";

      if (process.env.FASHN_API_KEY) {
        // Sab kuch Fashn.ai se
        try {
          resultUrl = await runFashnTryon(
            humanUrl,
            garmentUrl,
            fashnCategory,
            isDress,
          );
        } catch (fashnErr) {
          console.log("⚠️ Fashn failed, IDM-VTON fallback:", fashnErr.message);
          resultUrl = await runIDMVTON(
            humanUrl,
            garmentUrl,
            garmentType,
            isCrop,
          );
        }
      } else {
        // Sirf IDM-VTON
        resultUrl = await runIDMVTON(humanUrl, garmentUrl, garmentType, isCrop);
      }

      console.log("Final resultUrl:", resultUrl);

      // अगर ऊपर से फिर भी Object रह गया हो, तो string में कन्वर्ट करने का फाइनल सेफ्टी चेक
      // if (resultUrl && typeof resultUrl === "object") {
      //   resultUrl = resultUrl.href || resultUrl.toString();
      // }

      console.log("EXTRACTED URL:", resultUrl);

      console.log("FINAL URL:", resultUrl);

      // Cloudinary par save karo
      let finalImageUrl = resultUrl;
      try {
        const imageResponse = await fetch(resultUrl);
        if (imageResponse.ok) {
          const arrayBuffer = await imageResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          finalImageUrl = await uploadToCloudinary(buffer, "tryon/results");
          console.log("✅ Saved to Cloudinary:", finalImageUrl);
        }
      } catch (saveErr) {
        console.log("⚠️ Cloudinary save failed:", saveErr.message);
        finalImageUrl = resultUrl;
      }

      // Legacy count
      await Seller.findByIdAndUpdate(seller._id, {
        $inc: { tryonCount: 1 },
      });

      console.log("🎉 Try-on result ready!");
      console.log("✨ Style advice le rahe hain...");

      // Style Advice - Jo .env mein key ho wahi use hogi
      let styleAdvice = null;

      try {
        if (process.env.CLAUDE_API_KEY) {
          // Direct Anthropic use karo
          console.log("Using: Direct Anthropic Claude");
          styleAdvice = await getStyleAdviceClaude(finalImageUrl);
        } else if (process.env.OPENROUTER_API_KEY) {
          // OpenRouter use karo - (👈 यहाँ सही फंक्शन का नाम बदल दिया है)
          console.log("Using: OpenRouter Claude");
          styleAdvice = await getStyleAdviceOpenRouter(finalImageUrl);
        }
      } catch (adviceErr) {
        // अगर API में कोई एरर आता है, तो यहाँ दिखेगा पर आपका मुख्य रिस्पॉन्स नहीं रुकेगा
        console.log(
          "⚠️ Style Advice fail hua par result image safe hai:",
          adviceErr.message,
        );
        styleAdvice = "Style advice is temporary unavailable.";
      }

      // Try-on count badhao
      // Legacy count update
      await Seller.findByIdAndUpdate(seller._id, {
        $inc: { tryonCount: 1 },
      });

      console.log("✅ All done!");

      res.json({
        success: true,
        resultImage: finalImageUrl,
        styleAdvice,
        humanImage: humanUrl,
        garmentImage: garmentUrl,
      });

      await TryonHistory.create({
        seller: seller._id,
        resultImage: finalImageUrl,
        humanImage: humanUrl,
        garmentImage: garmentUrl || "",
        productName: req.body.productName || "",
        category: req.body.description || "upper_body",
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

// ─── Gallery Route ────────────────────────
router.get("/gallery", async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ message: "API key missing!" });
    }

    const seller = await Seller.findOne({ apiKey });
    if (!seller) {
      return res.status(401).json({ message: "Invalid API key!" });
    }

    // Customer session ID se filter (optional)
    const sessionId = req.query.sessionId;

    const query = { seller: seller._id };

    const history = await TryonHistory.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
