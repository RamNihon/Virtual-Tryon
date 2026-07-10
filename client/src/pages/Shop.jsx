import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";
import { useCustomer } from "../context/CustomerContext";
import VoiceAssistant, { speakText } from "../components/VoiceAssistant";
import TryOnGallery from "../components/TryOnGallery";

// Shared status color classes (used for badges across the page)
const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  accepted: "bg-purple-100 text-purple-700",
  packed: "bg-yellow-100 text-yellow-700",
  shipped: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  return_requested: "bg-pink-100 text-pink-700",
};

// Reusable text color set for rating/stars
const RATING_TEXT_COLORS = {
  high: "text-green-500",
  mid: "text-orange-400",
  low: "text-red-500",
  muted: "text-gray-200",
};

// Helper function - order track karo
const trackOrder = async (product, orderType, shop) => {
  try {
    await axios.post(`${API_URL}/api/seller/track-order`, {
      sellerId: shop.sellerId,
      productId: product._id,
      productName: product.name,
      productPrice: product.price,
      orderType,
    });
  } catch (e) {
    // Silent fail - tracking fail hone par
    // user experience affect nahi hona chahiye
    console.log("Track error:", e.message);
  }
};

// ─── Star Rating Display ──────────────────
function StarRating({ rating, size = "sm", showNumber = true }) {
  const stars = [1, 2, 3, 4, 5];
  const sizeClass =
    size === "lg" ? "text-2xl" : size === "md" ? "text-lg" : "text-sm";

  const getColor = (r) => {
    if (r >= 4) return "text-green-500";
    if (r >= 2) return "text-orange-400";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {stars.map((star) => (
          <span
            key={star}
            className={`${sizeClass} ${
              star <= Math.round(rating) ? getColor(rating) : "text-gray-200"
            }`}
          >
            ★
          </span>
        ))}
      </div>
      {showNumber && rating > 0 && (
        <span
          className={`font-bold ${getColor(rating)}
                         ${size === "lg" ? "text-lg" : "text-xs"}`}
        >
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}

// ─── Interactive Star Selector ────────────
function StarSelector({ value, onChange }) {
  const [hover, setHover] = useState(0);

  const getColor = (star) => {
    const active = hover || value;
    if (star <= active) {
      if (active >= 4) return RATING_TEXT_COLORS.high;
      if (active >= 2) return RATING_TEXT_COLORS.mid;
      return RATING_TEXT_COLORS.low;
    }
    return RATING_TEXT_COLORS.muted;
  };

  const labels = {
    1: "Terrible 😡",
    2: "Poor 😞",
    3: "Average 🙂",
    4: "Good 😊",
    5: "Excellent! 🤩",
  };

  return (
    <div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`text-4xl transition-all duration-150
                       hover:scale-125 ${getColor(star)}`}
          >
            ★
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <p
          className="text-sm font-medium mt-1
                      text-gray-600"
        >
          {labels[hover || value]}
        </p>
      )}
    </div>
  );
}

// ─── Shop Navbar ──────────────────────────
// ─── Shop Account Panel (My Account dropdown) ───
function ShopAccountPanel({ customer, onClose, onProfileClick, onMyTryOnsClick, onLogout }) {
  return (
    <>
      {/* Backdrop - click karke close ho jayega */}
      <div className="fixed inset-0 z-[90]" onClick={onClose} />

      <div
        className="absolute right-0 top-full mt-3 w-72 z-[100]
                   bg-[#150826]
                   border border-white/15 rounded-2xl
                   shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)]
                   overflow-hidden
                   animate-in fade-in slide-in-from-top-2 duration-200"
      >
        {/* Header strip */}
        <div className="bg-[#2a1050] p-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500
                         flex items-center justify-center text-white font-black text-lg
                         shadow-lg shadow-purple-500/30 flex-shrink-0"
            >
              {customer?.name ? customer.name.charAt(0).toUpperCase() : "👤"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white font-bold text-sm truncate">
                {customer?.name || "Guest User"}
              </p>
              <p className="text-purple-300 text-xs truncate">
                {customer?.email || customer?.mobile || "Welcome back!"}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-2">
          <button
            onClick={onProfileClick}
            className="w-full flex items-center gap-2.5 text-left
                       text-white text-sm font-semibold
                       px-3 py-2.5 rounded-xl
                       hover:bg-white/10 active:bg-white/20
                       transition-all duration-200"
          >
            <span>👤</span> My Account
          </button>
          <button
            onClick={onMyTryOnsClick}
            className="w-full flex items-center gap-2.5 text-left
                       text-white text-sm font-semibold
                       px-3 py-2.5 rounded-xl
                       hover:bg-white/10 active:bg-white/20
                       transition-all duration-200"
          >
            <span>✨</span> My Try-Ons
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 text-left
                       text-red-300 text-sm font-semibold
                       px-3 py-2.5 rounded-xl
                       hover:bg-red-500/10 active:bg-red-500/20
                       transition-all duration-200"
          >
            <span>🔓</span> Logout
          </button>
        </div>
      </div>
    </>
  );
}

