import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";
import { useCustomer } from "../context/CustomerContext";

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
function ShopNavbar({ shop, onLoginClick, onProfileClick }) {
  const { customer, logoutCustomer } = useCustomer();
  const [menuOpen, setMenuOpen] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const features = [
    "✨ Virtual Try-On( for uppper body dress only)",
    "🤖 AI Style Advice",
    "📱 Easy WhatsApp Orders",
    "📱 Easy Direct order",
    "🟢 Live order status",
    "🚚 Fast Delivery",
    "↩️ Easy Returns",
    "💳 Secure Payments",
  ];

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
    <div className="sticky top-0 z-30 shadow-md">
      <div
        className="bg-gradient-to-r from-purple-700
                      via-purple-600 to-indigo-700 px-4 py-3"
      >
        <div
          className="max-w-6xl mx-auto flex
                        items-center justify-between"
        >
          <h1
            className="text-xl md:text-2xl font-bold
                         text-white italic"
            style={{ fontFamily: "Georgia, serif" }}
          >
            👗 {shop?.name}
          </h1>
          <div className="hidden md:flex items-center gap-3">
            {customer ? (
              <>
                <button
                  onClick={onProfileClick}
                  className="text-purple-200 text-sm
                             hover:text-white transition"
                >
                  Hi, {customer.name}! 👋
                </button>
                <button
                  onClick={onProfileClick}
                  className="bg-white text-purple-700
                             px-4 py-1.5 rounded-full text-sm
                             font-semibold hover:bg-purple-50"
                >
                  My Account
                </button>
                <button
                  onClick={logoutCustomer}
                  className="text-purple-200 text-sm
                             hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onLoginClick("login")}
                  className="text-white text-sm
                             hover:text-purple-200 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => onLoginClick("register")}
                  className="bg-white text-purple-700 px-4
                             py-1.5 rounded-full text-sm
                             font-semibold hover:bg-purple-50"
                >
                  Register
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white text-2xl"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div
            className="md:hidden mt-3 pt-3
                          border-t border-purple-500 space-y-2"
          >
            {customer ? (
              <>
                <button
                  onClick={() => {
                    onProfileClick();
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left
                             text-white text-sm px-2 py-1.5"
                >
                  👤 My Account ({customer.name})
                </button>
                <button
                  onClick={logoutCustomer}
                  className="block w-full text-left
                             text-white text-sm px-2 py-1.5"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onLoginClick("login");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left
                             text-white text-sm px-2 py-1.5"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onLoginClick("register");
                    setMenuOpen(false);
                  }}
                  className="block w-full text-left
                             text-white text-sm px-2 py-1.5"
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}
      </div>
      <div
        className="bg-gradient-to-r from-indigo-600
                      to-purple-600 py-2 px-4 text-center"
      >
        <p className="text-white text-sm font-medium min-h-6">
          {displayText}
          <span className="animate-pulse">|</span>
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
                Yeh email seller account ke liye registered hai. Shop page se
                login nahi kar sakte.
              </p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="mt-2 text-purple-600 text-xs
                 font-bold underline"
              >
                Seller Dashboard Mein Login Karein →
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
function OrderModal({ product, shop, onClose }) {
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
        `Product: ${product.name}\n` +
        `Price: ₹${product.price}\n` +
        `Delivery: ${deliveryFee === 0 ? "FREE" : "₹" + deliveryFee}\n` +
        `Total: ₹${total}\n\nPlease confirm!`,
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
                  className="w-full bg-green-500 text-white
                             py-4 rounded-2xl font-bold
                             hover:bg-green-600 transition
                             flex items-center
                             justify-center gap-3"
                >
                  <span className="text-xl">📱</span>
                  <div className="text-left">
                    <p className="font-bold">Order on WhatsApp </p>
                    <p className="text-green-100 text-xs">
                      Deal with the seller directly
                    </p>
                  </div>
                </button>
              )}

              <button
                onClick={() => {
                  if (!customer) {
                    alert("Log in first for a direct order!");
                    return;
                  }
                  setStep("address");
                }}
                className="w-full bg-gradient-to-r
                           from-purple-600 to-indigo-600
                           text-white py-4 pr-3 rounded-2xl
                           font-bold hover:opacity-90 transition
                           flex items-center
                           justify-center gap-3"
              >
                <span className="text-xl"></span>

                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 rounded-2xl shadow-md border border-white/3 w-full">
                  {/* Header Section */}
                  <div className="flex items-center gap-3 mb-4 text-left">
                    <span className="text-xl">🛒</span>
                    <h3 className="text-lg font-bold tracking-wide text-white">
                      Order Now
                    </h3>
                  </div>

                  {/* Content Section */}
                  <div className="space-y-3 text-left">
                    {/* Green Highlighted Text */}
                    <div className="flex items-start gap-2 text-left">
                      <span className="text-emerald-300 text-sm mt-0.5 flex-shrink-0">
                        ✨
                      </span>
                      <p className="text-emerald-300 font-medium text-xs leading-relaxed text-left">
                        We will handle your order with the seller for a
                        hassle-free experience
                      </p>
                    </div>

                    {/* Secondary Info */}
                    <div className="pl-6 text-left">
                      <p className="text-purple-200 text-xs font-semibold tracking-wide">
                        Address + Online Payment
                      </p>
                    </div>
                  </div>
                </div>
              </button>

              {!customer && (
                <p className="text-center text-xs text-gray-400">
                  Login is required for direct orders
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
                    ← Change Address
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
    <div
      className="fixed inset-0 bg-black bg-opacity-60
                    z-50 flex justify-end"
    >
      <div
        className="bg-white w-full md:w-96
                      max-h-screen overflow-y-auto shadow-2xl"
      >
        <div
          className="bg-gradient-to-r from-purple-600
                        to-indigo-600 p-5 text-white"
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xl font-bold">{customer?.name}</p>
              <p className="text-purple-200 text-sm">{customer?.email}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white text-xl w-8 h-8
                         bg-white bg-opacity-20 rounded-full
                         flex items-center justify-center"
            >
              ✕
            </button>
          </div>
        </div>

        <div
          className="flex overflow-x-auto p-3 gap-2
                        border-b bg-gray-50"
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
                          onClick={() => setProfile({ ...profile, gender: g })}
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
                Fabric shop mein better fitting ke liye measurements save karen!
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
                            STATUS_COLORS && STATUS_COLORS[order.orderStatus]
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
                        await axios.delete(`${API_URL}/api/customer/account`, {
                          headers: { Authorization: `Bearer ${customerToken}` },
                        });
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
                    href={`https://wa.me{shop.whatsapp}?text=Hi, I need help.`}
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
  );
}

// ─── Loading Animation ────────────────────
function TryOnAnimation() {
  const MESSAGES = [
    { emoji: "📸", text: "Photo is getting uploaded..." },
    { emoji: "🤖", text: "AI is working..." },
    { emoji: "👗", text: "Cloth is getting fitted..." },
    { emoji: "✨", text: "Style advice is generating..." },
    { emoji: "🎨", text: "Result is getting ready..." },
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIndex((p) => (p === MESSAGES.length - 1 ? 0 : p + 1));
    }, 1800);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70
                    z-50 flex items-center justify-center
                    backdrop-blur-sm"
    >
      <div
        className="bg-white rounded-3xl p-10 text-center
                      shadow-2xl max-w-sm w-full mx-4"
      >
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-100"
          />
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-600
                          border-t-transparent
                          border-r-transparent animate-spin"
          />
          <div
            className="absolute inset-3 rounded-full
                          bg-purple-50 animate-pulse
                          flex items-center justify-center text-4xl"
          >
            {MESSAGES[index].emoji}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          AI Magic is Working!
        </h3>
        <p className="text-purple-600 font-medium animate-pulse">
          {MESSAGES[index].text}
        </p>
        <div className="flex justify-center gap-2 mt-6">
          {MESSAGES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500
                         ${
                           i === index
                             ? "w-6 bg-purple-600"
                             : "w-1.5 bg-gray-200"
                         }`}
            />
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-4">
          It will take 20-30 seconds 😊
        </p>
      </div>
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
      <div
        className="bg-white w-full md:max-w-lg
                      rounded-t-3xl md:rounded-3xl
                      max-h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex justify-between items-center
                p-5 border-b bg-white
                rounded-t-3xl"
        >
          <h2
            className="text-sm font-semibold text-gray-600
                         truncate max-w-xs"
          >
            {product.brandName && (
              <span className="text-purple-600">{product.brandName} · </span>
            )}
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100
                       flex items-center justify-center
                       text-gray-500 flex-shrink-0"
          >
            ✕
          </button>
        </div>

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
                Size Select Karo
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
  );
}

// ─── Try-On Modal ─────────────────────────
function TryOnModal({ product, shop, onClose, selectedProduct }) {
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
      formData.append("garmentUrl", product.imageUrl); // imageUrl sahi hai
      formData.append("description", product.category || "upper_body");

      const res = await axios.post(`${API_URL}/api/tryon`, formData, {
        headers: {
          "x-api-key": shop.apiKey, // ← Yeh hai na?
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
                      className="w-full h-full object-cover"
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
                <p className="text-xs font-medium text-red-700 leading-relaxed">
                  <span className="font-bold">Note:</span> The Try-on feature is
                  currently working only for the upper body!
                </p>
              </div>
            </div>

            {/* Try On Button */}
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
                        ✨Try On Karen!
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
                  <div className="flex-1 flex items-center justify-center p-4 overflow-auto bg-neutral-950 select-none">
                    <img
                      src={tryonResult}
                      alt="Try-on result"
                      style={{
                        transform: `scale(${zoomScale})`,
                        cursor: zoomScale === 1 ? "zoom-in" : "zoom-out",
                      }}
                      onClick={() =>
                        setZoomScale((prev) => (prev === 1 ? 2 : 1))
                      }
                      className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl transition-transform duration-300 ease-out origin-center"
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
                    <div
                      className="bg-gradient-to-t from-black
                        to-transparent px-4 pb-2"
                    >
                      <div
                        className="bg-white bg-opacity-10
                          backdrop-blur-sm rounded-2xl
                          p-4 mb-3"
                      >
                        <p
                          className="text-purple-300 font-bold
                          text-sm mb-2"
                        >
                          ✨ AI Style Advice
                        </p>
                        <p
                          className="text-white text-xs
                          leading-relaxed
                          whitespace-pre-line
                          max-h-24 overflow-y-auto"
                        >
                          {styleAdvice}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div
                    className="bg-black bg-opacity-80
                      px-4 pb-6 pt-2 space-y-2 mt-4"
                  >
                    {shop?.whatsapp && (
                      <a
                        href={`https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(
                          `Hi! Maine try on kiya!\n👗 ${product?.name}\n💰 ₹${product?.price}\n\n Yah order karna hai!`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackOrder(selectedProduct, "whatsapp")}
                        className="block w-full bg-green-500
                       text-white py-4 rounded-2xl
                       font-bold text-center text-base
                       hover:bg-green-600 transition"
                      >
                        📱 Like it ! Order Now
                      </a>
                    )}

                    {shop?.upiId && (
                      <button
                        onClick={() => {
                          trackOrder(product, "upi");
                          navigator.clipboard.writeText(shop.upiId);
                          alert(
                            `UPI: ${shop.upiId}\nAmount: ₹${product?.price}`,
                          );
                        }}
                        className="w-full border-2 border-white
                       border-opacity-30 text-white
                       py-3 rounded-2xl font-semibold
                       hover:bg-white hover:bg-opacity-10
                       transition"
                      >
                        💳 UPI Se Pay Karen
                      </button>
                    )}

                    <button
                      onClick={() => setTryonResult(null)}
                      className="w-full text-gray-400 text-sm
                     py-2 hover:text-white transition"
                    >
                      ← Try again
                    </button>
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
      setProducts(res.data.products);
      console.log("Shop apiKey:", res.data.shop?.apiKey);
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
    </div>
  );
}
