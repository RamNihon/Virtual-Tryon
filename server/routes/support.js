const express = require('express')
const router = express.Router()
const SupportChat = require('../models/SupportChat')
const Seller = require('../models/Seller')
const { authMiddleware } = require('./seller')
const { sendContactEmail } = require('../config/email')

// ─── Bot Knowledge Base ────────────────────
const BOT_ANSWERS = {
  'credits khatam': {
    answer: `💳 Credits khatam ho gayi hain!

Aap 2 tareekon se credits badha sakte hain:

1. **Top-Up Pack Khariden** → /pricing page par jaiye
   - Mini Pack: ₹149 = 200 credits
   - Growth Pack: ₹599 = 1000 credits

2. **Plan Upgrade Karen** → Zyada credits milenge

Abhi /pricing page par jaiye!`,
    solved: true
  },
  'tryon nahi ho raha': {
    answer: `🔧 Try-On Problem Fix:

1. **Photo check karen** - Seedhi, puri photo upload karen
2. **Internet check karen** - Slow internet se problem hoti hai
3. **Browser refresh karen** - Page reload karen ek baar
4. **Credits check karen** - Dashboard mein credits 0 to nahi?

Yeh try karne ke baad bhi problem hai?`,
    solved: false
  },
  'product add nahi ho raha': {
    answer: `📸 Product Add Problem:

1. **Image size** - 5MB se kam honi chahiye
2. **Image format** - JPG, PNG, WEBP support hai
3. **Internet** - Upload ke time stable connection chahiye
4. **Required fields** - Naam aur photo zaroori hai

Refresh karke dobara try karen!`,
    solved: false
  },
  'payment nahi hua': {
    answer: `💰 Payment Issue:

1. **Bank check karen** - Amount deduct hua ya nahi
2. **2-3 minute wait karen** - Sometimes delay hoti hai
3. **Dashboard check karen** - Plan update hua ya nahi

Agar paise deduct gaye aur plan update nahi hua to:
📧 Hamein email karen: ${process.env.ADMIN_EMAIL}
Order ID aur screenshot ke saath`,
    solved: false
  },
  'shop link nahi chal raha': {
    answer: `🔗 Shop Link Fix:

1. **Seller ID check karen** - Dashboard mein dekhen
2. **Link copy karen** - Dashboard > Integration > Copy Link
3. **Browser mein directly kholen** - Copy-paste karke test karen

Format hona chahiye:
yoursite.com/shop/YOUR_SELLER_ID`,
    solved: false
  },
  'email nahi aa rahi': {
    answer: `📧 Email Problem:

1. **Spam folder check karen** - Gmail spam mein ho sakti hai
2. **Email sahi hai?** - Dashboard mein email verify karo
3. **2-3 minute wait karo** - Kabhi delay hoti hai

Waise bhi kaam chal sakta hai bina email ke!`,
    solved: true
  },
  'password bhool gaya': {
    answer: `🔐 Password Reset:

1. Login page par jaiye
2. "Forgot Password" click karen
3. Email daalen
4. Reset link aayega email par
5. Naya password set karen

Reset link 1 ghante tak valid hai!`,
    solved: true
  },
  'fabric shop nahi dikh raha': {
    answer: `🧵 Fabric Shop:

Fabric Shop sirf **Pro aur Elite Plan** mein available hai!

Abhi aap Free ya Basic plan mein hain.

Pro Plan upgrade karen:
→ /pricing par jaiye
→ ₹2,499/month mein fabric shop milega`,
    solved: true
  }
}

// ─── Bot Response Function ─────────────────
const getBotResponse = (userMessage) => {
  const msg = userMessage.toLowerCase()

  for (const [keyword, response] of Object.entries(BOT_ANSWERS)) {
    if (msg.includes(keyword.split(' ')[0]) ||
        msg.includes(keyword)) {
      return response
    }
  }

  // Default response
  return {
    answer: `🤔 Maaf karen, Mujhe samajh nahi aaya aapki problem.

Kya aap in mein se koi option choose karenge?

1. Credits ya Payment issue ?
2. Try-On kaam nahi kar raha ?
3. Product add nahi ho raha ?
4. Shop link problem
5. Password bhool gaye ?
6. Kuch aur

Ya seedha **"Talk to Developer"** button use karein!`,
    solved: false
  }
}

