import { useState, useEffect } from "react";
import axios from "axios";
import { Package } from "lucide-react";
import API_URL from "../../../api";
import OrderCard from "./OrderCard";

/*
  ─── ORDERS SECTION ─────────────────────────────────────────
  Single order list with filter chips (Gmail-label style)
  instead of separate hard tabs per status — chosen over 5
  dedicated tabs because a seller with few orders would
  otherwise see mostly-empty tabs. One list, one set of chips,
  zero empty states to click through.
--------------------------------------------------------------*/
const FILTERS = [
  { key: "all", label: "All" },
  { key: "placed", label: "Placed" },
  { key: "accepted", label: "Accepted" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersSection({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

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

  const updateStatus = async (orderId, status, extra = {}) => {
    const messages = {
      accepted: "Order accepted by seller!",
      packed: "Order has been packed.",
      shipped: "Order has been shipped.",
      out_for_delivery: "Out for delivery!",
      delivered: "Order delivered successfully!",
      cancelled: "Order cancelled.",
    };
    try {
      await axios.patch(
        `${API_URL}/api/seller/orders/${orderId}/status`,
        { status, message: messages[status] || `Order ${status}`, ...extra },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders();
    } catch (e) {
      alert("Error!");
    }
  };

  const filteredOrders =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === activeFilter);

  // Counts shown on each chip so the seller can see at a glance
  // where attention is needed, without opening anything.
  const countFor = (key) =>
    key === "all" ? orders.length : orders.filter((o) => o.orderStatus === key).length;

  if (loading) {
    return <p className="text-center py-8 text-gray-400">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          Customer Orders ({orders.length})
        </h2>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mb-1">
          {FILTERS.map((f) => {
            const count = countFor(f.key);
            const isActive = activeFilter === f.key;
            // Hide chips with zero orders (except "All") — keeps
            // the row short when the seller has few orders, and
            // grows naturally as more statuses appear.
            if (f.key !== "all" && count === 0) return null;

            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                            text-xs font-semibold transition ${
                              isActive
                                ? "bg-purple-600 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
              >
                {f.label}
                <span
                  className={`text-[10px] font-bold px-1.5 rounded-full ${
                    isActive ? "bg-white/25" : "bg-white text-gray-400"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
          <p className="text-gray-400 text-sm">
            {activeFilter === "all"
              ? "No orders yet."
              : `No orders with status "${FILTERS.find((f) => f.key === activeFilter)?.label}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard key={order._id} order={order} onUpdateStatus={updateStatus} />
          ))}
        </div>
      )}
    </div>
  );
}
