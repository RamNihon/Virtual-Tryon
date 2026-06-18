const express = require("express");
const router = express.Router();
const SupportChat = require("../models/SupportChat");
const Seller = require("../models/seller");
const { authMiddleware } = require("./seller");
const { sendContactEmail } = require("../config/email");

// ─── Topic Menu - Yeh buttons frontend dikhayega ──
const TOPICS = [
  { key: "credits", label: "💳 Credits & Payment Problems", icon: "💳" },
  { key: "tryon", label: "👗 Virtual Try-On Not Working", icon: "👗" },
  { key: "fabric", label: "🧵 Fabric Shop Issues", icon: "🧵" },
  { key: "product", label: "📸 Unable to Add Product", icon: "📸" },
  { key: "orders", label: "📦 How to Handle Orders", icon: "📦" },
  { key: "shop_down", label: "🚫 Shop Not Opening", icon: "🚫" },
  { key: "integration", label: "🔌 Widget/Integration Problems", icon: "🔌" },
  { key: "limit", label: "📊 Credits Available but Not Working", icon: "📊" },
  {
    key: "whatsapp",
    label: "📱 WhatsApp Order Received, What to Do",
    icon: "📱",
  },
  { key: "password", label: "🔐 Password / Login Issues", icon: "🔐" },
  { key: "shop_link", label: "🔗 Shop Link Problem with Widget ", icon: "🔗" },
  { key: "email", label: "📧 Email Not Received", icon: "📧" },
  { key: "others", label: "❓ Something Else / Other Problems", icon: "❓" },
];

