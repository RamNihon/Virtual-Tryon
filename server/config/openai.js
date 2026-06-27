// OpenAI configuration for fabric generation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Credit costs
const CREDIT_COSTS = {
  readyTryon: 10, // IDM-VTON try-on
  fabricGen: 12, // GPT Image 2 fabric → garment
  fabricTryon: 11, // IDM-VTON for fabric garment
  styleAdvice: 1, // Claude style advice
};

// Monthly caps per plan
const MONTHLY_CAPS = {
  free: 100,
  basic: 1500,
  pro: 5000,
  elite: 12000,
};

// ─── Credit Check & Deduct ────────────────
const useCredits = async (Seller, sellerId, action, metadata = {}) => {
  const cost = CREDIT_COSTS[action];
  if (!cost) throw new Error("Invalid action!");

  const seller = await Seller.findById(sellerId);
  if (!seller) throw new Error("Seller nahi mila!");

  // Monthly reset
  const lastReset = new Date(seller.lastResetDate);
  const now = new Date();
  if (
    now.getMonth() !== lastReset.getMonth() ||
    now.getFullYear() !== lastReset.getFullYear()
  ) {
    await Seller.findByIdAndUpdate(sellerId, {
      monthlyCreditsUsed: 0,
      lastResetDate: now,
    });
    seller.monthlyCreditsUsed = 0;
  }

  // Checks
  const cap = MONTHLY_CAPS[seller.plan] || 100;
  if (seller.monthlyCreditsUsed + cost > cap) {
    throw new Error(
      `Monthly limit khatam! (${seller.monthlyCreditsUsed}/${cap})\nTop-up karo.`,
    );
  }
  if (seller.credits < cost) {
    throw new Error(
      `Credits khatam! Sirf ${seller.credits} baaki.\nTop-up karo.`,
    );
  }

  const balanceBefore = seller.credits;

  // Deduct
  await Seller.findByIdAndUpdate(sellerId, {
    $inc: {
      credits: -cost,
      totalCreditsUsed: cost,
      monthlyCreditsUsed: cost,
    },
  });

  // Transaction save karo
  try {
    const CreditTransaction = require("../models/CreditTransaction");
    await CreditTransaction.create({
      seller: sellerId,
      type: "debit",
      action,
      credits: cost,
      balanceBefore,
      balanceAfter: balanceBefore - cost,
      description: getActionDescription(action),
      metadata,
    });
  } catch (e) {
    console.log("Transaction log error:", e.message);
  }

  return { success: true, cost, remaining: balanceBefore - cost };
};

const getActionDescription = (action) => {
  const descriptions = {
    readyTryon: "Ready-made Virtual Try-On",
    fabricGen: "Fabric to Garment Generation (AI)",
    fabricTryon: "Fabric Garment Try-On",
    styleAdvice: "AI Style Advice",
  };
  return descriptions[action] || action;
};

// ─── Garment Type Prompts ─────────────────
const getGarmentPrompt = (garmentType, additionalInfo = "") => {
  const prompts = {
    shirt_full: `Create a professional product photo of a men's 
      full sleeve formal shirt made from this exact fabric. 
      Preserve every detail of the fabric - color, texture, 
      pattern, and weave exactly as shown. Display on invisible 
      mannequin, front view, complete shirt visible, 
      white background, commercial catalog quality, 
      no model, no person.`,

    shirt_half: `Create a professional product photo of a men's 
      half sleeve casual shirt made from this exact fabric. 
      Preserve fabric color, texture, and pattern exactly. 
      Front view, complete shirt visible, white background, 
      commercial quality, no model.`,

    pant: `Create a professional product photo of men's 
      formal trousers made from this exact fabric. 
      Preserve fabric color, texture, pattern exactly. 
      Front view, complete pants visible, white background, 
      commercial catalog quality, no model.`,

    kurta: `Create a professional product photo of a traditional 
      Indian men's kurta made from this exact fabric. 
      Full length kurta, front view, complete garment visible, 
      white background, preserve fabric exactly, no model.`,

    salwar_suit: `Create a professional product photo of an 
      Indian women's salwar kameez set made from this exact fabric. 
      Complete 3-piece set (kameez, salwar, dupatta), 
      front view, white background, 
      preserve fabric color and texture exactly, no model.`,

    kurti: `Create a professional product photo of an Indian 
      women's kurti made from this exact fabric. 
      Full length kurti, front view, white background, 
      preserve fabric exactly, commercial quality, no model.`,

    saree: `Create a professional product photo of an Indian 
      saree draped elegantly on an invisible mannequin, 
      made from this exact fabric. 
      Traditional draping style, full view, white background, 
      preserve fabric color, texture, and pattern exactly.`,
  };

  const base = prompts[garmentType] || prompts.shirt_full;
  return additionalInfo
    ? `${base} Additional details: ${additionalInfo}`
    : base;
};

