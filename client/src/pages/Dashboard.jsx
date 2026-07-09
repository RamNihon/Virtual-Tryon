// import { useState, useEffect, useCallback } from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SupportBot from "../components/SupportBot";
import API_URL from "../api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import StoreSection from "../components/dashboard/StoreSection";
import GarmentShopSection from "../components/dashboard/GarmentShopSection";
import EditProductModal from "../components/dashboard/EditProductModal";
import GarmentWizard from "../components/dashboard/GarmentWizard/GarmentWizard";
import OrdersSection from "../components/dashboard/Orders/OrdersSection";
import FabricShopSection from "../components/dashboard/FabricShop/FabricShopSection";
import FabricWizard from "../components/dashboard/FabricShop/FabricWizard/FabricWizard";
import IntegrationSection from "../components/dashboard/IntegrationSection";
import BillingSection from "../components/dashboard/BillingSection";
import SettingsSection from "../components/dashboard/SettingsSection";

// eslint-disable-next-line
function DashboardImageSlider({ images, className = "" }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative w-16 h-16 flex-shrink-0 ${className}`.trim()}>
      <img
        src={images[current]}
        alt="product"
        className="w-16 h-16 object-cover rounded-lg"
      />
      {images.length > 1 && (
        <div
          className="absolute inset-0 flex
                        items-center justify-between
                        px-0.5"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
            }}
            className="w-5 h-5 bg-black bg-opacity-50
                       text-white rounded-full text-xs
                       flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
            }}
            className="w-5 h-5 bg-black bg-opacity-50
                       text-white rounded-full text-xs
                       flex items-center justify-center"
          >
            ›
          </button>
        </div>
      )}
      {images.length > 1 && (
        <div
          className="absolute bottom-0.5 left-1/2
                        -translate-x-1/2 flex gap-0.5"
        >
          {images.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all
                         ${
                           i === current
                             ? "w-2 h-1 bg-white"
                             : "w-1 h-1 bg-white opacity-50"
                         }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Fabric Dashboard Component ──────────
export default function Dashboard() {
  const { seller, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState("");
  // const [dashboard, setDashboard] = useState(null);
  // const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [showAddFabricForm, setShowAddFabricForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const updateName = async () => {
    if (!newName.trim()) return;
    setNameLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/api/seller/update-profile`,
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      login(res.data.seller, token);
      // setDashboard((prev) =>
      //   prev ? { ...prev, seller: res.data.seller } : prev,
      // );
      queryClient.invalidateQueries({ queryKey: ["sellerDashboard"] });
      setEditingName(false);
      setNameMsg("✅ Name updated successfully!");
      setTimeout(() => setNameMsg(""), 3000);
    } catch (err) {
      setNameMsg("❌ Error aaya!");
    } finally {
      setNameLoading(false);
    }
  };
  const queryClient = useQueryClient();
  const [shopSettings, setShopSettings] = useState({
    whatsapp: "",
    upiId: "",
  });
  const [settingsMsg, setSettingsMsg] = useState("");
  const [copiedKey, setCopiedKey] = useState("");

  // 1. Login condition check karne ke liye ek alag chota useEffect
  useEffect(() => {
    if (!seller || !token) {
      navigate("/login");
    }
  }, [seller, token, navigate]);

  // 2. Dashboard Stats Query (Tab focus auto-refresh active)
  const { data: dashboardData, isLoading: isDashboardLoading } = useQuery({
    queryKey: ["sellerDashboard", token],
    enabled: !!token && !!seller, // Token hone par hi request chalegi
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/seller/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Aapki shop settings ko update karne ke liye (WhatsApp aur UPI ID)
      if (res.data?.seller) {
        setShopSettings({
          whatsapp: res.data.seller.whatsapp || "",
          upiId: res.data.seller.upiId || "",
        });
      }
      return res.data;
    },
    onError: (err) => {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    },
  });

  // 3. Products List Query (Tab focus auto-refresh active)
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["sellerProducts", token],
    enabled: !!token && !!seller,
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/seller/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.products;
    },
    onError: (err) => {
      console.log("Products fetch error:", err);
    },
  });

  // Purane variables ke naam map karna taaki niche ke JSX/HTML code me koi error na aaye
  const products = productsData || [];
  const loading = isDashboardLoading || isProductsLoading;
  const dashboard = dashboardData || {};
  // eslint-disable-next-line
  const { data: fabricProductsData, isLoading: isFabricLoading } = useQuery({
    queryKey: ["fabricProducts", token],
    enabled: !!token && !!seller,
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/fabric/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.products;
    },
    onError: (err) => {
      console.log("Fabric products fetch error:", err);
    },
  });
  const fabricProducts = fabricProductsData || [];

  const saveShopSettings = async () => {
    try {
      await axios.post(`${API_URL}/api/seller/settings`, shopSettings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettingsMsg("✅ It is saved!");
      queryClient.invalidateQueries({ queryKey: ["sellerDashboard"] });
    } catch (err) {
      setSettingsMsg("❌ Error found!");
    }
  };

  const copyToClipboard = (text, key = "default") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  // Loading Component
  const DashboardSkeleton = () => {
    return (
      <div className="min-h-screen bg-[#fcfbfe] p-6 animate-pulse">
        {/* नैवबार स्केलेटन */}
        <div className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
          <div className="h-8 w-36 bg-gray-200 rounded-lg"></div>
          <div className="flex gap-4">
            <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
            <div className="h-6 w-16 bg-gray-200 rounded-md"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* वेलकम हेडर स्केलेटन */}
          <div className="mb-8">
            <div className="h-8 w-64 bg-gray-200 rounded-lg mb-2"></div>
            <div className="h-4 w-40 bg-gray-200 rounded-md"></div>
          </div>

          {/* 3 टॉप ग्रिड कार्ड्स */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm"
              >
                <div className="h-4 w-32 bg-gray-200 rounded-md mb-4"></div>
                <div className="h-10 w-16 bg-gray-300 rounded-lg mb-3"></div>
                <div className="h-2 w-full bg-gray-100 rounded-full">
                  <div className="h-2 w-2/3 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>

          {/* मिडिल करंट प्लान कार्ड */}
          <div className="w-full md:w-1/3 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6">
            <div className="h-4 w-28 bg-gray-200 rounded-md mb-3"></div>
            <div className="h-8 w-20 bg-purple-200 rounded-md mb-2"></div>
            <div className="h-3 w-24 bg-gray-200 rounded-md"></div>
          </div>

          {/* बड़ा पर्पल एनालिटिक्स डैशबोर्ड बार */}
          <div className="h-24 w-full bg-purple-200/60 rounded-2xl mb-4 flex justify-between items-center p-6">
            <div>
              <div className="h-5 w-48 bg-purple-300/80 rounded-md mb-2"></div>
              <div className="h-4 w-64 bg-purple-200 rounded-md"></div>
            </div>
            <div className="h-8 w-8 bg-purple-300/80 rounded-full"></div>
          </div>

          {/* क्रेडिट हिस्ट्री बार */}
          <div className="h-20 w-full bg-white border border-gray-100 rounded-2xl flex justify-between items-center p-6 shadow-sm">
            <div className="h-5 w-56 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-4 bg-gray-200 rounded-sm"></div>
          </div>
        </div>
      </div>
    );
  };

  // उपयोग करने का तरीका (Your Condition):
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <DashboardLayout activeSection={activeTab} onSectionChange={setActiveTab}>
        {/* Header — only shown on the Dashboard (overview) section */}
        {activeTab === "dashboard" && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              👋 Welcome, {seller?.name}!
            </h1>
            <p className="text-gray-500 mt-1">Your seller dashboard</p>
          </div>
        )}

        {/* Stats + quick links — Dashboard (home) section only.
              These used to render above the old tab-pills on every
              tab; now they belong solely to the home view. */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            {[
              {
                label: "Credits Remaining",
                value: dashboard?.seller?.credits || 0,
                sub: "available credits",
                icon: "💳",
                accent:
                  (dashboard?.seller?.credits || 0) < 50
                    ? "#ef4444"
                    : "#7c3aed",
                glow:
                  (dashboard?.seller?.credits || 0) < 50
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(124,58,237,0.1)",
                bar: true,
                barVal: Math.min(
                  ((dashboard?.seller?.credits || 0) / 100) * 100,
                  100,
                ),
                barColor:
                  (dashboard?.seller?.credits || 0) < 50
                    ? "linear-gradient(90deg,#ef4444,#f97316)"
                    : "linear-gradient(90deg,#7c3aed,#d946ef)",
                highlight: (dashboard?.seller?.credits || 0) < 50,
              },
              {
                label: "This Month Used",
                value: dashboard?.seller?.monthlyCreditsUsed || 0,
                sub: `of ${dashboard?.seller?.monthlyCreditsLimit || 100} limit`,
                icon: "📊",
                accent: "#06b6d4",
                glow: "rgba(6,182,212,0.1)",
                bar: true,
                barVal: Math.min(
                  ((dashboard?.seller?.monthlyCreditsUsed || 0) /
                    (dashboard?.seller?.monthlyCreditsLimit || 100)) *
                    100,
                  100,
                ),
                barColor: "linear-gradient(90deg,#06b6d4,#3b82f6)",
              },
              {
                label: "Total Products",
                value: dashboard?.totalProducts || 0,
                sub: "products added",
                icon: "🏪",
                accent: "#a855f7",
                glow: "rgba(168,85,247,0.1)",
              },
              {
                label: "Current Plan",
                value: (dashboard?.seller?.plan || "Free").toUpperCase(),
                sub: "active plan",
                icon: "👑",
                isPlan: true,
                accent: "#d946ef",
                glow: "rgba(217,70,239,0.12)",
              },
            ].map((stat, i) => (
              <div
                key={i}
                style={{
                  background: `linear-gradient(135deg, #ffffff 60%, ${stat.accent}08 100%)`,
                  borderRadius: "18px",
                  padding: "20px",
                  border: `1px solid ${stat.accent}20`,
                  boxShadow: `0 2px 16px ${stat.glow || "rgba(0,0,0,0.04)"}, 0 0 0 0 transparent`,
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 32px ${stat.glow || "rgba(0,0,0,0.08)"}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 4px 24px ${stat.glow || "rgba(0,0,0,0.05)"}`;
                }}
              >
                {/* Top accent line */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background: stat.isPlan
                      ? "linear-gradient(90deg,#7c3aed,#d946ef)"
                      : stat.highlight
                        ? "linear-gradient(90deg,#ef4444,#f97316)"
                        : `linear-gradient(90deg,${stat.accent},${stat.accent}88)`,
                  }}
                />

                {/* Icon + Label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      width: "34px",
                      height: "34px",
                      background: `${stat.accent}15`,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {stat.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: "#9ca3af",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {stat.label}
                  </span>
                </div>

                {/* Value */}
                <p
                  style={{
                    fontSize: stat.isPlan ? "1.4rem" : "2rem",
                    fontWeight: 900,
                    color: stat.highlight
                      ? "#ef4444"
                      : stat.isPlan
                        ? "#7c3aed"
                        : "#1f2937",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    marginBottom: "4px",
                  }}
                >
                  {stat.value}
                </p>
                {/* Watermark icon — right side faded */}
                <span
                  style={{
                    position: "absolute",
                    right: "14px",
                    bottom: "10px",
                    fontSize: "3.5rem",
                    opacity: 0.07,
                    filter: "grayscale(0.3)",
                    pointerEvents: "none",
                    userSelect: "none",
                    lineHeight: 1,
                  }}
                >
                  {stat.icon}
                </span>

                {/* Sub text */}
                <p
                  style={{
                    fontSize: "0.72rem",
                    color: "#9ca3af",
                    marginBottom: stat.bar ? "12px" : "0",
                  }}
                >
                  {stat.sub}
                </p>

                {/* Progress bar */}
                {stat.bar && (
                  <div
                    style={{
                      background: "#f3f4f6",
                      borderRadius: "999px",
                      height: "5px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${stat.barVal}%`,
                        height: "100%",
                        background: stat.barColor,
                        borderRadius: "999px",
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Low Credits Warning, Monthly Limit Warning, Analytics link,
              and Credit History link — all Dashboard (home) section only. */}
        {activeTab === "dashboard" && (
          <>
            {(dashboard?.seller?.credits || 0) < 50 && (
              <div
                style={{
                  background: "linear-gradient(135deg,#fff5f5,#fff)",
                  border: "1px solid #fecaca",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "#dc2626",
                      fontSize: "0.9rem",
                    }}
                  >
                    ⚠️ Credits Khatam Hone Wale Hain!
                  </p>
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "0.8rem",
                      marginTop: "2px",
                    }}
                  >
                    Sirf {dashboard?.seller?.credits} credits baaki hain. Try-on
                    band ho jayega!
                  </p>
                </div>
                <Link
                  to="/pricing"
                  style={{
                    background: "linear-gradient(135deg,#dc2626,#ef4444)",
                    color: "#fff",
                    padding: "8px 18px",
                    borderRadius: "10px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Top-Up Now →
                </Link>
              </div>
            )}

            {/* Monthly Limit Warning */}
            {(dashboard?.seller?.monthlyCreditsUsed || 0) >=
              (dashboard?.seller?.monthlyCreditsLimit || 100) * 0.9 && (
              <div
                style={{
                  background: "linear-gradient(135deg,#fffbeb,#fff)",
                  border: "1px solid #fed7aa",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "12px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "#d97706",
                      fontSize: "0.9rem",
                    }}
                  >
                    📊 Monthly Limit Almost Reached!
                  </p>
                  <p
                    style={{
                      color: "#f59e0b",
                      fontSize: "0.8rem",
                      marginTop: "2px",
                    }}
                  >
                    {dashboard?.seller?.monthlyCreditsUsed}/
                    {dashboard?.seller?.monthlyCreditsLimit} credits used this
                    month.
                  </p>
                </div>
                <Link
                  to="/pricing"
                  style={{
                    background: "linear-gradient(135deg,#d97706,#f59e0b)",
                    color: "#fff",
                    padding: "8px 18px",
                    borderRadius: "10px",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Plan Upgrade Karen →
                </Link>
              </div>
            )}

            {/* Analytics Link */}
            {seller?.plan.toLowerCase() === "free" && (
              <Link
                to="/analytics"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background:
                    "linear-gradient(270deg, #5b21b6, #7c3aed, #d946ef, #a855f7)",
                  backgroundSize: "300% 300%",
                  animation: "gradientShift 4s ease infinite",
                  borderRadius: "16px",
                  padding: "16px 20px",
                  color: "#fff",
                  textDecoration: "none",
                  marginBottom: "4px",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.25)",
                  transition: "opacity 0.2s",
                }}
              >
                <div>
                  <p style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                    📊 Analytics Dashboard
                  </p>
                  <p
                    style={{
                      color: "#fbbf24",
                      fontSize: "0.8rem",
                      marginTop: "2px",
                    }}
                  >
                    Buy Starter or Pro Plan to get analytics
                  </p>
                </div>
                <span style={{ fontSize: "1.4rem" }}>→</span>
              </Link>
            )}
            {(seller?.plan.toLowerCase() === "pro" ||
              seller?.plan?.toLowerCase() === "elite") && (
              <Link
                to="/analytics"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background:
                    "linear-gradient(270deg, #5b21b6, #7c3aed, #d846ef, #a855f7)",
                  backgroundSize: "300% 300%",
                  animation: "gradientShift 4s ease-in-out infinite",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  color: "#fff",
                  textDecoration: "none",
                  marginBottom: "4px",
                  position: "relative",
                  overflow: "hidden",
                  isolation: "isolate",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow:
                    "0 10px 30px -5px rgba(217, 70, 239, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 10px rgba(0, 0, 0, 0.15)",
                  transition: "all 0.6s cubic-bezier(0.15, 0.85, 0.35, 1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-6px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 25px 50px -12px rgba(217, 70, 239, 0.6), inset 0 1px 3px rgba(255, 255, 255, 0.6), 0 0 30px 2px rgba(216, 180, 254, 0.3)";

                  const glow = e.currentTarget.querySelector(".hyper-glow");
                  if (glow) glow.style.opacity = "1";

                  const arrow = e.currentTarget.querySelector(".premium-arrow");
                  if (arrow)
                    arrow.style.transform = "translateX(8px) scale(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 10px 30px -5px rgba(217, 70, 239, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.4), inset 0 -2px 10px rgba(0, 0, 0, 0.15)";

                  const glow = e.currentTarget.querySelector(".hyper-glow");
                  if (glow) glow.style.opacity = "0";

                  const arrow = e.currentTarget.querySelector(".premium-arrow");
                  if (arrow) arrow.style.transform = "translateX(0) scale(1)";
                }}
              >
                {/* अल्ट्रा प्रीमियम हाइपर-ग्लो लेयर */}
                <div
                  className="hyper-glow"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 50%), radial-gradient(circle at 20% 80%, rgba(6, 182, 212, 0.35) 0%, transparent 60%)",
                    mixBlendMode: "overlay",
                    opacity: 0,
                    transition: "opacity 0.8s ease",
                    zIndex: 1,
                  }}
                />

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    zIndex: 2,
                  }}
                >
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      margin: 0,
                      textShadow:
                        "0 2px 12px rgba(0,0,0,0.2), 0 0 20px rgba(255,255,255,0.2)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    📊 Analytics Dashboard
                  </p>
                  <p
                    style={{
                      color: "#86efac",
                      fontSize: "0.8rem",
                      marginTop: "4px",
                      marginBottom: 0,
                      textShadow: "0 1px 4px rgba(0,0,0,0.15)",
                      fontWeight: "500",
                    }}
                  >
                    See detailed graphs and insights
                  </p>
                </div>

                {/* प्रीमियम ग्लास-सर्किल एरो */}
                <div
                  className="premium-arrow"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "36px",
                    height: "36px",
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "50%",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
                    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                    transition:
                      "transform 0.5s cubic-bezier(0.15, 0.85, 0.35, 1)",
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.2rem",
                      lineHeight: 1,
                      transform: "translateY(-1px)",
                    }}
                  >
                    →
                  </span>
                </div>
              </Link>
            )}

            {/* // Stats cards ke baad: */}
            <Link
              to="/credits"
              className="flex items-center justify-between
             bg-white rounded-2xl p-6 border  {/* p-4.5 से बढ़ाकर p-6 किया ताकि मोटाई बढ़िया लगे */}
             border-gray-100 hover:border-purple-300
             shadow-sm hover:shadow-lg hover:shadow-purple-500/5
             transform hover:-translate-y-0.5
             transition-all duration-500 ease-out group 
             relative overflow-hidden pl-7"
            >
              {/* ⚡ अल्टीमेट होवर इफेक्ट: यह पट्टी होवर करने पर बाएं से दाएं पूरे बटन में रंग भर देगी */}
              <span
                className="absolute left-0 top-0 bottom-0 w-1.5 
                   bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600
                   group-hover:w-full transition-all duration-500 ease-in-out 
                   origin-left opacity-100 group-hover:opacity-100"
              ></span>

              {/* लेफ्ट साइड - आइकॉन और टेक्स्ट (relative z-10 ताकि रंग इसके पीछे भरे, इसके ऊपर नहीं) */}
              <div className="flex items-center gap-4 relative z-10">
                {/* क्रेडिट कार्ड इमोजी - होवर होने पर रंग बदलने के साथ यह थोड़ा सा पॉप होगा */}
                <span className="text-2xl filter drop-shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  💳
                </span>
                <div className="space-y-0.5">
                  {/* टेक्स्ट का रंग होवर होने पर बहुत ही स्मूथली ग्रे से वाइट (White) हो जाएगा */}
                  <p
                    className="font-extrabold text-gray-800 text-sm tracking-wide 
                   group-hover:text-white transition-colors duration-300"
                  >
                    Credit History
                  </p>
                  <p
                    className="text-gray-400 text-xs font-medium leading-normal
                   group-hover:text-purple-100 transition-colors duration-300"
                  >
                    See how the credit balance was consumed
                  </p>
                </div>
              </div>

              {/* राइट side - तीर का निशान जो होवर होने पर वाइट होकर आगे खिसकेगा */}
              <span
                className="text-gray-300 group-hover:text-white
                   transform group-hover:translate-x-1.5
                   transition-all duration-300 text-xl font-bold flex-shrink-0 relative z-10"
              >
                →
              </span>
            </Link>
          </>
        )}

        {/* Overview content — now shown under the "Store Settings"
              sidebar section (was previously the "overview" tab).
              Section key kept as "store" to match the new sidebar. */}
        {activeTab === "store" && (
          <StoreSection
            seller={seller}
            dashboard={dashboard}
            editingName={editingName}
            setEditingName={setEditingName}
            newName={newName}
            setNewName={setNewName}
            nameLoading={nameLoading}
            nameMsg={nameMsg}
            updateName={updateName}
            shopSettings={shopSettings}
            setShopSettings={setShopSettings}
            settingsMsg={settingsMsg}
            saveShopSettings={saveShopSettings}
            onCopy={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}

        {/* Products Tab */}
        {activeTab === "garments" && (
          <>
            {showAddProductForm ? (
              <GarmentWizard
                token={token}
                shopUrl={dashboard?.shopUrl}
                onClose={() => setShowAddProductForm(false)}
                onPublished={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["sellerProducts"],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["sellerDashboard"],
                  });
                }}
              />
            ) : (
              <GarmentShopSection
                products={products}
                onAddNew={() => setShowAddProductForm(true)}
                onEdit={(product) => setEditingProduct(product)}
                onToggleStock={async (product) => {
                  const newStock = product.inStock === false ? true : false;
                  try {
                    await axios.patch(
                      `${API_URL}/api/seller/products/${product._id}/stock`,
                      { inStock: newStock },
                      { headers: { Authorization: `Bearer ${token}` } },
                    );
                    queryClient.invalidateQueries({
                      queryKey: ["sellerProducts"],
                    });
                  } catch (e) {
                    alert("Error aaya!");
                  }
                }}
                onDelete={async (product) => {
                  if (window.confirm("Delete karna hai?")) {
                    await axios.delete(
                      `${API_URL}/api/seller/products/${product._id}`,
                      { headers: { Authorization: `Bearer ${token}` } },
                    );
                    queryClient.invalidateQueries({
                      queryKey: ["sellerProducts"],
                    });
                  }
                }}
              />
            )}
          </>
        )}

        {/* Orders Tab */}
        {activeTab === "orders" && <OrdersSection token={token} />}

        {/* Fabric Tab */}
        {activeTab === "fabric" && (
          <>
            {showAddFabricForm ? (
              <FabricWizard
                token={token}
                shopUrl={
                  dashboard?.shopUrl
                    ? dashboard.shopUrl.replace("/shop/", "/fabric/")
                    : ""
                }
                onClose={() => setShowAddFabricForm(false)}
                onPublished={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["fabricProducts"],
                  });
                }}
              />
            ) : (
              <FabricShopSection
                seller={seller}
                products={fabricProducts}
                onAddNew={() => setShowAddFabricForm(true)}
                onToggleStock={async (product) => {
                  const newStock = product.inStock === false ? true : false;
                  try {
                    await axios.patch(
                      `${API_URL}/api/fabric/products/${product._id}/stock`,
                      { inStock: newStock },
                      { headers: { Authorization: `Bearer ${token}` } },
                    );
                    queryClient.invalidateQueries({
                      queryKey: ["fabricProducts"],
                    });
                  } catch (e) {
                    alert("Error aaya!");
                  }
                }}
                onDelete={async (product) => {
                  if (window.confirm("Delete karna hai?")) {
                    await axios.delete(
                      `${API_URL}/api/fabric/products/${product._id}`,
                      { headers: { Authorization: `Bearer ${token}` } },
                    );
                    queryClient.invalidateQueries({
                      queryKey: ["fabricProducts"],
                    });
                  }
                }}
              />
            )}
          </>
        )}

        {/* Integration Tab */}
        {activeTab === "integration" && (
          <IntegrationSection
            apiKey={dashboard?.seller?.apiKey}
            widgetCode={dashboard?.widgetCode}
            shopUrl={dashboard?.shopUrl}
            onCopy={copyToClipboard}
            copiedKey={copiedKey}
          />
        )}

        {activeTab === "billing" && (
          <BillingSection token={token} seller={seller} dashboard={dashboard} />
        )}

        {activeTab === "settings" && (
          <SettingsSection
            seller={seller}
            token={token}
            editingName={editingName}
            setEditingName={setEditingName}
            newName={newName}
            setNewName={setNewName}
            nameLoading={nameLoading}
            nameMsg={nameMsg}
            updateName={updateName}
            onAccountDeleted={() => {
              logout();
              navigate("/");
            }}
          />
        )}
      </DashboardLayout>

      {/* Edit Product Modal — Phase 3B */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          token={token}
          onClose={() => setEditingProduct(null)}
          onSaved={() => {
            setEditingProduct(null);
            queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
          }}
        />
      )}

      {/* Support Bot */}
      <SupportBot />
    </>
  );
}
