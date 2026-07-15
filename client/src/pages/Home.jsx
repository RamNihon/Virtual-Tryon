import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import API_URL from "../api";

import VoiceAssistant from "../components/VoiceAssistant";

import {
  Store,
  MessageCircle,
  Code2,
  BarChart3,
  Sparkles,
  Shirt,
  ArrowRight,
  Play,
  ShieldCheck,
  CreditCard,
  Zap,
  MapPin,
  Upload,
  Link2,
  Send,
  Check,
} from "lucide-react";

/*
  ─── HOW TO ADD YOUR REAL IMAGES ───────────────────────────
  Drop these three files into: client/src/assets/
    1. garment.png   → a clean product photo (e.g. a shirt on a plain background)
    2. user.png       → a customer photo (front-facing, plain background works best)
    3. result.png     → the AI try-on output (customer wearing the garment)

  Then uncomment the three import lines below and the code will
  automatically use your real photos instead of the placeholder icons.
------------------------------------------------------------- */

import garmentImg from "../assets/garment.jpg";
import userImg from "../assets/user.webp";
import resultImg from "../assets/result.webp";

// const garmentImg = null;
// const userImg = null;
// const resultImg = null;

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
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════ */}
      <div
        className="relative overflow-hidden
                      bg-gradient-to-br from-[#0f0c29] via-[#1a1030]
                      to-[#2d1155]
                      min-h-screen flex items-center"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute top-[-10%] left-[-5%]
                          w-[500px] h-[500px] bg-purple-600
                          opacity-25 rounded-full
                          blur-[120px]"
          />
          <div
            className="absolute bottom-[-15%] right-[-10%]
                          w-[550px] h-[550px] bg-fuchsia-600
                          opacity-20 rounded-full
                          blur-[130px]"
          />
          <div
            className="absolute top-[30%] right-[15%]
                          w-72 h-72 bg-indigo-500
                          opacity-15 rounded-full
                          blur-[100px]"
          />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)
              `,
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2
                              bg-white/[0.06] backdrop-blur-md
                              border border-white/[0.12]
                              rounded-full px-4 py-1.5 mb-7"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-white/90 text-sm font-medium tracking-wide">
                  Built for Indian Clothing Sellers
                </span>
              </div>

              <h1
                className="text-[2.75rem] sm:text-5xl lg:text-[3.4rem]
                             font-extrabold text-white mb-6
                             leading-[1.08] tracking-tight"
              >
                Your Own Online Store,
                <span
                  className="block bg-gradient-to-r
                                 from-fuchsia-400 via-purple-300 to-indigo-300
                                 bg-clip-text text-transparent pb-1"
                >
                  No Website Needed.
                </span>
              </h1>

              <p className="text-purple-200/80 text-lg mb-9 max-w-lg leading-relaxed">
                Upload your products, share one link, and start taking orders on
                WhatsApp today. AI virtual try-on comes built in — so every customer gets a virtual trial room before they buy.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-14">
                {token ? (
                  <Link
                    to="/dashboard"
                    className="group bg-gradient-to-r from-purple-500
                               to-fuchsia-500 text-white
                               px-8 py-4 rounded-2xl
                               text-base font-semibold
                               transition-all duration-300
                               shadow-[0_8px_30px_rgba(168,85,247,0.35)]
                               hover:shadow-[0_8px_40px_rgba(168,85,247,0.55)]
                               hover:-translate-y-0.5
                               flex items-center gap-2"
                  >
                    <BarChart3 className="w-5 h-5" strokeWidth={2.25} />
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="group bg-gradient-to-r from-purple-500
                                 to-fuchsia-500 text-white
                                 px-8 py-4 rounded-2xl
                                 text-base font-semibold
                                 transition-all duration-300
                                 shadow-[0_8px_30px_rgba(168,85,247,0.35)]
                                 hover:shadow-[0_8px_40px_rgba(168,85,247,0.55)]
                                 hover:-translate-y-0.5
                                 flex items-center gap-2"
                    >
                      Create Your Free Store
                      <ArrowRight
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        strokeWidth={2.5}
                      />
                    </Link>
                    <a
                      href="#demo"
                      className="group bg-white/[0.06]
                                 backdrop-blur-md
                                 border border-white/[0.14]
                                 text-white px-7 py-4 rounded-2xl
                                 text-base font-semibold
                                 hover:bg-white/[0.1]
                                 transition-all duration-300
                                 flex items-center gap-2.5"
                    >
                      <span
                        className="w-7 h-7 rounded-full bg-white/15
                                       flex items-center justify-center
                                       group-hover:bg-white/25 transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                      </span>
                      Watch Demo
                    </a>
                  </>
                )}
              </div>

              {/* Three quick value points instead of fake social proof */}
              <div className="grid grid-cols-3 gap-4 max-w-md">
                {[
                  { icon: Zap, label: "Live in minutes" },
                  { icon: CreditCard, label: "No card needed" },
                  { icon: ShieldCheck, label: "Secure by default" },
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <item.icon
                      className="w-4 h-4 text-fuchsia-300"
                      strokeWidth={2}
                    />
                    <span className="text-white/60 text-xs leading-snug">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Premium Try-On Showcase */}
            <TryOnShowcase />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 -translate-x-1/2
                        text-white/40"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2.5 bg-white/50 rounded-full animate-bounce" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          HOW IT WORKS
      ═══════════════════════════════════════════════════ */}
      <div id='how-it-works' className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <SectionEyebrow>How It Works</SectionEyebrow>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-gray-900 mt-4 mb-4 text-center tracking-tight">
            Live in three simple steps
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-center mb-16">
            No coding, no design skills. If you can send a WhatsApp message, you
            can run this store.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <div
              className="hidden md:block absolute top-[52px]
                            left-[calc(16.66%+28px)] right-[calc(16.66%+28px)]
                            h-px bg-gradient-to-r from-purple-200 via-fuchsia-200 to-purple-200"
            />
            {[
              {
                icon: Upload,
                title: "Add Your Products",
                desc: "Create a free account and upload your products. Your shop link is ready in under 2 minutes.",
              },
              {
                icon: Link2,
                title: "Share Your Shop Link",
                desc: "Add the link to your Instagram bio, WhatsApp status, or paste one script tag on your existing website.",
              },
              {
                icon: Send,
                title: "Take Orders on WhatsApp",
                desc: "Customers try on your products, get AI style advice, and message you directly to order.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="relative bg-white rounded-3xl p-8
                           shadow-[0_2px_20px_rgba(0,0,0,0.04)]
                           hover:shadow-[0_8px_30px_rgba(124,58,237,0.1)]
                           transition-all duration-300
                           hover:-translate-y-1.5
                           border border-gray-100"
              >
                <div
                  className="relative z-10 w-14 h-14 rounded-2xl
                                bg-gradient-to-br from-purple-600 to-fuchsia-500
                                flex items-center justify-center
                                mb-6 shadow-lg shadow-purple-500/20"
                >
                  <step.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <span className="text-xs font-bold text-purple-400 tracking-widest uppercase">
                  Step 0{i + 1}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 leading-relaxed text-[0.95rem]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          LIVE DEMO
      ═══════════════════════════════════════════════════ */}
      <div id="demo" className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <SectionEyebrow>See It In Action</SectionEyebrow>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-gray-900 mt-4 mb-4 tracking-tight">
            Watch a 60-second walkthrough
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-10">
            See exactly how a seller sets up their shop and how a customer
            experiences the try-on.
          </p>

          <div
            className="relative rounded-3xl overflow-hidden
                          bg-gradient-to-br from-gray-900 to-purple-950
                          aspect-video flex items-center justify-center
                          border border-gray-200 shadow-2xl group cursor-pointer"
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.4),transparent_70%)]" />
            <button
              className="relative w-20 h-20 rounded-full bg-white
                         flex items-center justify-center
                         group-hover:scale-110
                         transition-all duration-300 shadow-2xl"
              aria-label="Play demo video"
            >
              <Play className="w-7 h-7 fill-purple-700 text-purple-700 ml-1" />
            </button>
            <span className="absolute bottom-5 left-5 text-white/60 text-sm font-medium">
              Demo video coming soon
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          FEATURES
      ═══════════════════════════════════════════════════ */}
      <div id='what-you-get' className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <SectionEyebrow >What You Get</SectionEyebrow>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-gray-900 mt-4 mb-16 text-center tracking-tight">
            Everything to run your store online
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Store,
                title: "Your Own Shop Page",
                desc: "No website? No problem. Get a shareable shop link and add it to your Instagram bio or anywhere else.",
                accent: "from-amber-500 to-orange-500",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Orders",
                desc: "Customers pick a product and message you directly to order — no separate checkout system needed.",
                accent: "from-emerald-500 to-teal-500",
              },
              {
                icon: Code2,
                title: "Works With Your Website Too",
                desc: "Already have a website?  Bring Try-on to your existing website, Just Paste one script tag and the widget works on Shopify, WordPress, or custom sites.",
                accent: "from-blue-500 to-cyan-500",
              },
              {
                icon: BarChart3,
                title: "Simple Analytics",
                desc: "See how many people tried on your products, which items are popular, and where to focus next.",
                accent: "from-orange-500 to-red-500",
              },
              {
                icon: Sparkles,
                title: "AI Virtual Try-On",
                desc: "Customers see themselves in your product before buying, which means fewer returns for you.",
                accent: "from-purple-500 to-fuchsia-500",
              },
              {
                icon: Shirt,
                title: "Fabric-to-Garment AI",
                desc: "Selling unstitched fabric? Show customers what it looks like stitched into a shirt, kurta, or pant.",
                accent: "from-pink-500 to-rose-500",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="group bg-white rounded-3xl p-7
                            hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)]
                            transition-all duration-300 hover:-translate-y-1
                            border border-gray-100"
              >
                <div
                  className={`w-[52px] h-[52px] rounded-2xl
                                bg-gradient-to-br ${f.accent}
                                flex items-center justify-center mb-5
                                shadow-lg shadow-gray-300/40
                                group-hover:scale-105 transition-transform`}
                >
                  <f.icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
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

      {/* ═══════════════════════════════════════════════════
          PRICING
      ═══════════════════════════════════════════════════ */}
      <div id='pricing' className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2 className="text-3xl md:text-[2.5rem] font-extrabold text-gray-900 mt-4 mb-4 text-center tracking-tight">
            Start free, upgrade when you're ready
          </h2>
          <p className="text-gray-500 text-center mb-16">
            No credit card required to start.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: "Free",
                price: "₹0",
                credits: "100 credits",
                limit: "~10 try-ons/month",
                border: "border-gray-200",
                btn: "bg-gray-900 hover:bg-gray-800",
              },
              {
                name: "Basic",
                price: "₹999",
                credits: "1,500 credits",
                limit: "~150 try-ons/month",
                border: "border-blue-200",
                btn: "bg-blue-600 hover:bg-blue-700",
              },
              {
                name: "Pro",
                price: "₹2,499",
                credits: "3,000 credits",
                limit: "Includes fabric-to-garment AI",
                border: "border-purple-300",
                btn: "bg-purple-700 hover:bg-purple-800",
                popular: true,
              },
              {
                name: "Elite",
                price: "₹4,999",
                credits: "10,000 credits",
                limit: "Highest usage limits",
                border: "border-amber-200",
                btn: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600",
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative border-2 ${plan.border}
                           rounded-3xl p-6 text-center
                           hover:shadow-xl transition-all
                           hover:-translate-y-1
                           ${plan.popular ? "shadow-lg shadow-purple-200/50" : ""}`}
              >
                {plan.popular && (
                  <span
                    className="absolute -top-3 left-1/2 -translate-x-1/2
                     bg-purple-700 text-white
                     px-4 py-1 rounded-full text-xs
                     font-bold tracking-wide"
                  >
                    MOST POPULAR
                  </span>
                )}
                <h3 className="font-bold text-lg text-gray-900 mb-1 mt-1">
                  {plan.name}
                </h3>
                <p className="text-3xl font-extrabold text-gray-900 mb-1">
                  {plan.price}
                </p>
                <p className="text-xs text-gray-400 mb-4">/month</p>
                <div className="bg-purple-50 rounded-xl py-2 px-3 mb-3">
                  <p className="text-purple-700 font-bold text-sm">
                    {plan.credits}
                  </p>
                </div>
                <p className="text-gray-500 text-xs mb-6 min-h-[32px]">
                  {plan.limit}
                </p>
                <Link
                  to="/pricing"
                  className={`${plan.btn} text-white
                              px-5 py-2.5 rounded-full text-sm
                              font-semibold block transition-colors`}
                >
                  See Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════════════ */}
      <div
        className="py-24 px-6 relative overflow-hidden
                      bg-gradient-to-br from-[#0f0c29] via-[#1a1030] to-[#2d1155]"
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2
                          w-[500px] h-[500px] bg-purple-600
                          opacity-20 rounded-full blur-[130px]"
          />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div
            className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md
                          border border-white/15 flex items-center justify-center
                          mx-auto mb-8"
          >
            <Sparkles className="w-8 h-8 text-fuchsia-300" strokeWidth={1.75} />
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to start selling smarter?
          </h2>
          <p className="text-purple-200/80 text-lg mb-10 max-w-xl mx-auto">
            Start free with 100 credits. No credit card needed.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-14">
            {token ? (
              <Link
                to="/dashboard"
                className="bg-gradient-to-r from-purple-500 to-fuchsia-500
                           text-white px-10 py-4 rounded-2xl
                           text-base font-bold
                           transition-all duration-300
                           shadow-[0_8px_30px_rgba(168,85,247,0.4)]
                           hover:-translate-y-0.5"
              >
                Open Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500
                             text-white px-10 py-4 rounded-2xl
                             text-base font-bold
                             transition-all duration-300
                             shadow-[0_8px_30px_rgba(168,85,247,0.4)]
                             hover:-translate-y-0.5
                             flex items-center gap-2"
                >
                  Create Your Free Store
                  <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                </Link>
                <Link
                  to="/pricing"
                  className="bg-white/[0.06] backdrop-blur-md
                             border border-white/[0.14]
                             text-white px-10 py-4 rounded-2xl
                             text-base font-semibold
                             hover:bg-white/[0.1]
                             transition-all duration-300"
                >
                  View Plans
                </Link>
              </>
            )}
          </div>

          {/* Trust badges — icon based, factual only */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: ShieldCheck, label: "Secure Payments" },
              { icon: CreditCard, label: "No Card to Start" },
              { icon: Zap, label: "Live in Minutes" },
              { icon: MapPin, label: "Made in India" },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white/[0.06]
                           backdrop-blur-md border border-white/[0.12]
                           rounded-full px-4 py-2 text-white/80 text-sm"
              >
                <badge.icon className="w-3.5 h-3.5" strokeWidth={2} />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Assistant */}
      <VoiceAssistant pageType="home" shopName={"merchant"} language="hi" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Reusable eyebrow label
