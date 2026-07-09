import { useState } from "react";
import { User, Phone, MapPin, Truck, X } from "lucide-react";

const STATUS_COLORS = {
  placed: "bg-blue-100 text-blue-700",
  accepted: "bg-purple-100 text-purple-700",
  packed: "bg-yellow-100 text-yellow-700",
  shipped: "bg-orange-100 text-orange-700",
  out_for_delivery: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const LOGISTICS = [
  "Delhivery", "Blue Dart", "DTDC", "Ekart Logistics", "Xpressbees",
  "Shadowfax", "Dunzo", "Porter", "Amazon Logistics", "FedEx",
  "Speed Post", "Other",
];

const SEQ = ["placed", "accepted", "packed", "shipped", "out_for_delivery", "delivered"];

/*
  ─── ORDER CARD ─────────────────────────────────────────────
  One order's full detail + status-update controls. Extracted
  from the original SellerOrders monolith with zero logic
  changes — same status sequence, same shipped/cancel dialog
  behavior, same disable rules.
--------------------------------------------------------------*/
export default function OrderCard({ order, onUpdateStatus }) {
  const [shippedOpen, setShippedOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [shippedForm, setShippedForm] = useState({ logistics: "", trackingId: "" });
  const [cancelReason, setCancelReason] = useState("");

  const currentIdx = SEQ.indexOf(order.orderStatus);
  const isCancelled = order.orderStatus === "cancelled";

  const confirmShip = () => {
    if (!shippedForm.logistics || !shippedForm.trackingId) {
      alert("Logistics and tracking ID are required for all shipments!");
      return;
    }
    onUpdateStatus(order._id, "shipped", {
      logistics: shippedForm.logistics,
      trackingId: shippedForm.trackingId,
      message: `Shipped via ${shippedForm.logistics}. Tracking: ${shippedForm.trackingId}`,
    });
    setShippedOpen(false);
    setShippedForm({ logistics: "", trackingId: "" });
  };

  const confirmCancel = () => {
    if (!cancelReason) {
      alert("Reason select karo!");
      return;
    }
    onUpdateStatus(order._id, "cancelled", {
      cancelReason,
      message: `Cancelled: ${cancelReason}`,
    });
    setCancelOpen(false);
    setCancelReason("");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 flex flex-wrap gap-2 justify-between items-center">
        <div>
          <p className="font-bold text-sm">#{order.orderId}</p>
          <p className="text-xs text-gray-400">
            {new Date(order.createdAt).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex gap-2">
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              order.paymentStatus === "paid"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {order.paymentStatus === "paid" ? "💰 Paid" : "⏳ Pending"}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
              STATUS_COLORS[order.orderStatus] || "bg-gray-100"
            }`}
          >
            {order.orderStatus?.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="p-4">
        {/* Product */}
        <div className="flex gap-3 mb-3">
          <img
            src={order.productImage}
            alt={order.productName}
            className="w-14 h-14 object-contain rounded-xl bg-gray-50 border"
          />
          <div>
            <p className="font-medium text-sm">{order.productName}</p>
            <p className="text-purple-600 font-bold">₹{order.totalAmount}</p>
            <p className="text-xs text-gray-400">
              Delivery: {order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}
            </p>
          </div>
        </div>

        {/* Customer */}
        {order.customer && (
          <div className="bg-blue-50 rounded-xl p-3 mb-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-blue-800 text-sm font-medium">
              <User className="w-3.5 h-3.5" strokeWidth={2} />
              {order.customer.name}
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 text-xs">
              <Phone className="w-3 h-3" strokeWidth={2} />
              {order.customer.mobile}
            </span>
          </div>
        )}

        {/* Address */}
        {order.address && (
          <div className="bg-gray-50 rounded-xl p-3 mb-3 text-xs text-gray-600">
            <p className="font-medium flex items-center gap-1.5 mb-0.5">
              <MapPin className="w-3 h-3" strokeWidth={2} />
              {order.address.fullName}
            </p>
            <p>
              {order.address.addressLine1}, {order.address.city} -{" "}
              {order.address.pincode}
            </p>
            <p className="flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3 h-3" strokeWidth={2} />
              {order.address.mobile}
            </p>
          </div>
        )}

        {/* Status controls */}
        <div>
          <p className="text-xs font-medium text-gray-500 mb-2">
            Update Order Status:
          </p>

          {isCancelled ? (
            <div className="bg-red-50 rounded-xl px-4 py-3">
              <p className="text-red-600 text-sm font-semibold flex items-center gap-1.5">
                <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                Order Cancelled
              </p>
              {order.cancelReason && (
                <p className="text-red-400 text-xs mt-0.5">{order.cancelReason}</p>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {[
                { v: "accepted", l: "Accept" },
                { v: "packed", l: "Pack" },
                { v: "shipped", l: "Ship" },
                { v: "out_for_delivery", l: "OFD" },
                { v: "delivered", l: "Delivered" },
                { v: "cancelled", l: "Cancel" },
              ].map((opt) => {
                const optIdx = SEQ.indexOf(opt.v);
                const isCurrentStatus = order.orderStatus === opt.v;
                const isDone = optIdx <= currentIdx && opt.v !== "cancelled";
                const isNext = optIdx === currentIdx + 1;
                const isCancel = opt.v === "cancelled";
                const isDisabled =
                  (!isNext && !isCancel) || (isCancel && currentIdx >= 4);

                return (
                  <button
                    key={opt.v}
                    onClick={() => {
                      if (isDisabled) return;
                      if (opt.v === "shipped") setShippedOpen(true);
                      else if (opt.v === "cancelled") setCancelOpen(true);
                      else onUpdateStatus(order._id, opt.v);
                    }}
                    disabled={isDisabled}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium
                                transition border ${
                                  isCurrentStatus
                                    ? "bg-purple-600 text-white border-purple-600"
                                    : isDone
                                    ? "bg-gray-100 text-gray-400 border-gray-100 line-through cursor-not-allowed"
                                    : isNext
                                    ? isCancel
                                      ? "border-red-300 text-red-500 hover:bg-red-50"
                                      : "border-purple-300 text-purple-600 hover:bg-purple-50 font-bold"
                                    : "border-gray-100 text-gray-300 cursor-not-allowed opacity-50"
                                }`}
                  >
                    {opt.l}
                  </button>
                );
              })}
            </div>
          )}

          {/* Shipped dialog */}
          {shippedOpen && (
            <div className="mt-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="font-semibold text-blue-800 text-sm mb-3 flex items-center gap-1.5">
                <Truck className="w-4 h-4" strokeWidth={2} />
                Shipping Details
              </p>
              <div className="space-y-2">
                <select
                  value={shippedForm.logistics}
                  onChange={(e) =>
                    setShippedForm({ ...shippedForm, logistics: e.target.value })
                  }
                  className="w-full border border-blue-200 rounded-xl px-3 py-2.5
                             text-sm bg-white focus:outline-none focus:border-blue-500"
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
                    setShippedForm({ ...shippedForm, trackingId: e.target.value })
                  }
                  className="w-full border border-blue-200 rounded-xl px-3 py-2.5
                             text-sm focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={confirmShip}
                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl
                               text-sm font-bold hover:bg-blue-700 transition"
                  >
                    Confirm Ship
                  </button>
                  <button
                    onClick={() => setShippedOpen(false)}
                    className="px-4 border border-gray-200 rounded-xl text-sm
                               text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cancel dialog */}
          {cancelOpen && (
            <div className="mt-3 bg-red-50 rounded-xl p-4 border border-red-100">
              <p className="font-semibold text-red-800 text-sm mb-3">
                Cancel Reason
              </p>
              <div className="space-y-2">
                {[
                  "Out of stock",
                  "Cannot deliver to location",
                  "Customer not reachable",
                  "Fraudulent order",
                  "Other",
                ].map((reason) => (
                  <label key={reason} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`cancel_${order._id}`}
                      value={reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="text-red-500"
                    />
                    <span className="text-sm text-gray-700">{reason}</span>
                  </label>
                ))}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={confirmCancel}
                    className="flex-1 bg-red-500 text-white py-2.5 rounded-xl
                               text-sm font-bold hover:bg-red-600 transition"
                  >
                    Confirm Cancel
                  </button>
                  <button
                    onClick={() => setCancelOpen(false)}
                    className="px-4 border border-gray-200 rounded-xl text-sm
                               text-gray-600 hover:bg-gray-50"
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
  );
}
