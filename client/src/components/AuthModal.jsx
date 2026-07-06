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
  const blocked = ["test.com","abc.com","xyz.com","example.com","fake.com","asdf.com"];
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
          style={{ background: "linear-gradient(90deg,#8B5CF6,#EC4899,#F59E0B)" }}
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100
                     hover:bg-gray-200 flex items-center justify-center
                     text-gray-500 text-sm transition"
        >
          ✕
        </button>

        <div className="p-8 text-center">
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center
                       justify-center text-4xl"
            style={{
              background: "linear-gradient(135deg,#8B5CF6,#EC4899)",
              boxShadow: "0 10px 30px rgba(139,92,246,0.4)",
            }}
          >
            🔒
          </div>

          <h2 className="text-xl font-black text-gray-800 mb-2">
            Login Zaroori Hai!
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Virtual try-on aur apni gallery dekhne ke liye pehle login ya
            register karein. Aapki photos sirf aapko dikhegi — kisi aur ko
            nahi. 🔐
          </p>

          <button
            onClick={onLoginClick}
            className="w-full text-white py-3.5 rounded-2xl font-bold text-sm
                       transition hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "linear-gradient(135deg,#8B5CF6,#EC4899)",
              boxShadow: "0 10px 25px rgba(139,92,246,0.35)",
            }}
          >
            🚀 Login / Register Karein
          </button>
          <p className="text-xs text-gray-400 mt-4">
            Sirf 30 second lagega, promise! 😊
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Auth Modal (Login + Register) ────────
export default function AuthModal({ mode = "login", onClose, onSuccess }) {
  const [activeMode, setActiveMode] = useState(mode);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sellerError, setSellerError] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [pwdTouched, setPwdTouched] = useState(false);
  const { loginCustomer } = useCustomer();

  const pwdChecks = checkPwd(form.password);
  const isPwdStrong = Object.values(pwdChecks).every(Boolean);

  const handleSubmit = async () => {
    if (!isValidEmail(form.email)) {
      setError("Sahi email daalo! (jaise: name@gmail.com)");
      return;
    }
    if (activeMode === "register" && !isPwdStrong) {
      setPwdTouched(true);
      setError("Password strong nahi hai — niche dekho!");
      return;
    }
    setLoading(true);
    setError("");
    setSellerError(false);
    try {
      const endpoint =
        activeMode === "login" ? "/api/customer/login" : "/api/customer/register";
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
              ? "Apne try-ons dekhne ke liye login karein"
              : "Free mein register karein aur try-on karein"}
          </p>
        </div>

        <div className="p-6">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => { setActiveMode(m); setError(""); setSellerError(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition capitalize
                  ${activeMode === m
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
                Yeh email seller account ke liye hai. Shop se login nahi kar sakte.
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-2 text-purple-600 text-xs font-bold underline"
              >
                Seller Dashboard →
              </button>
            </div>
          )}

          <div className="space-y-3">
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
                  { c: pwdChecks.num,   t: "Number (0-9)" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className={`text-sm ${r.c ? "text-green-500" : "text-gray-300"}`}>
                      {r.c ? "✓" : "○"}
                    </span>
                    <span className={`text-xs ${r.c ? "text-green-600 font-medium" : "text-gray-400"}`}>
                      {r.t}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
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
          </div>
        </div>
      </div>
    </div>
  );
}