// ─── Har topic ka structured response ──────
// action: { type: 'link', label, url } → frontend button banayega
const TOPIC_RESPONSES = {
  credits: {
    text: `💳 Credits ya Payment ki problem ho rahi hai?

Yeh karke dekhiye:

1. Dashboard mein apne current credits check karein
2. Agar credits 0 ya kam hain → Top-Up pack lijiye
3. Agar payment kiya hai par credits nahi badhe:
   • Bank statement check karein, paise kate hain ya nahi
   • 2-3 minute wait karein, kabhi processing mein time lagta hai
   • Phir bhi nahi hua to "Escalate to Developer" use karein

Top-Up Packs:
₹149 = 200 credits
₹599 = 1000 credits`,
    actions: [
      { type: "link", label: "💳 Top-Up / Pricing Page", url: "/pricing" },
      { type: "link", label: "📊 Credit History Dekhen", url: "/credits" },
    ],
    followUp: "solved",
  },

  tryon: {
    text: `👗 Try-On kaam nahi kar rahi ? Yeh check karein:

1. Photo seedhi aur puri honi chahiye (front-facing)
2. Internet connection stable honi chahiye
3. Image size 5MB se kam honi chahiye
4. Dashboard mein credits check karein, 0 to nahi?
5. Browser refresh karke dobara try karein

Agar yeh sab sahi hai aur fir bhi nahi ho raha, to yeh ek technical issue ho sakta hai.`,
    actions: [
      { type: "link", label: "📊 Credits Check Karen", url: "/dashboard" },
    ],
    followUp: "ask_more",
  },

  fabric: {
    text: `🧵 Fabric Shop ki problem ho rahi hai? Yeh dekhein:

1. Fabric Shop sirf Pro aur Elite plan mein available hai
   • Free/Basic plan mein hain to upgrade karna padega

2. Garment generate nahi ho raha?
   • Fabric ki photo clear honi chahiye (flat lay best hai)
   • Credits check karein (12 credits per generation)

3. Try-On nahi ho raha fabric ke baad?
   • Pehle garment generate hona zaroori hai
   • Phir hi try-on hoga (8 credits)

4. Generated garment image nahi dikh rahi?
   • Page refresh karein ek baar`,
    actions: [
      { type: "link", label: "🚀 Pro Plan Dekhen", url: "/pricing" },
      { type: "link", label: "🧵 Fabric Shop Dashboard", url: "/dashboard" },
    ],
    followUp: "ask_more",
  },

  product: {
    text: `📸 Product add nahi ho raha? Yeh check karein:

1. Image size 5MB se kam honi chahiye
2. Format JPG, PNG ya WEBP hona chahiye
3. Product name aur photo dono zaroori hain
4. Internet stable rakhein upload ke time

Phir bhi nahi ho raha to refresh karke dobara try karein.`,
    actions: [
      { type: "link", label: "📦 Dashboard Mein Try Karen", url: "/dashboard" },
    ],
    followUp: "ask_more",
  },

  orders: {
    text: `📦 Orders aane par kya karein? Step by step:

1. Order aate hi WhatsApp pe ya Dashboard ke Orders tab mein dikhega
2. Customer se confirm karein — size, color, quantity
3. Order ko "Accept" karein dashboard se
4. Packing karein aur tracking ID add karein (agar courier use kar rahe hain)
5. Status update karein: Packed → Shipped → Delivered
6. Customer ko WhatsApp pe update bhej dein

Yeh sab Dashboard ke "Orders" tab se manage hota hai.`,
    actions: [
      { type: "link", label: "📦 Open orders Tab ", url: "/dashboard" },
    ],
    followUp: "solved",
  },

  shop_down: {
    text: `🚫 Aapki shop khul nahi rahi customers ke liye?

1. Pehle apna shop link khud browser mein khol kar check karein
2. Link format sahi hai: yoursite.com/shop/YOUR_SELLER_ID
3. Dashboard → Overview tab mein sahi link copy karein
4. Agar link sahi hai par "Shop nahi mili"  error aa raha hai:
   • Account active hai ya nahi check karein
   • Internet connection check karein

Agar phir bhi nahi khul raha, yeh server-side issue ho sakta hai.`,
    actions: [
      { type: "link", label: "🔗 Apna Link Check Karen", url: "/dashboard" },
    ],
    followUp: "ask_more",
  },

  integration: {
    text: `🔌 Widget ya website integration mein problem?

1. Dashboard → Integration tab mein widget code milega
2. Apni website ke HTML mein <body> tag ke andar paste karein
3. API key sahi se copy hui honi chahiye, partial copy na ho
4. Widget Integration Guide page mein step-by-step troubleshooting hai

Website nahi hai? Koi baat nahi — humara free Shop Link use karein, koi coding nahi chahiye!`,
    actions: [
      {
        type: "link",
        label: "📖 Integration Guide Padhen",
        url: "/widget-guide",
      },
      {
        type: "link",
        label: "🔌 Dashboard Integration Tab",
        url: "/dashboard",
      },
    ],
    followUp: "ask_more",
  },

  limit: {
    text: `📊 Credits hain par phir bhi try-on/generation nahi ho raha?

Yeh ho sakta hai:

1. Monthly Limit khatam ho sakti hai (yeh credits se alag hai!)
   • Har plan ki ek monthly cap hoti hai
   • Free: 100/month, Basic: 1500/month, Pro: 3000/month, Elite: 10000/month
   • Yeh agle mahine reset hoti hai

2. Credits hain par monthly limit cross ho gayi ho to kaam nahi karega
   • Solution: Plan upgrade karein zyada monthly limit ke liye

3. Dashboard mein "Credits History" mein dono options dikhte hain:
   • Available Credits
   • Monthly Used / Monthly Limit`,
    actions: [
      { type: "link", label: "📊 Credit History Dekhen", url: "/credits" },
      { type: "link", label: "🚀 Plan Upgrade Karen", url: "/pricing" },
    ],
    followUp: "solved",
  },

  whatsapp: {
    text: `📱 WhatsApp pe order aaya? Yahan kaise handle karein:

1. Customer try-on karne ke baad seedha aapke WhatsApp number pe message karega
2. Message mein product naam, price, aur "order karna hai" likha hoga
3. Customer se confirm karein:
   • Size, color, quantity
   • Delivery address
   • Payment mode (UPI/COD)
4. (skip) Payment confirm hone ke baad order ko Dashboard mein "Manual Order" ke roop mein add kar sakte hain (future feature)
5. Packing aur shipping aap khud manage karein, jaise normal WhatsApp business order hote hain.

Tip: Apna WhatsApp number Dashboard → Settings mein update rakhein, taaki order aate rahein.`,
    actions: [
      {
        type: "link",
        label: "⚙️ WhatsApp Number Set Karen",
        url: "/dashboard",
      },
    ],
    followUp: "solved",
  },

  password: {
    text: `🔐 Password ya Login problem? Yeh options try karein:

1. Password bhool gaye:
   • Login page → "Forgot Password" click karein
   • Email par reset link aayega (link sirf 1 ghante ke liye valid hai)

2. Login nahi ho raha (sahi password ke baad bhi):
   • Email sahi type kiya hai check karein
   • Caps Lock on to nahi hai check karein
   • Browser cache clear karein ek baar

3. "Invalid token" ya "Session expired" aa raha hai:
   • Dobara login karein, token session  48 hours  ki hoti hai

4. Account locked lag raha hai:
   • Escalate to Developer use karein`,
    actions: [{ type: "link", label: "🔐 Go to Login Page", url: "/login" }],
    followUp: "ask_more",
  },

  shop_link: {
    text: `🔗 Shop widget  link kaam nahi kar raha?

1. Dashboard → Integration tab mein sahi link copy karein
2. Format: yoursite.com/shop/YOUR_SELLER_ID
3. Link directly browser mein paste karke khud test karein
4. Agar "Shop nahi mili" aata hai, account status check karein

Fabric Shop ka link alag hota hai: yoursite.com/fabric/YOUR_SELLER_ID
(Sirf Pro/Elite plan mein milta hai)`,
    actions: [
      {
        type: "link",
        label: "🔗 Dashboard Mein Link Dekhe",
        url: "/dashboard",
      },
    ],
    followUp: "solved",
  },

  email: {
    text: `📧 Email nahi aa rahi?

1. Spam/Junk folder bhi check karein
2. Email sahi register hua hai, Dashboard-> Account Overview mein verify karein
3. 2-3 minute wait karein, kabhi-kabhi thodi delay ho sakti hai
4. Email apko aaye ya  na aaye, aapka kaam (jaise payment, registration) ho chuka hota hai — Dashboard ko check karein`,
    actions: [
      { type: "link", label: "👤 Check in Dashboard", url: "/dashboard" },
    ],
    followUp: "solved",
  },

  others: {
    text: `❓ Koi aur problem hai? Neeche box mein apni problem detail mein likhein.

Main poori koshish karunga help karne ki. Agar main solve nahi kar paya, to "Escalate to Developer" button se seedha me developer ko apki problem email kar dunga!`,
    actions: [],
    followUp: "free_text",
  },
};

