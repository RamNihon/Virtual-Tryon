import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";
import API_URL from "../api";

import VoiceAssistant from '../components/VoiceAssistant';

export default function Home() {
  const { token } = useAuth();

  useEffect(() => {
    async function wakeServer() {
      try {
        await fetch(`${API_URL}/`);
        console.log("Server awake!");
      } catch (e) {
        console.log("Waking server...");
      }
    }

    wakeServer();
  }, []);

  return (
    <div className="min-h-screen">
      {/* ─── HERO SECTION ─────────────────── */}
      <div
        className="relative overflow-hidden
                      bg-gradient-to-br from-slate-900
                      via-purple-900 to-indigo-900
                      min-h-screen flex items-center"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gradient Orbs */}
          <div
            className="absolute top-1/4 left-1/4
                          w-96 h-96 bg-purple-500
                          opacity-20 rounded-full
                          blur-3xl animate-pulse"
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4
                          w-80 h-80 bg-indigo-500
                          opacity-20 rounded-full
                          blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-1/2
                          w-64 h-64 bg-pink-500
                          opacity-10 rounded-full
                          blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          ></div>

          {/* Grid Pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
            }}
          ></div>
        </div>

        {/* Hero Content */}
        <div
          className="relative z-10 max-w-7xl mx-auto
                        px-6 py-20 w-full"
        >
          <div
            className="grid grid-cols-1 lg:grid-cols-2
                          gap-12 items-center"
          >
            {/* Left Content */}
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2
                              bg-white bg-opacity-10
                              backdrop-blur-sm
                              border border-white border-opacity-20
                              rounded-full px-4 py-2 mb-6"
              >
                <span
                  className="w-2 h-2 bg-green-400
                                 rounded-full animate-pulse"
                ></span>
                <span className="text-white text-sm font-medium">
                  🇮🇳 India's #1 Virtual Try-On Platform
                </span>
              </div>

              <h1
                className="text-4xl md:text-5xl lg:text-6xl
                             font-bold text-white mb-6
                             leading-tight"
              >
                Kapde Try Karen
                <span
                  className="block bg-gradient-to-r
                                 from-purple-400 to-pink-400
                                 bg-clip-text text-transparent"
                >
                  Ghar Baithe! ✨
                </span>
              </h1>

              <p
                className="text-purple-200 text-lg mb-8
                            max-w-xl leading-relaxed"
              >
                AI-powered virtual try-on apni website par lagayen. Customers
                try karein, returns kam hon, aur sales badhe! 🚀
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-12">
                {token ? (
                  <Link
                    to="/dashboard"
                    className="bg-gradient-to-r from-purple-500
                               to-pink-500 text-white
                               px-8 py-4 rounded-2xl
                               text-lg font-semibold
                               hover:from-purple-600
                               hover:to-pink-600
                               transition-all duration-300
                               shadow-lg shadow-purple-500/30
                               hover:shadow-purple-500/50
                               hover:-translate-y-1
                               flex items-center gap-2"
                  >
                    📊 Open Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="bg-gradient-to-r from-purple-500
                                 to-pink-500 text-white
                                 px-8 py-4 rounded-2xl
                                 text-lg font-semibold
                                 hover:from-purple-600
                                 hover:to-pink-600
                                 transition-all duration-300
                                 shadow-lg shadow-purple-500/30
                                 hover:shadow-purple-500/50
                                 hover:-translate-y-1
                                 flex items-center gap-2"
                    >
                      🚀 Start in Free
                    </Link>
                    <Link
                      to="/login"
                      className="bg-white bg-opacity-10
                                 backdrop-blur-sm
                                 border border-white border-opacity-30
                                 text-white px-8 py-4 rounded-2xl
                                 text-lg font-semibold
                                 hover:bg-opacity-20
                                 transition-all duration-300
                                 flex items-center gap-2"
                    >
                      Login Now →
                    </Link>
                  </>
                )}
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["👨", "👩", "👨‍💼", "👩‍💼"].map((e, i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full
                                   bg-gradient-to-br from-purple-400
                                   to-pink-400 border-2 border-purple-900
                                   flex items-center justify-center
                                   text-sm"
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                  <span className="text-purple-200 text-sm">500+ sellers</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <span key={i} className="text-yellow-400 text-sm">
                      ⭐
                    </span>
                  ))}
                  <span className="text-purple-200 text-sm ml-1">4.8/5</span>
                </div>
              </div>
            </div>

            {/* Right - 3D Card Preview */}
            <div className="relative hidden lg:block">
              <div className="relative" style={{ perspective: "1000px" }}>
                {/* Main Card */}
                <div
                  className="bg-white bg-opacity-10
                                backdrop-blur-md
                                border border-white border-opacity-20
                                rounded-3xl p-6
                                transform rotate-y-6"
                  style={{
                    transform: "rotateY(-5deg) rotateX(5deg)",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
                  }}
                >
                  {/* Mock Try-On UI */}
                  <div className="flex gap-4 mb-4">
                    <div
                      className="flex-1 bg-white bg-opacity-10
                                    rounded-2xl aspect-square
                                    flex items-center justify-center
                                    text-5xl"
                    >
                      👔
                    </div>
                    <div
                      className="flex-1 bg-white bg-opacity-10
                                    rounded-2xl aspect-square
                                    flex items-center justify-center
                                    text-5xl"
                    >
                      🧍
                    </div>
                  </div>

                  {/* Arrow */}
                  <div
                    className="text-center text-white
                                  text-2xl my-3 animate-bounce"
                  >
                    ✨ AI Magic ✨
                  </div>

                  {/* Result */}
                  <div
                    className="bg-gradient-to-br
                                  from-purple-500 to-pink-500
                                  rounded-2xl p-4 text-center"
                  >
                    <div className="text-5xl mb-2">🧍‍♂️</div>
                    <p className="text-white font-semibold text-sm">
                      Virtual Try-On Result!
                    </p>
                    <div className="flex justify-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <span key={i} className="text-yellow-300 text-xs">
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* AI Advice */}
                  <div
                    className="mt-4 bg-white bg-opacity-10
                                  rounded-xl p-3"
                  >
                    <p className="text-white text-xs font-medium mb-1">
                      🤖 AI Style Advice:
                    </p>
                    <p className="text-purple-200 text-xs">
                      "Color rating: 9/10 — Black pant ke saath perfect match!
                      🎯"
                    </p>
                  </div>
                </div>

                {/* Floating badges */}
                <div
                  className="absolute -top-4 -right-4
                                bg-green-500 text-white
                                rounded-2xl px-4 py-2
                                text-sm font-bold
                                shadow-lg animate-bounce"
                >
                  ✅ Result Ready!
                </div>
                <div
                  className="absolute -bottom-4 -left-4
                                bg-purple-600 text-white
                                rounded-2xl px-4 py-2
                                text-sm font-bold shadow-lg"
                >
                  ⚡ In 20 sec
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2
                        -translate-x-1/2 text-white
                        opacity-50 animate-bounce"
        >
          <div
            className="w-6 h-10 border-2 border-white
                          rounded-full flex justify-center pt-2"
          >
            <div
              className="w-1 h-3 bg-white rounded-full
                            animate-bounce"
            ></div>
          </div>
        </div>
      </div>

      {/* ─── STATS SECTION ────────────────── */}
      <div
        className="bg-gradient-to-r from-purple-600
                      to-indigo-600 py-12"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "500+", label: "Active Sellers", icon: "🏪" },
              { num: "10K+", label: "Try-Ons Done", icon: "👗" },
              { num: "40%", label: "Low Returns", icon: "📉" },
              { num: "4.8⭐", label: "Seller Rating", icon: "🌟" },
            ].map((stat, i) => (
              <div key={i} className="text-center text-white">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold mb-1">{stat.num}</div>
                <div className="text-purple-200 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── HOW IT WORKS ─────────────────── */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="bg-purple-100 text-purple-700
                             px-4 py-2 rounded-full text-sm
                             font-semibold"
            >
              How does it work?
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold
                           text-gray-800 mt-4 mb-4"
            >
              Ready in just 3 steps!⚡
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              No technical knowledge required. Just register and get started!
            </p>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-3
                          gap-8 relative"
          >
            {/* Connecting Line */}
            <div
              className="hidden md:block absolute top-16
                            left-1/3 right-1/3 h-0.5
                            bg-gradient-to-r from-purple-300
                            to-indigo-300"
            ></div>

            {[
              {
                step: "01",
                icon: "📝",
                title: "Create your Account",
                desc: "Create a free account, upload products and get a shop link in 2 minutes!",
                color: "from-purple-500 to-purple-600",
              },
              {
                step: "02",
                icon: "🔌",
                title: "Add on your Website",
                desc: "Paste a script tag into the HTML body tag on your website or Share our shop link!",
                color: "from-indigo-500 to-indigo-600",
              },
              {
                step: "03",
                icon: "🚀",
                title: "Increase Sales",
                desc: "Customers choose, get style advice, and order on WhatsApp!",
                color: "from-pink-500 to-pink-600",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white rounded-3xl p-8
                           shadow-sm hover:shadow-lg
                           transition-all duration-300
                           hover:-translate-y-2
                           border border-gray-100"
              >
                <div
                  className={`w-16 h-16 rounded-2xl
                                bg-gradient-to-br ${step.color}
                                flex items-center justify-center
                                text-3xl mb-6 shadow-lg`}
                >
                  {step.icon}
                </div>
                <div
                  className="absolute top-6 right-6
                                text-5xl font-black
                                text-gray-100"
                >
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FEATURES ─────────────────────── */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="bg-purple-100 text-purple-700
                             px-4 py-2 rounded-full text-sm
                             font-semibold"
            >
              Features
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold
                           text-gray-800 mt-4"
            >
              Everything In One Place! 🎯
            </h2>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2
                          lg:grid-cols-3 gap-6"
          >
            {[
              {
                icon: "🤖",
                title: "AI-Powered Try-On",
                desc: "Realistic virtual try-ons from advanced AI models. Perfectly fit customer's face and body!",
                color: "bg-purple-50",
                iconBg: "bg-purple-100",
              },

              {
                icon: "🧵",
                title: "Fabric to Garment",
                desc: "Our Advance AI model turns unstitched fabric into a stitched shirt/kurta/pant!",
                color: "bg-emerald-50",
                iconBg: "bg-emerald-100",
              },
              {
                icon: "✨",
                title: "AI Style Advisor",
                desc: "Instant fashion advice from Advance AI. Color combination, occasion suggestion, and rating!",
                color: "bg-pink-50",
                iconBg: "bg-pink-100",
              },
              {
                icon: "🔌",
                title: "Easy Widget",
                desc: "Paste a script tag in your html <body>. Works on any website – Shopify, WordPress, custom!",
                color: "bg-blue-50",
                iconBg: "bg-blue-100",
              },
              {
                icon: "🏪",
                title: "Free Shop Page",
                desc: "Don't have a website? No problem! Get your shop URL and add it to your Instagram bio or Anywhere!",
                color: "bg-yellow-50",
                iconBg: "bg-yellow-100",
              },
              {
                icon: "💳",
                title: "Credit System",
                desc: "Pay as you go! Pay for what you use. Top-up anytime!",
                 color: "bg-pink-50",
                iconBg: "bg-blue-100",
              },
              {
                icon: "📱",
                title: "WhatsApp Orders",
                desc: "Customers can choose and place their order directly on WhatsApp. Message ready in one click.!",
                color: "bg-emerald-50",
                iconBg: "bg-emerald-100",
              },

              {
                icon: "📊",
                title: "Analytics Dashboard",
                desc: "See how many try-ons have taken place, which products are popular, and grow your business!",
                color: "bg-orange-50",
                iconBg: "bg-orange-100",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`${f.color} rounded-3xl p-7
                            hover:shadow-lg transition-all
                            duration-300 hover:-translate-y-1
                            border border-transparent
                            hover:border-gray-100`}
              >
                <div
                  className={`${f.iconBg} w-14 h-14
                                rounded-2xl flex items-center
                                justify-center text-2xl mb-5`}
                >
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {f.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── PRICING ──────────────────────── */}
      <div className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="bg-purple-100 text-purple-700
                             px-4 py-2 rounded-full text-sm
                             font-semibold"
            >
              Pricing
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold
                           text-gray-800 mt-4 mb-4"
            >
              Simple Plans 💰
            </h2>
            <p className="text-gray-500">Free trial available!</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                emoji: "🆓",
                price: "₹0",
                credits: "100 credits",
                limit: "~10 try-ons",
                color: "border-gray-300",
                btn: "bg-gray-800",
              },
              {
                name: "Basic",
                emoji: "🚀",
                price: "₹999",
                credits: "1,500 credits",
                limit: "~150 try-ons",
                color: "border-blue-400",
                btn: "bg-blue-600",
              },
              {
                name: "Pro",
                emoji: "💎",
                price: "₹2,499",
                credits: "3,000 credits",
                limit: "Fabric shop + try-ons",
                color: "border-purple-500",
                btn: "bg-purple-700",
                popular: true,
              },
              {
                name: "Elite",
                emoji: "👑",
                price: "₹4,999",
                credits: "10,000 credits",
                limit: "Everything unlimited",
                color: "border-yellow-500",
                btn: "bg-gradient-to-r from-yellow-500 to-orange-500",
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`border-2 ${plan.color}
             rounded-2xl p-6 text-center
             relative hover:shadow-lg
             transition-all hover:-translate-y-1`}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3
                     left-1/2 -translate-x-1/2
                     bg-purple-700 text-white
                     px-4 py-1 rounded-full text-sm
                     font-bold"
                  >
                    ⭐ Popular
                  </span>
                )}
                <div className="text-3xl mb-2">{plan.emoji}</div>
                <h3 className="font-bold text-xl mb-1">{plan.name}</h3>
                <p className="text-3xl font-black text-gray-800 mb-1">
                  {plan.price}
                </p>
                <p className="text-xs text-gray-400 mb-2">/month</p>
                <div className="bg-purple-50 rounded-xl py-2 px-3 mb-2">
                  <p className="text-purple-700 font-bold text-sm">
                    💳 {plan.credits}
                  </p>
                </div>
                <p className="text-gray-500 text-sm mb-5">{plan.limit}</p>
                <Link
                  to="/pricing"
                  className={`${plan.btn} text-white
                px-6 py-3 rounded-full
                font-semibold block
                hover:opacity-90 transition`}
                >
                  See Details →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── TESTIMONIALS ─────────────────── */}
      <div className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span
              className="bg-purple-100 text-purple-700
                             px-4 py-2 rounded-full text-sm
                             font-semibold"
            >
              Reviews
            </span>
            <h2
              className="text-3xl md:text-4xl font-bold
                           text-gray-800 mt-4"
            >
              Sellers Kya Kehte Hain? 💬
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Priya Sharma",
                role: "Fashion Boutique Owner, Mumbai",
                review:
                  "Mere returns 40% kam ho gaye! Customers try karke hi order karte hain ab. Amazing product!",
                avatar: "👩‍💼",
                rating: 5,
              },
              {
                name: "Rahul Gupta",
                role: "Instagram Fashion Seller, Delhi",
                review:
                  "Website nahi thi meri, par ab shop URL se bohot orders aa rahe hain WhatsApp par. Best!",
                avatar: "👨‍💼",
                rating: 5,
              },
              {
                name: "Meena Patel",
                role: "Saree Shop Owner, Surat",
                review:
                  "AI style advice feature sabse best hai! Customers ko perfect combination suggest ho jata hai.",
                avatar: "👩",
                rating: 5,
              },
            ].map((t, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-3xl p-7
                           hover:shadow-lg transition-all
                           duration-300 border border-gray-100"
              >
                <div className="flex gap-1 mb-4">
                  {Array(t.rating)
                    .fill(0)
                    .map((_, si) => (
                      <span key={si} className="text-yellow-400">
                        ⭐
                      </span>
                    ))}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 italic">
                  "{t.review}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full
                                  bg-purple-100 flex items-center
                                  justify-center text-2xl"
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {t.name}
                    </p>
                    <p className="text-gray-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── FINAL CTA ────────────────────── */}
      <div
        className="py-20 px-6 bg-gradient-to-br
                      from-slate-900 via-purple-900
                      to-indigo-900 relative overflow-hidden"
      >
        {/* Background effect */}
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-1/2
                          w-96 h-96 bg-purple-500
                          opacity-20 rounded-full
                          blur-3xl -translate-x-1/2"
          ></div>
        </div>

        <div
          className="relative z-10 max-w-3xl
                        mx-auto text-center"
        >
          <div className="text-6xl mb-6">🚀</div>
          <h2
            className="text-3xl md:text-5xl font-bold
                         text-white mb-6"
          >
            Start today now!
          </h2>
          <p
            className="text-purple-200 text-lg mb-10
                        max-w-xl mx-auto"
          >
            Start with free 100 credits. No need any credit card !
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            {token ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-purple-500
                           to-pink-500 text-white
                           px-10 py-4 rounded-2xl
                           text-lg font-bold
                           hover:from-purple-600
                           hover:to-pink-600
                           transition-all duration-300
                           shadow-lg hover:-translate-y-1"
              >
                📊 Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-500
                             to-pink-500 text-white
                             px-10 py-4 rounded-2xl
                             text-lg font-bold
                             hover:from-purple-600
                             hover:to-pink-600
                             transition-all duration-300
                             shadow-lg hover:-translate-y-1"
                >
                  🎉 Make Free Account
                </Link>
                <Link
                  to="/pricing"
                  className="bg-white bg-opacity-10
                             backdrop-blur-sm
                             border border-white border-opacity-30
                             text-white px-10 py-4 rounded-2xl
                             text-lg font-semibold
                             hover:bg-opacity-20
                             transition-all duration-300"
                >
                  View Plans →
                </Link>
              </>
            )}
          </div>

          {/* Trust badges */}
          <div
            className="flex flex-wrap justify-center
                          gap-6 mt-12"
          >
            {[
              "🔒 100% Secure",
              "✅ No Credit Card",
              "⚡ 2 Min Setup",
              "🇮🇳 Made in India",
            ].map((badge, i) => (
              <div
                key={i}
                className="bg-white bg-opacity-10
                           backdrop-blur-sm
                           border border-white border-opacity-20
                           rounded-full px-4 py-2
                           text-white text-sm"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Voice Assistant */}
            <VoiceAssistant
              pageType="home"
              shopName={'merchant'}
              language="hi"
            />
    </div>
  );
}
