import { useState } from "react";
import axios from "axios";
import API_URL from "../api";
import { useCustomer } from "../context/CustomerContext";

// Password strength checks
const checkPwd = (p) => ({
  length: p.length >= 8,
  upper: /[A-Z]/.test(p),
  lower: /[a-z]/.test(p),
  num: /[0-9]/.test(p),
});

// Email validation
const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,10}$/;
  if (!regex.test(email)) return false;
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const blocked = [
    "test.com",
    "abc.com",
    "xyz.com",
    "example.com",
    "fake.com",
    "asdf.com",
  ];
  return !blocked.includes(domain);
};

// ─── Login Required Popup ─────────────────
export function LoginRequiredPopup({ onClose, onLoginClick }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,12,41,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-white"
        style={{ boxShadow: "0 25px 60px rgba(139,92,246,0.3)" }}
      >
        {/* Rainbow top bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: "linear-gradient(90deg,#8B5CF6,#EC4899,#F59E0B)",
          }}
        />

        <div className="p-8 text-center relative overflow-hidden bg-white rounded-3xl select-none shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-neutral-100">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100
                     hover:bg-gray-200 flex items-center justify-center
                     text-gray-500 text-sm transition"
          >
            ✕
          </button>

          {/* SaaS Premium Ambient Background Aura */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Ultra Premium Glowing Lock Icon Container */}
          <div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center relative group transition-all duration-300 hover:scale-105"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              boxShadow: "0 12px 30px rgba(139, 92, 246, 0.3)",
            }}
          >
            {/* Inner Shimmer Effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Advanced SaaS Lock/Shield SVG Icon */}
            <svg
              className="w-6 h-6 text-white animate-[pulse_3s_infinite]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://w3.org"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          {/* Premium Modern Heading (आपकी अपनी वॉर्डिंग सुरक्षित है) */}
          <h2 className="text-xl font-extrabold text-neutral-900 mb-3 tracking-normal">
            Sign in to continue ✨
          </h2>

          {/* Optimized Typography Contrast (आपकी अपनी वॉर्डिंग पूरी तरह सुरक्षित है) */}
          <p className="text-neutral-600 font-medium leading-7 text-sm max-w-sm mx-auto mb-7 px-1">
            Please Login or Create a free account to experience the virtual
            try-on and save your styles. Your uploaded photos are completely
            private, securely encrypted, and visible only to you. 🔐
          </p>

          {/* Elite Centered Call-to-Action Button */}
          <button
            onClick={onLoginClick}
            className="relative overflow-hidden w-full text-white h-12 flex items-center justify-center rounded-xl font-bold text-sm tracking-wide shadow-[0_10px_25px_rgba(139,92,246,0.3)] hover:shadow-[0_12px_30px_rgba(139,92,246,0.4)] active:scale-[0.98] transition-all duration-200 ease-out group"
            style={{
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
            }}
          >
            {/* Glossy Reflection Wave Effect on Hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

            <span className="flex items-center justify-center gap-2">
              🚀 Login / Register Now
            </span>
          </button>

          {/* Clean Minimalist Subtext Badge (बिना ग्रीन डॉट के एकदम प्रीमियम साएस लुक) */}
          <div className="mt-5 inline-flex items-center justify-center bg-purple-500/[0.04] border border-purple-500/10 px-4 py-1.5 rounded-full text-[11px] text-purple-600/80 font-bold tracking-wide uppercase">
            Takes less than 30 seconds!
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal (Login + Register) ────────
export default function AuthModal({ mode = "login", onClose, onSuccess }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sellerError, setSellerError] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const { loginCustomer } = useCustomer();

  const pwdChecks = checkPwd(form.password);
  const isPwdStrong = Object.values(pwdChecks).every(Boolean);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address (e.g., name@gmail.com).");
      return;
    }
    if (activeMode === "register" && !isPwdStrong) {
      setPwdTouched(true);
      setError("Password does not meet the requirements — please check below.");
      return;
    }
    setLoading(true);
    setError("");
    setSellerError(false);
    try {
      const endpoint =
        activeMode === "login"
          ? "/api/customer/login"
          : "/api/customer/register";
      const res = await axios.post(`${API_URL}${endpoint}`, form);
      loginCustomer(res.data.customer, res.data.token);
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === "SELLER_EMAIL") setSellerError(true);
      else setError(msg || "Kuch error aaya!");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div
      className="fixed inset-0 z-[210] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="p-6 text-white text-center relative"
          style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white opacity-70
                       hover:opacity-100 text-xl leading-none"
          >
            ✕
          </button>
          <div className="text-4xl mb-2">👗</div>
          <h2 className="text-xl font-bold">
            {activeMode === "login" ? "Welcome Back!" : "Create Account"}
          </h2>
          <p className="text-purple-200 text-xs mt-1">
            {activeMode === "login"
              ? "Sign in to access and view your virtual try-ons"
              : "Create a free account to unlock virtual try-ons"}
          </p>
        </div>

        <div className="p-6">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setActiveMode(m);
                  setError("");
                  setSellerError(false);
                }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition capitalize
                  ${
                    activeMode === m
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-gray-500"
                  }`}
              >
                {m === "login" ? "Login" : "Register"}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Seller Error */}
          {sellerError && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4">
              <p className="text-amber-800 font-bold text-sm mb-1">
                ⚠️ Seller Account Detected!
              </p>
              <p className="text-amber-700 text-xs">
                This email is registered as a seller account. Please use the
                dashboard to Log in, as shop login is not supported.
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-2 text-purple-600 text-xs font-bold underline"
              >
                Login via Seller Dashboard →
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {activeMode === "register" && (
              <input
                type="text"
                placeholder="Aapka naam *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3
                           text-sm focus:outline-none focus:border-purple-500"
              />
            )}

            <input
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-3
                         text-sm focus:outline-none focus:border-purple-500"
            />

            {activeMode === "register" && (
              <input
                type="tel"
                placeholder="Mobile number (optional)"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3
                           text-sm focus:outline-none focus:border-purple-500"
              />
            )}

            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                placeholder="Password *"
                value={form.password}
                onChange={(e) => {
                  setForm({ ...form, password: e.target.value });
                  setPwdTouched(true);
                }}
                className="w-full border border-gray-200 rounded-xl
                           px-4 py-3 pr-12 text-sm focus:outline-none
                           focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 text-xl"
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password strength */}
            {activeMode === "register" && pwdTouched && form.password && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
                {[
                  { c: pwdChecks.length, t: "8+ characters" },
                  { c: pwdChecks.upper, t: "Capital letter (A-Z)" },
                  { c: pwdChecks.lower, t: "Small letter (a-z)" },
                  { c: pwdChecks.num, t: "Number (0-9)" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`text-sm ${r.c ? "text-green-500" : "text-gray-300"}`}
                    >
                      {r.c ? "✓" : "○"}
                    </span>
                    <span
                      className={`text-xs ${r.c ? "text-green-600 font-medium" : "text-gray-400"}`}
                    >
                      {r.t}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full text-white py-3 rounded-xl font-bold
                         transition disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)" }}
            >
              {loading
                ? "⏳ Please wait..."
                : activeMode === "login"
                  ? "🚀 Login Now"
                  : "✅ Register Now"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