// ─── Keyword se topic detect karo (free text ke liye) ──
const detectTopic = (msg) => {
  const m = msg.toLowerCase();
  if (m.includes("credit") || m.includes("payment") || m.includes("paisa"))
    return "credits";
  if (m.includes("fabric")) return "fabric";
  if (m.includes("tryon") || m.includes("try-on") || m.includes("try on"))
    return "tryon";
  if (m.includes("product") || m.includes("upload")) return "product";
  if (m.includes("order")) return "orders";
  if (
    m.includes("shop") &&
    (m.includes("down") || m.includes("nahi khul") || m.includes("khul rahi"))
  )
    return "shop_down";
  if (
    m.includes("widget") ||
    m.includes("integration") ||
    m.includes("embed") ||
    m.includes("widget")
  )
    return "integration";
  if (m.includes("limit")) return "limit";
  if (m.includes("whatsapp") || m.includes("whatsapp order")) return "whatsapp";
  if (m.includes("password") || m.includes("login")) return "password";
  if (
    m.includes("link") ||
    m.includes("meri shop me try on button nahi dikh raha ") ||
    m.includes("kapde par tryon button nahi aa raha ")
  )
    return "shop_link";
  if (m.includes("email")) return "email";
  return null;
};

// ─── Start Chat ────────────────────────────
router.post("/start", authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId);

    const chat = await SupportChat.create({
      seller: req.sellerId,
      sellerName: seller.name,
      sellerEmail: seller.email,
      messages: [
        {
          role: "bot",
          text: `Namaste ${seller.name}! 👋 Main aapka Support Assistant hun.\n\nAaj main aapki kya sahayata kar sakta hun?\nNeeche diye gaye options mein se apni problem select karein:`,
        },
      ],
    });

    res.json({ success: true, chat, topics: TOPICS });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Topic Select Karne Par ────────────────