// ─── Start Chat ────────────────────────────
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const seller = await Seller.findById(req.sellerId)

    const chat = await SupportChat.create({
      seller: req.sellerId,
      sellerName: seller.name,
      sellerEmail: seller.email,
      messages: [{
        role: 'bot',
        text: `Namaste ${seller.name}! 👋

Main aapka Support Assistant hun! 🤖

आपकी सहायता के लिए मैं तत्पर हूँ। कृपया अपनी समस्या नीचे इनपुट बॉक्स में लिखें या निम्नलिखित मुख्य विषयों में से किसी एक को टाइप करें:

- "Credits Issue" — क्रेडिट्स अपडेट या बैलेंस से जुड़ी समस्या
- "Try-on Issue" — वर्चुअल ट्राई-ऑन फंक्शन काम न करना
- "Payment Issue" — पेमेंट फेल्योर या सब्सक्रिप्शन एक्टिवेशन
- "Product Add Issue" — नए प्रोडक्ट्स को जोड़ने या अपलोड करने में समस्या
- "Password Reset" — अकाउंट लॉगइन या पासवर्ड बदलने के लिए
- "Shop Link Error" — स्टोर लिंक/यूआरएल काम न करने की स्थिति में

आप अपनी समस्या सीधे नीचे चैट बॉक्स में भी टाइप कर सकते हैं। हमारी टीम आपकी पूरी सहायता करेगी! 😊`
      }]
    })

    res.json({ success: true, chat })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Send Message ──────────────────────────
router.post('/message', authMiddleware, async (req, res) => {
  try {
    const { chatId, message } = req.body

    const chat = await SupportChat.findById(chatId)
    if (!chat) {
      return res.status(404).json({
        message: 'Chat nahi mili!'
      })
    }

    // User message save
    chat.messages.push({ role: 'user', text: message })

    // Bot response
    const botResponse = getBotResponse(message)
    chat.messages.push({
      role: 'bot',
      text: botResponse.answer
    })

    await chat.save()

    res.json({
      success: true,
      botReply: botResponse.answer,
      solved: botResponse.solved,
      messages: chat.messages
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Escalate to Admin ─────────────────────
router.post('/escalate', authMiddleware, async (req, res) => {
  try {
    const { chatId, issue } = req.body

    const seller = await Seller.findById(req.sellerId)
    const chat = await SupportChat.findById(chatId)

    if (!chat) {
      return res.status(404).json({
        message: 'Chat nahi mili!'
      })
    }

    // Status update
    chat.status = 'escalated'
    chat.adminNotified = true
    chat.messages.push({
      role: 'bot',
      text: `✅ Aapki request developer ko bhej di gayi hai!

Developer jaldi hi aapse contact karenge.
📧 Response: admin email se aayega

Chat history save ho gayi hai. Hum aapko email karenge!`
    })
    await chat.save()

    // Admin ko email bhejo
    const chatHistory = chat.messages
      .map(m => `${m.role.toUpperCase()}: ${m.text}`)
      .join('\n\n---\n\n')

    await sendContactEmail({
      name: `Support Request - ${seller.name}`,
      email: seller.email,
      subject: `🚨 Developer Support Request: ${issue || 'Help chahiye'}`,
      message: `Seller: ${seller.name}
Email: ${seller.email}
Plan: ${seller.plan}
Issue: ${issue || 'Not specified'}

Chat History:
${chatHistory}`
    })

    res.json({
      success: true,
      message: 'Developer ko notify kar diya gaya hai !'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Get Chat History ──────────────────────
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const chats = await SupportChat.find({
      seller: req.sellerId
    })
      .sort({ createdAt: -1 })
      .limit(10)

    res.json({ success: true, chats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// ─── Admin - All Chats ─────────────────────
router.get('/admin/all', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key']
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(401).json({ message: 'Unauthorized!' })
    }

    const chats = await SupportChat.find({
      status: 'escalated'
    })
      .sort({ createdAt: -1 })
      .populate('seller', 'name email plan')

    res.json({ success: true, chats })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router