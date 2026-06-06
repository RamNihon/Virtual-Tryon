import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCustomer } from "../context/CustomerContext";
import API_URL from "../api";

// ─── Status Config ────────────────────────
const STATUS_CONFIG = [
  {
    key: "placed",
    label: "Order Placed",
    icon: "📦",
    color: "green",
  },
  {
    key: "accepted",
    label: "Order Confirmed",
    icon: "✅",
    color: "green",
  },
  {
    key: "packed",
    label: "Packed",
    icon: "📫",
    color: "green",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: "🚚",
    color: "green",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    icon: "🛵",
    color: "green",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: "🎉",
    color: "green",
  },
];

const CANCEL_STEPS = [
  { key: "placed", label: "Order Placed", icon: "📦" },
  { key: "cancelled", label: "Cancelled", icon: "❌", color: "red" },
];

export default function OrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { customerToken } = useCustomer();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllUpdates, setShowAllUpdates] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrder();
    // Refresh every 10 seconds for live updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/customer/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      setOrder(res.data.order);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason) return;
    setCancelling(true);
    try {
      await axios.post(
        `${API_URL}/api/customer/orders/${orderId}/cancel`,
        { reason: cancelReason },
        { headers: { Authorization: `Bearer ${customerToken}` } },
      );
      fetchOrder();
      setShowCancelForm(false);
    } catch (e) {
      alert(e.response?.data?.message || "Error aaya!");
    } finally {
      setCancelling(false);
    }
  };

  const isCancelled = order?.orderStatus === "cancelled";

  const getActiveStepIndex = () => {
    if (isCancelled) return -1;
    const steps = STATUS_CONFIG;
    return steps.findLastIndex((s) =>
      order?.trackingUpdates?.some((u) => u.status === s.key),
    );
  };

  const activeIndex = getActiveStepIndex();

  const getExpectedDelivery = () => {
    const placed = order?.trackingUpdates?.find((u) => u.status === "placed");
    if (!placed) return null;
    const date = new Date(placed.time);
    date.setDate(date.getDate() + 5);
    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center bg-gray-50"
      >
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">📦</div>
          <p className="text-gray-400 animate-pulse">Loading order...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className="min-h-screen flex items-center
                      justify-center"
      >
        <p className="text-gray-400">Order not received!</p>
      </div>
    );
  }

  const steps = isCancelled ? CANCEL_STEPS : STATUS_CONFIG;
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-gradient-to-r from-purple-700
                      to-indigo-700 text-white sticky
                      top-0 z-10"
      >
        <div className="flex items-center gap-3 px-4 py-4">
         <button
  onClick={() => {
    // '-1' के बजाय सीधे अपने Orders वाले URL पाथ का नाम लिखें
    // उदाहरण के लिए: "/my-account/orders" या जो भी आपका रूट हो
    navigate(-1); 
  }}
  className="w-9 h-9 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white hover:bg-opacity-30 transition flex-shrink-0"
>
  {/* पुराने तीर (←) की जगह एक सुंदर बोल्ड एरो SVG जो इसे एडवांस बनाएगा */}
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
    <path d="m15 18-6-6 6-6" />
  </svg>
