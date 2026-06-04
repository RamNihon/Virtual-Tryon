import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

export default function Pricing() {
  const { seller, token } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState("");
  const [billingType] = useState("monthly");

  const plans = [
    {
      key: "free",
      name: "Free",
      emoji: "🆓",
      price: { monthly: 0 },
      description: "Shuru karne ke liye perfect",
      color: "border-gray-200",
      btnStyle: "bg-gray-800 hover:bg-gray-900",
      features: [
        { text: "50 try-ons/month", available: true },
        { text: "Basic shop page", available: true },
        { text: "WhatsApp orders", available: true },
        { text: "AI style advice", available: true },
        { text: "Website widget", available: false },
        { text: "Analytics dashboard", available: false },
        { text: "Priority support", available: false },
      ],
    },
    {
      key: "starter",
      name: "Starter",
      emoji: "🚀",
      price: { monthly: 1999 },
      description: "Growing sellers ke liye",
      color: "border-purple-500",
      btnStyle:
        "bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90",
      popular: true,
      features: [
        { text: "500 try-ons/month", available: true },
        { text: "Custom shop page", available: false },
        { text: "WhatsApp orders", available: true },
        { text: "AI style advice", available: true },
        { text: "Website widget", available: true },
        { text: "Analytics dashboard", available: true },
        { text: "Priority support", available: true },
      ],
    },
    {
      key: "pro",
      name: "Pro",
      emoji: "💎",
      price: { monthly: 4999 },
      description: "Serious sellers ke liye",
      color: "border-indigo-500",
      btnStyle:
        "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90",
      features: [
        { text: "Unlimited try-ons", available: true },
        { text: "Custom shop page", available: true },
        { text: "WhatsApp orders", available: true },
        { text: "AI style advice", available: true },
        { text: "Website widget", available: true },
        { text: "Analytics dashboard", available: true },
        { text: "Priority support", available: true },
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="bg-gradient-to-br from-slate-900
                      via-purple-900 to-indigo-900
                      py-20 px-6 text-center relative
                      overflow-hidden"
      >
        <div className="absolute inset-0">
          <div
            className="absolute top-0 left-1/4 w-72 h-72
                          bg-purple-500 opacity-20 rounded-full
                          blur-3xl animate-pulse"
          />
          <div
            className="absolute bottom-0 right-1/4 w-64 h-64
                          bg-indigo-500 opacity-20 rounded-full
                          blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
        <div className="relative z-10">
          <span
            className="bg-white bg-opacity-10 backdrop-blur-sm
                           border border-white border-opacity-20
                           text-white px-4 py-2 rounded-full
                           text-sm font-medium inline-block mb-6"
          >
            💰 Simple Pricing
          </span>
          <h1
            className="text-3xl md:text-5xl font-black
                         text-white mb-4"
          >
            For your business
            <span
              className=" block bg-gradient-to-r
                             from-purple-400 to-pink-400
                             bg-clip-text text-transparent"
            >
              Choose the right plan!
            </span>
          </h1>
          <p className="text-purple-200 text-lg max-w-xl mx-auto mb-8">
            No hidden charges. No contracts. Cancel anytime!
          </p>

          {/* Trust */}
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "✅ Free Trial",
              "🔒 Secure Payment",
              "↩️ 7-day Refund",
              "⚡ Instant Activation",
            ].map((b, i) => (
              <span
                key={i}
                className="bg-white bg-opacity-10
                           backdrop-blur-sm text-white
                           px-4 py-2 rounded-full text-sm
                           border border-white border-opacity-20"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative bg-white rounded-3xl
                         border-2 ${plan.color} overflow-hidden
                         hover:shadow-2xl transition-all
                         duration-300 hover:-translate-y-2
                         ${plan.popular ? "shadow-xl shadow-purple-100" : "shadow-sm"}`}
            >
              {plan.popular && (
                <div
                  className="bg-gradient-to-r from-purple-600
                                to-indigo-600 text-white text-center
                                py-2 text-sm font-bold"
                >
                  ⭐ MOST POPULAR PLAN
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl
                                  flex items-center justify-center
                                  text-2xl
                                  ${
                                    plan.popular
                                      ? "bg-purple-100"
                                      : "bg-gray-100"
                                  }`}
                  >
                    {plan.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-800">
                      {plan.name}
                    </h3>
                    <p className="text-gray-400 text-xs">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-gray-800">
                      ₹{plan.price[billingType].toLocaleString()}
                    </span>
                    {plan.price[billingType] > 0 && (
                      <span className="text-gray-400 mb-2">/month</span>
                    )}
                  </div>
                  {plan.price[billingType] === 0 && (
                    <span className="text-gray-400 text-sm">Forever Free!</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, fi) => (
                    <li key={fi} className="flex items-center gap-3">
                      <span
                        className={`w-5 h-5 rounded-full flex
                                       items-center justify-center
                                       text-xs flex-shrink-0
                                       ${
                                         f.available
                                           ? "bg-green-100 text-green-600"
                                           : "bg-gray-100 text-gray-300"
                                       }`}
                      >
                        {f.available ? "✓" : "✕"}
                      </span>
                      <span
                        className={`text-sm
                                       ${
                                         f.available
                                           ? "text-gray-700"
                                           : "text-gray-300 line-through"
                                       }`}
                      >
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={loading === plan.key}
                  className={`w-full ${plan.btnStyle} text-white
                             py-4 rounded-2xl font-bold text-base
                             transition-all duration-300
                             disabled:opacity-50 shadow-lg`}
                >
                  {loading === plan.key
                    ? "⏳ Loading..."
                    : plan.key === "free"
                      ? "🆓 Free Mein Shuru Karem"
                      : `🚀 ${plan.name} Plan → Buy Now!`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-20">
          <h2
            className="text-3xl font-black text-gray-800
                         text-center mb-10"
          >
            Aksar Puche Jane Wale Sawaal(FAQ) ❓
          </h2>
          <div
            className="grid grid-cols-1 md:grid-cols-2 gap-6
                          max-w-4xl mx-auto"
          >
            {[
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
                a: "Abhi upper body (shirts, t-shirts, jackets) best results deta hai. Lower body bhi kaam karta hai.",
              },
              {
                q: "Support kaise milega?",
                a: "Email aur WhatsApp pe support available hai. Starter aur Pro users ko priority support milti hai.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6
                           border border-gray-100
                           hover:shadow-md transition-all"
              >
                <h4
                  className="font-bold text-gray-800 mb-2
                               flex items-start gap-2"
                >
                  <span className="text-purple-500 flex-shrink-0">Q.</span>
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
          className="mt-16 bg-gradient-to-br from-purple-600
                        to-indigo-600 rounded-3xl p-10
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
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl md:text-3xl font-black mb-3">
              Get started now - for free!
            </h3>
            <p className="text-purple-200 mb-6 max-w-md mx-auto">
              Test with 50 free trials. Upgrade if you like it!
            </p>
            <button
              onClick={() => navigate(seller ? "/dashboard" : "/register")}
              className="bg-white text-purple-700
                         px-10 py-4 rounded-2xl
                         font-black text-lg
                         hover:bg-purple-50 transition
                         shadow-lg hover:-translate-y-1"
            >
              {seller ? "📊 Open Dashboard" : "🚀 Create Your Free Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
