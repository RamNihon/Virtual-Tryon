import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

export default function CreditHistory() {
   // eslint-disable-next-line
  const { seller, token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  const fetchHistory = async () => {
    try {
      const [histRes, sumRes] = await Promise.all([
        axios.get(`${API_URL}/api/seller/credit-transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/seller/credit-history`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setTransactions(histRes.data.transactions || []);
      setSummary(sumRes.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const ACTION_COLORS = {
    readyTryon: "bg-purple-100 text-purple-700",
    fabricGen: "bg-blue-100 text-blue-700",
    fabricTryon: "bg-indigo-100 text-indigo-700",
    styleAdvice: "bg-pink-100 text-pink-700",
    planPurchase: "bg-green-100 text-green-700",
    topupPurchase: "bg-green-100 text-green-700",
    adminCredit: "bg-yellow-100 text-yellow-700",
  };

  const ACTION_ICONS = {
    readyTryon: "👗",
    fabricGen: "🧵",
    fabricTryon: "✨",
    styleAdvice: "💡",
    planPurchase: "🚀",
    topupPurchase: "💳",
    adminCredit: "🎁",
  };

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-slate-900
                      via-purple-900 to-indigo-900
                      py-10 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <Link
            to="/dashboard"
            className="text-purple-300 hover:text-white
                       text-sm transition mb-4 inline-block"
          >
            ← Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white mb-1">
            💳 Credit History
          </h1>
          <p className="text-purple-200">The complete breakdown/account of your credits!</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        {summary && (
          <div
            className="grid grid-cols-2 md:grid-cols-4
                          gap-4 mb-8"
          >
            {[
              {
                label: "💳 Available",
                value: summary.currentCredits,
                color:
                  summary.currentCredits < 50
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-green-50 border-green-200 text-green-700",
              },
              {
                label: "📊 This Month",
                value: summary.monthlyUsed,
                color: "bg-orange-50 border-orange-200 text-orange-700",
              },
              {
                label: "📅 Monthly Limit",
                value: summary.monthlyLimit,
                color: "bg-blue-50 border-blue-200 text-blue-700",
              },
              {
                label: "🏆 Total Used",
                value: summary.totalUsed,
                color: "bg-purple-50 border-purple-200 text-purple-700",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 border-2 text-center
                           ${card.color}`}
              >
                <p className="text-xs font-medium mb-1">{card.label}</p>
                <p className="text-3xl font-black">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Monthly Progress */}
        {summary && (
          <div
            className="bg-white rounded-2xl p-5
                          border border-gray-100 shadow-sm mb-6"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-gray-700 text-sm">
                Monthly Usage
              </span>
              <span className="text-sm text-gray-500">
                {summary.monthlyUsed}/{summary.monthlyLimit}
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all
                           ${
                             summary.monthlyUsed / summary.monthlyLimit > 0.8
                               ? "bg-red-500"
                               : "bg-gradient-to-r from-purple-600 to-indigo-600"
                           }`}
                style={{
                  width: `${Math.min(
                    (summary.monthlyUsed / summary.monthlyLimit) * 100,
                    100,
                  )}%`,
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {summary.monthlyLimit - summary.monthlyUsed} credits remaining this
              month
            </p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-5">
          {[
            { key: "all", label: "📋 All" },
            { key: "debit", label: "📤 Used" },
            { key: "credit", label: "📥 Added" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm
                         font-medium transition
                         ${
                           filter === f.key
                             ? "bg-purple-600 text-white"
                             : "bg-white text-gray-600 border border-gray-200"
                         }`}
            >
              {f.label}
            </button>
          ))}

          <Link
            to="/pricing"
            className="ml-auto bg-gradient-to-r from-purple-600
                       to-indigo-600 text-white px-4 py-2
                       rounded-xl text-sm font-bold
                       hover:opacity-90 transition"
          >
            + Top-Up
          </Link>
        </div>

        {/* Transactions */}
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : filtered.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-10
                          text-center border border-gray-100"
          >
            <div className="text-4xl mb-3">💳</div>
            <p className="text-gray-400">Koi transactions nahi hain abhi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => (
              <div
                key={tx._id}
                className="bg-white rounded-2xl p-4
                           border border-gray-100 shadow-sm
                           flex items-center gap-4"
              >
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex
                               items-center justify-center
                               text-2xl flex-shrink-0
                               ${
                                 tx.type === "credit"
                                   ? "bg-green-100"
                                   : "bg-red-50"
                               }`}
                >
                  {ACTION_ICONS[tx.action] || "💳"}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    {tx.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`text-xs px-2 py-0.5
                                     rounded-full font-medium
                                     ${
                                       ACTION_COLORS[tx.action] ||
                                       "bg-gray-100 text-gray-600"
                                     }`}
                    >
                      {tx.action}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* Amount */}
                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-lg font-black
                               ${
                                 tx.type === "credit"
                                   ? "text-green-600"
                                   : "text-red-500"
                               }`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {tx.credits}
                  </p>
                  <p className="text-xs text-gray-400">
                    Balance: {tx.balanceAfter}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