═══════════════════════════════════════════════════ */
function SectionEyebrow({ children }) {
  return (
    <div className="flex justify-center">
      <span
        className="inline-flex items-center gap-1.5
                       bg-purple-100 text-purple-700
                       px-4 py-1.5 rounded-full text-xs
                       font-bold tracking-widest uppercase"
      >
        {children}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Premium Try-On Showcase — the hero's signature element
   Shows: Garment → User → Result, in a single flowing card,
   with the AI advice as the payoff at the bottom.
   Falls back to clean icon placeholders until real images
   are dropped into client/src/assets/.
═══════════════════════════════════════════════════ */
function TryOnShowcase() {
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);
  return (
    <div className="relative w-full max-w-md mx-auto lg:mx-0">
      {/* Ambient glow behind the card */}
      <div className="absolute -inset-4 bg-gradient-to-br from-purple-600/20 to-fuchsia-600/20 blur-3xl rounded-[2rem]" />

      <div
        className="relative bg-white/[0.07] backdrop-blur-xl
                      border border-white/[0.14] rounded-[2rem] p-6
                      shadow-[0_25px_60px_rgba(0,0,0,0.45)]"
      >
        {/* Window chrome — signals "this is a live product" */}
        <div className="flex items-center gap-1.5 mb-5 px-1">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70" />
          <span className="ml-3 text-white/40 text-[11px] font-medium tracking-wide">
            Live Try-On Preview
          </span>
        </div>

        {/* Garment + User row */}
        <div className="flex items-center gap-3 mb-2">
          <ShowcaseTile image={garmentImg} icon={Shirt} label="Garment" />

          <div className="flex flex-col items-center gap-1 shrink-0">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-white text-sm font-bold">+</span>
            </div>
          </div>

          <ShowcaseTile
            image={userImg}
            icon={UserSilhouette}
            label="Customer"
          />
        </div>

        {/* Connector down to result */}
        <div className="flex flex-col items-center py-3">
          <div className="w-px h-5 bg-gradient-to-b from-white/20 to-fuchsia-400/50" />
          <div
            className="flex items-center gap-1.5 bg-fuchsia-500/15
                          border border-fuchsia-400/30 rounded-full
                          px-3 py-1"
          >
            <Sparkles className="w-3 h-3 text-fuchsia-300" strokeWidth={2} />
            <span className="text-fuchsia-200 text-[11px] font-semibold">
              AI generates in ~30 sec
            </span>
          </div>
          <div className="w-px h-5 bg-gradient-to-b from-fuchsia-400/50 to-white/20" />
        </div>

        {/* Result */}
        <div
          className="relative rounded-2xl overflow-hidden
                        bg-gradient-to-br from-purple-500 to-fuchsia-600
                        p-4"
        >
          <div className="flex items-center gap-4">
            <div
              onClick={() => resultImg && setShowModal(true)}
              className="relative w-24 h-28 sm:w-28 sm:h-28 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer"
            >
              {resultImg ? (
                <>
                  <img
                    src={resultImg}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
                  />
                  <img
                    src={resultImg}
                    alt="Try-on result"
                    className="relative w-full h-full object-contain"
                  />
                </>
              ) : (
                <UserSilhouette className="w-10 h-10 text-white/90" />
              )}
            </div>
            <div>
              <p className="text-white font-bold text-sm">Try-On Result</p>
              <p className="text-purple-100/90 text-xs mt-0.5">
                Ready to share with the customer
              </p>
              <div
                onClick={() => resultImg && setShowModal(true)}
                className="inline-flex items-center justify-center gap-1.5 mt-2.5 bg-black/15 border border-white/10 text-purple-200 hover:text-white hover:bg-black/25 font-bold text-[8px] uppercase tracking-widest px-3 py-1.5 rounded-lg backdrop-blur-md shadow-inner transition-all cursor-pointer"
              >
                <span>View Preview</span>
                {/* 💡 नीले इमोजी को रोकने के लिए एक स्लीक प्रीमियम SVG एरो */}
                <svg
                  className="w-2.5 h-2.5 text-current"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://w3.org"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2.5"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </div>
            </div>
            <Check
              className="w-5 h-5 text-white ml-auto shrink-0"
              strokeWidth={3}
            />
          </div>
        </div>

        {/* AI Style Advice — the payoff line */}
        <div className="mt-3 bg-white/[0.06] border border-white/[0.1] rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles
              className="w-3.5 h-3.5 text-fuchsia-300"
              strokeWidth={2}
            />
            <span className="text-white text-xs font-semibold">
              AI Style Advice
            </span>
          </div>
          <p className="text-purple-200/80 text-xs leading-relaxed">
            Great color match with dark bottoms — best suited for casual
            daywear.
          </p>
        </div>
      </div>

      {/* Floating badge */}
      <div
        className="absolute -top-3 -right-3 bg-emerald-500 text-white
                      rounded-2xl px-3.5 py-1.5 text-xs font-bold
                      shadow-lg flex items-center gap-1.5"
      >
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
        Result Ready
      </div>

      {/* Lightbox modal — rendered via portal so it truly covers
          the full viewport, escaping any parent's backdrop-blur */}
      {showModal &&
        createPortal(
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-sm
                       flex flex-col items-center justify-center p-6 cursor-zoom-out"
          >
            <img
              src={resultImg}
              alt="Try-on result full view"
              className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl"
            />
            <p className="mt-4 text-white/50 text-xs tracking-wide">
              Tap anywhere to close
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowModal(false);
              }}
              className="absolute top-20 right-10 w-10 h-10 rounded-full
                         bg-black/40 border border-white/20 text-white
                         flex items-center justify-center hover:bg-white/20
                         transition-colors"
            >
              ✕
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

/* Small tile used for Garment / Customer photo slots.
   Shows the real uploaded image if present, otherwise a
   clean icon placeholder with a label. */
function ShowcaseTile({ image, icon: Icon, label }) {
  return (
    <div className="flex-1 min-w-0">
      <div
        className="w-full h-56 rounded-2xl overflow-hidden
                   bg-white/[0.06] border border-white/[0.1]
                   flex items-center justify-center relative"
      >
        {image ? (
          <>
            {/* Blurred background fills the whole tile — no black bars */}
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-60"
            />
            {/* Actual image on top, fully visible, never cropped */}
            <img
              src={image}
              alt={label}
              className="relative w-full h-full object-cover"
            />
          </>
        ) : (
          <Icon className="w-9 h-9 text-white/50" strokeWidth={1.5} />
        )}
      </div>
      <p className="text-white/50 text-[11px] font-medium text-center mt-1.5 tracking-wide">
        {label}
      </p>
    </div>
  );
}

/* Simple person-silhouette icon (lucide doesn't ship a great
   default "customer photo" glyph, so this is a tiny custom SVG
   kept in the same style/stroke-width as lucide icons). */
function UserSilhouette({ className, strokeWidth = 1.5 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  );
}