router.post("/select-topic", authMiddleware, async (req, res) => {
  try {
    const { chatId, topicKey } = req.body;

    const chat = await SupportChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat nahi mili!" });
    }

    const topic = TOPICS.find((t) => t.key === topicKey);
    const response = TOPIC_RESPONSES[topicKey];

    if (!topic || !response) {
      return res.status(400).json({ message: "Invalid topic!" });
    }

    // User ne jo "selected" kiya woh user message jaisa dikhega
    chat.messages.push({ role: "user", text: topic.label });
    chat.messages.push({ role: "bot", text: response.text });
    await chat.save();

    res.json({
      success: true,
      messages: chat.messages,
      actions: response.actions || [],
      followUp: response.followUp,
      showOthersInput: topicKey === "others",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Free Text Message (jab koi topic match nahi karta ya "others") ──
router.post("/message", authMiddleware, async (req, res) => {
  try {
    const { chatId, message } = req.body;

    const chat = await SupportChat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat nahi mili!" });
    }

    chat.messages.push({ role: "user", text: message });

    const detectedKey = detectTopic(message);
    let botText = "";
    let actions = [];

    if (detectedKey && TOPIC_RESPONSES[detectedKey]) {
      botText = TOPIC_RESPONSES[detectedKey].text;
      actions = TOPIC_RESPONSES[detectedKey].actions || [];
    } else {
      botText = `🤔 Maaf kijiyega, main aapki query ko samajh nahi paya.\n\nKripya upar diye gaye list mein se koi option choose karein. Agar aapki dikkat alag hai, toh niche diye gaye "Escalate to Developer" button par click karein — main aapka message seedha developer ko email kar dunga!`;
    }

    chat.messages.push({ role: "bot", text: botText });
    await chat.save();

    const userMsgCount = chat.messages.filter((m) => m.role === "user").length;

    res.json({
      success: true,
      messages: chat.messages,
      actions,
      showEscalate: userMsgCount >= 2,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Escalate to Admin ─────────────────────
router.post("/escalate", authMiddleware, async (req, res) => {
  try {
    const { chatId, issue } = req.body;

    const seller = await Seller.findById(req.sellerId);
    const chat = await SupportChat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: "Chat nahi mili!" });
    }

    chat.status = "escalated";
    chat.adminNotified = true;
    chat.messages.push({
      role: "bot",
      text: `✅ Aapki request developer ko bhej di gayi hai!\n\nDeveloper/ Hamari team  jaldi hi aapse apke email par contact karengi. \n Chat history save ho gayi hai. \nApka din subh ho 🙏`,
    });
    await chat.save();

    const chatHistory = chat.messages
      .map((m) => `${m.role.toUpperCase()}: ${m.text}`)
      .join("\n\n---\n\n");

    await sendContactEmail({
      name: `Support Request - ${seller.name}`,
      email: seller.email,
      subject: `🚨 Developer Support Request: ${issue || "Help chahiye"}`,
      message: `Seller: ${seller.name}\nEmail: ${seller.email}\nPlan: ${seller.plan}\nIssue: ${issue || "Not specified"}\n\nChat History:\n${chatHistory}`,
    });

    res.json({
      success: true,
      message: "Developer ko notify kar diya gaya hai!",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Get Chat History ──────────────────────
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const chats = await SupportChat.find({ seller: req.sellerId })
      .sort({ createdAt: -1 })
      .limit(10);
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── Admin - All Escalated Chats ───────────
router.get("/admin/all", async (req, res) => {
  try {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ message: "Unauthorized!" });
    }
    const chats = await SupportChat.find({ status: "escalated" })
      .sort({ createdAt: -1 })
      .populate("seller", "name email plan");
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