</button>

          <div>
            <h1 className="font-bold text-lg">Order Details</h1>
            <p className="text-purple-200 text-xs">#{order.orderId}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Product Card */}
        {/* Product Card */}
        <div
          className="bg-white rounded-2xl overflow-hidden
                shadow-sm border border-gray-100"
        >
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-full h-56 object-contain
               bg-gray-50 p-4"
          />
          <div className="p-4">
            {order.product?.brandName && (
              <p
                className="text-purple-600 font-bold
                    text-sm mb-1"
              >
                {order.product.brandName}
              </p>
            )}
            <p className="font-bold text-gray-800 text-base">
              {order.productName}
            </p>
            {order.product?.description && (
              <p
                className="text-gray-500 text-xs
                    mt-1 leading-relaxed"
              >
                {order.product.description}
              </p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <p className="text-xl font-black text-purple-600">
                ₹{order.productPrice}
              </p>
              {order.product?.originalPrice &&
                order.product.originalPrice > order.productPrice && (
                  <span className="text-gray-400 text-sm line-through">
                    ₹{order.product.originalPrice}
                  </span>
                )}
            </div>
            <div className="flex gap-4 mt-2">
              {order.selectedSize && (
                <p className="text-xs text-gray-500">
                  Size:{" "}
                  <span className="font-semibold text-gray-700">
                    {order.selectedSize}
                  </span>
                </p>
              )}
              {order.product?.highlights?.color && (
                <p className="text-xs text-gray-500">
                  Color:{" "}
                  <span className="font-semibold text-gray-700">
                    {order.product.highlights.color}
                  </span>
                </p>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">Qty: {order.quantity}</p>
          </div>
        </div>

        {/* Order Status Card */}
        <div
          className="bg-white rounded-2xl shadow-sm
                        border border-gray-100 overflow-hidden"
        >
          {/* Status Header */}
          <div
            className={`px-5 py-4 ${
              isCancelled
                ? "bg-red-50 border-b border-red-100"
                : "bg-green-50 border-b border-green-100"
            }`}
          >
            <div
              className="flex items-center
                            justify-between"
            >
              <div>
                <p
                  className={`font-bold text-lg ${
                    isCancelled ? "text-red-700" : "text-green-700"
                  }`}
                >
                  {isCancelled
                    ? "❌ Order Cancelled"
                    : steps[activeIndex]?.icon +
                      " " +
                      steps[activeIndex]?.label}
                </p>
                {!isCancelled && getExpectedDelivery() && (
                  <p className="text-gray-500 text-sm mt-0.5">
                    Expected by <strong>{getExpectedDelivery()}</strong>
                  </p>
                )}
                {isCancelled && order.cancelReason && (
                  <p className="text-red-500 text-sm mt-0.5">
                    Reason: {order.cancelReason}
                  </p>
                )}
              </div>
              {/* Live indicator */}
              {!isCancelled && (
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 bg-green-500
                                  rounded-full animate-pulse"
                  />
                  <span
                    className="text-green-600 text-xs
                                   font-medium"
                  >
                    Live
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tracking Steps */}
          <div className="px-5 py-5">
            <div className="relative">
              {/* Vertical line */}
              <div
                className="absolute left-4 top-4
                              bottom-4 w-0.5 bg-gray-100"
              ></div>

              {/* Active line */}
              {!isCancelled && activeIndex >= 0 && (
                <div
                  className="absolute left-4 top-4
                             w-0.5 bg-green-400
                             transition-all duration-1000"
                  style={{
                    height: `${(activeIndex / (steps.length - 1)) * 100}%`,
                  }}
                ></div>
              )}

              <div className="space-y-6">
                {steps.map((step, index) => {
                  const isCompleted = !isCancelled && index <= activeIndex;
                  const isActive = !isCancelled && index === activeIndex;
                  const isCancelStep = step.color === "red";

                  const trackUpdate = order.trackingUpdates
                    ?.filter((u) => u.status === step.key)
                    ?.slice(-1)[0];

                  return (
                    <div
                      key={step.key}
                      className="flex gap-4 items-start
                                 relative"
                    >
                      {/* Dot */}
                      <div
                        className={`w-8 h-8 rounded-full
                                      flex items-center
                                      justify-center text-sm
                                      flex-shrink-0 z-10
                                      border-2 transition-all
                                      ${
                                        isActive
                                          ? "bg-green-500 border-green-500 shadow-lg shadow-green-200 scale-110"
                                          : isCompleted
                                            ? "bg-green-500 border-green-500"
                                            : isCancelStep && isCancelled
                                              ? "bg-red-500 border-red-500"
                                              : "bg-white border-gray-200"
                                      }`}
                      >
                        {isCompleted || (isCancelStep && isCancelled) ? (
                          <span className="text-white text-xs">✓</span>
                        ) : (
                          <span className="text-gray-300 text-xs">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <p
                          className={`font-semibold text-sm ${
                            isActive
                              ? "text-green-700"
                              : isCompleted
                                ? "text-gray-800"
                                : isCancelStep && isCancelled
                                  ? "text-red-700"
                                  : "text-gray-300"
                          }`}
                        >
                          {step.label}
                        </p>

                        {trackUpdate && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(trackUpdate.time).toLocaleString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        )}

                        {/* Logistics info */}
                        {step.key === "shipped" &&
                          isCompleted &&
                          order.logistics && (
                            <div
                              className="mt-1.5 bg-blue-50
                                          rounded-lg px-3 py-2"
                            >
                              <p
                                className="text-xs text-blue-700
                                          font-medium"
                              >
                                🚚 {order.logistics}
                              </p>
                              {order.trackingId && (
                                <p className="text-xs text-blue-600 mt-0.5">
                                  Tracking: {order.trackingId}
                                </p>
                              )}
                            </div>
                          )}

                        {/* Active pulse animation */}
                        {isActive && (
                          <div
                            className="mt-1.5 flex items-center
                                          gap-1.5"
                          >
                            <div
                              className="w-1.5 h-1.5 bg-green-500
                                            rounded-full animate-bounce"
                            />
                            <div
                              className="w-1.5 h-1.5 bg-green-500
                                            rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <div
                              className="w-1.5 h-1.5 bg-green-500
                                            rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* See All Updates */}
            {order.trackingUpdates?.length > 2 && (
              <button
                onClick={() => setShowAllUpdates(!showAllUpdates)}
                className="w-full mt-4 text-purple-600
                           text-sm font-semibold py-2
                           border border-purple-100
                           rounded-xl hover:bg-purple-50
                           transition"
              >
                {showAllUpdates
                  ? "Hide Updates ↑"
                  : `See All Updates (${order.trackingUpdates.length}) ↓`}
              </button>
            )}

            {/* All Updates */}
            {showAllUpdates && (
              <div
                className="mt-3 space-y-2 bg-gray-50
                              rounded-xl p-3"
              >
                {order.trackingUpdates
                  .slice()
                  .reverse()
                  .map((update, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start
                               border-b border-gray-100
                               pb-2 last:border-0"
                    >
                      <div
                        className="w-2 h-2 rounded-full
                                    mt-1.5 flex-shrink-0
                                    bg-purple-400"
                      />
                      <div>
                        <p
                          className="text-xs font-semibold
                                    text-gray-700 capitalize"
                        >
                          {update.status?.replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {update.message}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(update.time).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Delivery Address */}
        {order.address && (
          <div
            className="bg-white rounded-2xl p-4
                          shadow-sm border border-gray-100"
          >
            <h3 className="font-bold text-gray-800 mb-3">
              📍 Delivery Address
            </h3>
            <p className="font-medium text-gray-700 text-sm">
              {order.address.fullName}
            </p>
            <p className="text-gray-500 text-sm mt-0.5">
              {order.address.addressLine1}
              {order.address.addressLine2 && `, ${order.address.addressLine2}`}
            </p>
            <p className="text-gray-500 text-sm">
              {order.address.city}, {order.address.state} -
              {order.address.pincode}
            </p>
            <p className="text-gray-400 text-sm mt-0.5">
              📱 {order.address.mobile}
            </p>
          </div>
        )}

        {/* Price Breakdown */}
        <div
          className="bg-white rounded-2xl p-4
                        shadow-sm border border-gray-100"
        >
          <h3 className="font-bold text-gray-800 mb-3">💰 Price Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Product Price</span>
              <span className="text-gray-700">₹{order.productPrice}</span>
            </div>
            {order.quantity > 1 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Quantity</span>
                <span className="text-gray-700">× {order.quantity}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery Fee</span>
              <span
                className={
                  order.deliveryFee === 0
                    ? "text-green-600 font-medium"
                    : "text-gray-700"
                }
              >
                {order.deliveryFee === 0 ? "FREE 🎉" : `₹${order.deliveryFee}`}
              </span>
            </div>
            <div
              className="flex justify-between font-bold
                            text-base border-t pt-2 mt-2"
            >
              <span className="text-gray-800">Total Amount</span>
              <span className="text-purple-600">₹{order.totalAmount}</span>
            </div>
            <div
              className="flex justify-between text-sm
                bg-gray-50 rounded-lg px-3 py-2"
            >
              <span className="text-gray-500">Payment Mode</span>
              <span className="font-medium text-gray-700">
                {order.paymentMethod === "cod"
                  ? "💵 Cash on Delivery"
                  : "💳 Online Payment"}
              </span>
            </div>
            <div
              className="flex justify-between text-sm
                bg-gray-50 rounded-lg px-3 py-2"
            >
              <span className="text-gray-500">Payment Status</span>
              <span
                className={`font-medium ${
                  order.paymentStatus === "paid"
                    ? "text-green-600"
                    : order.paymentStatus === "refunded"
                      ? "text-blue-600"
                      : order.paymentStatus === "refund_pending"
                        ? "text-orange-500"
                        : "text-orange-500"
                }`}
              >
                {order.paymentStatus === "paid"
                  ? "✅ Paid"
                  : order.paymentStatus === "refunded"
                    ? "↩️ Refunded"
                    : order.paymentStatus === "refund_pending"
                      ? "⏳ Refund Pending"
                      : order.paymentMethod === "cod"
                        ? "💵 Pay on Delivery"
                        : "⏳ Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Cancel + Help Buttons */}
        {!isCancelled &&
          order.orderStatus !== "delivered" &&
          order.orderStatus !== "out_for_delivery" && (
            <div className="space-y-3">
              {/* Cancel Form */}
              {showCancelForm ? (
                <div
                  className="bg-red-50 rounded-2xl p-5
                              border border-red-100"
                >
                  <h3 className="font-bold text-red-800 mb-4">
                    ❌ Select Reason for Cancellation
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      "Changed my mind",
                      "Ordered by mistake",
                      "Found better price",
                      "Delivery time too long",
                      "Other",
                    ].map((reason) => (
                      <label
                        key={reason}
                        className="flex items-center gap-3
                                 cursor-pointer bg-white
                                 rounded-xl px-4 py-3
                                 border border-red-100
                                 hover:border-red-300
                                 transition"
                      >
                        <input
                          type="radio"
                          name="cancelReason"
                          value={reason}
                          checked={cancelReason === reason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          className="text-red-500 w-4 h-4"
                        />
                        <span className="text-sm text-gray-700">{reason}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={handleCancel}
                      disabled={!cancelReason || cancelling}
                      className="flex-1 bg-red-500 text-white
                               py-3 rounded-xl font-bold
                               hover:bg-red-600 transition
                               disabled:opacity-50"
                    >
                      {cancelling ? "⏳ Cancelling..." : "❌ Confirm Cancel"}
                    </button>
                    <button
                      onClick={() => {
                        setShowCancelForm(false);
                        setCancelReason("");
                      }}
                      className="px-5 border-2 border-gray-200
                               rounded-xl text-gray-600
                               font-semibold hover:bg-gray-50
                               transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCancelForm(true)}
                  className="w-full border-2 border-red-200
                           text-red-500 py-3 rounded-2xl
                           font-semibold hover:bg-red-50
                           transition"
                >
                  ❌ Cancel Order
                </button>
              )}
            </div>
          )}

        {/* Review Option - Only after delivered */}
        {order.orderStatus === "delivered" && <ReviewFromOrder order={order} />}

        {/* Help Button */}
        <button
          onClick={() => {
            // Go back to orders list
            window.history.back();
          }}
          className="w-full border-2 border-purple-200
                     text-purple-600 py-3 rounded-2xl
                     font-semibold hover:bg-purple-50
                     transition"
        >
          ❓ Help / Report Issue
        </button>

        {/* Refund Info if cancelled and paid */}
        {isCancelled && order.paymentStatus === "paid" && (
          <div
            className="bg-green-50 rounded-2xl p-4
                          border border-green-100 text-center"
          >
            <div className="text-3xl mb-2">💰</div>
            <p className="font-bold text-green-800">Refund Initiated</p>
            <p className="text-green-600 text-sm mt-1">
              ₹{order.totalAmount} It will be credited to your account in 5-7
              days.
            </p>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-8" />
      </div>
    </div>
  );
}
function ReviewFromOrder({ order }) {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    rating: 0,
    review: "",
  });
  const [reviewImages, setReviewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [hover, setHover] = useState(0);

  const labels = {
    1: "Terrible 😡",
    2: "Poor 😞",
    3: "Average 🙂",
    4: "Good 😊",
    5: "Excellent! 🤩",
  };

  const handleSubmit = async () => {
    if (!form.customerName || form.rating === 0) {
      alert("Naam aur rating zaroori hai!");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      const productId = order.product?._id || order.product || "";
      const sellerId = order.seller?.sellerId || order.seller || "";
      formData.append("productId", productId);
      formData.append("sellerId", sellerId);
      formData.append("customerName", form.customerName);
      formData.append("rating", form.rating);
      formData.append("review", form.review);
      reviewImages.forEach((img) => formData.append("reviewImages", img));
      await axios.post(`${API_URL}/api/reviews`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (e) {
      alert("Error! Dobara try karo.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="bg-green-50 rounded-2xl p-4
                      text-center border border-green-100"
      >
        <div className="text-3xl mb-2">⭐</div>
        <p className="font-bold text-green-800">
          The review has been submitted!
        </p>
        <p className="text-green-600 text-sm">
          Thank you for your valuable feedback 🙏
        </p>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl border
                    border-gray-100 shadow-sm overflow-hidden"
    >
      <div
        className="bg-gradient-to-r from-purple-50
                      to-indigo-50 px-4 py-3 border-b
                      border-purple-100"
      >
        <p className="font-bold text-gray-800">⭐ Rate Your Purchase</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Please share your experience with us
        </p>
      </div>

      {!showForm ? (
        <div className="p-4">
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-gradient-to-r
                       from-purple-600 to-indigo-600
                       text-white py-3 rounded-xl
                       font-bold hover:opacity-90 transition"
          >
            ✏️ Give review
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          <div>
            <label
              className="text-sm font-medium
                              text-gray-700 block mb-1.5"
            >
              Your name *
            </label>
            <input
              type="text"
              placeholder="Write the name"
              value={form.customerName}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerName: e.target.value,
                })
              }
              className="w-full border border-gray-200
                         rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none
                         focus:border-purple-500"
            />
          </div>

          <div>
            <label
              className="text-sm font-medium
                              text-gray-700 block mb-2"
            >
              Rating *
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setForm({
                      ...form,
                      rating: star,
                    })
                  }
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className={`text-4xl transition-all
                             hover:scale-125
                             ${
                               star <= (hover || form.rating)
                                 ? (hover || form.rating) >= 4
                                   ? "text-green-500"
                                   : (hover || form.rating) >= 2
                                     ? "text-orange-400"
                                     : "text-red-500"
                                 : "text-gray-200"
                             }`}
                >
                  ★
                </button>
              ))}
            </div>
            {(hover || form.rating) > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {labels[hover || form.rating]}
              </p>
            )}
          </div>

          <div>
            <label
              className="text-sm font-medium
                              text-gray-700 block mb-1.5"
            >
              Review (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="What do you think of the product?"
              value={form.review}
              onChange={(e) =>
                setForm({
                  ...form,
                  review: e.target.value,
                })
              }
              className="w-full border border-gray-200
                         rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none
                         focus:border-purple-500 resize-none"
            />
          </div>

          <div>
            <label
              className="flex items-center gap-2
                               border-2 border-dashed
                               border-gray-200 rounded-xl
                               p-3 cursor-pointer
                               hover:border-purple-400 transition"
            >
              <span className="text-2xl">📷</span>
              <span className="text-sm text-gray-500">
                {reviewImages.length > 0
                  ? `${reviewImages.length} photo(s)`
                  : "Add Photos (optional)"}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setReviewImages(files);
                  setPreviews(files.map((f) => URL.createObjectURL(f)));
                }}
              />
            </label>
            {previews.length > 0 && (
              <div className="flex gap-2 mt-2">
                {previews.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    className="w-14 h-14 object-cover
                               rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting || form.rating === 0}
              className="flex-1 bg-gradient-to-r
                         from-purple-600 to-indigo-600
                         text-white py-3 rounded-xl
                         font-bold disabled:opacity-40
                         hover:opacity-90 transition"
            >
              {submitting ? "⏳..." : "✅ Submit"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 border border-gray-200
                         rounded-xl text-gray-600 text-sm
                         hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