function ShopNavbar({ shop, onLoginClick, onProfileClick, onMyTryOnsClick }) {
  const { customer, logoutCustomer } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const features = [
    "✨ Virtual Try-On Technology",
    "🤖 AI Style Advice",
    "📱 Easy WhatsApp Orders",
    "📱 Easy Direct order",
    "🟢 Live order status",
    "🚚 Fast Delivery",
    "↩️ Easy Returns",
    "💳 Secure Payments",
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const current = features[textIndex];
    let timeout;
    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setTextIndex((i) => (i + 1) % features.length);
    } else {
      timeout = setTimeout(
        () => {
          setDisplayText((prev) =>
            isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
          );
        },
        isDeleting ? 50 : 80,
      );
    }
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayText, isDeleting, textIndex]);

  return (
   <div
      className={`sticky top-0 z-30 relative transition-shadow duration-500 ${
        scrolled ? "shadow-xl shadow-purple-950/60" : "shadow-lg shadow-purple-950/40"
      }`}
    >
      {/* Subtle top glow line */}
      {/* <div className="h-[2px] w-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400 opacity-80" /> */}
      <div
        className="transition-all duration-500 px-4 py-3 relative
                   bg-gradient-to-r from-[#1a0b2e] via-[#3b0764] to-[#1e1b4b]"
      >
        {/* Soft glow accent */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(217,70,239,0.12),transparent)]" />
        <div
          className="max-w-6xl mx-auto flex
                        items-center justify-between relative"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <h1
              className="text-xl md:text-2xl font-bold
                           text-white italic truncate"
              style={{ fontFamily: "Georgia, serif" }}
            >
              👗 {shop?.name}
            </h1>
          </div>

          <div className="hidden md:flex items-center gap-3 relative z[95]">
            {customer ? (
              <div className="relative">
            <button
                  onClick={() => setAccountOpen((v) => !v)}
                  className="flex items-center gap-2 bg-white/[0.07] hover:bg-white/[0.14]
                             border border-white/15 rounded-full pl-1.5 pr-4 py-1.5
                             shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_4px_20px_-4px_rgba(217,70,239,0.25)]
                             transition-all duration-200 cursor-pointer"
                >
                  <span
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500
                               flex items-center justify-center text-white font-bold text-xs"
                  >
                    {customer?.name ? customer.name.charAt(0).toUpperCase() : "👤"}
                  </span>
                  <span className="text-white text-sm font-semibold">
                    {customer.name?.split(" ")[0]}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-purple-300 transition-transform duration-300 ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {accountOpen && (
                  <ShopAccountPanel
                    customer={customer}
                    onClose={() => setAccountOpen(false)}
                    onProfileClick={() => {
                      setAccountOpen(false);
                      onProfileClick();
                    }}
                    onMyTryOnsClick={() => {
                      setAccountOpen(false);
                      onMyTryOnsClick();
                    }}
                    onLogout={() => {
                      setAccountOpen(false);
                      logoutCustomer();
                    }}
                  />
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={() => onLoginClick("login")}
                  className="text-white/90 text-sm font-semibold px-4 py-2
                             hover:text-white transition-colors duration-200 cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => onLoginClick("register")}
                  className="relative overflow-hidden text-white text-sm font-bold
                             px-5 py-2.5 rounded-full
                             bg-gradient-to-r from-[#ff007f] via-[#7928ca] to-[#00dfd8]
                             bg-[size:200%_auto] hover:bg-[position:right_center]
                             shadow-[0_0_20px_rgba(121,40,202,0.35)]
                             hover:shadow-[0_0_30px_rgba(255,0,127,0.45)]
                             transition-all duration-500 ease-out
                             transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  Register
                </button>
              </>
            )}
          </div>
          {/* --- 1. ANIMATED HAMBURGER BUTTON --- */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-90 transition-all duration-300 focus:outline-none z-50 group border border-white/5 cursor-pointer"
            aria-label="Toggle Menu"
          >
            <div className="w-5 h-3.5 flex flex-col justify-between relative">
              {/* टॉप लाइन */}
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 transform origin-center ${
                  menuOpen ? "rotate-45 translate-y-[6px]" : ""
                }`}
              ></span>

              {/* मिडिल line */}
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-200 transform ${
                  menuOpen ? "opacity-0 scale-x-0" : ""
                }`}
              ></span>

              {/* बॉटम लाइन */}
              <span
                className={`w-full h-0.5 bg-white rounded-full transition-all duration-300 transform origin-center ${
                  menuOpen ? "-rotate-45 -translate-y-[6px]" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>

        {/* --- 2. ADVANCE PREMIUM DROPDOWN MENU --- */}
        {menuOpen && (
          <div className="md:hidden mt-3 p-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 space-y-1 shadow-xl shadow-purple-950/20 animate-in fade-in slide-in-from-top-3 duration-300">
            {customer ? (
              <>
                <div className="flex items-center gap-2.5 px-3 py-2.5">
                  <span
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500
                               flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                  >
                    {customer?.name ? customer.name.charAt(0).toUpperCase() : "👤"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold truncate">
                      {customer.name}
                    </p>
                    <p className="text-purple-300 text-xs truncate">
                      {customer?.email || "Welcome back!"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onProfileClick();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left text-white text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all"
                >
                  <span>👤</span> My Account
                </button>
                <button
                  onClick={() => {
                    onMyTryOnsClick();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left text-white text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all"
                >
                  <span>✨</span> My Try-Ons
                </button>
                <button
                  onClick={() => {
                    logoutCustomer();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left text-pink-200 text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-red-500/10 active:bg-red-500/20 transition-all"
                >
                  <span>🔓</span> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onLoginClick("login");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left text-white text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all"
                >
                  <span>🔑</span> Login
                </button>
                <button
                  onClick={() => {
                    onLoginClick("register");
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full text-left text-white text-sm font-semibold px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#ff007f]/80 via-[#7928ca]/80 to-[#00dfd8]/80 hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  <span>📝</span> Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
{/* Subtle top glow line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-fuchsia-500 via-purple-400 to-cyan-400 opacity-80" />
      {/* --- 3. PREMIUM RUNNING TICKER BAR --- */}
     <div className="bg-gradient-to-r from-[#1e1b4b] via-[#4c1d95] to-[#1e1b4b] py-2.5 px-4 text-center border-t border-white/10 relative overflow-hidden">
        {/* बैकग्राउंड शाइन इफ़ेक्ट */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmery"></div>

        <p className="text-white text-xs sm:text-sm font-bold tracking-wide min-h-6 flex items-center justify-center gap-1 drop-shadow-sm relative z-10">
          <span>{displayText}</span>
          <span className="w-1.5 h-3.5 bg-white/80 rounded-sm animate-pulse inline-block ml-0.5"></span>
        </p>
      </div>
    </div>
  );
}

// ─── Customer Auth Modal ──────────────────
// Password checks
const checkPwd = (p) => ({
  length: p.length >= 8,
  upper: /[A-Z]/.test(p),
  lower: /[a-z]/.test(p),
  num: /[0-9]/.test(p),
});

// ✅ Email validation
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
function LoginRequiredPopup({ onClose, onLoginClick }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(15,12,41,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden bg-white"
        style={{ boxShadow: "0 25px 60px rgba(139,92,246,0.3)" }}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: "linear-gradient(90deg,#8B5CF6,#EC4899,#F59E0B)",
          }}
        />
        {/* <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100
                     hover:bg-gray-200 flex items-center justify-center
                     text-gray-500 text-sm transition"
        >
          ✕
        </button> */}
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
    <svg className="w-6 h-6 text-white animate-[pulse_3s_infinite]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
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

function CustomerAuthModal({ mode, onClose, onSuccess }) {
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

  const handleSubmit = async () => {
    // ✅ Email validation
    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address (e.g., name@gmail.com).");
      return;
    }
    // Prevent weak passwords on registration
    if (activeMode === "register" && !isPwdStrong) {
      setPwdTouched(true);
      setError("Password is not strong enough");
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
      if (msg === "SELLER_EMAIL") {
        setSellerError(true);
      } else {
        setError(msg || "Error aaya!");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60
                    z-50 flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-3xl w-full
                      max-w-sm shadow-2xl"
      >
        <div
          className="bg-gradient-to-r from-purple-600
                        to-indigo-600 p-6 rounded-t-3xl
                        text-white text-center relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white
                       opacity-70 hover:opacity-100 text-xl"
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
          <div
            className="flex bg-gray-100 rounded-xl
                          p-1 mb-5"
          >
            {["login", "register"].map((m) => (
              <button
                key={m}
                onClick={() => setActiveMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm
                           font-semibold transition capitalize
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
          {error && (
            <div
              className="bg-red-50 text-red-600 p-3
                            rounded-xl mb-4 text-sm"
            >
              ❌ {error}
            </div>
          )}
          {sellerError && (
            <div
              className="bg-amber-50 border border-amber-200
                  p-4 rounded-xl mb-4"
            >
              <p className="text-amber-800 font-bold text-sm mb-1">
                ⚠️ Seller Account Detected!
              </p>
              <p className="text-amber-700 text-xs">
               This email is registered as a seller account. Shop page login is not supported for seller credentials.
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-2 text-purple-600 text-xs
                 font-bold underline"
              >
                Login via Seller Dashboard →
              </button>
            </div>
          )}
          <div className="space-y-3">
            {activeMode === "register" && (
              <input
                type="text"
                placeholder="Your name *"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                className="w-full border border-gray-200
                           rounded-xl px-4 py-3 text-sm
                           focus:outline-none
                           focus:border-purple-500"
              />
            )}
            <input
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              className="w-full border border-gray-200
                         rounded-xl px-4 py-3 text-sm
                         focus:outline-none
                         focus:border-purple-500"
            />
            {activeMode === "register" && (
              <input
                type="tel"
                placeholder="Mobile number"
                value={form.mobile}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mobile: e.target.value,
                  })
                }
                className="w-full border border-gray-200
                           rounded-xl px-4 py-3 text-sm
                           focus:outline-none
                           focus:border-purple-500"
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
                className="w-full border border-gray-200
               rounded-xl px-4 py-3 pr-10 text-sm
               focus:outline-none
               focus:border-purple-500"
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2
               -translate-y-1/2 text-gray-400
               text-xl"
              >
                {showPwd ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password strength for register */}
            {activeMode === "register" && pwdTouched && form.password && (
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {[
                  { c: pwdChecks.length, t: "8+ characters" },
                  { c: pwdChecks.upper, t: "Capital letter" },
                  { c: pwdChecks.lower, t: "Small letter" },
                  { c: pwdChecks.num, t: "Number" },
                ].map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`text-sm
          ${r.c ? "text-green-500" : "text-gray-300"}`}
                    >
                      {r.c ? "✓" : "○"}
                    </span>
                    <span
                      className={`text-xs
          ${r.c ? "text-green-600 font-medium" : "text-gray-400"}`}
                    >
                      {r.t}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r
                         from-purple-600 to-indigo-600
                         text-white py-3 rounded-xl font-bold
                         hover:opacity-90 transition
                         disabled:opacity-50"
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

// ─── Order Modal ──────────────────────────
function OrderModal({ product, shop, onClose, tryonResult }) {
  const { customer, customerToken, loginCustomer } = useCustomer();
  const [step, setStep] = useState("options");
  const selectedSize = product.sizes?.[0] || "";
  const [selectedAddress, setSelectedAddress] = useState(
    customer?.addresses?.find((a) => a.isDefault) ||
      customer?.addresses?.[0] ||
      null,
  );
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [addingNew, setAddingNew] = useState(!customer?.addresses?.length);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showPaymentStep, setShowPaymentStep] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const deliveryFee = product.price >= 499 ? 0 : 60;
  const total = product.price + deliveryFee;

  const handleWhatsApp = () => {
    if (!shop?.whatsapp) return;
    const msg = encodeURIComponent(
      `Hi! I want to order:\n\n` +
        `Product: ${product?.name || "N/A"}\n` +
        `Price: ₹${product?.price || "0"}\n` +
        `Delivery: ${deliveryFee === 0 ? "FREE" : "₹" + deliveryFee}\n` +
        `Total: ₹${total}\n\n` +
        `📸 Fabric Preview: ${product?.imageUrl || product?.fabricImageUrl || "N/A"}\n` +
        `${tryonResult ? `✨ Try-on Result: ${tryonResult}\n\n` : ""}` +
        `Please confirm!`,
    );
    window.open(`https://wa.me/${shop.whatsapp}?text=${msg}`);
    onClose();
  };

  const handleAddressAndProceed = async () => {
    if (!customer) {
      alert("Pehle login karo!");
      return;
    }
    const address = addingNew ? newAddress : selectedAddress;
    if (
      !address?.fullName ||
      !address?.mobile ||
      !address?.addressLine1 ||
      !address?.pincode
    ) {
      alert("Pura address bharo!");
      return;
    }

    // Save new address if adding
    if (addingNew && newAddress.fullName) {
      try {
        const res = await axios.post(
          `${API_URL}/api/customer/address`,
          { ...newAddress, isDefault: !customer?.addresses?.length },
          { headers: { Authorization: `Bearer ${customerToken}` } },
        );
        const profileRes = await axios.get(`${API_URL}/api/customer/profile`, {
          headers: { Authorization: `Bearer ${customerToken}` },
        });
        loginCustomer(profileRes.data.customer, customerToken);
        // If API returned the saved address, set it as selected for the flow
        const savedAddress =
          res?.data?.address ||
          profileRes?.data?.customer?.addresses?.slice(-1)[0];
        if (savedAddress) setSelectedAddress(savedAddress);
      } catch (e) {
        console.log("Address save error:", e.message);
      }
    }

    setShowPaymentStep(true);
  };

  const handleDirectOrder = async () => {
    const address = addingNew ? newAddress : selectedAddress;
    setLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/customer/orders`,
        {
          sellerId: shop.sellerId,
          productId: product._id,
          address,
          paymentMethod,
          quantity: 1,
          selectedSize: selectedSize || "",
        },
        { headers: { Authorization: `Bearer ${customerToken}` } },
      );
      setOrderData(res.data);

      if (paymentMethod === "razorpay") {
        const options = {
          key: res.data.keyId,
          amount: res.data.amount,
          currency: "INR",
          name: shop.name,
          description: product.name,
          order_id: res.data.razorpayOrderId,
          handler: async (response) => {
            await axios.post(
              `${API_URL}/api/customer/orders/verify-payment`,
              { orderId: res.data.order._id, ...response },
              { headers: { Authorization: `Bearer ${customerToken}` } },
            );
            setStep("success");
          },
          prefill: {
            name: customer.name,
            email: customer.email,
            contact: customer.mobile,
          },
          theme: { color: "#7C3AED" },
        };
        new window.Razorpay(options).open();
      } else {
        // COD
        setStep("success");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Error aaya!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70
                    z-50 flex items-end md:items-center
                    justify-center p-0 md:p-4"
    >
      <div
        className="bg-white w-full md:max-w-md
                      rounded-t-3xl md:rounded-3xl
                      max-h-screen overflow-y-auto"
      >
        <div
          className="flex justify-between items-center
                        p-5 border-b sticky top-0 bg-white
                        rounded-t-3xl z-10"
        >
          <h2 className="font-bold text-gray-800">
            {step === "options" && "🛍️ Order Now"}
            {step === "address" && "📍 Delivery Address"}
            {step === "success" && "🎉 Order Placed!"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100
                       flex items-center justify-center
                       text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="p-5">
          {step === "options" && (
            <div className="space-y-4">
              <div
                className="flex gap-3 bg-gray-50
                              rounded-2xl p-4"
              >
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-16 h-16 object-contain
                             rounded-xl bg-white border"
                />
                <div>
                  <p className="font-semibold text-gray-800">{product.name}</p>
                  <p className="text-purple-600 font-bold">₹{product.price}</p>
                  <p className="text-xs text-gray-400">
                    {deliveryFee === 0
                      ? "🚚 Free Delivery!"
                      : `🚚 Delivery: ₹${deliveryFee}`}
                  </p>
                  <p className="text-sm font-bold text-gray-800">
                    Total: ₹{total}
                  </p>
                </div>
              </div>

              {shop?.whatsapp && (
                <button
                  onClick={handleWhatsApp}
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white py-3.5 px-6 rounded-2xl font-sans font-bold shadow-[0_4px_20px_rgba(16,185,129,0.2)] hover:shadow-[0_8px_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] flex items-center justify-center gap-4 border border-emerald-400/20"
                >
                  {/* 🌊 बैकग्राउंड पर एक प्रीमियम वेव शाइन इफेक्ट (Hover करने पर चमकेगा) */}
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shine_0.8s_ease-in-out]"></div>

                  {/* 🟢 एडवांस नियॉन ग्लो वाला व्हाट्सएप आइकन */}
                  <div className="flex-shrink-0 relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/12 border border-white/20 text-white shadow-inner">
                    <svg
                      xmlns="http://w3.org"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-5 h-5"
                    >
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.713-1.455L0 24zm6.59-4.846c1.66.986 3.296 1.489 4.961 1.491 5.485.002 9.948-4.463 9.951-9.95.001-2.657-1.02-5.155-2.877-7.015s-4.359-2.883-7.016-2.884c-5.49 0-9.953 4.464-9.956 9.952-.001 1.761.464 3.424 1.348 4.909l-.989 3.61 3.709-.972zm11.444-6.842c-.305-.153-1.805-.89-2.083-.991-.279-.101-.482-.153-.684.153-.203.306-.784.991-.962 1.194-.178.203-.356.229-.661.076-.305-.153-1.288-.475-2.454-1.516-.908-.81-1.52-1.81-1.698-2.115-.178-.305-.019-.47.134-.622.137-.137.305-.356.457-.534.153-.178.203-.305.305-.509.102-.203.051-.381-.025-.534-.076-.153-.684-1.647-.937-2.257-.247-.593-.499-.513-.684-.522-.178-.008-.381-.01-.584-.01s-.534.076-.813.381c-.279.305-1.066 1.042-1.066 2.541s1.092 2.946 1.244 3.15c.153.203 2.15 3.284 5.207 4.601.727.314 1.293.502 1.735.643.73.232 1.393.199 1.918.121.585-.087 1.805-.738 2.059-1.452.254-.715.254-1.327.178-1.452-.076-.126-.279-.203-.584-.356z" />
                    </svg>
                    {/* पल्सिंग ऑनलाइन सिग्नल */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-white border border-green-500 animate-pulse"></span>
                  </div>

                  {/* 📝 प्रीमियम डार्क-लाइट टेक्स्ट कंट्रास्ट */}
                  <div className="flex-1 text-left space-y-0.5">
                    <p className="font-sans font-bold text-sm tracking-wide leading-none">
                      Order via WhatsApp
                    </p>
                    <p className="text-emerald-100/90 font-medium text-[11px] leading-tight tracking-normal">
                      Connect with the seller directly for instant deals
                    </p>
                  </div>

                  {/* ➡️ छोटा सा प्रीमियम एरो इंडिकेटर */}
                  <svg
                    xmlns="http://w3.org"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-4 h-4 text-emerald-100 group-hover:translate-x-0.5 transition-transform duration-200"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </button>
              )}

              {/* direct order button hai yahan par jo google se advance kiya hai  */}
              {/* 💳 मुख्य अल्ट्रा-एडवांस ऑर्डर कार्ड बटन (100% वर्किंग इन-लाइन पॉपअप) */}
              <button
                onClick={(e) => {
                  if (!customer) {
                    // फिक्स किया गया लॉजिक: अब यह बटन के अंदर से ही क्लास को ढूंढेगा
                    const el = e.currentTarget;
                    const errBox = el.querySelector(".js-err-box");

                    if (errBox) {
                      // पर्दे को स्क्रीन पर दिखाना (स्लाइड इन)
                      errBox.classList.remove(
                        "hidden",
                        "opacity-0",
                        "-translate-y-2",
                      );
                      errBox.classList.add(
                        "flex",
                        "opacity-100",
                        "translate-y-0",
                      );

                      // 4 सेकंड के बाद पर्दे को वापस छुपाना (स्लाइड आउट)
                      setTimeout(() => {
                        errBox.classList.remove("opacity-100", "translate-y-0");
                        errBox.classList.add("opacity-0", "-translate-y-2");
                        setTimeout(() => errBox.classList.add("hidden"), 300);
                      }, 4000);
                    }
                    return;
                  }
                  setStep("address");
                }}
                className="group relative w-full text-left overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-5 rounded-2xl shadow-[0_10px_30px_rgba(99,102,241,0.18)] hover:shadow-[0_15px_35px_rgba(99,102,241,0.32)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] border border-white/10"
              >
                {/* 🌌 बैकग्राउंड में सॉफ्ट नियॉन लाइट्स */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl group-hover:bg-purple-400/25 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-indigo-400/10 rounded-full blur-3xl group-hover:bg-indigo-400/15 transition-all duration-500"></div>

                {/* 🚨 यह है आपका इन-लाइन सुंदर अलर्ट (जो अब 100% काम करेगा) */}
                <div className="js-err-box hidden opacity-0 -translate-y-2 transition-all duration-300 absolute inset-0 bg-slate-900/95 z-20 rounded-2xl p-4 items-center gap-3 border border-red-500/30 shadow-lg">
                  <div className="flex-shrink-0 bg-red-500/20 p-2 rounded-xl text-red-400">
                    <svg
                      xmlns="http://w3.org"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-red-400 text-xs font-bold uppercase tracking-widest">
                      Authentication Required
                    </h5>
                    <p className="text-slate-300 text-[11px] font-medium mt-0.5 leading-relaxed">
                      Please Register or Login first to place a direct order
                      securely.
                    </p>
                  </div>
                </div>

                <div className="relative z-10 space-y-4">
                  {/* 🛒 हेडर सेक्शन */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 border border-white/20 text-white shadow-inner">
                        <svg
                          xmlns="http://w3.org"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-4.5 h-4.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 10-7 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-base font-bold tracking-wide text-white font-sans">
                        Direct Order Now
                      </h3>
                    </div>

                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-white/80 group-hover:translate-x-0.5 transition-transform duration-200">
                      <svg
                        xmlns="http://w3.org"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-3.5 h-3.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 4.5l7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* 📝 कंटेंट सेक्शन */}
                  <div className="space-y-2.5">
                    <div className="flex items-start gap-2.5 bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl">
                      <span className="text-emerald-300 text-xs mt-0.5 animate-pulse">
                        ✨
                      </span>
                      <p className="text-emerald-300 font-semibold text-[11px] leading-relaxed text-left">
                        Hassle-Free Experience: We will personally coordinate
                        and manage your order directly with the seller.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pl-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-300"></span>
                      <p className="text-indigo-200 text-[10px] font-bold tracking-wider uppercase">
                        Fill Address & Do Secured Online Payment
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              {!customer && (
                <p className="text-center text-xs text-gray-400">
                  Sign in/ Sign up is required for direct orders
                </p>
              )}
            </div>
          )}

          {step === "address" && (
            <div className="space-y-4">
              {customer?.addresses?.length > 0 && (
                <div>
                  <p
                    className="font-semibold text-gray-700
                                text-sm mb-3"
                  >
                    Saved Addresses
                  </p>
                  {customer.addresses.map((addr, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedAddress(addr);
                        setAddingNew(false);
                      }}
                      className={`border-2 rounded-xl p-3
                                 cursor-pointer mb-2 transition
                                 ${
                                   selectedAddress === addr
                                     ? "border-purple-500 bg-purple-50"
                                     : "border-gray-100"
                                 }`}
                    >
                      <p className="font-medium text-sm">{addr.fullName}</p>
                      <p className="text-gray-500 text-xs">
                        {addr.addressLine1}, {addr.city} - {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  setAddingNew(true);
                  setSelectedAddress(null);
                }}
                className={`w-full border-2 border-dashed
                           py-3 rounded-xl text-sm font-medium
                           transition
                           ${
                             addingNew
                               ? "border-purple-500 text-purple-600 bg-purple-50"
                               : "border-gray-200 text-gray-500"
                           }`}
              >
                + Add New Address
              </button>

              {addingNew && (
                <div className="space-y-3">
                  {[
                    { k: "fullName", p: "Full name *" },
                    { k: "mobile", p: "Mobile *" },
                    { k: "addressLine1", p: "House/Area/Street *" },
                    { k: "addressLine2", p: "Landmark" },
                    { k: "city", p: "City *" },
                    { k: "state", p: "State *" },
                    { k: "pincode", p: "Pincode *" },
                  ].map((f) => (
                    <input
                      key={f.k}
                      type="text"
                      placeholder={f.p}
                      value={newAddress[f.k]}
                      onChange={(e) =>
                        setNewAddress({
                          ...newAddress,
                          [f.k]: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200
                                 rounded-xl px-4 py-2.5 text-sm
                                 focus:outline-none
                                 focus:border-purple-500"
                    />
                  ))}
                </div>
              )}

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Product</span>
                  <span>₹{product.price}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Delivery</span>
                  <span
                    className={
                      deliveryFee === 0 ? "text-green-600 font-medium" : ""
                    }
                  >
                    {deliveryFee === 0 ? "FREE 🎉" : `₹${deliveryFee}`}
                  </span>
                </div>
                <div
                  className="flex justify-between font-bold
                                border-t pt-2"
                >
                  <span>Total</span>
                  <span className="text-purple-600">₹{total}</span>
                </div>
              </div>

              {!showPaymentStep ? (
                <button
                  onClick={handleAddressAndProceed}
                  disabled={loading || (!selectedAddress && !addingNew)}
                  className="w-full bg-gradient-to-r
               from-purple-600 to-indigo-600
               text-white py-4 rounded-2xl font-bold
               disabled:opacity-50 hover:opacity-90
               transition"
                >
                  Continue →
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="font-semibold text-gray-700 text-sm">
                    Payment Method
                  </p>

                  {/* COD Option */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`border-2 rounded-xl p-4 cursor-pointer
                 flex items-center gap-3 transition
                 ${
                   paymentMethod === "cod"
                     ? "border-green-500 bg-green-50"
                     : "border-gray-100 hover:border-gray-200"
                 }`}
                  >
                    <span className="text-2xl">💵</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-gray-400">
                        Pay cash at the time of delivery (COD)
                      </p>
                    </div>
                    {paymentMethod === "cod" && (
                      <span className="ml-auto text-green-500 text-xl">✓</span>
                    )}
                  </div>

                  {/* Online Payment */}
                  <div
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`border-2 rounded-xl p-4 cursor-pointer
                 flex items-center gap-3 transition
                 ${
                   paymentMethod === "razorpay"
                     ? "border-purple-500 bg-purple-50"
                     : "border-gray-100 hover:border-gray-200"
                 }`}
                  >
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-semibold text-sm text-gray-800">
                        Pay Online
                      </p>
                      <p className="text-xs text-gray-400">
                        Card, UPI, NetBanking - Razorpay
                      </p>
                    </div>
                    {paymentMethod === "razorpay" && (
                      <span className="ml-auto text-purple-500 text-xl">✓</span>
                    )}
                  </div>

                  <button
                    onClick={handleDirectOrder}
                    disabled={loading}
                    className="w-full bg-gradient-to-r
                 from-purple-600 to-indigo-600
                 text-white py-4 rounded-2xl font-bold
                 disabled:opacity-50 hover:opacity-90
                 transition"
                  >
                    {loading
                      ? "⏳ Processing..."
                      : paymentMethod === "cod"
                        ? `📦 Place Order (₹${total}) - COD`
                        : `💳 Pay ₹${total} Online`}
                  </button>

                  <button
                    onClick={() => setShowPaymentStep(false)}
                    className="w-full text-gray-400 text-sm py-2
                 hover:text-gray-600 transition"
                  >
                    ← Go Back
                  </button>
                </div>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-6">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-2xl font-black text-gray-800 mb-2">
                Order Placed!
              </h3>
              <p className="text-gray-500 mb-4">
                Your order is placed successfully!
              </p>
              <div className="bg-purple-50 rounded-2xl p-4 mb-6">
                <p className="text-purple-700 font-medium text-sm">
                  Order: #{orderData?.order?.orderId}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-full bg-gradient-to-r
                           from-purple-600 to-indigo-600
                           text-white py-3 rounded-xl font-bold"
              >
                ✅ Done!
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AddressManager({ customer, customerToken, loginCustomer }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");
  const [form, setForm] = useState({
    label: "Home",
    fullName: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const resetForm = () => {
    setForm({
      label: "Home",
      fullName: "",
      mobile: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
    setShowAddForm(false);
    setEditId(null);
  };

  const handleSave = async () => {
    // 1. बुनियादी चेकिंग
    if (!form.fullName || !form.mobile || !form.addressLine1 || !form.pincode) {
      setMsg("❌ Zaroori fields bharo!");
      return;
    }

    try {
      // 2. अगर यूजर पुराने एड्रेस को EDIT कर रहा है (editId मौजूद है)
      if (editId) {
        // पहले पुराने एड्रेस को डिलीट मारेंगे (चूंकि बैकएंड में डिलीट राउट पहले से बना है)
        await axios.delete(`${API_URL}/api/customer/address/${editId}`, {
          headers: { Authorization: `Bearer ${customerToken}` },
        });
      }

      // 3. अब नए या एडिटेड डेटा को सीधे POST कर देंगे (यह राउट बैकएंड में चालू है)
      await axios.post(`${API_URL}/api/customer/address`, form, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });

      // 4. कस्टमर का प्रोफाइल डेटा दोबारा फेच करके स्टेट अपडेट करेंगे
      const profileRes = await axios.get(`${API_URL}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });

      // रिएक्ट की ग्लोबल स्टेट अपडेट करें
      loginCustomer(profileRes.data.customer, customerToken);

      setMsg("🎉 Address saved successfully!");
      setTimeout(() => setMsg(""), 3000);
      resetForm();
    } catch (e) {
      console.error("Address Save Error:", e);
      setMsg("❌ Error aaya!");
    }
  };

  const handleDelete = async (addrId) => {
    if (!window.confirm("Do you want to delete it?")) return;
    try {
      await axios.delete(`${API_URL}/api/customer/address/${addrId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      const profileRes = await axios.get(`${API_URL}/api/customer/profile`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      loginCustomer(profileRes.data.customer, customerToken);
      setMsg("✅ The address has been deleted!");
      setTimeout(() => setMsg(""), 3000);
    } catch (e) {
      setMsg("❌ An error occured!");
    }
  };

  const handleEdit = (addr) => {
    setForm({
      label: addr.label || "Home",
      fullName: addr.fullName || "",
      mobile: addr.mobile || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      isDefault: addr.isDefault || false,
    });
    setEditId(addr._id);
    setShowAddForm(true);
  };

  const addressFields = [
    { k: "fullName", p: "Full name *" },
    { k: "mobile", p: "Mobile *" },
    { k: "addressLine1", p: "House/Area/Street *" },
    { k: "addressLine2", p: "Landmark" },
    { k: "city", p: "City *" },
    { k: "state", p: "State *" },
    { k: "pincode", p: "Pincode *" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-800">
          My Addresses ({customer?.addresses?.length || 0})
        </h3>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="text-sm bg-purple-600 text-white
                       px-3 py-1.5 rounded-xl font-medium
                       hover:bg-purple-700 transition"
          >
            + Add New
          </button>
        )}
      </div>

      {msg && <p className="text-sm text-center mb-3">{msg}</p>}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div
          className="bg-purple-50 rounded-2xl p-4
                        mb-4 border border-purple-100"
        >
          <h4 className="font-semibold text-gray-800 mb-3">
            {editId ? "✏️ Edit Address" : "+ New Address"}
          </h4>

          {/* Label */}
          <div className="flex gap-2 mb-3">
            {["Home", "Work", "Other"].map((l) => (
              <button
                key={l}
                onClick={() =>
                  setForm({
                    ...form,
                    label: l,
                  })
                }
                className={`px-3 py-1.5 rounded-xl text-sm
                           font-medium transition border
                           ${
                             form.label === l
                               ? "bg-purple-600 text-white border-purple-600"
                               : "border-gray-200 text-gray-600 bg-white"
                           }`}
              >
                {l === "Home" ? "🏠" : l === "Work" ? "🏢" : "📍"} {l}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {addressFields.map((f) => (
              <input
                key={f.k}
                type="text"
                placeholder={f.p}
                value={form[f.k]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    [f.k]: e.target.value,
                  })
                }
                className="w-full border border-gray-200
                           bg-white rounded-xl px-3 py-2.5
                           text-sm focus:outline-none
                           focus:border-purple-500"
              />
            ))}

            <label
              className="flex items-center gap-2
                               cursor-pointer"
            >
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isDefault: e.target.checked,
                  })
                }
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-600">
                Set as Default Address
              </span>
            </label>
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={handleSave}
              className="flex-1 bg-purple-600 text-white
                         py-2.5 rounded-xl font-bold
                         hover:bg-purple-700 transition text-sm"
            >
              💾 Save
            </button>
            <button
              onClick={resetForm}
              className="px-4 border border-gray-200
                         rounded-xl text-sm text-gray-600
                         hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Addresses List */}
      {!customer?.addresses?.length ? (
        <div
          className="text-center py-8 bg-gray-50
                        rounded-2xl"
        >
          <p className="text-gray-400 text-sm">There isn't any address</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-2 text-purple-600 text-sm
                       font-medium"
          >
            + Add the first address
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {customer.addresses.map((addr) => (
            <div
              key={addr._id}
              className="border border-gray-100
                         rounded-2xl p-4 bg-white"
            >
              <div
                className="flex justify-between
                              items-start mb-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs bg-purple-100
                                   text-purple-700 px-2 py-0.5
                                   rounded-full font-medium"
                  >
                    {addr.label || "Home"}
                  </span>
                  {addr.isDefault && (
                    <span
                      className="text-xs bg-green-100
                                     text-green-700 px-2 py-0.5
                                     rounded-full"
                    >
                      Default
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(addr)}
                    className="text-xs text-purple-600
                               hover:text-purple-800 font-medium"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr._id)}
                    className="text-xs text-red-400
                               hover:text-red-600"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <p className="font-medium text-sm text-gray-800">
                {addr.fullName}
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                {addr.addressLine1}
                {addr.addressLine2 && `, ${addr.addressLine2}`}
              </p>
              <p className="text-gray-500 text-xs">
                {addr.city}, {addr.state} - {addr.pincode}
              </p>
              <p className="text-gray-400 text-xs">📱 {addr.mobile}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── Customer Profile Sidebar ─────────────
function CustomerProfile({ shop, onClose }) {
  const { customer, customerToken, logoutCustomer, loginCustomer } =
    useCustomer();
  const [activeSection, setActiveSection] = useState("profile");
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState({
    name: customer?.name || "",
    lastName: customer?.lastName || "",
    mobile: customer?.mobile || "",
    gender: customer?.gender || "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer/orders`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      setOrders(res.data.orders);
    } catch (e) {
      console.log(e);
    }
  }, [customerToken]);

  useEffect(() => {
    if (activeSection === "orders") {
      setOrders([]); // Clear first
      fetchOrders();
    }
  }, [activeSection, fetchOrders]);

  // Initial load bhi karo
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const [profileMsg, setProfileMsg] = useState("");

  const saveProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.put(`${API_URL}/api/customer/profile`, profile, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      // Context update karo immediately
      loginCustomer(res.data.customer, customerToken);
      setEditingProfile(false);
      setProfileMsg("✅ Profile update sucessfully!");
      setTimeout(() => setProfileMsg(""), 3000);
    } catch (e) {
      setProfileMsg("❌ There is an error!");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { key: "profile", icon: "👤", label: "Profile" },
    { key: "orders", icon: "📦", label: "Orders" },
    { key: "addresses", icon: "📍", label: "Addresses" },
    { key: "account", icon: "⚙️", label: "Account" },
    { key: "measurements", icon: "📏", label: "Fabric Shop" },
    { key: "help", icon: "❓", label: "Help" },
  ];

  return (
    <div>
      {/* ─── 1. सबसे बाहरी बैकड्रॉप / रैपर ─── */}
      <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-end">
        {/* ─── 2. मुख्य साइडबार पैरेंट कंटेनर ─── */}
        <div
          className="bg-white w-full md:w-[600px] md:min-w-[420px]
                     h-screen flex flex-col shadow-2xl
                     rounded-t-[2rem] md:rounded-l-[2rem] md:rounded-tr-none
                     overflow-hidden transition-all duration-300 ease-in-out"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ─── PREMIUM ADVANCE HEADER SECTION ─── */}
          <div
            className="bg-gradient-to-br from-indigo-700 via-purple-600 to-pink-600 
                     p-6 text-white relative overflow-hidden 
                     border-b border-white/10 shadow-lg flex-shrink-0"
          >
            {/* बैकग्राउंड में अट्रैक्टिव एब्सट्रैक्ट यूआई ग्लो (Decorative Element) */}
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute -bottom-8 -left-12 w-28 h-28 bg-pink-500/20 rounded-full blur-xl pointer-events-none"></div>

            <div className="flex justify-between items-center relative z-10 gap-4">
              {/* यूजर इन्फो - विथ एवतार या फर्स्ट लेटर बैच */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* सुंदर राउंडेड प्रोफाइल आइकॉन/बैच */}
                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-black text-lg text-white shadow-inner flex-shrink-0 backdrop-blur-sm">
                  {customer?.name
                    ? customer.name.charAt(0).toUpperCase()
                    : "👤"}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-black text-white tracking-tight truncate">
                      {customer?.name || "Guest User"}
                    </p>
                    <span className="text-[9px] font-extrabold text-white bg-emerald-500 px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex-shrink-0">
                      Active
                    </span>
                  </div>
                  <p className="text-purple-200/90 text-xs truncate mt-0.5 font-medium tracking-wide">
                    {customer?.email || "No email connected"}
                  </p>
                </div>
              </div>

              {/* ✕ (Close) बटन - अब यह कभी हाइड नहीं होगा */}
              {/* ✕ (Close) बटन - जो मोबाइल एम्यूलेटर, असली फोन और लैपटॉप हर जगह 100% घूमेगा */}
              <button
                onClick={() => {
                  setIsClosing(true);
                  // 300ms के एनीमेशन के बाद onClose फंक्शन चलेगा ताकि घूमता हुआ साफ़ दिखे
                  setTimeout(() => {
                    onClose();
                    setIsClosing(false);
                  }, 300);
                }}
                className={`w-10 h-10 rounded-xl bg-white/10 
             border border-white/10 
             flex items-center justify-center text-white
             font-medium shadow-inner flex-shrink-0
             backdrop-blur-md cursor-pointer
             transition-all duration-300 ease-out group
             hover:bg-red-500 hover:border-red-400 hover:rotate-90
             active:scale-75
             ${isClosing ? "rotate-180 bg-red-600 scale-75" : ""}`}
                title="Close Profile"
              >
                <span className="text-sm font-bold tracking-normal leading-none block transition-transform duration-300 group-hover:scale-110">
                  ✕
                </span>
              </button>
            </div>
          </div>

          {/* ─── SCROLLABLE CONTENT AREA START (इसके नीचे के टैब्स और फॉर्म यहाँ आएंगे) ─── */}
          {/* ─── SCROLLABLE CONTENT AREA START ─── */}
          <div
            className="flex-1 overflow-y-auto 
                        [&::-webkit-scrollbar]:w-1.5
                        [&::-webkit-scrollbar-track]:bg-transparent
                        [&::-webkit-scrollbar-thumb]:bg-purple-500/20
                        hover:[&::-webkit-scrollbar-thumb]:bg-purple-500/40
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        transition-all duration-200"
          >
            {/* ─── ULTRA-ADVANCE RESPONSIVE TABS BAR ─── */}
            <div
              className="flex overflow-x-auto p-3 gap-2 border-b bg-gray-50
                     md:pb-4
                     [&::-webkit-scrollbar]:h-1
                     [&::-webkit-scrollbar-track]:bg-transparent
                     [&::-webkit-scrollbar-thumb]:bg-purple-500/20
                     hover:[&::-webkit-scrollbar-thumb]:bg-purple-700/50
                     [&::-webkit-scrollbar-thumb]:rounded-full
                     transition-all duration-200"
            >
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key)}
                  className={`flex-shrink-0 flex items-center
                         gap-1.5 px-3 py-2 rounded-xl text-sm
                         font-medium transition whitespace-nowrap
                         ${
                           activeSection === item.key
                             ? "bg-purple-600 text-white"
                             : "bg-white text-gray-600 border"
                         }`}
                >
                  {item.icon} {item.label}
                </button>
              ))}
            </div>

            <div className="p-4">
              {/* Profile */}
              {activeSection === "profile" && (
                <div className="w-full max-w-xl mx-auto space-y-5 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                  {/* 1. शीर्ष हिस्सा (Header) - प्रोफाइल टाइटल और एडिट बटन */}
                  <div className="flex justify-between items-center pb-2.5 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://w3.org"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-purple-600"
                      >
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <h3 className="font-black text-gray-800 tracking-wide uppercase text-sm">
                        My Profile
                      </h3>
                    </div>

                    {/* एडवांस एडिट / कैंसल बटन */}
                    <button
                      onClick={() => setEditingProfile(!editingProfile)}
                      className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1 border
                   ${
                     editingProfile
                       ? "bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100/70"
                       : "bg-purple-50 text-purple-700 border-purple-100/50 hover:bg-purple-100"
                   }`}
                    >
                      {editingProfile ? (
                        <>
                          <svg
                            xmlns="http://w3.org"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          <span>Cancel</span>
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://w3.org"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                          </svg>
                          <span>Edit</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* 2. इनपुट फ़ील्ड्स ग्रिड (Name, Last Name, Mobile) */}
                  <div className="space-y-4">
                    {["name", "lastName", "mobile"].map((field) => (
                      <div key={field} className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                          {field === "lastName"
                            ? "Last Name"
                            : field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>

                        {editingProfile ? (
                          /* एडिटिंग मोड: प्रीमियम फोकस स्टेट इनपुट */
                          <input
                            type="text"
                            value={profile[field] || ""}
                            onChange={(e) =>
                              setProfile({
                                ...profile,
                                [field]: e.target.value,
                              })
                            }
                            className="w-full border border-gray-200 bg-gray-50/30 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800
                         focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md focus:shadow-purple-500/5 transition-all duration-200"
                          />
                        ) : (
                          /* व्यू मोड: क्लीन रीड-ओनली कार्ड */
                          <p className="text-gray-800 text-sm font-bold bg-gray-50/60 border border-gray-100 rounded-xl px-4 py-3">
                            {profile[field] || "—"}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 3. जेंडर सिलेक्शन और सेव बटन (केवल एडिटिंग मोड में) */}
                  {editingProfile && (
                    <div className="space-y-5 pt-2 animate-fadeIn">
                      {/* जेंडर चयन बॉक्स */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide block">
                          Gender
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {["male", "female", "other"].map((g) => (
                            <button
                              key={g}
                              type="button"
                              onClick={() =>
                                setProfile({ ...profile, gender: g })
                              }
                              className={`py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 border flex items-center justify-center gap-1.5 leading-none cursor-pointer transform active:scale-95
                           ${
                             profile.gender === g
                               ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent shadow-md shadow-purple-500/20"
                               : "border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:text-purple-700"
                           }`}
                            >
                              {/* जेंडर के हिसाब से कस्टमाइज्ड लाइन आइकॉन */}
                              {g === "male" && (
                                <svg
                                  xmlns="http://w3.org"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <circle cx="10" cy="14" r="5" />
                                  <path d="M14 10l7-7M16 3h5v5" />
                                </svg>
                              )}
                              {g === "female" && (
                                <svg
                                  xmlns="http://w3.org"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <circle cx="12" cy="9" r="5" />
                                  <path d="M12 14v7M9 18h6" />
                                </svg>
                              )}
                              {g === "other" && (
                                <svg
                                  xmlns="http://w3.org"
                                  width="13"
                                  height="13"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <path d="M12 8v8M8 12h8" />
                                </svg>
                              )}
                              <span>{g}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* मुख्य सेव बटन (मैजिकल शाइन और रोटेटिंग स्पिनर के साथ) */}
                      <button
                        onClick={saveProfile}
                        disabled={loading}
                        className={`w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-white transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2
                     ${
                       loading
                         ? "bg-gradient-to-r from-gray-300 to-gray-400 cursor-not-allowed shadow-none"
                         : "bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 shadow-md shadow-purple-500/10 hover:shadow-lg hover:shadow-purple-500/30 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                     }`}
                      >
                        {loading ? (
                          <>
                            {/* लोडिंग व्हील स्पिनर */}
                            <svg
                              className="animate-spin h-4 w-4 text-white"
                              xmlns="http://w3.org"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0 1 4 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <svg
                              xmlns="http://w3.org"
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                            <span>Save Profile</span>
                          </>
                        )}
                      </button>

                      {/* प्रोफाइल मैसेज/सक्सेस अलर्ट बॉक्स */}
                      {profileMsg && (
                        <div
                          className={`p-3 rounded-xl text-xs font-bold text-center border animate-pulse [animation-duration:3s]
                          ${
                            profileMsg.toLowerCase().includes("error") ||
                            profileMsg.toLowerCase().includes("fail")
                              ? "bg-rose-50 border-rose-100 text-rose-600"
                              : "bg-emerald-50 border-emerald-100 text-emerald-700"
                          }`}
                        >
                          {profileMsg}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Measurements */}
              {activeSection === "measurements" && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">📏 Fabric Shop</h3>
                  <p className="text-gray-400 text-sm">
                    Fabric shop mein better fitting ke liye measurements save
                    karen!
                  </p>
                  <a
                    href={`/fabric/${shop?.sellerId || ""}`}
                    className="block w-full bg-gradient-to-r
                  from-purple-600 to-indigo-600
                  text-white py-3 rounded-xl
                  font-bold text-center"
                  >
                    🧵 Go to Fabric Shop
                  </a>
                </div>
              )}

              {/* Orders */}
              {activeSection === "orders" && (
                <div className="w-full max-w-2xl mx-auto space-y-4 pb 8">
                  {/* सेक्शन हेडिंग काउंट बैज के साथ */}
                  <div className="flex items-center justify-between mb-5 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://w3.org"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="text-purple-600"
                      >
                        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                        <path d="m3.3 7 8.7 5 8.7-5" />
                        <path d="M12 22V12" />
                      </svg>
                      <h3 className="font-black text-gray-800 tracking-wide uppercase text-sm">
                        My Orders
                      </h3>
                    </div>
                    <span className="bg-purple-100 text-purple-700 text-xs font-black px-2.5 py-1 rounded-lg">
                      {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                    </span>
                  </div>

                  {orders.length === 0 ? (
                    /* खाली स्टेट का प्रीमियम और एनिमेटेड लुक (No Orders State) */
                    <div className="text-center py-14 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200/60 p-6">
                      <div className="relative flex items-center justify-center bg-gray-100 text-gray-400 w-14 h-14 rounded-2xl mx-auto mb-3 animate-pulse">
                        <svg
                          xmlns="http://w3.org"
                          width="28"
                          height="28"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                          <path d="m3.3 7 8.7 5 8.7-5" />
                          <path d="M12 22V12" />
                        </svg>
                      </div>
                      <p className="text-gray-700 font-bold text-base mb-0.5">
                        No orders placed yet
                      </p>
                      <p className="text-gray-400 text-xs font-medium max-w-xs mx-auto">
                        When you purchase custom garments or fabrics, they will
                        appear right here.
                      </p>
                    </div>
                  ) : (
                    /* ऑर्डर्स लिस्ट कार्ड्स (Active Orders Grid) */
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order._id}
                          onClick={() => {
                            // ⚡ यहाँ हमने सीधे ब्राउज़र के इन-बिल्ट विंडो ऑब्जेक्ट का उपयोग किया है
                            // इससे कोई भी 'navigate' एरर नहीं आएगा और पेज स्मूथली खुल जाएगा
                            window.location.href = `/order/${order._id}`;
                          }}
                          className="group border border-gray-100 bg-white rounded-2xl p-4.5 cursor-pointer
                       shadow-sm hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5
                       transition-all duration-300 ease-out relative overflow-hidden"
                        >
                          {/* शीर्ष हिस्सा: ऑर्डर आईडी और स्टेटस */}
                          <div className="flex items-start justify-between mb-4 pb-3 border-b border-gray-50">
                            <div className="space-y-0.5">
                              <p className="text-xs font-bold text-gray-800 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md inline-block font-mono">
                                #{order.orderId}
                              </p>
                              <p className="text-[11px] text-gray-400 font-semibold tracking-wide flex items-center gap-1">
                                <svg
                                  xmlns="http://w3.org"
                                  width="11"
                                  height="11"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>

                            {/* मॉडर्न स्टेटस बैज (यहाँ STATUS_COLORS का उपयोग करके वार्निंग भी ठीक कर दी गई है) */}
                            <span
                              className={`text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-lg border shadow-sm ${
                                STATUS_COLORS &&
                                STATUS_COLORS[order.orderStatus]
                                  ? STATUS_COLORS[order.orderStatus]
                                  : order.orderStatus === "delivered"
                                    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                    : order.orderStatus === "cancelled"
                                      ? "bg-rose-50 border-rose-100 text-rose-700"
                                      : "bg-purple-50 border-purple-100 text-purple-700"
                              }`}
                            >
                              {order.orderStatus === "out_for_delivery"
                                ? "Out for Delivery"
                                : order.orderStatus?.replace(/_/g, " ")}
                            </span>
                          </div>

                          {/* मध्य हिस्सा: प्रोडक्ट की इमेज और नाम/कीमत */}
                          <div className="flex gap-3.5 items-center">
                            <div className="w-14 h-14 bg-neutral-50 rounded-xl border border-gray-100 p-1 flex-shrink-0 overflow-hidden relative group-hover:scale-102 transition-transform duration-300">
                              <img
                                src={order.productImage}
                                alt={order.productName}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <div className="space-y-0.5 flex-1 min-w-0">
                              <p className="font-bold text-sm text-gray-800 truncate group-hover:text-purple-700 transition-colors duration-200">
                                {order.productName}
                              </p>
                              <p className="text-purple-600 font-black text-base">
                                ₹{order.totalAmount}
                              </p>
                            </div>

                            {/* तीर का निशान जो माउस ले जाने पर सीधे खिसकेगा (Micro-interaction) */}
                            <div className="text-gray-300 group-hover:text-purple-500 transform group-hover:translate-x-1 transition-all duration-300 flex-shrink-0">
                              <svg
                                xmlns="http://w3.org"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                              >
                                <path d="M5 12h14M12 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>

                          {/* लाइव ट्रैकिंग बार (सक्रिय ऑर्डर्स के लिए) */}
                          {!["delivered", "cancelled"].includes(
                            order.orderStatus,
                          ) && (
                            <div className="flex flex-wrap items-center justify-between gap-1 mt-4 pt-3 border-t border-gray-50 bg-purple-50/10 px-1 rounded-b-2xl w-full overflow-hidden">
                              <div className="flex items-center gap-2">
                                <div className="relative flex h-2 w-2 flex-shrink-0">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </div>
                                <span className="text-[11px] text-emerald-700 font-bold uppercase tracking-wider whitespace-nowrap">
                                  Live Tracking Available
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-auto sm:ml-0">
                                Click to view status
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses */}
              {/* Addresses सेक्शन - इसे एक प्रीमियम पैरेंट विजेट में रैप किया गया है */}
              {activeSection === "addresses" && (
                <div className="w-full max-w-xl mx-auto space-y-4 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm animate-fadeIn">
                  <div className="flex items-center gap-2 pb-2.5 border-b border-gray-50 mb-2">
                    <svg
                      xmlns="http://w3.org"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-purple-600"
                    >
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <h3 className="font-black text-gray-800 tracking-wide uppercase text-sm">
                      Saved Addresses
                    </h3>
                  </div>

                  <AddressManager
                    customer={customer}
                    customerToken={customerToken}
                    loginCustomer={loginCustomer}
                  />
                </div>
              )}

              {/* Account Settings सेक्शन (Logout & Danger Zone) */}
              {activeSection === "account" && (
                <div className="w-full max-w-xl mx-auto space-y-6 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm animate-fadeIn">
                  {/* हेडिंग */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-gray-50">
                    <svg
                      xmlns="http://w3.org"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className="text-purple-600"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <h3 className="font-black text-gray-800 tracking-wide uppercase text-sm">
                      Account Settings
                    </h3>
                  </div>

                  {/* बटन्स कंटेनर */}
                  <div className="space-y-3">
                    {/* 1. लॉगआउट बटन (क्लीन और मॉडर्न लुक) */}
                    <button
                      onClick={() => {
                        logoutCustomer();
                        onClose();
                      }}
                      className="w-full border border-gray-200 text-gray-700 py-3.5 rounded-xl
                   text-xs font-black uppercase tracking-wider bg-white shadow-sm
                   hover:bg-gray-50 hover:border-gray-300 transform hover:-translate-y-0.5 
                   active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <svg
                        xmlns="http://w3.org"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Logout Session</span>
                    </button>

                    {/* 2. डेंजर ज़ोन: डिलीट अकाउंट बटन (प्रीमियम रेड अलर्ट थीम) */}
                    <div className="pt-2 border-t border-gray-100 mt-4">
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 block pl-1">
                        Danger Zone
                      </p>
                      <button
                        onClick={async () => {
                          if (
                            !window.confirm(
                              "Are you sure you want to delete your account? This action cannot be undone.",
                            )
                          )
                            return;
                          try {
                            await axios.delete(
                              `${API_URL}/api/customer/account`,
                              {
                                headers: {
                                  Authorization: `Bearer ${customerToken}`,
                                },
                              },
                            );
                            logoutCustomer();
                            onClose();
                          } catch (e) {
                            // पुराना डिफ़ॉल्ट अलर्ट बॉक्स सेफ रखा है
                            alert("Error deleting account!");
                          }
                        }}
                        className="w-full bg-rose-50/60 border border-rose-200 text-rose-600 py-3.5 rounded-xl 
                     text-xs font-black uppercase tracking-wider shadow-sm
                     hover:bg-rose-100 hover:border-rose-300 hover:shadow-md hover:shadow-rose-500/5
                     transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg
                          xmlns="http://w3.org"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                        <span>Delete Account Permanently</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Help */}
              {activeSection === "help" && (
                <div className="w-full max-w-xl mx-auto space-y-5 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm">
                  {/* 1. क्लीन एडवांस हेडर */}
                  <div className="flex items-center gap-2 pb-2.5 border-b border-gray-50">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    <h3 className="font-black text-gray-800 tracking-wide uppercase text-xs">
                      Help Center & Support
                    </h3>
                  </div>

                  {/* 2. प्रीमियम इनपुट बॉक्स (ग्लास इफेक्ट और सॉफ्ट शैडो के साथ) */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block pl-1">
                      Describe Your Issue
                    </label>
                    <textarea
                      rows={4}
                      placeholder="How can we help you today? Write your message here..."
                      className="w-full border border-gray-200 bg-gray-50/40 rounded-xl p-4 text-sm font-semibold text-gray-800 resize-none
                             focus:outline-none focus:border-purple-500 focus:bg-white focus:shadow-md focus:shadow-purple-500/5 transition-all duration-200"
                    />
                  </div>

                  {/* 3. सबमिट बटन (अल्टीमेट पर्पल-इंडिगो ग्रेडिएंट और हैप्टिक क्लिक) */}
                  <button
                    className="w-full bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 text-white
                           py-3.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-purple-500/10
                           hover:shadow-lg hover:shadow-purple-500/30 transform hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    Submit Query
                  </button>

                  {/* 4. व्हाट्सएप सपोर्ट (सुपर प्रीमियम नियन ग्रीन कस्टमाइजेशन) */}
                  {shop?.whatsapp && (
                    <div className="pt-3 border-t border-gray-100 mt-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block pl-1">
                        Instant Live Chat
                      </p>
                      <a
                        href={`https://wa.me${shop.whatsapp}?text=Hi, I need help.`}
                        target="_blank"
                        rel="noreferrer"
                        className="block w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white
                               py-3.5 rounded-xl text-xs font-black uppercase tracking-wider text-center
                               shadow-md shadow-green-500/10 hover:shadow-green-500/30
                               transform hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer"
                      >
                        Chat On WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Loading Animation ────────────────────
function TryOnAnimation() {
  const STEPS = [
    {
      label: "Photo Upload",
      detail: "Your photo is being uploaded to a secure server",
      percent: 12,
      color: "#8B5CF6",
      icon: "📸",
    },
    {
      label: "AI Analysis",
      detail: "The system is detecting your body measurements",
      percent: 28,
      color: "#7C3AED",
      icon: "🔍",
    },
    {
      label: "Garment Mapping",
      detail: "Our system is fitting the clothes on you",
      percent: 52,
      color: "#6D28D9",
      icon: "👗",
    },
    {
      label: "Texture Rendering",
      detail: "We are adjusting the fabric texture and color",
      percent: 74,
      color: "#5B21B6",
      icon: "🎨",
    },

    {
      label: "Final Touches",
      detail: "The result is almost ready!",
      percent: 97,
      color: "#3B0764",
      icon: "🚀",
    },

    {
      label: "Style Analysis",
      detail: "AI style advice is being prepared",
      percent: 88,
      color: "#4C1D95",
      icon: "✨",
    },

    // {
    //   label: 'Final Touches',
    //   detail: 'The result is almost ready!',
    //   percent: 97,
    //   color: '#3B0764',
    //   icon: '🚀'
    // }
  ];

  const [stepIdx, setStepIdx] = useState(0);
  const [displayPercent, setDisplayPercent] = useState(0);
  const [particles, setParticles] = useState([]);
  const spokenRef = useRef(new Set());

  // Particles generate
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 3 + 2,
      })),
    );
  }, []);

  // Step progression
  useEffect(() => {
    if (!spokenRef.current.has(0)) {
      speakText(STEPS[0].detail, "en");
      spokenRef.current.add(0);
    }

    const t = setInterval(() => {
      setStepIdx((p) => {
        const next = p < STEPS.length - 1 ? p + 1 : p;
        if (!spokenRef.current.has(next) && next !== p) {
          speakText(STEPS[next].detail, "en");
          spokenRef.current.add(next);
        }
        return next;
      });
    }, 5000);

    return () => {
      clearInterval(t);
      // eslint-disable-next-line
      spokenRef.current.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smooth percent counter
  useEffect(() => {
    const target = STEPS[stepIdx].percent;
    const interval = setInterval(() => {
      setDisplayPercent((prev) => {
        if (prev >= target) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  const current = STEPS[stepIdx];
  const circumference = 2 * Math.PI * 54;

  return (
    <div
      style={{ zIndex: 99999 }}
      className="fixed inset-0 flex items-center justify-center"
    >
      {/* Animated gradient backdrop */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full opacity-30"
            style={{
              left: `${p.x}%`,
              bottom: "-10px",
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: "linear-gradient(135deg, #8B5CF6, #EC4899)",
              animation: `floatUp ${p.duration}s ${p.delay}s infinite linear`,
            }}
          />
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm mx-4">
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow:
              "0 25px 50px rgba(0,0,0,0.5), 0 0 100px rgba(139,92,246,0.2)",
          }}
        >
          {/* Top glow bar */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, #8B5CF6 0%, #EC4899 ${displayPercent}%, rgba(255,255,255,0.1) ${displayPercent}%)`,
            }}
          />

          <div className="p-8">
            {/* Circular Progress */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <svg width="140" height="140" className="-rotate-90">
                  {/* Background ring */}
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="8"
                  />
                  {/* Outer glow ring */}
                  <circle
                    cx="70"
                    cy="70"
                    r="62"
                    fill="none"
                    stroke="rgba(139,92,246,0.15)"
                    strokeWidth="2"
                  />
                  {/* Progress ring */}
                  <circle
                    cx="70"
                    cy="70"
                    r="54"
                    fill="none"
                    stroke="url(#progressGrad)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={
                      circumference - (displayPercent / 100) * circumference
                    }
                    style={{ transition: "stroke-dashoffset 0.3s ease" }}
                  />
                  <defs>
                    <linearGradient
                      id="progressGrad"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                  <span
                    className="text-3xl mb-1"
                    style={{
                      filter: "drop-shadow(0 0 8px rgba(139,92,246,0.8))",
                    }}
                  >
                    {current.icon}
                  </span>
                  <span className="text-2xl font-black text-white">
                    {displayPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Step Label */}
            <div className="text-center mb-5">
              <h3 className="text-xl font-black text-white mb-1">
                {current.label}
              </h3>
              <p className="text-purple-300 text-sm leading-relaxed">
                {current.detail}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 mb-5">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-500"
                  style={{
                    width: i === stepIdx ? "24px" : "8px",
                    height: "8px",
                    background:
                      i <= stepIdx
                        ? "linear-gradient(90deg, #8B5CF6, #EC4899)"
                        : "rgba(255,255,255,0.15)",
                  }}
                />
              ))}
            </div>

            {/* Linear Progress Bar */}
            <div
              className="rounded-full overflow-hidden mb-3"
              style={{
                height: "6px",
                background: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${displayPercent}%`,
                  background:
                    "linear-gradient(90deg, #8B5CF6, #EC4899, #F59E0B)",
                }}
              />
            </div>

            {/* Step list */}
            <div className="space-y-2">
              {STEPS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 transition-all"
                  style={{
                    background:
                      i === stepIdx ? "rgba(139,92,246,0.2)" : "transparent",
                    border:
                      i === stepIdx
                        ? "1px solid rgba(139,92,246,0.3)"
                        : "1px solid transparent",
                  }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        i < stepIdx
                          ? "linear-gradient(135deg, #8B5CF6, #EC4899)"
                          : i === stepIdx
                            ? "rgba(139,92,246,0.4)"
                            : "rgba(255,255,255,0.05)",
                    }}
                  >
                    {i < stepIdx ? (
                      <span className="text-white text-xs">✓</span>
                    ) : i === stepIdx ? (
                      <span className="text-xs">{s.icon}</span>
                    ) : (
                      <span className="text-white text-xs opacity-30">○</span>
                    )}
                  </div>
                  <span
                    className={`text-xs font-medium transition-all
                    ${
                      i === stepIdx
                        ? "text-purple-200"
                        : i < stepIdx
                          ? "text-white opacity-60"
                          : "text-white opacity-20"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i === stepIdx && (
                    <div className="ml-auto flex gap-1">
                      {[0, 1, 2].map((d) => (
                        <div
                          key={d}
                          className="w-1 h-1 rounded-full bg-purple-400 animate-bounce"
                          style={{ animationDelay: `${d * 0.15}s` }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-center text-white text-xs mt-4 opacity-40">
              It will take 30-60 seconds, Please wait patiently... 😊
            </p>
          </div>
        </div>
      </div>

      {/* CSS for float animation */}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          100% { transform: translateY(-100vh) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Image Slider ─────────────────────────
function ImageSlider({ images, onClick }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  if (!images || images.length === 0) return null;

  const prev = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  };

  const next = (e) => {
    e.stopPropagation();
    setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
  };

  // Touch/Swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next(e) : prev(e);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="relative w-full h-64 overflow-hidden
             bg-white rounded-t-2xl cursor-pointer"
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img
        src={images[current]}
        alt="product"
        className="w-full h-64 object-contain p-2
                   transition-all duration-300"
        style={{ imageRendering: "high-quality" }}
      />

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2
                       -translate-y-1/2 bg-white shadow-md
                       rounded-full w-8 h-8 flex items-center
                       justify-center text-gray-600
                       hover:bg-gray-50 transition z-10"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2
                       -translate-y-1/2 bg-white shadow-md
                       rounded-full w-8 h-8 flex items-center
                       justify-center text-gray-600
                       hover:bg-gray-50 transition z-10"
          >
            ›
          </button>
          <div
            className="absolute bottom-2 left-1/2
                          -translate-x-1/2 flex gap-1.5"
          >
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`h-1.5 rounded-full transition-all
                           ${
                             i === current
                               ? "w-4 bg-purple-600"
                               : "w-1.5 bg-gray-300"
                           }`}
              />
            ))}
          </div>
          <div
            className="absolute top-2 right-2
                          bg-black bg-opacity-50 text-white
                          text-xs px-2 py-1 rounded-full"
          >
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}
function ProductReviews({
  product,
  showAllReviews,
  setShowAllReviews,
  onImageClick,
}) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/api/reviews/product/${product._id}`,
        );
        setReviews(res.data.reviews);
        setAvgRating(res.data.avgRating);
        setTotalReviews(res.data.totalReviews);
        setBreakdown(res.data.breakdown);
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [product._id]);

  const getBarColor = (r) =>
    r >= 4 ? "bg-green-500" : r >= 2 ? "bg-orange-400" : "bg-red-500";

  const getRatingColor = (r) =>
    r >= 4 ? "text-green-600" : r >= 2 ? "text-orange-500" : "text-red-500";

  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 2);

  return (
    <div className="mb-4">
      <p
        className="text-sm font-bold text-gray-800
                    mb-3 uppercase tracking-wide"
      >
        Ratings & Reviews
      </p>

      {/* Summary */}
      <div className="flex items-start gap-4 mb-4">
        <div className="text-center flex-shrink-0">
          <div
            className={`text-4xl font-black
            ${
              avgRating >= 4
                ? "text-green-500"
                : avgRating >= 2
                  ? "text-orange-400"
                  : avgRating > 0
                    ? "text-red-500"
                    : "text-gray-300"
            }`}
          >
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <div className="flex justify-center mt-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`text-sm ${
                  s <= Math.round(avgRating)
                    ? getRatingColor(avgRating)
                    : "text-gray-200"
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-xs mt-0.5">{totalReviews} reviews</p>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-3">{star}</span>
              <span
                className={`text-xs
                ${
                  star >= 4
                    ? "text-green-500"
                    : star >= 2
                      ? "text-orange-400"
                      : "text-red-500"
                }`}
              >
                ★
              </span>
              <div
                className="flex-1 bg-gray-100
                              rounded-full h-1.5"
              >
                <div
                  className={`h-full rounded-full
                             ${getBarColor(star)}`}
                  style={{
                    width:
                      totalReviews > 0
                        ? `${((breakdown[star] || 0) / totalReviews) * 100}%`
                        : "0%",
                  }}
                />
              </div>
              <span className="text-xs text-gray-400 w-4">
                {breakdown[star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <p className="text-center text-gray-400 text-sm py-4">
          Loading reviews...
        </p>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-6 bg-gray-50
                        rounded-2xl"
        >
          <p className="text-gray-400 text-sm">There are no reviews yet.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {displayedReviews.map((review) => (
              <div
                key={review._id}
                className="border-b border-gray-100
                           pb-4 last:border-0"
              >
                <div
                  className="flex items-start
                                justify-between mb-1.5"
                >
                  <div>
                    <p
                      className="font-semibold text-sm
                                  text-gray-800"
                    >
                      {review.customerName}
                    </p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span
                          key={s}
                          className={`text-xs ${
                            s <= review.rating
                              ? review.rating >= 4
                                ? "text-green-500"
                                : review.rating >= 2
                                  ? "text-orange-400"
                                  : "text-red-500"
                              : "text-gray-200"
                          }`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold
                                     px-2 py-0.5 rounded-full
                                     ${
                                       review.rating >= 4
                                         ? "bg-green-100 text-green-700"
                                         : review.rating >= 2
                                           ? "bg-orange-100 text-orange-600"
                                           : "bg-red-100 text-red-600"
                                     }`}
                    >
                      {review.rating}★
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                {review.review && (
                  <p
                    className="text-sm text-gray-600
                                leading-relaxed mb-2"
                  >
                    {review.review}
                  </p>
                )}

                {/* Review Images - Clickable */}
                {review.images?.length > 0 && (
                  <div className="flex gap-2">
                    {review.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => onImageClick(img, review)}
                        className="w-16 h-16 rounded-xl
                                   overflow-hidden border
                                   border-gray-100
                                   hover:opacity-80
                                   transition flex-shrink-0"
                      >
                        <img
                          src={img}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {reviews.length > 2 && (
            <button
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full mt-3 py-3 border-2
                         border-gray-200 rounded-xl text-sm
                         font-semibold text-gray-600
                         hover:bg-gray-50 transition"
            >
              {showAllReviews
                ? "Show Less ↑"
                : `Show All Reviews (${totalReviews}) ↓`}
            </button>
          )}
        </>
      )}
    </div>
  );
}

// ─── Reviews Section ──────────────────────
// eslint-disable-next-line no-unused-vars
function ReviewsSection({ product, shop }) {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    rating: 0,
    review: "",
  });
  const [reviewImages, setReviewImages] = useState([]);
  const [previews, setPreviews] = useState([]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/reviews/product/${product._id}`,
      );
      setReviews(res.data.reviews);
      setAvgRating(res.data.avgRating);
      setTotalReviews(res.data.totalReviews);
      setBreakdown(res.data.breakdown);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [product._id]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setReviewImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async () => {
    if (!form.customerName || form.rating === 0) {
      alert("Naam aur rating zaroori hai!");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", product._id);
      formData.append("sellerId", shop.sellerId);
      formData.append("customerName", form.customerName);
      formData.append("rating", form.rating);
      formData.append("review", form.review);
      reviewImages.forEach((img) => {
        formData.append("reviewImages", img);
      });

      await axios.post(`${API_URL}/api/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
      setShowForm(false);
      fetchReviews();
    } catch (e) {
      alert("An error occurred! Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingColor = (r) => {
    if (r >= 4) return "text-green-600 bg-green-50";
    if (r >= 2) return "text-orange-500 bg-orange-50";
    return "text-red-500 bg-red-50";
  };

  const getBarColor = (r) => {
    if (r >= 4) return "bg-green-500";
    if (r >= 2) return "bg-orange-400";
    return "bg-red-500";
  };

  return (
    <div className="mt-6 border-t pt-6">
      {/* Rating Summary */}
      <div className="flex items-start gap-6 mb-6">
        {/* Big Rating */}
        <div className="text-center flex-shrink-0">
          <div
            className={`text-5xl font-black mb-1
                          ${
                            avgRating >= 4
                              ? "text-green-500"
                              : avgRating >= 2
                                ? "text-orange-400"
                                : avgRating > 0
                                  ? "text-red-500"
                                  : "text-gray-300"
                          }`}
          >
            {avgRating > 0 ? avgRating.toFixed(1) : "—"}
          </div>
          <StarRating rating={avgRating} size="md" showNumber={false} />
          <p className="text-gray-400 text-xs mt-1">{totalReviews} reviews</p>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2">
              <span
                className="text-xs text-gray-500
                               w-4 text-right flex-shrink-0"
              >
                {star}
              </span>
              <span
                className={`text-xs flex-shrink-0
                               ${
                                 star >= 4
                                   ? "text-green-500"
                                   : star >= 2
                                     ? "text-orange-400"
                                     : "text-red-500"
                               }`}
              >
                ★
              </span>
              <div
                className="flex-1 bg-gray-100
                              rounded-full h-2 overflow-hidden"
              >
                <div
                  className={`h-full rounded-full
                             transition-all duration-700
                             ${getBarColor(star)}`}
                  style={{
                    width:
                      totalReviews > 0
                        ? `${((breakdown[star] || 0) / totalReviews) * 100}%`
                        : "0%",
                  }}
                ></div>
              </div>
              <span
                className="text-xs text-gray-400
                               w-4 flex-shrink-0"
              >
                {breakdown[star] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {!submitted ? (
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full bg-gradient-to-r
                     from-purple-600 to-indigo-600
                     text-white py-3 rounded-2xl
                     font-semibold mb-4 hover:opacity-90
                     transition flex items-center
                     justify-center gap-2"
        >
          ✏️Write Review
        </button>
      ) : (
        <div
          className="bg-green-50 border border-green-100
                        rounded-2xl p-3 mb-4 text-center"
        >
          <p className="text-green-700 font-medium text-sm">
            ✅ Your review has been submitted! Thank you for the review.🙏
          </p>
        </div>
      )}

      {/* Review Form */}
      {showForm && (
        <div
          className="bg-gradient-to-br from-purple-50
                        to-indigo-50 rounded-2xl p-5 mb-6
                        border border-purple-100"
        >
          <h3 className="font-bold text-gray-800 mb-4">⭐ Give your review</h3>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                Your Name *
              </label>
              <input
                type="text"
                placeholder="Jaise: Priya S."
                value={form.customerName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customerName: e.target.value,
                  })
                }
                className="w-full border border-purple-200
                           bg-white rounded-xl px-4 py-2.5
                           text-sm focus:outline-none
                           focus:border-purple-500"
              />
            </div>

            {/* Star Rating */}
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-2"
              >
                Rating Do *
              </label>
              <StarSelector
                value={form.rating}
                onChange={(r) =>
                  setForm({
                    ...form,
                    rating: r,
                  })
                }
              />
            </div>

            {/* Review Text */}
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                Write a Review (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="How was the product? Regarding its quality and fitting..."
                value={form.review}
                onChange={(e) =>
                  setForm({
                    ...form,
                    review: e.target.value,
                  })
                }
                className="w-full border border-purple-200
                           bg-white rounded-xl px-4 py-2.5
                           text-sm focus:outline-none
                           focus:border-purple-500 resize-none"
              />
            </div>

            {/* Photo Upload */}
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                📸 Add photos (Optional, maximum 3))
              </label>
              <label
                className="flex items-center gap-2
                                border-2 border-dashed
                                border-purple-200 rounded-xl
                                p-3 cursor-pointer
                                hover:border-purple-400 transition
                                bg-white"
              >
                <span className="text-2xl">📷</span>
                <span className="text-sm text-gray-500">
                  {reviewImages.length > 0
                    ? `${reviewImages.length} photo(s) selected`
                    : "Select photos"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImages}
                  className="hidden"
                />
              </label>

              {/* Image Previews */}
              {previews.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {previews.map((p, i) => (
                    <img
                      key={i}
                      src={p}
                      alt=""
                      className="w-16 h-16 object-cover
                                 rounded-lg border-2
                                 border-purple-200"
                    />
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || form.rating === 0}
              className="w-full bg-gradient-to-r
                         from-purple-600 to-indigo-600
                         text-white py-3 rounded-xl
                         font-bold hover:opacity-90
                         transition disabled:opacity-40
                         flex items-center justify-center gap-2"
            >
              {submitting
                ? "⏳ It is being submitted.."
                : "✅ Submit the review"}
            </button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <p className="text-center text-gray-400 py-4">
          The reviews are loading
        </p>
      ) : reviews.length === 0 ? (
        <div
          className="text-center py-8 bg-gray-50
                        rounded-2xl"
        >
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-gray-400 text-sm">
            There are no reviews yet.
            <br />
            Be the first to review!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800">Reviews ({totalReviews})</h3>
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-2xl p-4
                         border border-gray-100
                         shadow-sm"
            >
              {/* Review Header */}
              <div
                className="flex items-start
                              justify-between mb-2"
              >
                <div>
                  <p
                    className="font-semibold text-gray-800
                                text-sm"
                  >
                    {review.customerName}
                  </p>
                  <StarRating
                    rating={review.rating}
                    size="sm"
                    showNumber={false}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1
                                   rounded-full font-bold
                                   ${getRatingColor(review.rating)}`}
                  >
                    {review.rating}/5
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(review.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Review Text */}
              {review.review && (
                <p
                  className="text-gray-600 text-sm
                              leading-relaxed mt-2"
                >
                  {review.review}
                </p>
              )}

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt=""
                      className="w-16 h-16 object-cover
                                 rounded-xl border
                                 border-gray-100
                                 cursor-pointer
                                 hover:opacity-80"
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function ZoomModal({ images, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex || 0);
  const [scale, setScale] = useState(1);
  const touchStartX = useRef(null);

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? next() : prev();
      setScale(1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="fixed inset-0 bg-black z-[100]
                 flex flex-col"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div
        className="flex justify-between items-center
                      px-4 py-3 bg-black"
      >
        <p className="text-white text-sm">
          {current + 1} / {images.length}
        </p>
        <div className="flex gap-3 items-center">
          {/* Zoom buttons */}
          <button
            onClick={() => setScale((s) => Math.min(s + 0.5, 3))}
            className="text-white text-xl w-9 h-9
                       bg-white bg-opacity-20
                       rounded-full flex items-center
                       justify-center"
          >
            🔍
          </button>
          <button
            onClick={() => setScale(1)}
            className="text-white text-xs
                       bg-white bg-opacity-20
                       px-3 py-1.5 rounded-full"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="text-white text-xl w-9 h-9
                       bg-white bg-opacity-20
                       rounded-full flex items-center
                       justify-center"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center
                      justify-center overflow-hidden
                      relative"
      >
        <img
          src={images[current]}
          alt="zoom"
          style={{
            transform: `scale(${scale})`,
            transition: "transform 0.2s",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
          }}
        />

        {/* Side arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => {
                prev();
                setScale(1);
              }}
              className="absolute left-3 top-1/2
                         -translate-y-1/2 bg-white
                         bg-opacity-20 text-white
                         rounded-full w-10 h-10
                         flex items-center justify-center
                         text-2xl"
            >
              ‹
            </button>
            <button
              onClick={() => {
                next();
                setScale(1);
              }}
              className="absolute right-3 top-1/2
                         -translate-y-1/2 bg-white
                         bg-opacity-20 text-white
                         rounded-full w-10 h-10
                         flex items-center justify-center
                         text-2xl"
            >
              ›
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div
          className="flex gap-2 p-3 bg-black
                        overflow-x-auto justify-center"
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrent(i);
                setScale(1);
              }}
              className={`flex-shrink-0 w-14 h-14
                         rounded-lg overflow-hidden border-2
                         ${
                           i === current
                             ? "border-purple-500"
                             : "border-transparent opacity-50"
                         }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      <p
        className="text-center text-gray-500
                    text-xs pb-3"
      >
        Swipe to navigate · Tap 🔍 to zoom
      </p>
    </div>
  );
}

// ─── Product Detail Modal ─────────────────
function ProductModal({ product, shop, onClose, onTryOn, onOrder }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [zoomedReview, setZoomedReview] = useState(null);
  const images =
    product.images?.length > 0 ? product.images : [product.imageUrl];

  const hasDiscount =
    product.originalPrice && product.originalPrice > product.price;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70
                    z-40 flex items-end md:items-center
                    justify-center p-0 md:p-4"
      onClick={onClose}
    >
      {/* इनर पॉपअप बॉक्स - अब यह मोबाइल पर फुलस्क्रीन रहेगा और लैपटॉप पर सेंटर्ड रहेगा */}
      <div
        className="bg-white w-full md:max-w-lg 
                     rounded-t-3xl md:rounded-3xl 
                     h-full md:max-h-[90vh] 
                     flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── FIXED HEADER (यह हमेशा टॉप पर जमा रहेगा, मोबाइल पर कभी नहीं छुपेगा) ─── */}
        <div
          className="flex justify-between items-center
             px-5 py-4 border-b border-gray-100/80 
             bg-white/80 backdrop-blur-md
             rounded-t-3xl md:rounded-t-3xl
             sticky top-0 z-50 
             transition-all duration-300"
        >
          {/* ब्रांड और नेम का अट्रैक्टिव सेक्शन */}
          <div className="flex flex-col gap-0.5 max-w-[75vw]">
            {product.brandName ? (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                  {product.brandName}
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-0.5">
                  ✨ Premium
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md w-max">
                Collection
              </span>
            )}

            <h2 className="text-sm font-extrabold text-gray-800 tracking-tight truncate mt-0.5">
              {product.name}
            </h2>
          </div>

          {/* अट्रैक्टिव क्लोज बटन - विथ होवर एंड एक्टिव स्टेट */}
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-50 hover:bg-red-50 
               border border-gray-100 hover:border-red-100
               flex items-center justify-center
               text-gray-400 hover:text-red-500
               font-bold flex-shrink-0
               shadow-sm hover:shadow-md
               transform active:scale-90 hover:rotate-90
               transition-all duration-300 ease-out"
            title="Close"
          >
            <span className="text-xs transition-transform duration-300">✕</span>
          </button>
        </div>

        {/* ─── SCROLLABLE CONTENT BODY START ─── */}
        {/* नोट: इसके नीचे की बाकी सब चीजें (जैसे Images, Thumbnail Strip, Pricing) अब इस स्क्रॉल बॉक्स के अंदर स्मूथली स्क्रॉल होंगी */}

        <div className="flex-1 overflow-y-auto">
          {/* Images */}
          <div className="relative">
            <div className="bg-gray-50">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-80 object-contain p-3
                         cursor-zoom-in"
                onClick={() => {
                  // Zoom handled in parent
                }}
              />
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div
                className="flex gap-2 p-3 overflow-x-auto
                            bg-white border-b"
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-14 h-14
                             rounded-xl overflow-hidden
                             border-2 transition
                             ${
                               i === selectedImage
                                 ? "border-purple-500"
                                 : "border-gray-100"
                             }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-5">
            {/* Brand + Name */}
            {product.brandName && (
              <p
                className="text-purple-600 font-bold
                          text-sm mb-1"
              >
                {product.brandName}
              </p>
            )}
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              {product.name}
            </h1>

            {/* Description */}
            {product.description && (
              <p
                className="text-gray-500 text-sm
                          leading-relaxed mb-3"
              >
                {product.description}
              </p>
            )}

            {/* Pricing */}
            <div className="flex items-center gap-3 mb-4">
              {hasDiscount && (
                <span
                  className="bg-green-600 text-white
                               text-xs font-bold px-2 py-1
                               rounded-lg"
                >
                  ↓ {product.discountPercent}% OFF
                </span>
              )}
              <div className="flex items-center gap-2">
                <span
                  className="text-2xl font-black
                               text-gray-900"
                >
                  ₹{product.price}
                </span>
                {hasDiscount && (
                  <span
                    className="text-gray-400 text-sm
                                 line-through"
                  >
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span
                  className="text-green-600 text-xs
                               font-medium"
                >
                  Save ₹{product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Size Chart */}
            {product.sizes?.length > 0 && (
              <div className="mb-4">
                <p
                  className="text-sm font-semibold
                            text-gray-700 mb-2"
                >
                  Size Select
                </p>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl text-sm
                               font-semibold border-2 transition
                               ${
                                 selectedSize === size
                                   ? "bg-gray-900 text-white border-gray-900"
                                   : "border-gray-200 text-gray-700 hover:border-gray-400"
                               }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-4">
              <p
                className="text-xs font-semibold text-gray-500
                          uppercase tracking-wide mb-3"
              >
                Delivery Details
              </p>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-base">📍</span>
                <div>
                  <p className="text-sm text-gray-700 font-medium">
                    {product.price >= 499
                      ? "🚚 Free Delivery!"
                      : "🚚 Delivery: ₹60"}
                  </p>
                  <p className="text-xs text-gray-400">
                    Expected by{" "}
                    {new Date(
                      Date.now() + 5 * 24 * 60 * 60 * 1000,
                    ).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </div>
              <p
                className="text-xs text-gray-500 flex
                          items-center gap-1"
              >
                <span>🏪</span>
                Fulfilled by{" "}
                <span className="font-semibold text-gray-700 ml-1">
                  {shop?.name}
                </span>
              </p>
              <p
                className=" font-semibold text-xs text-blue-500 flex
                          items-center gap-1 mt-2"
              >
                <span>⛟.</span>
                Free delivery on all orders above ₹499
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: "↩️", text: "7 Day Return" },
                { icon: "💵", text: "Cash on Delivery" },
                { icon: "✅", text: "VirtualTryOn Assured" },
              ].map((b, i) => (
                <div
                  key={i}
                  className="text-center bg-blue-50
                           rounded-xl p-3"
                >
                  <div className="text-xl mb-1">{b.icon}</div>
                  <p
                    className="text-xs text-gray-600
                               font-medium leading-tight"
                  >
                    {b.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Product Highlights */}
            {product.highlights &&
              Object.values(product.highlights).some((v) => v) && (
                <div className="mb-5">
                  <p
                    className="text-sm font-bold text-gray-800
                            mb-3 uppercase tracking-wide"
                  >
                    Product Highlights
                  </p>
                  <div
                    className="bg-gray-50 rounded-2xl
                              overflow-hidden"
                  >
                    {[
                      { k: "packOf", l: "Pack Of" },
                      { k: "color", l: "Color" },
                      { k: "pattern", l: "Pattern" },
                      { k: "fabric", l: "Fabric" },
                      { k: "occasion", l: "Occasion" },
                      { k: "suitableFor", l: "Suitable For" },
                    ]
                      .filter((f) => product.highlights[f.k])
                      .map((f, i, arr) => (
                        <div
                          key={f.k}
                          className={`flex px-4 py-3
                               ${
                                 i !== arr.length - 1
                                   ? "border-b border-gray-100"
                                   : ""
                               }`}
                        >
                          <span
                            className="text-gray-400 text-sm
                                     w-28 flex-shrink-0"
                          >
                            {f.l}
                          </span>
                          <span
                            className="text-gray-800 text-sm
                                     font-medium"
                          >
                            {product.highlights[f.k]}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Reviews Section - Read Only */}
            <ProductReviews
              product={product}
              showAllReviews={showAllReviews}
              setShowAllReviews={setShowAllReviews}
              onImageClick={(img, review) => setZoomedReview({ img, review })}
            />
          </div>

          {/* Sticky Buttons */}
          <div
            className="sticky bottom-0 bg-white border-t
                        px-5 py-4 space-y-2.5
                        shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
          >
            <button
              onClick={() => onOrder(product)}
              disabled={!product?.inStock}
              className={`w-full py-3.5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2.5 
             transition-all duration-300 ease-in-out shadow-lg transform active:scale-[0.98]
             ${
               product?.inStock
                 ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-600 text-white shadow-green-500/20 hover:shadow-green-500/40 hover:-translate-y-0.5 cursor-pointer"
                 : "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-400 shadow-none cursor-not-allowed border border-gray-300/30"
             }`}
            >
              {product?.inStock ? (
                <>
                  {/* आइकॉन रैपर - इसे परफेक्टली सेंटर और अलाइन किया गया है */}
                  <div className="relative flex items-center justify-center bg-white/15 p-1 rounded-lg animate-pulse [animation-duration:1.5s]">
                    <span className="absolute inline-flex h-full w-full rounded-lg bg-white/20 animate-ping opacity-60"></span>
                    <svg
                      xmlns="http://w3.org"
                      width="18" // साइज़ थोड़ा छोटा किया ताकि ऊपर टच न हो
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5" // यह आइकॉन को बढ़िया और बोल्ड रखेगा
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="relative z-10"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  </div>

                  <span className="tracking-wide">Order Now</span>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://w3.org"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.93 4.93 14.14 14.14" />
                  </svg>
                  <span className="tracking-wide uppercase text-sm font-extrabold opacity-75">
                    Out of Stock
                  </span>
                </>
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (product.inStock === false) return;
                onTryOn(product);
              }}
              disabled={product.inStock === false}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 
             transition-all duration-300 ease-in-out shadow-lg transform active:scale-[0.98]
             ${
               product.inStock === false
                 ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-400 shadow-none cursor-not-allowed border border-gray-300/30"
                 : "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-0.5 cursor-pointer"
             }`}
            >
              {product.inStock === false ? (
                <>
                  {/* आउट ऑफ़ स्टॉक स्टेट */}
                  <svg
                    xmlns="http://w3.org"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m4.93 4.93 14.14 14.14" />
                  </svg>
                  <span className="tracking-wide uppercase text-sm font-extrabold opacity-75">
                    Tryon Unavailable
                  </span>
                </>
              ) : (
                <>
                  {/* एक्टिव AI / फैशन ट्राई-ऑन स्टेट */}
                  <div className="relative flex items-center justify-center bg-white/20 p-1 rounded-lg animate-pulse [animation-duration:1.8s]">
                    {/* पीछे हल्का सा ग्लोइंग रिंग इफ़ेक्ट */}
                    <span className="absolute inline-flex h-full w-full rounded-lg bg-white/20 animate-ping opacity-60"></span>

                    {/* स्पार्कल / मैजिक AI आइकॉन (जो वर्चुअल ट्राई-ऑन को दर्शाता है) */}
                    <svg
                      xmlns="http://w3.org"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="relative z-10"
                    >
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                      <path
                        d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z"
                        className="opacity-80"
                      />
                      <path
                        d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"
                        className="opacity-80"
                      />
                    </svg>
                  </div>

                  <span className="tracking-wide">Try-On Now!</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Review Image Zoom */}
        {zoomedReview && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90
                     z-50 flex items-center justify-center p-4"
            onClick={() => setZoomedReview(null)}
          >
            <div
              className="bg-white rounded-2xl overflow-hidden
                          max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={zoomedReview.img}
                alt=""
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-sm ${
                        s <= zoomedReview.review.rating
                          ? "text-yellow-400"
                          : "text-gray-200"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-gray-500 ml-1">
                    {zoomedReview.review.customerName}
                  </span>
                </div>
                {zoomedReview.review.review && (
                  <p className="text-sm text-gray-700">
                    {zoomedReview.review.review}
                  </p>
                )}
              </div>
              <button
                onClick={() => setZoomedReview(null)}
                className="w-full bg-gray-100 py-3 text-sm
                         font-semibold text-gray-600
                         hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Try-On Modal ─────────────────────────
function TryOnModal({
  product,
  shop,
  onClose,
  selectedProduct,
  onLoginRequired,
}) {
  const { customerToken } = useCustomer();
  const [showLoginRequired, setShowLoginRequired] = useState(false);
  const [humanImage, setHumanImage] = useState(null);
  const [humanPreview, setHumanPreview] = useState(null);
  const [tryonLoading, setTryonLoading] = useState(false);
  const [tryonResult, setTryonResult] = useState(null);
  const [zoomScale, setZoomScale] = useState(1); // 1 = normal, 2 = zoomed
  const [styleAdvice, setStyleAdvice] = useState(null);

  const handleDownloadImage = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `tryon-${product?.name || "result"}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download error:", error);
      // अगर fetch ब्लॉक होता है तो डायरेक्ट न्यू टैब में खोलने का बैकअप
      window.open(imageUrl, "_blank");
    }
  };
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setHumanImage(file);
    setHumanPreview(URL.createObjectURL(file));
  };

  const handleTryOn = async () => {
    // ✅ Login check — try-on se pehle login zaroori
    if (!customerToken) {
      setShowLoginRequired(true);
      return;
    }
    if (!humanImage) {
      alert("Upload your photo first!");
      return;
    }
    setTryonLoading(true);
    setTryonResult(null);
    setStyleAdvice(null);
    try {
      const formData = new FormData();
      formData.append("humanImage", humanImage);
      formData.append("garmentUrl", product.imageUrl);
      const category = product.category || "upper_body";
      formData.append("description", category);
      console.log("Sending category:", category);
      formData.append("productName", product.name || "");

      const res = await axios.post(`${API_URL}/api/tryon`, formData, {
        headers: {
          "x-api-key": shop.apiKey,
          Authorization: `Bearer ${customerToken}`, // ✅ Auth header
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.success && res.data.resultImage) {
        setTryonResult(res.data.resultImage);
        setStyleAdvice(res.data.styleAdvice);
      } else {
        console.log("❌ No resultImage in response!");
        alert("Try-on result nahi mila! Dobara try karo.");
      }
    } catch {
      alert("Found an error! Please try again.");
    } finally {
      setTryonLoading(false);
    }
  };

  return (
    <>
      {tryonLoading && <TryOnAnimation />}

      {/* ✅ Login Required Popup */}
      {showLoginRequired && (
        <LoginRequiredPopup
          onClose={() => setShowLoginRequired(false)}
          onLoginClick={() => {
            setShowLoginRequired(false);
            onClose();
            if (onLoginRequired) onLoginRequired();
          }}
        />
      )}

      <div
        className="fixed inset-0 bg-black bg-opacity-70
                      z-40 flex items-end md:items-center
                      justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <div
          className="bg-white w-full md:max-w-lg
                        rounded-t-3xl md:rounded-3xl
                        max-h-screen overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex justify-between items-center
                          p-5 border-b sticky top-0 bg-white z-10
                          rounded-t-3xl"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-800">
                👗 Virtual Try-On
              </h2>
              <p className="text-xs text-gray-400">{product.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100
                         flex items-center justify-center
                         text-gray-500 hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* Preview Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  👕 Cloth's Photo
                </p>
                <div
                  className="bg-gray-50 rounded-2xl
                                aspect-square overflow-hidden"
                >
                  <img
                    src={product.imageUrl}
                    alt="product"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  📸 Your Photo
                </p>
                <div
                  className="bg-gray-50 rounded-2xl
                                aspect-square overflow-hidden
                                flex items-center justify-center"
                >
                  {humanPreview ? (
                    <img
                      src={humanPreview}
                      alt="you"
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="text-center p-3">
                      <div className="text-3xl mb-1">📷</div>
                      <p className="text-gray-300 text-xs">
                        {" "}
                        Your photo preview
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Upload */}
            <div className="w-full max-w-md mx-auto space-y-3">
              {/* मुख्य लेबल */}
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Upload your photo <span className="text-purple-500">*</span>
              </label>

              {/* अपलोडर बॉक्स */}
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed 
               rounded-2xl cursor-pointer transition-all duration-300 ease-in-out relative overflow-hidden
               ${
                 humanImage
                   ? "border-emerald-400 bg-emerald-50/40 hover:bg-emerald-50 shadow-md shadow-emerald-500/5"
                   : "border-purple-200 bg-gray-50/50 hover:border-purple-500 hover:bg-purple-50/60 shadow-sm"
               }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center space-y-2">
                  {/* डायनैमिक आइकॉन एनिमेशन के साथ */}
                  <div
                    className={`p-2.5 rounded-xl transition-all duration-300 ${
                      humanImage
                        ? "bg-emerald-100 text-emerald-600 animate-pulse"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    {humanImage ? (
                      // सफलता का टिक आइकॉन
                      <svg
                        xmlns="http://w3.org"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    ) : (
                      // कैमरा / फोटो अपलोड आइकॉन
                      <svg
                        xmlns="http://w3.org"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                    )}
                  </div>

                  {/* टेक्स्ट कंटेंट */}
                  <div className="space-y-0.5">
                    <p
                      className={`text-sm font-semibold transition-colors ${humanImage ? "text-emerald-700" : "text-gray-700"}`}
                    >
                      {humanImage
                        ? "Photo Uploaded Successfully!"
                        : "Click to upload or drag & drop"}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-[280px] font-medium">
                      {humanImage
                        ? humanImage.name
                        : "PNG, JPG or JPEG (Max. 5MB)"}
                    </p>
                  </div>
                </div>

                {/* हिडन इनपुट फ़ील्ड */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  className="hidden"
                />
              </label>

              {/* एडवांस टिप/हिंट सेक्शन */}
              <div className="flex items-start gap-2 bg-purple-50/50 border border-purple-100/80 p-3 rounded-xl transition-all duration-300">
                <div className="text-purple-500 mt-0.5 animate-bounce [animation-duration:3s] flex-shrink-0">
                  <svg
                    xmlns="http://w3.org"
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
                    <path d="M9 18h6" />
                    <path d="M10 22h4" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-purple-700 leading-relaxed">
                  <span className="font-bold">Tip:</span> Seedhi khadi photo
                  (Front-face portrait) best result deti hai!
                </p>
                {/* <p className="text-xs font-medium text-red-700 leading-relaxed">
                  <span className="font-bold">Note:</span> The Try-on feature is
                  currently working only for the upper body!
                </p> */}
              </div>
            </div>

            {/* Try On Button */}

            {(product?.category?.includes("lower") ||
              product?.category?.includes("pant")) && (
              <div
                className="bg-amber-50 border border-amber-200
                  rounded-xl p-3 mb-3"
              >
                <p className="text-amber-700 text-xs font-medium">
                  ⚠️ Straight standing full-body photos give the best results
                  for lower body Try-on. Actual results may vary
                </p>
              </div>
            )}
            <button
              onClick={handleTryOn}
              disabled={tryonLoading || !humanImage}
              className={`w-full py-3.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 
             transition-all duration-500 ease-in-out relative overflow-hidden transform active:scale-[0.98]
             ${
               tryonLoading || !humanImage
                 ? "bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 text-gray-400 shadow-none cursor-not-allowed border border-gray-300/30"
                 : "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 cursor-pointer"
             }`}
            >
              {tryonLoading ? (
                <>
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://w3.org"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="tracking-wider animate-pulse">
                    AI is Processing...
                  </span>
                </>
              ) : (
                <>
                  {!tryonLoading && humanImage ? (
                    <>
                      {/* परफेक्टली सेंटर अलाइंड आइकॉन बॉक्स (साइज छोटा किया ताकि ऊपर टच न हो) */}
                      <div className="relative flex items-center justify-center bg-white/15 p-1 rounded-lg animate-pulse [animation-duration:2s]">
                        <span className="absolute inline-flex h-full w-full rounded-lg bg-white/20 animate-ping opacity-60"></span>

                        {/* नया "Hanger + Magic" आइकॉन (फैशन और AI ट्राई-ऑन के लिए एकदम परफेक्ट) */}
                        <svg
                          xmlns="http://w3.org"
                          width="18" // साइज छोटा किया ताकि ऊपर टच न करे
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="relative z-10 text-white"
                        >
                          {/* हैंगर का हुक और त्रिकोण */}
                          <path d="M12 2a2 2 0 0 1 2 2c0 .7-.4 1.3-1 1.7L13 6v1" />
                          <path d="M21 18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          {/* अंदर की चमक / मैजिक */}
                          <path
                            d="m10 11 1 2 1-2 2-1-2-1-1-2-1 2-2 1z"
                            className="fill-amber-300 stroke-none animate-pulse"
                          />
                        </svg>
                      </div>

                      {/* यहाँ से पुराना '✨' हटा दिया है ताकि दो-दो स्टार न दिखें */}
                      <span className="tracking-wide drop-shadow-md">
                        ✨Try On Karen! (10 credits)
                      </span>

                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]"></span>
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://w3.org"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                      </svg>
                      <span className="text-sm font-bold tracking-wide uppercase opacity-60">
                        Upload Photo First
                      </span>
                    </>
                  )}
                </>
              )}
            </button>

            {/* Result */}
            {tryonResult && (
              <div>
                {/* Fullscreen Result */}
                <div className="fixed inset-0 bg-black z-50 flex flex-col">
                  {/* Header */}
                  <div className="flex justify-between items-center px-4 py-3 bg-neutral-900 border-b border-white/10 z-50 w-full relative">
                    <div>
                      <p className="text-white font-bold text-sm sm:text-base">
                        🎉 Try-On Result !
                      </p>
                      <p className="text-gray-400 text-xs">
                        {product?.name || "shirt"}
                      </p>
                    </div>

                    {/* एक्शन बटन्स - राइट साइड में बिल्कुल साफ़ दिखेंगे */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto mr-2">
                      {/* ज़ूम बटन */}
                      <button
                        onClick={() =>
                          setZoomScale((prev) => (prev === 1 ? 1.8 : 1))
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30 transition-all active:scale-95"
                      >
                        {zoomScale === 1 ? "🔍 Zoom In" : "🔎 Zoom Out"}
                      </button>

                      {/* डाउनलोड बटन */}
                      <button
                        onClick={() => handleDownloadImage(tryonResult)}
                        className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-all shadow-md active:scale-95 flex items-center gap-1"
                      >
                        📥 Download
                      </button>
                    </div>

                    {/* बंद करने का बटन */}
                    <button
                      onClick={() => {
                        setTryonResult(null);
                        setZoomScale(1);
                      }}
                      className="w-8 h-8 sm:w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Result Image - Fullscreen Container with Scroll Support for Zoom */}
                  <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-neutral-950 select-none h-[65vh] max-h-[65vh]">
                    <img
                      src={tryonResult}
                      alt="Try-on result"
                      style={{
                        top: 10,
                        transform: `scale(${zoomScale})`,
                        cursor: zoomScale === 1 ? "zoom-in" : "zoom-out",
                      }}
                      onClick={() =>
                        setZoomScale((prev) => (prev === 1 ? 2.5 : 1))
                      }
                      className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl transition-transform duration-300 ease-out origin-top"
                      onLoad={() => {
                        console.log("✅ Result image loaded:", tryonResult);
                      }}
                      onError={(e) => {
                        console.log("❌ Image failed to load:", tryonResult);
                        e.target.style.display = "none";
                        const fallback = document.getElementById(
                          "tryon-fallback-link",
                        );
                        if (fallback) fallback.style.display = "block";
                      }}
                    />

                    <div
                      id="tryon-fallback-link"
                      style={{ display: "none" }}
                      className="text-center p-4 absolute"
                    >
                      <p className="text-white text-sm mb-3">
                        Image load nahi hui. Yahan click karen:
                      </p>
                      <a
                        href={tryonResult}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-white text-purple-700 px-6 py-3 rounded-xl font-bold inline-block"
                      >
                        🔗 Result Dekhen (New Tab)
                      </a>
                    </div>
                  </div>

                  {/* Style Advice */}
              {styleAdvice && (
  <div className="bg-gradient-to-t from-black to-transparent px-6 pb-2">
    <div className="relative overflow-hidden bg-neutral-900/60 border border-white/10 backdrop-blur-md rounded-2xl p-5 shadow-2xl transition-all duration-300 group hover:border-purple-500/40">
      
      {/* SaaS Premium Ambient Glow Effect Background */}
      <div className="absolute -top-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header Container */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center justify-center w-6 h-5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-300 shadow-inner">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://w3.org">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <p className="bg-gradient-to-r from-purple-300 via-pink-200 to-white bg-clip-text text-transparent font-extrabold text-sm tracking-wide uppercase">
          Personal Style Analysis
        </p>
      </div>

      {/* Style Advice Text with Customized SaaS Scrollbar */}
      {/* 💡 यहाँ max-h-24 को बढ़ाकर max-h-40 (लगभग डबल साइज) कर दिया है */}
      <div className="text-neutral-300 text-xs leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto pr-2 
        [&::-webkit-scrollbar]:w-1.5
        [&::-webkit-scrollbar-track]:bg-white/5
        [&::-webkit-scrollbar-track]:rounded-full
        [&::-webkit-scrollbar-thumb]:bg-gradient-to-b
        [&::-webkit-scrollbar-thumb]:from-purple-500/30
        [&::-webkit-scrollbar-thumb]:to-pink-500/20
        [&::-webkit-scrollbar-thumb]:rounded-full
        [scrollbar-width:thin]
        [scrollbar-color:rgba(168,85,247,0.3)_rgba(255,255,255,0.05)]"
      >
        {styleAdvice}
      </div>
    </div>
  </div>
)}


                  {/* Action Buttons */}
                  {/* Premium, Advanced & Ultra-Compact Action Buttons Container */}
                  <div className="bg-neutral-900/60 backdrop-blur-md px-6 py-3 border-t border-white/5 rounded-t-2xl shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
                      {/* 1. Try Another Style - Left Side */}
                      <button
                        onClick={() => setTryonResult(null)}
                        className="w-full sm:w-auto order-3 sm:order-1 text-neutral-400 text-xs font-semibold px-4 py-2 hover:text-white transition-colors duration-200 tracking-wider uppercase whitespace-nowrap"
                      >
                        ← Try another
                      </button>

                      {/* Right Side Buttons Group */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2 flex-1 sm:justify-end">
                        {shop?.upiId && (
                          <button
                            onClick={() => {
                              trackOrder(product, "upi");
                              navigator.clipboard.writeText(shop.upiId);
                              alert(
                                `UPI: ${shop.upiId}\nAmount: ₹${product?.price}`,
                              );
                            }}
                            className="flex items-center justify-center gap-2 w-full sm:w-auto sm:px-6 h-10 bg-white/5 border border-white/10 text-white rounded-xl font-medium text-xs tracking-wide hover:bg-white/10 hover:border-white/20 active:scale-[0.98] transition-all duration-200 backdrop-blur-sm whitespace-nowrap"
                          >
                            <span className="text-sm text-blue-400">💳</span>{" "}
                            UPI Se Pay Karen
                          </button>
                        )}

                        {shop?.whatsapp && (
                          <a
                            href={`https://wa.me/${shop?.whatsapp}?text=${encodeURIComponent(
                              `Hi! Maine try on kiya!\n\n` +
                                `👗 Fabric: ${product?.name || "N/A"}\n` +
                                `💰 Price: ₹${product?.price || "0"}\n\n` +
                                `📸 Fabric Preview: ${product?.imageUrl || product?.fabricImageUrl || "N/A"}\n` +
                                // `${tryonResult ? `✨ Try-on Result: ${tryonResult}\n\n` : ""}` +
                                `Yah order karna hai!`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() =>
                              trackOrder(selectedProduct, "whatsapp")
                            }
                            className="relative flex items-center justify-center gap-2 w-full sm:w-auto sm:px-8 h-10 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl font-bold text-xs tracking-wide uppercase shadow-[0_4px_12px_rgba(16,185,129,0.2)] hover:opacity-95 active:scale-[0.98] transition-all duration-200 overflow-hidden group whitespace-nowrap"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                            {/* प्रीमियम व्हाट्सएप एसवीजी लोगो (Premium WhatsApp SVG Logo) */}
                            <svg
                              className="w-5 h-5 fill-current text-white animate-pulse"
                              viewBox="0 0 24 24"
                              xmlns="http://w3.org"
                            >
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.503-5.714-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.864.001-2.641-1.03-5.124-2.904-6.999-1.875-1.875-4.361-2.906-7.004-2.907-5.44 0-9.864 4.414-9.867 9.866-.001 1.748.457 3.456 1.326 4.965l-.995 3.636 3.73-.978zm11.381-5.308c-.312-.156-1.848-.912-2.134-1.017-.286-.105-.495-.156-.703.156-.208.312-.807 1.017-.989 1.225-.182.208-.364.234-.676.078-.312-.156-1.318-.486-2.51-1.549-.928-.827-1.554-1.849-1.737-2.161-.182-.312-.02-.481.136-.636.141-.14.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.703-1.693-.963-2.319-.253-.611-.512-.528-.703-.537-.181-.009-.39-.01-.599-.01-.208 0-.546.078-.832.39-.286.312-1.092 1.067-1.092 2.601 0 1.533 1.117 3.018 1.272 3.226.156.208 2.199 3.359 5.328 4.709.745.322 1.325.515 1.779.659.749.238 1.431.205 1.969.125.6-.09 1.847-.755 2.107-1.444.259-.689.259-1.277.182-1.404-.078-.127-.286-.203-.597-.36z" />
                            </svg>
                            Order Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Main Shop Page ───────────────────────
export default function Shop() {
  const { sellerId } = useParams();
  const [shop, setShop] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showProfile, setShowProfile] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderProduct, setOrderProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showTryOn, setShowTryOn] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [zoomImages, setZoomImages] = useState(null);
  const [zoomIndex, setZoomIndex] = useState(0);
    // ✅ Navbar se "My Try-Ons" trigger karne ke liye signal
  const [galleryOpenSignal, setGalleryOpenSignal] = useState(0);
  // eslint-disable-next-line
  const { customer, customerToken } = useCustomer();

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.category === filter;
    return matchSearch && matchFilter;
  });

  useEffect(() => {
    fetchShop();
    // eslint-disable-next-line
  }, [sellerId]);

  //SEO tags code
  useEffect(() => {
    if (shop) {
      document.title = `${shop.name} - Virtual Try-On Shop`;

      const setMeta = (name, content, prop = false) => {
        const attr = prop ? "property" : "name";
        const existing = document.querySelector(`meta[${attr}="${name}"]`);
        const tag = existing || document.createElement("meta");
        tag.setAttribute(attr, name);
        tag.content = content;
        if (!existing) document.head.appendChild(tag);
      };

      setMeta(
        "description",
        `${shop.name} ki virtual try-on shop. ` +
          `Ghar baithe kapde try karo! AI-powered virtual try-on.`,
      );
      setMeta("og:title", `${shop.name} - Try-On Shop`, true);
      setMeta("og:description", "AI se kapde try karo ghar baithe!", true);
      setMeta("og:type", "website", true);
      setMeta("og:url", window.location.href, true);

      return () => {
        document.title = "VirtualTryOn";
      };
    }
  }, [shop]);

  // Scroll lock - jab bhi koi modal khule
  useEffect(() => {
    const shouldLock =
      showDetail ||
      showTryOn ||
      showAuthModal ||
      showOrderModal ||
      showProfile ||
      !!zoomImages;

    if (shouldLock) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [
    showDetail,
    showTryOn,
    showAuthModal,
    showOrderModal,
    showProfile,
    zoomImages,
  ]);

  const fetchShop = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/shop/${sellerId}`);
      setShop(res.data.shop);
      if (res.data && res.data.shop) {
  localStorage.setItem("live_shop_whatsapp", res.data.shop.whatsapp || "");
}
      setProducts(res.data.products);
      // console.log("Shop apiKey:", res.data.shop?.apiKey);
    } catch {
      setError("Shop nahi mili!");
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (product) => {
    setSelectedProduct(product);
    setShowDetail(true);
    setShowTryOn(false);
  };

  const openTryOn = (product) => {
    setSelectedProduct(product);
    setShowTryOn(true);
    setShowDetail(false);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">👗</div>
          <p className="text-purple-600 font-medium animate-pulse">
            Loading shop...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-red-500 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Shop Header */}
      <ShopNavbar
        shop={shop}
        onLoginClick={(mode) => {
          setAuthMode(mode);
          setShowAuthModal(true);
        }}
        onProfileClick={() => setShowProfile(true)}
        onMyTryOnsClick={() => {
          if (!customer) {
            setAuthMode("login");
            setShowAuthModal(true);
            return;
          }
          setGalleryOpenSignal((n) => n + 1);
        }}
      />
      {/* <div
        className="bg-gradient-to-r from-purple-600
                      via-purple-700 to-indigo-700
                      text-white relative overflow-hidden"
      > */}
      {/* Background pattern */}
      {/* <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "30px 30px",
          }}
        ></div> */}

      {/* <div className="relative z-10 text-center py-10 px-4">
          <div
            className="w-16 h-16 bg-white bg-opacity-20
                          rounded-2xl flex items-center
                          justify-center text-3xl mx-auto mb-4"
          >
            👗
          </div>
          <h1 className="text-2xl md:text-4xl font-bold mb-2">{shop?.name}</h1>
          <p className="text-purple-200 text-sm md:text-base">
            Ghar baithe kapde try karen! ✨
          </p> */}

      {/* Stats */}
      {/* <div className="flex justify-center gap-6 mt-5">
            {[
              { label: "Products", value: products.length },
              { label: "Try-On", value: "🤖 AI" },
              { label: "Order", value: "📞 WhatsApp" },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white bg-opacity-15
                           backdrop-blur-sm rounded-xl
                           px-4 py-2 text-center"
              >
                <p className="font-bold text-base">{s.value}</p>
                <p className="text-purple-200 text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div> */}

      {/* Products Grid */}
      <div className="mb-6 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200
                 rounded-2xl px-5 py-3 pl-12
                 focus:outline-none focus:border-purple-400
                 focus:ring-2 focus:ring-purple-100
                 transition text-sm shadow-sm"
          />
          <span
            className="absolute left-4 top-1/2
                     -translate-y-1/2 text-gray-400"
          >
            🔍
          </span>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2
                   -translate-y-1/2 text-gray-400
                   hover:text-gray-600 transition"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: "🛍️ All" },
            { key: "upper_body", label: "👕 Shirt" },
            { key: "lower_body", label: "👖 Pant" },
            { key: "dress", label: "👗 Dress" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilter(cat.key)}
              className={`flex-shrink-0 px-4 py-2
                   rounded-full text-sm font-medium
                   transition whitespace-nowrap
                   ${
                     filter === cat.key
                       ? "bg-purple-600 text-white shadow-md"
                       : "bg-white text-gray-600 border border-gray-200 hover:border-purple-300"
                   }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        {(search || filter !== "all") && (
          <p className="text-sm text-gray-400">
            &nbsp;🔍︎ {filteredProducts.length} products found for
            {search && ` "${search}" →`}
          </p>
        )}
      </div>

      {/* Grid mein filteredProducts use karo */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">😕</div>
          <p className="text-gray-400">No any product found!</p>
          <button
            onClick={() => {
              setSearch("");
              setFilter("all");
            }}
            className="mt-3 text-purple-600 text-sm
                 hover:underline"
          >
            View all products
          </button>
        </div>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-3
                            lg:grid-cols-4 gap-4"
        >
          {filteredProducts.map((product) => {
            const images =
              product.images?.length > 0 ? product.images : [product.imageUrl];

            return (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm
                               hover:shadow-lg transition-all
                               duration-300 overflow-hidden
                               group cursor-pointer
                               hover:-translate-y-1"
                onClick={() => openDetail(product)}
              >
                {/* Image with slider */}
                <div className="relative">
                  <ImageSlider
                    images={images}
                    onClick={() => openDetail(product)}
                  />

                  {/* Try-On Quick Button */}
                  <div
                    className="absolute bottom-2 right-2
                                      opacity-0 group-hover:opacity-100
                                      transition-all duration-300"
                  >
                    {/* yaha pe hover wala button hai hoverbutton*/}
                    {/* <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTryOn(product);
                      }}
                      className="bg-purple-600 text-white
                                     text-xs px-3 py-1.5
                                     rounded-full font-medium
                                     shadow-lg hover:bg-purple-700"
                    >
                      👗 Try On
                    </button> */}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* OOS Badge */}
                  {product.inStock === false && (
                    <div
                      className="bg-red-500 text-white text-xs
                    font-bold px-2 py-1 rounded-lg
                    mb-2 inline-block"
                    >
                      ❌ Out of Stock
                    </div>
                  )}
                  <h3
                    className="font-semibold text-gray-800
                 text-sm mb-1 truncate capitalize"
                  >
                    {product.name}
                  </h3>

                  <div
                    className="flex items-center
                                      justify-between mb-3"
                  >
                    <p
                      className="text-purple-600 font-bold
              text-base"
                    >
                      ₹{product.price}
                    </p>

                    <div
                      className="flex items-center
                justify-between"
                    >
                      <span
                        className="text-xs text-gray-400
                   bg-gray-100 px-2 py-0.5
                   rounded-full capitalize"
                      >
                        {product.category?.replace("_", " ")}
                      </span>

                      {/* Rating Badge */}
                      {product.reviewCount > 0 && (
                        <div
                          className={`flex items-center gap-1
                    px-2 py-0.5 rounded-full
                    text-xs font-bold
                    ${
                      product.avgRating >= 4
                        ? "bg-green-100 text-green-700"
                        : product.avgRating >= 2
                          ? "bg-orange-100 text-orange-600"
                          : "bg-red-100 text-red-600"
                    }`}
                        >
                          <span>★</span>
                          <span>{product.avgRating?.toFixed(1)}</span>
                          <span className="text-gray-400 font-normal">
                            ({product.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (product.inStock === false) return;
                      openTryOn(product);
                    }}
                    disabled={product.inStock === false}
                    className={`w-full mt-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 
             transition-all duration-200 ease-in-out shadow-sm transform active:scale-[0.97]
             ${
               product.inStock === false
                 ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200/50"
                 : "bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white shadow-purple-500/10 hover:shadow-md hover:shadow-purple-500/20 hover:-translate-y-0.5 cursor-pointer"
             }`}
                  >
                    {product.inStock === false ? (
                      <>
                        {/* आउट ऑफ़ स्टॉक के लिए साफ-सुथरा लुक */}
                        <svg
                          xmlns="http://w3.org"
                          width="13"
                          height="13"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="opacity-70"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path d="m4.93 4.93 14.14 14.14" />
                        </svg>
                        <span className="tracking-wide uppercase text-[10px] font-extrabold">
                          Out of Stock
                        </span>
                      </>
                    ) : (
                      <>
                        {/* मैजिक AI स्पार्कल्स आइकॉन (जो छोटा और स्लीक है) */}
                        <svg
                          xmlns="http://w3.org"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5" // बटन छोटा है इसलिए २.५ मोटाई एकदम बोल्ड दिखेगी
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="animate-pulse [animation-duration:2s]"
                        >
                          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
                        </svg>

                        <span className="tracking-wide">Try On Karen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Size Selector in Order */}
      {/* This section is intentionally left out in the main Shop page because
          size selection is handled inside the product/order modals. */}

      {/* Product Detail Modal */}

      {showDetail && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          shop={shop}
          onClose={() => setShowDetail(false)}
          onTryOn={(p) => {
            setShowDetail(false);
            openTryOn(p);
          }}
          onOrder={(p) => {
            setShowDetail(false);
            setOrderProduct(p);
            setShowOrderModal(true);
          }}
        />
      )}

      {/* Zoom Modal */}
      {zoomImages && (
        <ZoomModal
          images={zoomImages}
          initialIndex={zoomIndex}
          onClose={() => {
            setZoomImages(null);
            setZoomIndex(0);
          }}
        />
      )}

      {/* Try-On Modal */}
      {showTryOn && selectedProduct && (
        <TryOnModal
          product={selectedProduct}
          shop={shop}
          onClose={() => setShowTryOn(false)}
          onLoginRequired={() => {
            setAuthMode("login");
            setShowAuthModal(true);
          }}
        />
      )}

      {showAuthModal && (
        <CustomerAuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {showOrderModal && orderProduct && (
        <OrderModal
          product={orderProduct}
          shop={shop}
          onClose={() => {
            setShowOrderModal(false);
            setOrderProduct(null);
          }}
        />
      )}

      {showProfile && (
        <CustomerProfile shop={shop} onClose={() => setShowProfile(false)} />
      )}

      {/* Voice Assistant */}
      <VoiceAssistant
        pageType="shop"
        shopName={shop?.name || ""}
        language="hi"
      />

      {/* Try-On Gallery */}
      <TryOnGallery
        shop={shop}
        apiKey={shop?.apiKey}
        customerToken={customerToken}
        openSignal={galleryOpenSignal}
      />
    </div>
  );
}
