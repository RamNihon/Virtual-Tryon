import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

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
export default function Dashboard() {
  const { seller, token, login, logout } = useAuth();
  const navigate = useNavigate();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [nameMsg, setNameMsg] = useState("");
  const [dashboard, setDashboard] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

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
      setDashboard((prev) =>
        prev ? { ...prev, seller: res.data.seller } : prev,
      );
      setEditingName(false);
      setNameMsg("✅ Name update ho gaya!");
      setTimeout(() => setNameMsg(""), 3000);
    } catch (err) {
      setNameMsg("❌ Error aaya!");
    } finally {
      setNameLoading(false);
    }
  };
  const [productForm, setProductForm] = useState({
    name: "",
    price: "",
    description: "",
    category: "upper_body",
    productUrl: "",
  });
  const [productImage, setProductImage] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productMsg, setProductMsg] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [shopSettings, setShopSettings] = useState({
    whatsapp: "",
    upiId: "",
  });
  const [settingsMsg, setSettingsMsg] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(res.data);
      setShopSettings({
        whatsapp: res.data.seller.whatsapp || "",
        upiId: res.data.seller.upiId || "",
      });
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [token, logout, navigate]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products);
    } catch (err) {
      console.log(err);
    }
  }, [token]);

  useEffect(() => {
    if (!seller || !token) {
      navigate("/login");
      return;
    }
    fetchDashboard();
    fetchProducts();
  }, [seller, token, navigate, fetchDashboard, fetchProducts]);

  const handleAddProduct = async () => {
    const validUrls = imageUrls.filter(
      (url) => url && url.trim().startsWith("http"),
    );

    if (
      !productForm.name ||
      ((!productImage ||
        (Array.isArray(productImage) && productImage.length === 0)) &&
        validUrls.length === 0)
    ) {
      setProductMsg(
        "❌ Name is necessary and Either→ Add product Urls or  Select images!",
      );
      return;
    }

    setProductLoading(true);
    setProductMsg("");

    try {
      const formData = new FormData();

      if (productImage && Array.isArray(productImage)) {
        productImage.forEach((img) => {
          formData.append("productImages", img);
        });
      } else if (productImage) {
        formData.append("productImages", productImage);
      }

      validUrls.forEach((url) => {
        formData.append("imageUrls", url);
      });

      formData.append("name", productForm.name);
      formData.append("price", productForm.price);
      formData.append("description", productForm.description);
      formData.append("category", productForm.category);
      formData.append("productUrl", productForm.productUrl);

      await axios.post(`${API_URL}/api/seller/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProductMsg("✅ Product added successfully!");
      setProductForm({
        name: "",
        price: "",
        description: "",
        category: "upper_body",
        productUrl: "",
      });
      setProductImage(null);
      setImageUrls([""]);
      fetchProducts();
    } catch (err) {
      setProductMsg("❌ Error found!");
    } finally {
      setProductLoading(false);
    }
  };

  const saveShopSettings = async () => {
    try {
      await axios.post(`${API_URL}/api/seller/settings`, shopSettings, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSettingsMsg("✅ It is saved!");
    } catch (err) {
      setSettingsMsg("❌ Error found!");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied! ✅");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center"
      >
        <p className="text-purple-700 text-xl">⏳ Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            👋 Welcome, {seller?.name}!
          </h1>
          <p className="text-gray-500 mt-1">Your seller dashboard</p>
        </div>

        {/* Stats */}
        <div
          className="grid grid-cols-1 md:grid-cols-3
                        gap-6 mb-8"
        >
          {[
            {
              label: "Try-On Used",
              value: dashboard?.seller?.tryonCount || 0,
              sub: `of ${dashboard?.seller?.tryonLimit} limit`,
            },
            {
              label: "Total Products",
              value: dashboard?.totalProducts || 0,
              sub: "products",
            },
            {
              label: "Current Plan",
              value: dashboard?.seller?.plan || "Free",
              sub: "plan",
            },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p
                className="text-3xl font-bold
                            text-purple-700 mt-1 capitalize"
              >
                {stat.value}
              </p>
              <p className="text-gray-400 text-xs mt-1">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {[
            { key: "overview", label: "📊 Overview" },
            { key: "products", label: "👗 Products" },
            { key: "integration", label: "🔌 Integration" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-2 rounded-full 
                         font-medium transition
                         ${
                           activeTab === tab.key
                             ? "bg-purple-700 text-white"
                             : "bg-white text-gray-600 hover:bg-gray-100"
                         }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">📊 Account Overview</h2>

            <div className="space-y-3">
              {[
                { label: "Email", value: seller?.email },
                { label: "Seller ID", value: dashboard?.seller?.sellerId },
                { label: "Plan", value: dashboard?.seller?.plan },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-3 border-b">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium capitalize text-sm">
                    {item.value}
                  </span>
                </div>
              ))}

              {/* Name Edit */}
              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Shop Name</span>
                <div className="flex items-center gap-2">
                  {editingName ? (
                    <>
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="border border-purple-300 rounded-lg
                     px-3 py-1 text-sm focus:outline-none
                     focus:border-purple-500 w-32"
                        placeholder="Enter new name"
                        autoFocus
                      />
                      <button
                        onClick={updateName}
                        disabled={nameLoading}
                        className="bg-gray-100 text-white px-3 py-1
                     rounded-lg text-xs hover:bg-green-300 
                     transition disabled:opacity-50"
                      >
                        <big>{nameLoading ? "..." : "✔️"}</big>
                      </button>
                      <button
                        onClick={() => setEditingName(false)}
                        className="bg-gray-100 text-gray-600 px-3 py-1
                     rounded-lg text-xs hover:bg-red-200"
                      >
                        ❌
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-sm">
                        {seller?.name}
                      </span>
                      <button
                        onClick={() => {
                          setNewName(seller?.name || "");
                          setEditingName(true);
                        }}
                        className="text-purple-600 text-xs
                     hover:text-purple-700 bg-purple-50
                     px-2 py-1 rounded-lg transition"
                      >
                        ✏️ Edit
                      </button>
                    </>
                  )}
                </div>
              </div>
              {nameMsg && <p className="text-sm text-center py-1">{nameMsg}</p>}

              <div className="flex justify-between py-3 border-b">
                <span className="text-gray-500">Shop Link: </span>
                <div className="flex flex-row gap-2 flex-1 min-w-0">
                  <span
                    className="pt-0text-sm text-purple-600 
                   truncate block max-w-xs
                   md:max-w-sm lg:max-w-md"
                  >
                    &nbsp; {dashboard?.shopUrl}
                  </span>
                  <button
                    onClick={() => copyToClipboard(dashboard?.shopUrl)}
                    className="bg-purple-100 text-purple-700
                               px-3 py-1 rounded-full text-xs"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* Shop Settings */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-bold text-lg mb-4">📱 Shop Settings</h3>

              <div className="space-y-3">
                <div>
                  <label
                    className="text-sm text-gray-600 
                                    block mb-1"
                  >
                    WhatsApp Number
                    <span className="text-gray-400 ml-1 text-xs">
                      (Aapke orders yahan aayenge)
                    </span>
                    <p className="text-orange-500 ml-1 mt-0.5 text-xs">
                      (Enter number with 91)
                    </p>
                  </label>
                  <input
                    type="text"
                    placeholder="91XXXXXXXXXX"
                    value={shopSettings.whatsapp}
                    onChange={(e) =>
                      setShopSettings({
                        ...shopSettings,
                        whatsapp: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300
                               rounded-lg px-4 py-2.5 text-sm
                               focus:outline-none
                               focus:border-purple-500"
                  />
                </div>

                <div>
                  <label
                    className="text-sm text-gray-600 
                                    block mb-1"
                  >
                    UPI ID
                    <span className="text-gray-400 ml-1 text-xs">
                      (Payment ke liye)
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="yourname@upi"
                    value={shopSettings.upiId}
                    onChange={(e) =>
                      setShopSettings({
                        ...shopSettings,
                        upiId: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300
                               rounded-lg px-4 py-2.5 text-sm
                               focus:outline-none
                               focus:border-purple-500"
                  />
                </div>

                {settingsMsg && <p className="text-sm">{settingsMsg}</p>}

                <button
                  onClick={saveShopSettings}
                  className="bg-purple-700 text-white
                             px-6 py-2.5 rounded-full
                             text-sm font-semibold
                             hover:bg-green-600 transition"
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === "products" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Add Product */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">➕ Add New Product</h2>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Product naam *"
                  value={productForm.name}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      name: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300
                             rounded-lg px-4 py-2.5 text-sm
                             focus:outline-none
                             focus:border-purple-500"
                />

                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={productForm.price}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      price: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300
                             rounded-lg px-4 py-2.5 text-sm
                             focus:outline-none
                             focus:border-purple-500"
                />

                <select
                  value={productForm.category}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      category: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300
                             rounded-lg px-4 py-2.5 text-sm
                             focus:outline-none
                             focus:border-purple-500"
                >
                  <option value="upper_body">👕 Upper Body</option>
                  <option value="lower_body">👖 Lower Body</option>
                  <option value="dress">👗 Full Dress</option>
                </select>

                {/* <input
                  type="url"
                  placeholder="Product URL (optional)"
                  value={productForm.productUrl}
                  onChange={(e) =>
                    setProductForm({
                      ...productForm,
                      productUrl: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300
                             rounded-lg px-4 py-2.5 text-sm
                             focus:outline-none
                             focus:border-purple-500"
                /> */}

                <div>
                  <label
                    className="text-sm text-gray-600 
                    block mb-1"
                  >
                    Product Photos *
                    <span className="text-gray-400 ml-1">(max 5 photos)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setProductImage(Array.from(e.target.files))
                    }
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-purple-600 mt-1">
                    💡 Tip: Pehli photo front view rakhen! AI try-on ke liye
                    best hai.
                  </p>
                  {productImage && productImage.length > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      ✅ {productImage.length} photo(s) selected
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span className="text-gray-600 text-xs">OR</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <label className="text-sm text-gray-600 block mb-1">
                    <br />
                    Enter Product Image URLs
                    <span className="text-gray-400 text-xs ml-1">(❄️)</span>
                  </label>

                  {imageUrls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={url}
                        onChange={(e) => {
                          const updated = [...imageUrls];
                          updated[index] = e.target.value;
                          setImageUrls(updated);
                        }}
                        className="flex-1 border border-gray-300
                           rounded-lg px-3 py-2 text-sm
                           focus:outline-none
                           focus:border-purple-500"
                      />
                      {imageUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setImageUrls(
                              imageUrls.filter((_, i) => i !== index),
                            )
                          }
                          className="text-red-400 hover:text-red-600
                             text-lg px-2"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}

                  {imageUrls.length < 5 && (
                    <button
                      type="button"
                      onClick={() => setImageUrls([...imageUrls, ""])}
                      className="text-purple-600 text-xs hover:text-purple-700"
                    >
                      + Add more URLs
                    </button>
                  )}
                </div>

                {productMsg && <p className="text-sm">{productMsg}</p>}

                <button
                  onClick={handleAddProduct}
                  disabled={productLoading}
                  className="w-full bg-purple-700 text-white
                             py-3 rounded-full font-semibold
                             hover:bg-purple-800 transition
                             disabled:opacity-50 text-sm"
                >
                  {productLoading
                    ? "⏳ Please wait, the item is uploading..."
                    : "➕ Add the item"}
                </button>
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">
                👗 My Products ({products.length})
              </h2>

              {products.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  There are no any products to show right now.
                </p>
              ) : (
                <div
                  className="space-y-3 max-h-96
                                overflow-y-auto"
                >
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="flex gap-3 items-center
                                 border border-gray-100
                                 rounded-xl p-3"
                    >
                      <DashboardImageSlider
                        images={
                          product.images?.length > 0
                            ? product.images
                            : [product.imageUrl]
                        }
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-purple-600 text-sm">
                          ₹{product.price}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-400 text-xs capitalize">
                            {product.category.replace("_", " ")}
                          </p>
                          {/* Stock Badge */}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full
                     font-medium
                     ${
                       product.inStock !== false
                         ? "bg-green-100 text-green-700"
                         : "bg-red-100 text-red-600"
                     }`}
                          >
                            {product.inStock !== false
                              ? "✅ In Stock"
                              : "❌ Out of Stock"}
                          </span>
                        </div>
                      </div>

                      {/* Stock Toggle */}
                      <div className="flex flex-col gap-1 items-end">
                        <button
                          onClick={async () => {
                            const newStock =
                              product.inStock === false ? true : false;
                            try {
                              await axios.patch(
                                `${API_URL}/api/seller/products/${product._id}/stock`,
                                { inStock: newStock },
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              );
                              fetchProducts();
                            } catch (e) {
                              alert("Error aaya!");
                            }
                          }}
                          className={`text-xs px-2 py-1 rounded-lg
               transition font-medium
               ${
                 product.inStock !== false
                   ? "bg-red-50 text-red-500 hover:bg-red-100"
                   : "bg-green-50 text-green-600 hover:bg-green-100"
               }`}
                        >
                          {product.inStock !== false
                            ? "Mark OOS"
                            : "Mark In Stock"}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={async () => {
                            if (window.confirm("Delete karna hai?")) {
                              await axios.delete(
                                `${API_URL}/api/seller/products/${product._id}`,
                                {
                                  headers: { Authorization: `Bearer ${token}` },
                                },
                              );
                              fetchProducts();
                            }
                          }}
                          className="text-red-500 text-xs
                         hover:text-red-700"
                        >
                          <b>Delete</b>❌
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Integration Tab */}
        {activeTab === "integration" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">🔑 Apki API Key</h2>
              <p className="text-gray-500 text-sm mb-4">
                Keep this key Secret!
              </p>
              <div className="flex gap-3 items-center">
                <code
                  className="bg-gray-100 px-4 py-2
                                 rounded-lg text-sm flex-1
                                 overflow-hidden truncate"
                >
                  {dashboard?.seller?.apiKey}
                </code>
                <button
                  onClick={() => copyToClipboard(dashboard?.seller?.apiKey)}
                  className="bg-purple-700 text-white
                             px-4 py-2 rounded-lg text-sm
                             whitespace-nowrap"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">🔌 Website Par Lagaiye</h2>
              <Link
                to="/widget-guide"
                className="inline-flex items-center gap-2
             bg-purple-100 text-purple-700
             px-4 py-2 rounded-xl text-sm
             font-semibold hover:bg-purple-200
             transition mb-4"
              >
                📖 Read full Guide →
              </Link>

              <p className="text-gray-500 text-sm mb-4">
                <big>⚠️ </big> If script is not working, add a class (
                tryon-product ) to all your products using JavaScript.
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Apni website ke body tag mein paste karen:
              </p>
              <div
                className="bg-gray-900 rounded-xl p-4
                              text-green-400 text-xs
                              font-mono overflow-x-auto
                              max-w-full"
              >
                {dashboard?.widgetCode}
              </div>
              <button
                onClick={() => copyToClipboard(dashboard?.widgetCode)}
                className="mt-3 bg-purple-700 text-white
                           px-6 py-2 rounded-full text-sm"
              >
                Code Copy Karen
              </button>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">
                📱 Agar Website Nahi Hai?
              </h2>
              <p className="text-gray-500 text-md mb-4">
                {" "}
                ➣ Yeh link customer ko share kariye!
              </p>
              <div className="flex gap-3 items-center mb-3">
                <code
                  className="bg-gray-100 px-4 py-2
                                 rounded-lg text-sm flex-1
                                 truncate"
                >
                  {dashboard?.shopUrl}
                </code>
                <button
                  onClick={() => copyToClipboard(dashboard?.shopUrl)}
                  className="bg-green-600 text-white
                             px-4 py-2 rounded-lg text-sm
                             whitespace-nowrap"
                >
                  Copy
                </button>
              </div>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Welcome to my shop! ${dashboard?.shopUrl}`,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="bg-green-500 text-white
                           px-6 py-2 rounded-full text-sm
                           inline-block hover:bg-green-600"
              >
                📱 WhatsApp Par Share Karen
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
