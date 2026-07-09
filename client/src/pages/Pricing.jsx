import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";
// --- Redesign note: swapped raw emoji icon-set for lucide-react so every
// icon shares one stroke-weight/visual-language across the page (premium
// SaaS pages almost never mix emoji + icons — pick one system and commit).
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Zap,
  Check,
  X,
  Gem,
  Rocket,
  Crown,
  Gift,
  CreditCard,
  Shirt,
  Scissors,
  Wand2,
  ArrowRight,
  LayoutDashboard,
  Loader2,
  BadgeCheck,
} from "lucide-react";

export default function Pricing() {
  const { seller, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");
  // eslint-disable-next-line
  const [billingType] = useState("monthly");

  // --- Redesign note: kept every plan/feature/pricing value 100% identical.
  // Only added an `icon` component reference + a couple of visual tokens
  // (accent / iconBg) so the markup below can render a consistent icon set
  // instead of emoji, and so the "popular" plan can get a premium glow ring.
  const plans = [
    {
      key: "free",
      icon: Gift,
      name: "Free",
      tagline: "Good for Testing the Platform",
      price: "₹0",
      credits: 100,
      color: "border-slate-200",
      headerBg: "bg-slate-50",
      accent: "text-slate-600",
      iconBg: "bg-slate-100",
      btnStyle: "bg-slate-900 hover:bg-black text-white",
      features: [
        { text: "100 credits included", available: true, highlight: true },
        { text: "~10 ready-made try-ons", available: true },
        { text: "~4 fabric generations", available: true },
        { text: "Basic shop page", available: true },
        { text: "WhatsApp orders", available: true },
        { text: "Website widget", available: false },
        { text: "Fabric shop", available: false },
        { text: "Analytics", available: false },
        { text: "Priority support", available: false },
      ],
    },
    {
      key: "basic",
      icon: Rocket,
      name: "Basic",
      tagline: "Perfect for Instagram Sellers",
      price: "₹999",
      credits: 1500,
      color: "border-blue-300",
      headerBg: "bg-blue-50",
      accent: "text-blue-600",
      iconBg: "bg-blue-100",
      btnStyle: "bg-blue-600 hover:bg-blue-700 text-white",
      features: [
        { text: "1,500 credits/month", available: true, highlight: true },
        { text: "~150 ready-made try-ons", available: true },
        { text: "Custom shop page", available: true },
        { text: "WhatsApp + UPI orders", available: true },
        { text: "Website widget", available: true },
        { text: "AI style advice", available: true },
        { text: "Basic analytics", available: true },
        { text: "Fabric shop", available: false },
        { text: "Priority support", available: false },
      ],
    },
    {
      key: "pro",
      icon: Gem,
      name: "Pro",
      tagline: "Best for Growing Fashion Stores",
      price: "₹2,499",
      credits: 3000,
      color: "border-violet-400",
      headerBg: "bg-violet-50",
      accent: "text-violet-600",
      iconBg: "bg-violet-100",
      btnStyle:
        "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-90",
      popular: true,
      features: [
        { text: "3,000 credits/month", available: true, highlight: true },
        { text: "~500 ready-made try-ons", available: true },
        { text: "~200 fabric generations", available: true },
        { text: "Fabric shop access", available: true },
        { text: "Website widget", available: true },
        { text: "Full analytics", available: true },
        { text: "Priority support", available: true },
        { text: "Custom domain", available: false },
      ],
    },
    {
      key: "elite",
      icon: Crown,
      name: "Elite",
      tagline: "For Fashion Brands",
      price: "₹4,999",
      credits: 10000,
      color: "border-amber-400",
      headerBg: "bg-amber-50",
      accent: "text-amber-600",
      iconBg: "bg-amber-100",
      btnStyle:
        "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90",
      features: [
        { text: "10,000 credits/month", available: true, highlight: true },
        { text: "~1200 ready-made try-ons", available: true },
        { text: "~500 fabric generations", available: true },
        { text: "Fabric shop access", available: true },
        { text: "Garment shop access", available: true },
        { text: "Website widget", available: true },
        { text: "Full analytics", available: true },
        { text: "Priority support", available: true },
        { text: "Custom domain", available: true },
      ],
    },
  ];

  const handlePayment = async (plan) => {
    if (plan.key === "free") {
      navigate(seller ? "/dashboard" : "/register");
      return;
    }
    if (!seller || !token) {
      navigate("/login");
      return;
    }
    setLoading(plan.key);
    try {
      const res = await axios.post(
        `${API_URL}/api/payment/create-order`,
        { plan: plan.key },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const { orderId, amount, keyId } = res.data;
      const options = {
        key: keyId,
        amount,
        currency: "INR",
        name: "VirtualTryOn",
        description: plan.name,
        order_id: orderId,
        handler: async (response) => {
          try {
            await axios.post(
              `${API_URL}/api/payment/verify`,
              { ...response, plan: plan.key },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            alert("🎉 Plan upgrade ho gaya!");
            navigate("/dashboard");
          } catch {
            alert("Payment verify nahi hua!");
          }
        },
        prefill: { name: seller?.name, email: seller?.email },
        theme: { color: "#7C3AED" },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("Found an error! Please try again.");
    } finally {
      setLoading("");
    }
  };

  const handleTopUp = async (pack) => {
    if (!seller || !token) {
      navigate("/login");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URL}/api/payment/topup-order`,
        { pack },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const options = {
        key: res.data.keyId,
        amount: res.data.amount,
        currency: "INR",
        name: "VirtualTryOn Credits",
        description: `${res.data.packName} - ${res.data.credits} Credits`,
        order_id: res.data.orderId,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(
              `${API_URL}/api/payment/topup-verify`,
              { ...response, pack },
              { headers: { Authorization: `Bearer ${token}` } },
            );
            alert(
              `🎉 ${res.data.credits} Credits add ho gaye!\n` +
                `New Balance: ${verifyRes.data.newBalance} credits`,
            );
            navigate("/dashboard");
          } catch {
            alert("Top-up verify nahi hua!");
          }
        },
        prefill: {
          name: seller?.name,
          email: seller?.email,
        },
        theme: { color: "#7C3AED" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      alert(err.response?.data?.message || "Error aaya!");
    }
  };

  // --- Redesign note: credit-cost + top-up pack data now carry a lucide
  // icon reference instead of a leading emoji character, so the icon and
  // label render as separate, properly aligned elements.
  const creditCosts = [
    { icon: Shirt, action: "Ready Try-On", credits: "10 credits", cost: "~₹10" },
    { icon: Scissors, action: "Fabric Generation", credits: "12 credits", cost: "~₹12" },
    { icon: Wand2, action: "Fabric Try-On", credits: "11 credits", cost: "~₹11" },
    { icon: Sparkles, action: "Style Advice", credits: "1 credit", cost: "~₹1" },
  ];

  const topUpPacks = [
    {
      key: "mini",
      name: "Mini",
      price: "₹149",
      credits: 200,
      desc: "~20 try-ons",
      color: "border-slate-200",
    },
    {
      key: "starter",
      name: "Starter",
      price: "₹299",
      credits: 450,
      desc: "~45 try-ons",
      color: "border-blue-200",
    },
    {
      key: "growth",
      name: "Growth",
      price: "₹599",
      credits: 1000,
      desc: "~100 try-ons",
      color: "border-violet-300",
      popular: true,
    },
    {
      key: "power",
      name: "Power",
      price: "₹999",
      credits: 1800,
      desc: "~180 try-ons",
      color: "border-indigo-300",
    },
    {
      key: "mega",
      name: "Mega",
      price: "₹1,999",
      credits: 4000,
      desc: "~400 try-ons",
      color: "border-amber-300",
    },
  ];

  const faqs = [
    {
      q: "Kya free trial mein card chahiye?",
      a: "Bilkul nahi! Free plan mein koi card nahi chahiye. Direct register karo aur shuru karo!",
    },
    {
      q: "Try-on limit khatam hone par kya hoga?",
      a: "Aapko email aayega. Aap plan upgrade kar sakte ho ya agle mahine tak wait kar sakte ho.",
    },
    {
      q: "Refund policy kya hai?",
      a: "7 din ke andar refund milega agar 10 se kam try-ons use kiye ho. Full details refund page par.",
    },
    {
      q: "Website nahi hai to kya hoga?",
      a: "Koi baat nahi! Hamara free shop page milega jiska link Instagram ya WhatsApp par share karo.",
    },
    {
      q: "Koi bhi kapde ka try-on ho sakta hai?",
      a: "Yes, we support all types of upper body (shirts, t-shirts, jackets) and lower body (trousers, pants, jeans etc) and also full dress (saree, kurti, kurta, lehnga, suits, gown etc). This all gives best result on try-ons.",
    },
    {
      q: "Support kaise milega?",
      a: "Email aur WhatsApp pe support available hai. Starter aur Pro users ko priority support milti hai.",
    },
  ];

  return (
    // --- Redesign note: base background moved from flat bg-gray-50 to a
    // very soft slate/violet-tinted gradient so white cards later in the
    // page get subtle depth instead of sitting on pure white/gray.
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/40">
      {/* Hero */}
      <div
        className="bg-gradient-to-br from-slate-950
                      via-violet-950 to-indigo-950
                      py-24 px-6 text-center relative
                      overflow-hidden"
      >
        {/* --- Redesign note: added a faint grid overlay under the glow
            blobs — this is the kind of texture premium SaaS marketing
            pages (Linear, Stripe, Vercel) use to keep a dark hero from
            feeling empty without adding visual noise. */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-1/4 w-72 h-72
                          bg-violet-500 opacity-25 rounded-full
                          blur-3xl animate-pulse"
          />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64
                          bg-indigo-500 opacity-25 rounded-full
                          blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
          {/* --- Redesign note: extra rose accent blob breaks the
              purple-only monotony and pairs with the pink used in the
              headline gradient below. */}
          <div
            className="absolute top-1/3 right-1/3 w-56 h-56
                          bg-fuchsia-500 opacity-10 rounded-full
                          blur-3xl animate-pulse"
            style={{ animationDelay: "2s" }}
          />
        </div>
        <div className="relative z-10">
          <span
            className="bg-white/10 backdrop-blur-md
                           border border-white/20
                           text-white px-4 py-2 rounded-full
                           text-sm font-medium inline-flex
                           items-center gap-2 mb-6 shadow-lg
                           shadow-violet-900/20"
          >
            <Sparkles className="w-4 h-4 text-violet-300" />
            Simple, Transparent Pricing
          </span>
          <h1
            className="text-4xl md:text-6xl font-black
                         text-white mb-4 tracking-tight"
          >
            Built for your business
            <span
              className=" block bg-gradient-to-r
                             from-violet-400 via-fuchsia-300 to-pink-400
                             bg-clip-text text-transparent
                             pb-2"
            >
              Choose the right plan
            </span>
          </h1>
          <p className="text-violet-200/80 text-lg max-w-xl mx-auto mb-8">
            No hidden charges. No contracts. Cancel anytime.
          </p>

          {/* Trust */}
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: BadgeCheck, label: "Free Trial" },
              { icon: ShieldCheck, label: "Secure Payment" },
              { icon: RotateCcw, label: "7-day Refund" },
              { icon: Zap, label: "Instant Activation" },
            ].map((b, i) => (
              <span
                key={i}
                className="bg-white/10
                           backdrop-blur-md text-white
                           px-4 py-2 rounded-full text-sm
                           border border-white/20
                           inline-flex items-center gap-1.5
                           hover:bg-white/[0.15] transition-colors"
              >
                <b.icon className="w-3.5 h-3.5 text-violet-300" />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative bg-white rounded-3xl
               border-2 ${plan.color} overflow-hidden
               hover:shadow-2xl transition-all
               duration-300 hover:-translate-y-2
               ${
                 plan.popular
                   ? // --- Redesign note: "popular" card now gets a soft
                     // glow ring behind it (via box-shadow) instead of just
                     // a plain shadow, so it visually pops off the grid at
                     // rest, not only on hover.
                     "shadow-2xl shadow-violet-300/40 ring-1 ring-violet-200 md:scale-105 z-10"
                   : "shadow-sm"
               }`}
            >
              {plan.popular && (
                <div
                  className="bg-gradient-to-r from-violet-600
                      to-indigo-600 text-white text-center
                      py-2 text-sm font-bold flex items-center
                      justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  MOST POPULAR
                </div>
              )}

              <div className={`${plan.headerBg} p-6 border-b`}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`${plan.iconBg} ${plan.accent} w-12 h-12
                       rounded-2xl flex items-center justify-center
                       shadow-sm`}
                  >
                    <plan.icon className="w-6 h-6" strokeWidth={2.25} />
                  </span>
                  <div>
                    <h3 className="text-xl font-black text-gray-800">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 text-xs">{plan.tagline}</p>
                  </div>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-gray-800">
                    {plan.price}
                  </span>
                  {plan.key !== "free" && (
                    <span className="text-gray-400 text-sm mb-1">/month</span>
                  )}
                </div>
                <div
                  className="mt-3 bg-white rounded-xl px-3 py-1.5
                      inline-flex items-center gap-1.5
                      border border-black/5 shadow-sm"
                >
                  <CreditCard className={`w-4 h-4 ${plan.accent}`} />
                  <span className={`${plan.accent} font-bold text-sm`}>
                    {plan.credits.toLocaleString()} Credits
                  </span>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex
                             items-center justify-center
                             flex-shrink-0
                             ${
                               f.available
                                 ? "bg-emerald-100 text-emerald-600"
                                 : "bg-gray-100 text-gray-300"
                             }`}
                      >
                        {f.available ? (
                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                        ) : (
                          <X className="w-3.5 h-3.5" strokeWidth={3} />
                        )}
                      </span>
                      <span
                        className={`text-sm
                             ${
                               !f.available
                                 ? "text-gray-300 line-through"
                                 : f.highlight
                                   ? "font-bold text-gray-800"
                                   : "text-gray-600"
                             }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePayment(plan)}
                  disabled={loading === plan.key}
                  className={`${plan.btnStyle} w-full py-3.5
                   rounded-2xl font-bold text-base
                   transition-all duration-300
                   disabled:opacity-50 shadow-md
                   flex items-center justify-center gap-2
                   group`}
                >
                  {loading === plan.key ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : plan.key === "free" ? (
                    <>
                      <Gift className="w-4 h-4" />
                      Start with Free Plan
                    </>
                  ) : (
                    <>
                      Buy {plan.name} Plan Now
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Credit Info Box */}
        <div
          className="max-w-4xl mx-auto mt-12 bg-gradient-to-br
                from-violet-50 to-indigo-50 rounded-3xl
                p-6 border border-violet-100"
        >
          <h3 className="font-bold text-gray-800 text-lg mb-4 text-center flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-600" />
            How Does the Credit System Work?
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {creditCosts.map((item, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-4 text-center
                   border border-violet-100 hover:border-violet-200
                   hover:shadow-md transition-all"
              >
                <span
                  className="w-10 h-10 rounded-xl bg-violet-100
                     text-violet-600 flex items-center justify-center
                     mx-auto mb-2"
                >
                  <item.icon className="w-5 h-5" />
                </span>
                <p className="text-xs text-gray-500 mb-1">{item.action}</p>
                <p className="font-black text-violet-600">{item.credits}</p>
                <p className="text-xs text-gray-400">{item.cost}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top-Up Packs */}
        <div className="max-w-5xl mx-auto mt-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-800 flex items-center justify-center gap-2">
              <Zap className="w-7 h-7 text-amber-500" />
              Credit Top-Up Packs
            </h2>
            <p className="text-gray-500 mt-2">
              Credits khatam? Turant top-up karen!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {topUpPacks.map((pack) => (
              <div
                key={pack.key}
                className={`bg-white rounded-2xl p-4 text-center
                   border-2 ${pack.color} relative
                   hover:shadow-lg transition-all
                   hover:-translate-y-1`}
              >
                {pack.popular && (
                  <span
                    className="absolute -top-2.5 left-1/2
                           -translate-x-1/2 bg-violet-600
                           text-white text-xs px-3 py-0.5
                           rounded-full font-bold"
                  >
                    Best Value
                  </span>
                )}
                <h3 className="font-black text-gray-800 mb-1">{pack.name}</h3>
                <p className="text-2xl font-black text-violet-600 mb-1">
                  {pack.price}
                </p>
                <p className="text-sm font-bold text-gray-600 mb-0.5">
                  {pack.credits} Credits
                </p>
                <p className="text-xs text-gray-400 mb-3">{pack.desc}</p>
                <button
                  onClick={() => handleTopUp(pack.key)}
                  className="w-full bg-gradient-to-r from-violet-600
                     to-indigo-600 text-white py-2 rounded-xl
                     font-bold text-sm hover:opacity-90
                     transition flex items-center justify-center gap-1"
                >
                  Buy
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2
            className="text-3xl font-black text-gray-800
                         text-center mb-10"
          >
            Aksar Puche Jane Wale Sawaal (FAQ)
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6
                          max-w-4xl mx-auto"
          >
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6
                           border border-gray-100
                           hover:shadow-md hover:border-violet-100
                           transition-all"
              >
                <h4
                  className="font-bold text-gray-800 mb-2
                               flex items-start gap-2"
                >
                  <span className="text-violet-500 flex-shrink-0">Q.</span>
                  {faq.q}
                </h4>
                <p
                  className="text-gray-500 text-sm leading-relaxed
                              pl-6"
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-16 bg-gradient-to-br from-violet-600
                        via-indigo-600 to-violet-700 rounded-3xl p-10
                        text-center text-white relative
                        overflow-hidden"
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                radial-gradient(circle, white 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          ></div>
          <div className="relative z-10">
            <span
              className="w-16 h-16 rounded-2xl bg-white/15
                 backdrop-blur-sm flex items-center justify-center
                 mx-auto mb-4"
            >
              <Sparkles className="w-8 h-8" />
            </span>
            <h3 className="text-2xl md:text-3xl font-black mb-3">
              Get started now — for free!
            </h3>
            <p className="text-violet-200 mb-6 max-w-md mx-auto">
              Test with 100 credit trials. Upgrade if you like it!
            </p>
            <button
              onClick={() => navigate(seller ? "/dashboard" : "/register")}
              className="bg-white text-violet-700
                         px-10 py-4 rounded-2xl
                         font-black text-lg
                         hover:bg-violet-50 transition
                         shadow-lg hover:-translate-y-1
                         inline-flex items-center gap-2"
            >
              {seller ? (
                <>
                  <LayoutDashboard className="w-5 h-5" />
                  Open Dashboard
                </>
              ) : (
                <>
                  <Rocket className="w-5 h-5" />
                  Create Your Free Account
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}