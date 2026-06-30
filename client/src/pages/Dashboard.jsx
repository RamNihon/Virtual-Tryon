// import { useState, useEffect, useCallback } from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import SupportBot from "../components/SupportBot";
import API_URL from "../api";
import { ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

function SellerOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/seller/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const [shippedDialog, setShippedDialog] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(null);
  const [shippedForm, setShippedForm] = useState({
    logistics: "",
    trackingId: "",
  });
  const [cancelReason, setCancelReason] = useState("");

  const LOGISTICS = [
    "Delhivery",
    "Blue Dart",
    "DTDC",
    "Ekart Logistics",
    "Xpressbees",
    "Shadowfax",
    "Dunzo",
    "Porter",
    "Amazon Logistics",
    "FedEx",
    "Speed Post",
    "Other",
  ];

  const updateStatus = async (orderId, status, extra = {}) => {
    try {
      await axios.patch(
        `${API_URL}/api/seller/orders/${orderId}/status`,
        {
          status,
          message: getStatusMessage(status),
          ...extra,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
      setShippedDialog(null);
      setCancelDialog(null);
      setShippedForm({ logistics: "", trackingId: "" });
      setCancelReason("");
    } catch (e) {
      alert("Error!");
    }
  };

  const getStatusMessage = (status) => {
    const messages = {
      accepted: "Order accepted by seller!",
      packed: "Order has been packed.",
      shipped: "Order has been shipped.",
      out_for_delivery: "Out for delivery!",
      delivered: "Order delivered successfully!",
      cancelled: "Order cancelled.",
    };
    return messages[status] || `Order ${status}`;
  };

  const statusColors = {
    placed: "bg-blue-100 text-blue-700",
    accepted: "bg-purple-100 text-purple-700",
    packed: "bg-yellow-100 text-yellow-700",
    shipped: "bg-orange-100 text-orange-700",
    out_for_delivery: "bg-indigo-100 text-indigo-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  if (loading)
    return <p className="text-center py-8 text-gray-400">Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        📦 Customer Orders ({orders.length})
      </h2>
      {orders.length === 0 ? (
        <div
          className="text-center py-10 bg-white
                        rounded-2xl border border-gray-100"
        >
          <div className="text-4xl mb-2">📦</div>
          <p className="text-gray-400">Abhi koi order nahi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border
                         border-gray-100 overflow-hidden"
            >
              <div
                className="bg-gray-50 px-4 py-3
                              flex flex-wrap gap-2
                              justify-between items-center"
              >
                <div>
                  <p className="font-bold text-sm">#{order.orderId}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span
                    className={`text-xs px-2 py-1
                                   rounded-full font-medium
                                   ${
                                     order.paymentStatus === "paid"
                                       ? "bg-green-100 text-green-700"
                                       : "bg-yellow-100 text-yellow-700"
                                   }`}
                  >
                    {order.paymentStatus === "paid" ? "💰 Paid" : "⏳ Pending"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1
                                   rounded-full font-medium capitalize
                                   ${statusColors[order.orderStatus] || "bg-gray-100"}`}
                  >
                    {order.orderStatus?.replace("_", " ")}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex gap-3 mb-3">
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="w-14 h-14 object-contain
                               rounded-xl bg-gray-50 border"
                  />
                  <div>
                    <p className="font-medium text-sm">{order.productName}</p>
                    <p className="text-purple-600 font-bold">
                      ₹{order.totalAmount}
                    </p>
                    <p className="text-xs text-gray-400">
                      Delivery:{" "}
                      {order.deliveryFee === 0
                        ? "FREE"
                        : `₹${order.deliveryFee}`}
                    </p>
                  </div>
                </div>

                {order.customer && (
                  <div className="bg-blue-50 rounded-xl p-3 mb-3">
                    <p className="font-medium text-blue-800 text-sm">
                      👤 {order.customer.name}
                    </p>
                    <p className="text-blue-600 text-xs">
                      📱 {order.customer.mobile}
                    </p>
                  </div>
                )}

                {order.address && (
                  <div
                    className="bg-gray-50 rounded-xl p-3 mb-3
                                  text-xs text-gray-600"
                  >
                    <p className="font-medium">📍 {order.address.fullName}</p>
                    <p>
                      {order.address.addressLine1},{order.address.city} -{" "}
                      {order.address.pincode}
                    </p>
                    <p>📱 {order.address.mobile}</p>
                  </div>
                )}

                <div>
                  <p
                    className="text-xs font-medium
                text-gray-500 mb-2"
                  >
                    Update Order Status:
                  </p>
                  {/* Status Flow */}
                  {(() => {
                    const SEQ = [
                      "placed",
                      "accepted",
                      "packed",
                      "shipped",
                      "out_for_delivery",
                      "delivered",
                    ];
                    const currentIdx = SEQ.indexOf(order.orderStatus);
                    const isCancelled = order.orderStatus === "cancelled";

                    if (isCancelled) {
                      return (
                        <div className="bg-red-50 rounded-xl px-4 py-3">
                          <p className="text-red-600 text-sm font-semibold">
                            ❌ Order Cancelled
                          </p>
                          {order.cancelReason && (
                            <p className="text-red-400 text-xs mt-0.5">
                              {order.cancelReason}
                            </p>
                          )}
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-wrap gap-2">
                        {[
                          { v: "accepted", l: "✅ Accept" },
                          { v: "packed", l: "📦 Packed" },
                          { v: "shipped", l: "🚚 Ship" },
                          { v: "out_for_delivery", l: "🛵 OFD" },
                          { v: "delivered", l: "✅ Delivered" },
                          { v: "cancelled", l: "❌ Cancel" },
                        ].map((opt) => {
                          const optIdx = SEQ.indexOf(opt.v);
                          const isCurrentStatus = order.orderStatus === opt.v;
                          const isDone =
                            optIdx <= currentIdx && opt.v !== "cancelled";
                          const isNext = optIdx === currentIdx + 1;
                          const isCancel = opt.v === "cancelled";

                          // Disable conditions
                          const isDisabled =
                            (!isNext && !isCancel) ||
                            (isCancel && currentIdx >= 4); // Can't cancel if OFD or delivered

                          return (
                            <button
                              key={opt.v}
                              onClick={() => {
                                if (isDisabled) return;
                                if (opt.v === "shipped") {
                                  setShippedDialog(order._id);
                                } else if (opt.v === "cancelled") {
                                  setCancelDialog(order._id);
                                } else {
                                  updateStatus(order._id, opt.v);
                                }
                              }}
                              disabled={isDisabled}
                              className={`text-xs px-3 py-1.5 rounded-xl
                       font-medium transition border
                       ${
                         isCurrentStatus
                           ? "bg-purple-600 text-white border-purple-600"
                           : isDone
                             ? "bg-gray-100 text-gray-400 border-gray-100 line-through cursor-not-allowed"
                             : isNext
                               ? isCancel
                                 ? "border-red-300 text-red-500 hover:bg-red-50"
                                 : "border-purple-300 text-purple-600 hover:bg-purple-50 font-bold"
                               : isDisabled
                                 ? "border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                                 : "border-gray-200 text-gray-600 hover:bg-gray-50"
                       }`}
                            >
                              {opt.l}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                  {/* Shipped Dialog */}
                  {shippedDialog === order._id && (
                    <div
                      className="mt-3 bg-blue-50 rounded-xl p-4
                  border border-blue-100"
                    >
                      <p
                        className="font-semibold text-blue-800
                  text-sm mb-3"
                      >
                        🚚 Shipping Details
                      </p>
                      <div className="space-y-2">
                        <select
                          value={shippedForm.logistics}
                          onChange={(e) =>
                            setShippedForm({
                              ...shippedForm,
                              logistics: e.target.value,
                            })
                          }
                          className="w-full border border-blue-200
                   rounded-xl px-3 py-2.5 text-sm
                   bg-white focus:outline-none
                   focus:border-blue-500"
                        >
                          <option value="">Select a Logistics Partner *</option>
                          {LOGISTICS.map((l) => (
                            <option key={l} value={l}>
                              {l}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Tracking ID *"
                          value={shippedForm.trackingId}
                          onChange={(e) =>
                            setShippedForm({
                              ...shippedForm,
                              trackingId: e.target.value,
                            })
                          }
                          className="w-full border border-blue-200
                   rounded-xl px-3 py-2.5 text-sm
                   focus:outline-none
                   focus:border-blue-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (
                                !shippedForm.logistics ||
                                !shippedForm.trackingId
                              ) {
                                alert(
                                  "Logistics and tracking ID are required for all shipments!",
                                );
                                return;
                              }
                              updateStatus(order._id, "shipped", {
                                logistics: shippedForm.logistics,
                                trackingId: shippedForm.trackingId,
                                message: `Shipped via ${shippedForm.logistics}. Tracking: ${shippedForm.trackingId}`,
                              });
                            }}
                            className="flex-1 bg-blue-600 text-white
                     py-2.5 rounded-xl text-sm font-bold
                     hover:bg-blue-700 transition"
                          >
                            ✅ Confirm Ship
                          </button>
                          <button
                            onClick={() => setShippedDialog(null)}
                            className="px-4 border border-gray-200
                     rounded-xl text-sm text-gray-600
                     hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancel Dialog */}
                  {cancelDialog === order._id && (
                    <div
                      className="mt-3 bg-red-50 rounded-xl p-4
                  border border-red-100"
                    >
                      <p
                        className="font-semibold text-red-800
                  text-sm mb-3"
                      >
                        ❌ Cancel Reason
                      </p>
                      <div className="space-y-2">
                        {[
                          "Out of stock",
                          "Cannot deliver to location",
                          "Customer not reachable",
                          "Fraudulent order",
                          "Other",
                        ].map((reason) => (
                          <label
                            key={reason}
                            className="flex items-center gap-2
                     cursor-pointer"
                          >
                            <input
                              type="radio"
                              name={`cancel_${order._id}`}
                              value={reason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="text-red-500"
                            />
                            <span className="text-sm text-gray-700">
                              {reason}
                            </span>
                          </label>
                        ))}
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => {
                              if (!cancelReason) {
                                alert("Reason select karo!");
                                return;
                              }
                              updateStatus(order._id, "cancelled", {
                                cancelReason,
                                message: `Cancelled: ${cancelReason}`,
                              });
                            }}
                            className="flex-1 bg-red-500 text-white
                     py-2.5 rounded-xl text-sm font-bold
                     hover:bg-red-600 transition"
                          >
                            Confirm Cancel
                          </button>
                          <button
                            onClick={() => setCancelDialog(null)}
                            className="px-4 border border-gray-200
                     rounded-xl text-sm text-gray-600
                     hover:bg-gray-50"
                          >
                            Back
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
function FabricDashboard({ token, seller }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMsg, setAddMsg] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // eslint-disable-next-line
  const [generatingFor, setGeneratingFor] = useState(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    pricePerMeter: "",
    fabricType: "",
    description: "",
    availableGarments: [],
    brand: "",
    material: "",
    occasion: "any",
    pattern: "solid",
    colors: [],
  });

  const COLOR_OPTIONS = [
    { value: "Red", hex: "#EF4444" },
    { value: "Blue", hex: "#3B82F6" },
    { value: "Green", hex: "#22C55E" },
    { value: "Yellow", hex: "#EAB308" },
    { value: "Orange", hex: "#F97316" },
    { value: "Purple", hex: "#A855F7" },
    { value: "Pink", hex: "#EC4899" },
    { value: "Black", hex: "#1F2937" },
    { value: "White", hex: "#F9FAFB" },
    { value: "Grey", hex: "#9CA3AF" },
    { value: "Brown", hex: "#92400E" },
    { value: "Cream", hex: "#FEF3C7" },
    { value: "Navy", hex: "#1E3A5F" },
    { value: "Maroon", hex: "#7F1D1D" },
    { value: "Teal", hex: "#0D9488" },
    { value: "Gold", hex: "#D97706" },
    { value: "Silver", hex: "#CBD5E1" },
    { value: "Multi", hex: "linear-gradient(135deg,#EF4444,#3B82F6,#22C55E)" },
  ];

  const toggleColor = (color) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };
  const [fabricImages, setFabricImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const GARMENT_OPTIONS = [
    { value: "shirt_full", label: "👔 Full Sleeve Shirt" },
    { value: "shirt_half", label: "👕 Half Sleeve Shirt" },
    { value: "pant", label: "👖 Formal Pant" },
    { value: "kurta", label: "🪭 Kurta" },
    { value: "salwar_suit", label: "👗 Salwar Suit" },
    { value: "kurti", label: "👘 Kurti" },
    { value: "saree", label: "🥻 Saree" },
  ];

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/fabric/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFabricImages(files);
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const toggleGarment = (value) => {
    setForm((prev) => ({
      ...prev,
      availableGarments: prev.availableGarments.includes(value)
        ? prev.availableGarments.filter((g) => g !== value)
        : [...prev.availableGarments, value],
    }));
  };

  const handleAddProduct = async () => {
    // Field-specific validation
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Fabric name is necessary";
    if (!form.price) newErrors.price = "Price is required ";
    if (!form.pricePerMeter)
      newErrors.pricePerMeter = "Price per meter is required";
    if (!form.description.trim())
      newErrors.description = "Description is necessary";
    if (form.colors.length === 0)
      newErrors.colors = "Select at least one color";
    if (fabricImages.length === 0)
      newErrors.images = "Fabric photo is necessary";
    if (form.availableGarments.length === 0)
      newErrors.garments = "Choose Garment type";

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setAddMsg("");
      return;
    }

    setFieldErrors({});
    setAddLoading(true);
    setAddMsg("");
    try {
      const formData = new FormData();
      fabricImages.forEach((img) => formData.append("fabricImages", img));
      formData.append("name", form.name);
      formData.append("price", form.price);
      formData.append("pricePerMeter", form.pricePerMeter);
      formData.append("fabricType", form.fabricType);
      formData.append("description", form.description);
      form.availableGarments.forEach((g) =>
        formData.append("availableGarments", g),
      );
      // Naye fields add karo
      formData.append("brand", form.brand);
      formData.append("material", form.material);
      formData.append("occasion", form.occasion);
      formData.append("pattern", form.pattern);
      formData.append("colors", JSON.stringify(form.colors));

      await axios.post(`${API_URL}/api/fabric/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setAddMsg("✅ Fabric product added successfully!");
      setShowAddForm(false);
      setForm({
        name: "",
        price: "",
        pricePerMeter: "",
        fabricType: "",
        description: "",
        availableGarments: [],
        brand: "",
        material: "",
        occasion: "any",
        pattern: "solid",
        colors: [],
      });
      setFabricImages([]);
      setImagePreviews([]);
      fetchProducts();
    } catch (e) {
      setAddMsg("❌ Error: " + (e.response?.data?.message || e.message));
    } finally {
      setAddLoading(false);
    }
  };

  // Plan check
  const isPlanAllowed =
    seller?.plan.toLowerCase() === "pro" ||
    seller?.plan.toLowerCase() === "elite";

  if (!isPlanAllowed) {
    return (
      <div
        className="bg-white rounded-3xl p-10 text-center
                      border border-gray-100"
      >
        <div className="text-6xl mb-4">🧵</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Fabric Shop - Pro/Elite Only
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Upload unstitched fabric, AI designs the stitched garment, and
          customers try it on!
        </p>
        <Link
          to="/pricing"
          className="bg-gradient-to-r from-purple-600
                     to-indigo-600 text-white px-8 py-3
                     rounded-2xl font-bold hover:opacity-90
                     transition inline-block"
        >
          🚀 Buy Pro Plan!
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="flex items-center justify-between
                      flex-wrap gap-3"
      >
        <div>
          <h2 className="text-2xl font-bold text-gray-800">🧵 Fabric Shop</h2>
          <p className="text-gray-400 text-sm">
            Unstitched fabric → AI stitched garment
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-purple-600
                     to-indigo-600 text-white px-5 py-2.5
                     rounded-2xl font-bold hover:opacity-90
                     transition flex items-center gap-2"
        >
          {showAddForm ? "✕ Cancel" : "+ Add Fabric"}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div
          className="bg-gradient-to-br from-purple-50
                        to-indigo-50 rounded-3xl p-6
                        border border-purple-100"
        >
          <h3 className="font-bold text-gray-800 text-lg mb-5">
            ➕ Add New Fabric Product
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                Fabric Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="German Silk, Premium Khadi Cotton, Pure Banarasi Silk..."
                value={form.name}
                onChange={(e) => {
                  setForm({ ...form, name: e.target.value });
                  if (fieldErrors.name)
                    setFieldErrors((p) => ({ ...p, name: "" }));
                }}
                className={`w-full rounded-xl px-4 py-2.5 text-sm
             focus:outline-none transition border
             ${
               fieldErrors.name
                 ? "border-red-400 bg-red-50 focus:border-red-500"
                 : "border-purple-200 bg-white focus:border-purple-500"
             }`}
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠️ {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                Fabric Type
              </label>
              <input
                type="text"
                placeholder="Like: Denim, Jersey, Muslin, Linen..."
                value={form.fabricType}
                onChange={(e) =>
                  setForm({
                    ...form,
                    fabricType: e.target.value,
                  })
                }
                className="w-full border border-purple-200
                           bg-white rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                Total Fabric Bundle Price (₹){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Total bundle price"
                value={form.price}
                onChange={(e) => {
                  setForm({ ...form, price: e.target.value });
                  if (fieldErrors.price)
                    setFieldErrors((p) => ({ ...p, price: "" }));
                }}
                className={`w-full rounded-xl px-4 py-2.5 text-sm
             focus:outline-none transition border
             ${
               fieldErrors.price
                 ? "border-red-400 bg-red-50 focus:border-red-500"
                 : "border-purple-200 bg-white focus:border-purple-500"
             }`}
              />
              {fieldErrors.price && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠️ {fieldErrors.price}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Price per Meter (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                placeholder="Per meter price"
                value={form.pricePerMeter}
                onChange={(e) => {
                  setForm({ ...form, pricePerMeter: e.target.value });
                  if (fieldErrors.pricePerMeter) {
                    setFieldErrors((p) => ({ ...p, pricePerMeter: "" }));
                  }
                }}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition border
      ${
        fieldErrors.pricePerMeter
          ? "border-red-400 bg-red-50 focus:border-red-500"
          : "border-purple-200 bg-white focus:border-purple-500"
      }`}
              />
              {fieldErrors.pricePerMeter && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠️ {fieldErrors.pricePerMeter}
                </p>
              )}
            </div>

            {/* <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                You can fill any of Price fields , as per your wish (₹)
              </label>
            </div> */}
          </div>

          <div className="mt-4">
            <label
              className="text-sm font-medium
                              text-gray-700 block mb-1.5"
            >
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              rows={2}
              placeholder="Fabric ke baare mein likhen..."
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                if (fieldErrors.description)
                  setFieldErrors((p) => ({ ...p, description: "" }));
              }}
              className={`w-full rounded-xl px-4 py-2.5 text-sm
             focus:outline-none resize-none transition border
             ${
               fieldErrors.description
                 ? "border-red-400 bg-red-50 focus:border-red-500"
                 : "border-purple-200 bg-white focus:border-purple-500"
             }`}
            />

            {fieldErrors.description && (
              <p className="text-red-500 text-xs mt-1">
                ⚠️ {fieldErrors.description}
              </p>
            )}

            {/* Color Selection */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                🎨 Available Colors
              </label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => toggleColor(color.value)}
                    title={color.value}
                    className={`w-8 h-8 rounded-full border-4 transition-all
                   ${
                     form.colors.includes(color.value)
                       ? "border-purple-600 scale-110"
                       : "border-transparent hover:border-gray-300"
                   }`}
                    style={{
                      background: color.hex.startsWith("linear")
                        ? color.hex
                        : color.hex,
                    }}
                  >
                    {form.colors.includes(color.value) && (
                      <span
                        className="text-xs text-white font-bold
                           drop-shadow-md"
                      >
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
              {form.colors.length > 0 && (
                <p className="text-xs text-purple-600 mt-1">
                  Selected: {form.colors.join(", ")}
                </p>
              )}
            </div>
            {fieldErrors.colors && (
              <p className="text-red-500 text-xs mt-1">
                ⚠️ {fieldErrors.colors}
              </p>
            )}

            {/* Brand + Material */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  🏷️ Brand Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Raymond, Grasim, Siyaram..."
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full border border-purple-200 bg-white
                 rounded-xl px-3 py-2 text-sm
                 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  🧶 Material
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cotton, Wool, Silk, Nylon, Polyester"
                  value={form.material}
                  onChange={(e) =>
                    setForm({ ...form, material: e.target.value })
                  }
                  className="w-full border border-purple-200 bg-white
                 rounded-xl px-3 py-2 text-sm
                 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Occasion + Pattern */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  🎭 Occasion
                </label>
                <select
                  value={form.occasion}
                  onChange={(e) =>
                    setForm({ ...form, occasion: e.target.value })
                  }
                  className="w-full border border-purple-200 bg-white
                 rounded-xl px-3 py-2 text-sm
                 focus:outline-none focus:border-purple-500"
                >
                  <option value="any">Any / All</option>
                  <option value="casual">👕 Casual</option>
                  <option value="formal">👔 Formal</option>
                  <option value="wedding">💍 Wedding</option>
                  <option value="festival">🪔 Festival</option>
                  <option value="party">🎉 Party</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  🔷 Pattern
                </label>
                <select
                  value={form.pattern}
                  onChange={(e) =>
                    setForm({ ...form, pattern: e.target.value })
                  }
                  className="w-full border border-purple-200 bg-white
                 rounded-xl px-3 py-2 text-sm
                 focus:outline-none focus:border-purple-500"
                >
                  <option value="solid">⬛ Solid</option>
                  <option value="stripes">〓 Stripes</option>
                  <option value="checks">▦ Checks</option>
                  <option value="floral">🌸 Floral</option>
                  <option value="geometric">🔷 Geometric</option>
                  <option value="printed">🖨️ Printed</option>
                  <option value="other">✨ Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Garment Types */}
          <div className="mt-4">
            <label
              className="text-sm font-medium
                              text-gray-700 block mb-2"
            >
              Available Garment Types * (multiple select)
            </label>
            <div className="flex flex-wrap gap-2">
              {GARMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleGarment(opt.value)}
                  className={`px-4 py-2 rounded-xl text-sm
                             font-medium transition border-2
                             ${
                               form.availableGarments.includes(opt.value)
                                 ? "bg-purple-600 text-white border-purple-600"
                                 : "bg-white text-gray-600 border-gray-200 hover:border-purple-300"
                             }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {fieldErrors.garments && (
            <p className="text-red-500 text-xs mt-1">
              ⚠️ {fieldErrors.garments}
            </p>
          )}

          {/* Fabric Images */}
          <div className="mt-4">
            <label
              className="text-sm font-medium
                              text-gray-700 block mb-1.5"
            >
              Fabric Photos * (max 5)
            </label>
            <label
              className="flex items-center gap-3
                              border-2 border-dashed
                              border-purple-200 rounded-2xl p-4
                              cursor-pointer hover:border-purple-400
                              transition bg-white"
            >
              <span className="text-3xl">🧵</span>
              <div>
                <p className="font-medium text-gray-700 text-sm">
                  Fabric photos select karen
                </p>
                <p className="text-gray-400 text-xs">
                  Flat lay photo best hoti hai!
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {imagePreviews.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    className="w-20 h-20 object-cover
                               rounded-xl border-2 border-purple-200"
                  />
                ))}
              </div>
            )}
          </div>
          {fieldErrors.images && (
            <p className="text-red-500 text-xs mt-1">⚠️ {fieldErrors.images}</p>
          )}

          {addMsg && <p className="mt-3 text-sm">{addMsg}</p>}

          <button
            onClick={handleAddProduct}
            disabled={addLoading}
            className="mt-5 bg-gradient-to-r from-purple-600
                       to-indigo-600 text-white px-8 py-3
                       rounded-2xl font-bold hover:opacity-90
                       transition disabled:opacity-50 w-full"
          >
            {addLoading ? "⏳ Adding..." : "✅ Add Fabric Product"}
          </button>
        </div>
      )}

      {/* Products List */}
      {loading ? (
        <p className="text-center text-gray-400 py-8">Loading...</p>
      ) : products.length === 0 ? (
        <div
          className="bg-white rounded-3xl p-10 text-center
                        border border-gray-100"
        >
          <div className="text-5xl mb-3">🧵</div>
          <p className="text-gray-400">
            There is no fabric product. Please add it!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-3xl overflow-hidden
                         border border-gray-100 shadow-sm
                         hover:shadow-md transition-all"
            >
              {/* Fabric Image */}
              <div className="relative h-64 bg-gray-50">
                <img
                  src={product.fabricImageUrl}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-xs px-2 py-1
                                   rounded-full font-medium
                                   ${
                                     product.inStock
                                       ? "bg-green-100 text-green-700"
                                       : "bg-red-100 text-red-600"
                                   }`}
                  >
                    {product.inStock ? "✅ In Stock" : "❌ OOS"}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-800 text-lg">
                  {product.name}
                </h3>
                {product.fabricType && (
                  <p className="text-gray-400 text-xs mb-2">
                    {product.fabricType}
                  </p>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-purple-600 font-black text-xl">
                    ₹{product.price}
                  </span>
                  {product.pricePerMeter > 0 && (
                    <span className="text-gray-400 text-xs">
                      ₹{product.pricePerMeter}/meter
                    </span>
                  )}
                </div>

                {/* Available Garments */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.availableGarments?.map((g) => (
                    <span
                      key={g}
                      className="text-xs bg-purple-50
                                 text-purple-700 px-2 py-1
                                 rounded-lg font-medium"
                    >
                      {GARMENT_OPTIONS.find((o) => o.value === g)?.label || g}
                    </span>
                  ))}
                </div>

                {/* Generated Previews */}
                {product.generatedPreviews?.length > 0 && (
                  <div className="mb-4">
                    <p
                      className="text-xs font-medium
                                  text-gray-500 mb-2"
                    >
                      AI Generated Previews:
                    </p>
                    <div className="flex gap-2 overflow-x-auto">
                      {product.generatedPreviews.map((prev, i) => (
                        <div key={i} className="flex-shrink-0 text-center">
                          <img
                            src={prev.imageUrl}
                            alt={prev.garmentType}
                            className="w-16 h-20 object-cover
                                       rounded-xl border border-gray-100"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            {
                              GARMENT_OPTIONS.find(
                                (o) => o.value === prev.garmentType,
                              )?.label?.split(" ")[0]
                            }
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await axios.patch(
                        `${API_URL}/api/fabric/products/${product._id}/stock`,
                        { inStock: !product.inStock },
                        { headers: { Authorization: `Bearer ${token}` } },
                      );
                      fetchProducts();
                    }}
                    className={`flex-1 py-2 rounded-xl text-xs
                               font-semibold transition border
                               ${
                                 product.inStock
                                   ? "border-red-200 text-red-500 hover:bg-red-50"
                                   : "border-green-200 text-green-600 hover:bg-green-50"
                               }`}
                  >
                    {product.inStock ? "Mark OOS" : "Mark In Stock"}
                  </button>
                  <button
                    onClick={async () => {
                      if (!window.confirm("Delete?")) return;
                      await axios.delete(
                        `${API_URL}/api/fabric/products/${product._id}`,
                        { headers: { Authorization: `Bearer ${token}` } },
                      );
                      fetchProducts();
                    }}
                    className="px-3 py-2 rounded-xl text-xs
                               font-semibold text-red-400
                               hover:bg-red-50 transition border
                               border-red-100"
                  >
                    🗑️Delete
                  </button>
                </div>
              </div>
            </div>
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
  // const [dashboard, setDashboard] = useState(null);
  // const [products, setProducts] = useState([]);
  // const [loading, setLoading] = useState(true);
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
  const [productForm, setProductForm] = useState({
    name: "",
    brandName: "",
    price: "",
    originalPrice: "",
    description: "",
    category: "upper_body",
    productUrl: "",
    sizes: [],
    highlights: {},
    seqImages: [],
  });
  // const [productImage, setProductImage] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [productMsg, setProductMsg] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);
  const [productFieldErrors, setProductFieldErrors] = useState({});
  const queryClient = useQueryClient();
  const [shopSettings, setShopSettings] = useState({
    whatsapp: "",
    upiId: "",
  });
  const [settingsMsg, setSettingsMsg] = useState("");
  const [copied, setCopied] = useState(false);

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

  const handleAddProduct = async () => {
    // Pehle errors clear karo
    setProductFieldErrors({});
    setProductMsg("");

    // Sequence images check
    const seqImgs = (productForm.seqImages || []).filter(Boolean);
    const validUrls = (imageUrls || []).filter(
      (url) => url && url.startsWith("http"),
    );
    const totalImages = seqImgs.length + validUrls.length;

    // ── Frontend field-specific validation ──────────────────────
    const errors = {};

    if (!productForm.name || productForm.name.trim().length < 2) {
      errors.name = "Product name must be at least 2 characters long!";
    }
    const priceVal = parseFloat(productForm.price);
    if (!productForm.price || isNaN(priceVal) || priceVal <= 0) {
      errors.price = "Please enter a valid price greater than 0!";
    }
    if (
      !productForm.description ||
      productForm.description.trim().length < 20
    ) {
      errors.description = "Description must be at least 20 characters long!";
    }
    if (totalImages < 2) {
      errors.images = "❌ You need to upload a minimum of 2 photos!";
    }

    if (Object.keys(errors).length > 0) {
      setProductFieldErrors(errors);
      return;
    }
    // ─────────────────────────────────────────────────────────────

    setProductLoading(true);

    try {
      const formData = new FormData();

      seqImgs.forEach((img) => {
        if (img) formData.append("productImages", img);
      });
      validUrls.forEach((url) => {
        formData.append("imageUrls", url);
      });

      formData.append("name", productForm.name);
      formData.append("brandName", productForm.brandName || "");
      formData.append("description", productForm.description || "");
      formData.append("price", productForm.price);
      formData.append("originalPrice", productForm.originalPrice || 0);
      formData.append("category", productForm.category);
      formData.append("productUrl", productForm.productUrl || "");

      const sizes = productForm.sizes || [];
      formData.append("sizes", JSON.stringify(sizes));

      const highlights = productForm.highlights || {};
      formData.append("highlights", JSON.stringify(highlights));

      await axios.post(`${API_URL}/api/seller/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setProductMsg("✅ Product added successfully!");
      setProductFieldErrors({});
      setProductForm({
        name: "",
        brandName: "",
        price: "",
        originalPrice: "",
        description: "",
        category: "upper_body",
        productUrl: "",
        sizes: [],
        highlights: {},
        seqImages: [],
      });
      setImageUrls([""]);
      // fetchProducts();
      queryClient.invalidateQueries({ queryKey: ["sellerProducts"] });
      queryClient.invalidateQueries({ queryKey: ["sellerDashboard"] });
    } catch (err) {
      // Backend se field-specific errors
      if (err.response?.data?.fieldErrors) {
        setProductFieldErrors(err.response.data.fieldErrors);
      } else {
        setProductMsg(err.response?.data?.message || "❌ Error aaya!");
      }
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
      queryClient.invalidateQueries({ queryKey: ["sellerDashboard"] });
    } catch (err) {
      setSettingsMsg("❌ Error found!");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied! ✅");
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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              👋 Welcome, {seller?.name}!
            </h1>
            <p className="text-gray-500 mt-1">Your seller dashboard</p>
          </div>

          {/* Stats - PREMIUM VERSION */}
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

          {/* Low Credits Warning */}
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
                style={{ display: "flex", flexDirection: "column", zIndex: 2 }}
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

          {/* Tabs */}
          <div className="flex gap-4 mt-5 mb-6 flex-wrap">
            {[
              { key: "overview", label: "📊 Overview" },
              { key: "fabric", label: "🧵 Fabric Shop" },
              { key: "products", label: "👗 Products" },
              { key: "orders", label: "📦 Orders" },
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
                {nameMsg && (
                  <p className="text-sm text-center py-1">{nameMsg}</p>
                )}

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
                      onClick={() => {
                        copyToClipboard(dashboard?.shopUrl);
                        if (dashboard?.shopUrl) {
                          // Check karega ki kya app install karke open ki gayi hai?
                          const isStandalone = window.matchMedia(
                            "(display-mode: standalone)",
                          ).matches;

                          window.open(
                            dashboard?.shopUrl,
                            isStandalone ? "_self" : "_blank", // App me hai to usi window me, browser me hai to naye tab me!
                            "noopener,noreferrer",
                          );
                        }
                      }}
                      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 
             text-white font-medium px-4 py-2 rounded-xl text-xs
             shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
             transform hover:-translate-y-0.5 active:translate-y-0
             transition-all duration-200 ease-out"
                    >
                      <span>Open Shop</span>
                      <ExternalLink size={14} className="opacity-80" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fabric Shop Link - Pro/Elite (100% Correct Enclosing Syntax) */}
              {(seller?.plan?.toLowerCase() === "pro" ||
                seller?.plan?.toLowerCase() === "elite" ||
                dashboard?.plan?.toLowerCase() === "pro") && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100/80 space-y-4">
                  {/* हेडिंग और छोटा ब्यौरा */}
                  <div className="space-y-0.5">
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
                        <path d="M4 12a8 8 0 0 1 16 0M4 12v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
                      </svg>
                      <h2 className="text-base font-black text-gray-800 tracking-wide uppercase">
                        Fabric Shop Link
                      </h2>
                    </div>
                    <p className="text-gray-400 text-xs font-medium">
                      Unstitched fabric customers ko share karo!
                    </p>
                  </div>

                  {/* यूआरएल डिस्प्ले बॉक्स */}
                  <div className="bg-purple-50/40 border border-purple-100/30 rounded-xl p-3 font-mono text-xs text-purple-700 break-all select-all font-semibold">
                    {window.location.origin}/fabric/
                    {dashboard?.sellerId ||
                      dashboard?.id ||
                      seller?.sellerId ||
                      "1780063620784"}
                  </div>

                  {/* एक्शन बटन्स ग्रिड */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* 1. कॉपी लिंक बटन */}
                    <button
                      type="button"
                      onClick={() => {
                        const sellerId =
                          dashboard?.sellerId ||
                          dashboard?.id ||
                          seller?.sellerId ||
                          "1780063620784";
                        const url = `${window.location.origin}/fabric/${sellerId}`;
                        navigator.clipboard.writeText(url);

                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className={`py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm
                   transform hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5
                   ${
                     copied
                       ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                       : "bg-purple-50 text-purple-700 hover:bg-purple-100/80 border border-purple-200/50"
                   }`}
                    >
                      {copied ? (
                        <>
                          <svg
                            xmlns="http://w3.org"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span className="normal-case">Copied!</span>
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
                            <rect
                              width="8"
                              height="4"
                              x="8"
                              y="2"
                              rx="1"
                              ry="1"
                            />
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          </svg>
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    {/* 2. ओपन शॉप बटन */}
                    <button
                      type="button"
                      onClick={() => {
                        const sellerId =
                          dashboard?.sellerId ||
                          dashboard?.id ||
                          seller?.sellerId ||
                          "1780063620784";
                        const url = `${window.location.origin}/fabric/${sellerId}`;
                        // Check karega ki kya app install karke open ki gayi hai?
const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

window.open(
  url,
  isStandalone ? "_self" : "_blank", // App me usi screen par khulega, browser me naye tab me!
  "noopener,noreferrer"
);

                      }}
                      className="bg-gradient-to-r from-purple-600 via-purple-600 to-indigo-600 text-white
                   py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-purple-500/10
                   transform hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
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
                        <path d="M15 3h6v6" />
                        <path d="M10 14 21 3" />
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      </svg>
                      <span>Open Shop</span>
                    </button>
                  </div>
                  {/* 3. व्हाट्सएप शेयर बटन */}
                  <a
                    href={
                      "https://wa.me Fabric Shop dekhein! 🧵\n" +
                      window.location.origin +
                      "/fabric/" +
                      (dashboard?.sellerId || dashboard?.id || "1780063620784")
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white
                         py-3 rounded-xl text-xs font-black uppercase tracking-wider text-center
                         shadow-md shadow-green-500/10 hover:shadow-green-500/30
                         transform hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://w3.org"
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              )}

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

                <div
                  className="space-y-4 max-h-96
                  overflow-y-auto pr-2"
                >
                  {/* Brand Name */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-1.5"
                    >
                      Brand Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="like: Raymond, Zara"
                      value={productForm.brandName || ""}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          brandName: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200
                   rounded-xl px-4 py-2.5 text-sm
                   focus:outline-none
                   focus:border-purple-500"
                    />
                  </div>

                  {/* Product Name */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-1.5"
                    >
                      Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="like: Men Slim Fit Shirt"
                      value={productForm.name}
                      onChange={(e) => {
                        setProductForm({
                          ...productForm,
                          name: e.target.value,
                        });
                        if (productFieldErrors.name)
                          setProductFieldErrors((p) => ({ ...p, name: "" }));
                      }}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm
                   focus:outline-none transition border
                   ${
                     productFieldErrors.name
                       ? "border-red-400 bg-red-50 focus:border-red-500"
                       : "border-gray-200 focus:border-purple-500"
                   }`}
                    />
                    {productFieldErrors.name && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠️ {productFieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-1.5"
                    >
                      Product Description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the product's key qualities..."
                      value={productForm.description || ""}
                      onChange={(e) => {
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        });
                        if (productFieldErrors.description)
                          setProductFieldErrors((p) => ({
                            ...p,
                            description: "",
                          }));
                      }}
                      className={`w-full rounded-xl px-4 py-2.5 text-sm
                   focus:outline-none resize-none transition border
                   ${
                     productFieldErrors.description
                       ? "border-red-400 bg-red-50 focus:border-red-500"
                       : "border-gray-200 focus:border-purple-500"
                   }`}
                    />
                    {productFieldErrors.description && (
                      <p className="text-red-500 text-xs mt-1">
                        ⚠️ {productFieldErrors.description}
                      </p>
                    )}

                    <div className="mt-3 p-3.5 bg-slate-50 border-l-4 border-indigo-600 rounded-md shadow-sm font-sans">
                      <div className="flex items-start gap-2.5">
                        <span className="text-lg leading-none text-indigo-600">
                          💡
                        </span>
                        <div>
                          <h4 className="m-0 mb-1 text-sm font-semibold text-slate-800">
                            महत्वपूर्ण निर्देश (Important Guide)
                          </h4>
                          <p className="m-0 text-xs text-slate-600Sub leading-relaxed">
                            यदि आपके कपड़े की फोटो किसी{" "}
                            <strong>असली मॉडल (Model)</strong> या{" "}
                            <strong>पुतले (Mannequin)</strong> द्वारा पहनी हुई
                            है, तो विवरण (Description) में{" "}
                            <span className="text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                              "model"
                            </span>{" "}
                            या{" "}
                            <span className="text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                              "worn by model"
                            </span>{" "}
                            शब्द ज़रूर लिखें। इससे कपड़ों की फिटिंग ग्राहक पर
                            बिल्कुल सटीक बैठेगी।
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                        Original Price (₹){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="eg-999"
                        value={productForm.originalPrice || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProductForm({
                            ...productForm,
                            originalPrice: val,
                          });
                        }}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-border ${
                          !productForm.originalPrice
                            ? "border border-red-400 bg-red-50 focus:border-red-500"
                            : "border border-gray-200 focus:border-purple-500"
                        }`}
                      />
                      {/* बिना productFieldErrors को छुए इन-लाइन रिक्वायर्ड एरर लॉजिक */}
                      {!productForm.originalPrice && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          ⚠️ Original price is required
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        className="text-xs font-semibold
                          text-gray-500 uppercase
                          tracking-wide block mb-1.5"
                      >
                        Final Price (₹) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="eg-999"
                        value={productForm.price || ""}
                        onChange={(e) => {
                          setProductForm({
                            ...productForm,
                            price: e.target.value,
                          });
                          if (productFieldErrors.price)
                            setProductFieldErrors((p) => ({ ...p, price: "" }));
                        }}
                        className={`w-full rounded-xl px-4 py-2.5 text-sm
                     focus:outline-none transition border
                     ${
                       productFieldErrors.price
                         ? "border-red-400 bg-red-50 focus:border-red-500"
                         : "border-gray-200 focus:border-purple-500"
                     }`}
                      />
                      {productFieldErrors.price && (
                        <p className="text-red-500 text-xs mt-1">
                          ⚠️ {productFieldErrors.price}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Discount Preview */}
                  {productForm.originalPrice &&
                    productForm.price &&
                    parseFloat(productForm.originalPrice) >
                      parseFloat(productForm.price) && (
                      <div
                        className="bg-green-50 rounded-xl px-4
                      py-2 flex items-center gap-2"
                      >
                        <span className="text-green-600 font-bold text-sm">
                          {Math.round(
                            ((parseFloat(productForm.originalPrice) -
                              parseFloat(productForm.price)) /
                              parseFloat(productForm.originalPrice)) *
                              100,
                          )}
                          % OFF
                        </span>
                        <span className="text-gray-400 text-xs">
                          savings: ₹
                          {Math.round(
                            parseFloat(productForm.originalPrice) -
                              parseFloat(productForm.price),
                          )}
                        </span>
                      </div>
                    )}

                  {/* Category */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-1.5"
                    >
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200
                   rounded-xl px-4 py-2.5 text-sm
                   focus:outline-none
                   focus:border-purple-500 bg-white"
                    >
                      <option value="upper_body">👕 Upper Body</option>
                      <option value="lower_body">👖 Lower Body</option>
                      <option value="dress">👗 Full Dress</option>
                    </select>
                  </div>

                  {/* Size Chart */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-2"
                    >
                      Available Sizes
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {["XS", "S", "M", "L", "XL", "XXL", "Free Size"].map(
                        (size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => {
                              const sizes = productForm.sizes || [];
                              setProductForm({
                                ...productForm,
                                sizes: sizes.includes(size)
                                  ? sizes.filter((s) => s !== size)
                                  : [...sizes, size],
                              });
                            }}
                            className={`px-3 py-1.5 rounded-xl text-sm
                       font-semibold border-2 transition
                       ${
                         (productForm.sizes || []).includes(size)
                           ? "bg-purple-600 text-white border-purple-600"
                           : "border-gray-200 text-gray-600 hover:border-purple-300"
                       }`}
                          >
                            {size}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Product Highlights */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-3"
                    >
                      Product Highlights
                    </label>
                    <div
                      className="bg-gray-50 rounded-xl p-4
                      space-y-3"
                    >
                      {[
                        { k: "packOf", l: "Pack Of", p: "1, 2, 3..." },
                        { k: "color", l: "Color", p: "Blue, Red, Black..." },
                        { k: "fabric", l: "Fabric", p: "Cotton, Polyester..." },
                        {
                          k: "occasion",
                          l: "Occasion",
                          p: "Casual, Formal...",
                        },
                      ].map((f) => (
                        <div
                          key={f.k}
                          className="grid grid-cols-2 gap-2 items-center"
                        >
                          <label className="text-xs text-gray-500 font-medium">
                            {f.l}
                          </label>
                          <input
                            type="text"
                            placeholder={f.p}
                            value={productForm.highlights?.[f.k] || ""}
                            onChange={(e) =>
                              setProductForm({
                                ...productForm,
                                highlights: {
                                  ...productForm.highlights,
                                  [f.k]: e.target.value,
                                },
                              })
                            }
                            className="border border-gray-200
                         rounded-lg px-3 py-1.5 text-xs
                         focus:outline-none
                         focus:border-purple-500 bg-white"
                          />
                        </div>
                      ))}

                      {/* Pattern */}
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <label className="text-xs text-gray-500 font-medium">
                          Pattern
                        </label>
                        <select
                          value={productForm.highlights?.pattern || "Solid"}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              highlights: {
                                ...productForm.highlights,
                                pattern: e.target.value,
                              },
                            })
                          }
                          className="border border-gray-200
                       rounded-lg px-3 py-1.5 text-xs
                       focus:outline-none
                       focus:border-purple-500 bg-white"
                        >
                          {[
                            "Solid",
                            "Striped",
                            "Printed",
                            "Checked",
                            "Floral",
                            "Geometric",
                            "Abstract",
                          ].map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Suitable For */}
                      <div className="grid grid-cols-2 gap-2 items-center">
                        <label className="text-xs text-gray-500 font-medium">
                          Suitable For
                        </label>
                        <select
                          value={productForm.highlights?.suitableFor || ""}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              highlights: {
                                ...productForm.highlights,
                                suitableFor: e.target.value,
                              },
                            })
                          }
                          className="border border-gray-200
                       rounded-lg px-3 py-1.5 text-xs
                       focus:outline-none
                       focus:border-purple-500 bg-white"
                        >
                          <option value="">Select...</option>
                          <option value="Western Wear">Western Wear</option>
                          <option value="Traditional Wear">
                            Traditional Wear
                          </option>
                          <option value="Party Wear">Party Wear</option>
                          <option value="Sportswear">Sportswear</option>
                          <option value="Ethnic Wear">Ethnic Wear</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Sequence Image Upload */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-3"
                    >
                      Product Photos
                      <span className="text-red-500 ml-1">
                        * (min 2 required)
                      </span>
                    </label>

                    <div className="space-y-3">
                      {[
                        {
                          num: 1,
                          label: "Front View",
                          hint: "Main Photo - Front-facing",
                          required: true,
                        },
                        {
                          num: 2,
                          label: "Back View",
                          hint: " Cloth Photo from the back",
                          required: true,
                        },
                        {
                          num: 3,
                          label: "Side View",
                          hint: "Optional",
                          required: false,
                        },
                        {
                          num: 4,
                          label: "Detail Shot",
                          hint: "Optional - fabric, texture close-up",
                          required: false,
                        },
                        {
                          num: 5,
                          label: "Lifestyle / Model",
                          hint: "Optional - Worn by any model",
                          required: false,
                        },
                      ].map((slot) => {
                        const currentImages = productForm.seqImages || [];
                        const file = currentImages[slot.num - 1];

                        return (
                          <div
                            key={slot.num}
                            className={`border-2 rounded-xl p-3
                         transition
                         ${
                           file
                             ? "border-purple-400 bg-purple-50"
                             : slot.required
                               ? "border-dashed border-red-200 bg-red-50"
                               : "border-dashed border-gray-200 bg-gray-50"
                         }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full
                                flex items-center
                                justify-center text-sm
                                font-bold flex-shrink-0
                                ${
                                  file
                                    ? "bg-purple-600 text-white"
                                    : slot.required
                                      ? "bg-red-100 text-red-500"
                                      : "bg-gray-200 text-gray-400"
                                }`}
                              >
                                {file ? "✓" : slot.num}
                              </div>
                              <div className="flex-1">
                                <p
                                  className="text-sm font-semibold
                                text-gray-700"
                                >
                                  {slot.label}
                                  {slot.required && (
                                    <span className="text-red-500 ml-1 text-xs">
                                      *
                                    </span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-400">
                                  {slot.hint}
                                </p>
                              </div>
                              {file ? (
                                <div className="flex items-center gap-2">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt=""
                                    className="w-12 h-12 object-cover
                                 rounded-lg"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const imgs = [
                                        ...(productForm.seqImages || []),
                                      ];
                                      imgs[slot.num - 1] = undefined;
                                      setProductForm({
                                        ...productForm,
                                        seqImages: imgs,
                                      });
                                    }}
                                    className="text-red-400 text-lg
                                 hover:text-red-600"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <label
                                  className="cursor-pointer
                                    bg-white border
                                    border-gray-200
                                    rounded-xl px-3 py-2
                                    text-xs text-gray-600
                                    hover:border-purple-400
                                    transition"
                                >
                                  Choose
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const f = e.target.files[0];
                                      if (!f) return;
                                      const imgs = [
                                        ...(productForm.seqImages || []),
                                      ];
                                      imgs[slot.num - 1] = f;
                                      setProductForm({
                                        ...productForm,
                                        seqImages: imgs,
                                      });
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {productFieldErrors.images && (
                      <p className="text-red-500 text-xs mt-2 font-medium">
                        ⚠️ {productFieldErrors.images}
                      </p>
                    )}
                    <p className="text-xs text-purple-600 mt-2">
                      💡 Front view pehle rakho - AI try-on ke liye best!
                    </p>
                  </div>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-gray-300"></div>
                    <span className="text-gray-500 text-xs">OR</span>
                    <div className="flex-1 h-px bg-gray-300"></div>
                  </div>
                  {/* ─── URL Images Section ──────────────── */}
                  <div>
                    <label
                      className="text-xs font-semibold
                        text-gray-500 uppercase
                        tracking-wide block mb-3"
                    >
                      Add Image URL
                      <span
                        className="text-red-500 text-xs
                         normal-case ml-1 font-normal"
                      >
                        ( Optional ➤ online images's link )
                      </span>
                    </label>

                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={url}
                            onChange={(e) => {
                              const updated = [...imageUrls];
                              updated[index] = e.target.value;
                              setImageUrls(updated);
                            }}
                            className="flex-1 border border-gray-200
                         rounded-xl px-3 py-2.5 text-sm
                         focus:outline-none
                         focus:border-purple-500 bg-white"
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
                           text-lg px-2 flex-shrink-0"
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
                          className="text-purple-600 text-sm
                       font-medium hover:text-purple-800
                       transition flex items-center gap-1"
                        >
                          + Add More URLs
                        </button>
                      )}
                    </div>
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
                      ? "⏳ It is uploading..."
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
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                // fetchProducts();
                                queryClient.invalidateQueries({
                                  queryKey: ["sellerProducts"],
                                });
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
                                    headers: {
                                      Authorization: `Bearer ${token}`,
                                    },
                                  },
                                );
                                // fetchProducts();
                                queryClient.invalidateQueries({
                                  queryKey: ["sellerProducts"],
                                });
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

          {/* Orders Tab */}
          {activeTab === "orders" && <SellerOrders token={token} />}

          {/* Fabric Tab */}
          {activeTab === "fabric" && (
            <FabricDashboard token={token} seller={seller} />
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
                <h2 className="text-xl font-bold mb-2">
                  🔌 Website Par Lagaiye
                </h2>
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
        {/* Support Bot */}
        <SupportBot />
      </div>
    </>
  );
}
