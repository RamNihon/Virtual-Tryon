// import { useState, useEffect, useCallback } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SupportBot from "../components/SupportBot";
import API_URL from "../api";
// eslint-disable-next-line
import { ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardHome from "../components/dashboard/DashboardHome";
import StoreSection from "../components/dashboard/StoreSection";
import GarmentShopSection from "../components/dashboard/GarmentShopSection";
import EditProductModal from "../components/dashboard/EditProductModal";
import NotificationPermissionModal from "../components/NotificationPermissionModal";
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
  // 1. API call se pehle hi check karein ki WhatsApp number sahi hai ya nahi
  // Agar input me text (letters) hoga, toh ye error block chal jayega
  if (shopSettings.whatsapp && isNaN(shopSettings.whatsapp)) {
    setSettingsMsg("❌ Please enter a valid WhatsApp number (numbers only).");
    
    // 4 second baad is error ko bhi gayab kar dete hain
    setTimeout(() => {
      setSettingsMsg("");
    }, 4000);
    
    return; // API call ko yahin rok dega, server par request nahi jayegi
  }

  try {
    // 2. Agar number sahi hai, toh request server par jayegi
    await axios.post(`${API_URL}/api/seller/settings`, shopSettings, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    setSettingsMsg("✔️ It is saved!");
    queryClient.invalidateQueries({ queryKey: ["sellerDashboard"] });
    
    setTimeout(() => {
      setSettingsMsg("");
    }, 3000);

  } catch (err) {
    // 3. Agar backend se koi aur error aata hai (jaise duplicate shop name)
    const exactErrorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
    
    setSettingsMsg(`❌ ${exactErrorMessage}`);
    
    setTimeout(() => {
      setSettingsMsg("");
    }, 4000);
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
      <DashboardLayout
        activeSection={activeTab}
        onSectionChange={setActiveTab}
      >
        {/* Header — only shown on the Dashboard (overview) section */}
          {activeTab === "dashboard" && (
            <DashboardHome seller={seller} dashboard={dashboard} />
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
                    queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
                    queryClient.invalidateQueries({ queryKey: ["sellerDashboard"] });
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
                    queryClient.invalidateQueries({ queryKey: ["fabricProducts"] });
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
                      queryClient.invalidateQueries({ queryKey: ["fabricProducts"] });
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
                      queryClient.invalidateQueries({ queryKey: ["fabricProducts"] });
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

      {/* Notification soft-ask — shows once per week at most,
          only when the browser has never been asked before */}
      <NotificationPermissionModal seller={seller} token={token} />

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