// ─── Generate Garment from Fabric ─────────
const generateGarmentFromFabric = async (
  fabricImageBase64,
  garmentType,
  additionalInfo = "",
) => {
  const prompt = getGarmentPrompt(garmentType, additionalInfo);

  // Convert base64 to File/Blob format for API
  const imageBuffer = Buffer.from(fabricImageBase64, "base64");
  const blob = new Blob([imageBuffer], { type: "image/jpeg" });

  const formData = new FormData();
  formData.append("model", "gpt-image-2");
  formData.append("prompt", prompt);
  formData.append("n", "1");
  formData.append("size", "1024x1536");
  formData.append("quality", "medium");
  formData.append("image", blob, "fabric.jpg");

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "GPT Image generation failed!");
  }

  // Return base64 image
  return data.data[0].b64_json;
};

// server/config/openai.js mein
// generateGarmentFromFabric ke baad add karo:

const tryOnGarmentGPT = async (
  humanImageBase64,
  garmentImageUrl
) => {
  console.log('🚀 GPT Image 2 try-on starting...')

  // Garment image download karo
  const garmentResponse = await fetch(garmentImageUrl)
  if (!garmentResponse.ok) {
    throw new Error('Garment image download failed!')
  }
  const garmentArrayBuffer = await garmentResponse.arrayBuffer()
  const garmentBuffer = Buffer.from(garmentArrayBuffer)

  // Human image buffer
  const humanBuffer = Buffer.from(humanImageBase64, 'base64')

  // FormData banao
  const FormData = require('form-data')
  const formData = new FormData()

  formData.append('model', 'gpt-image-2')
  formData.append('prompt',
    `Virtual try-on: Make this person wear the garment from the second image.
    CRITICAL RULES:
    - Keep the person's face EXACTLY identical - same skin tone, features, expression
    - Keep the background EXACTLY the same
    - Keep the person's pants/lower body same
    - Only replace the upper body clothing with the provided garment
    - Make the fit look natural and realistic
    - Preserve hair, accessories, and all facial details perfectly`
  )
  formData.append('n', '1')
  formData.append('size', '1024x1536')
  formData.append('quality', 'medium')

  // Images append karo
  formData.append(
    'image[]',
    humanBuffer,
    { filename: 'person.jpg', contentType: 'image/jpeg' }
  )
  formData.append(
    'image[]',
    garmentBuffer,
    { filename: 'garment.jpg', contentType: 'image/jpeg' }
  )

  const response = await fetch(
    'https://api.openai.com/v1/images/edits',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      },
      body: formData
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.log('GPT Image 2 error:', data)
    throw new Error(data.error?.message || 'GPT Image 2 try-on failed!')
  }

  console.log('✅ GPT Image 2 try-on done!')
  return data.data[0].b64_json
}

module.exports = {
  generateGarmentFromFabric,
   tryOnGarmentGPT,
  useCredits,
    getActionDescription,
  CREDIT_COSTS,
  MONTHLY_CAPS,
};
