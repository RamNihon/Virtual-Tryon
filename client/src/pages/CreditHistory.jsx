import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";
// --- Redesign note: same lucide-react icon system used on the Pricing
// page, so the two pages read as one product instead of two different
// visual languages. Kept a tight, purposeful import list — one icon per
// concept, nothing decorative-only.
import {
  ArrowLeft,
  CreditCard,
  BarChart3,
  CalendarRange,
  Trophy,
  ListFilter,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  Shirt,
  Scissors,
  Wand2,
  Lightbulb,
  Rocket,
  Gift,
  Loader2,
  Inbox,
} from "lucide-react";

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

  // --- Redesign note: colors moved from the old purple/blue/pink/green
  // mix to the app-wide violet/indigo/amber/emerald palette used on
  // Pricing, so a transaction badge here matches a plan badge there.
  const ACTION_COLORS = {
    readyTryon: "bg-violet-100 text-violet-700",
    fabricGen: "bg-blue-100 text-blue-700",
    fabricTryon: "bg-indigo-100 text-indigo-700",
    styleAdvice: "bg-fuchsia-100 text-fuchsia-700",
    planPurchase: "bg-emerald-100 text-emerald-700",
    topupPurchase: "bg-emerald-100 text-emerald-700",
    adminCredit: "bg-amber-100 text-amber-700",
  };

  // --- Redesign note: emoji -> lucide icon components + a matching
  // soft icon-chip background, so every transaction row gets a proper
  // two-tone icon tile instead of a raw emoji glyph.
  const ACTION_ICONS = {
    readyTryon: { icon: Shirt, bg: "bg-violet-100 text-violet-600" },
    fabricGen: { icon: Scissors, bg: "bg-blue-100 text-blue-600" },
    fabricTryon: { icon: Wand2, bg: "bg-indigo-100 text-indigo-600" },
    styleAdvice: { icon: Lightbulb, bg: "bg-fuchsia-100 text-fuchsia-600" },
    planPurchase: { icon: Rocket, bg: "bg-emerald-100 text-emerald-600" },
    topupPurchase: { icon: CreditCard, bg: "bg-emerald-100 text-emerald-600" },
    adminCredit: { icon: Gift, bg: "bg-amber-100 text-amber-600" },
  };
  const DEFAULT_ICON = { icon: CreditCard, bg: "bg-gray-100 text-gray-500" };

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.type === filter);

  // --- Redesign note: extracted the summary card + filter tab data into
  // plain arrays (was inline before) and swapped emoji labels for icon
  // component refs, matching the pattern used on the Pricing page.
  const summaryCards = summary
    ? [
        {
          label: "Available",
          icon: CreditCard,
          value: summary.currentCredits,
          color:
            summary.currentCredits < 50
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700",
        },
        {
          label: "This Month",
          icon: BarChart3,
          value: summary.monthlyUsed,
          color: "bg-orange-50 border-orange-200 text-orange-700",
        },
        {
          label: "Monthly Limit",
          icon: CalendarRange,
          value: summary.monthlyLimit,
          color: "bg-blue-50 border-blue-200 text-blue-700",
        },
        {
          label: "Total Used",
          icon: Trophy,
          value: summary.totalUsed,
          color: "bg-violet-50 border-violet-200 text-violet-700",
        },
      ]
    : [];

  const filterTabs = [
    { key: "all", label: "All", icon: ListFilter },
    { key: "debit", label: "Used", icon: ArrowUpCircle },
    { key: "credit", label: "Added", icon: ArrowDownCircle },
  ];

  return (
    // --- Redesign note: same soft slate -> violet gradient backdrop used
    // on Pricing, instead of flat bg-gray-50, so cards further down get
    // gentle depth against the page.
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/40">
      {/* Header */}
      <div
        className="bg-gradient-to-br from-slate-950
                      via-violet-950 to-indigo-950
                      py-10 px-6 relative overflow-hidden"
      >
        {/* --- Redesign note: same faint grid + glow-blob treatment from
            the Pricing hero, so dark headers feel like one design system
            across the app rather than a one-off gradient per page. */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="absolute top-0 right-0 w-72 h-72
                        bg-violet-500 opacity-20 rounded-full
                        blur-3xl"
        />
        <div
          className="absolute bottom-0 left-1/4 w-56 h-56
                        bg-indigo-500 opacity-20 rounded-full
                        blur-3xl"
        />

        <div className="max-w-4xl mx-auto relative z-10">
          <Link
            to="/dashboard"
            className="text-violet-300 hover:text-white
                       text-sm transition mb-4 inline-flex
                       items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-3xl font-black text-white mb-1 flex items-center gap-2.5">
            <span
              className="w-10 h-10 rounded-2xl bg-white/10
                 backdrop-blur-sm flex items-center
                 justify-center flex-shrink-0"
            >
              <CreditCard className="w-5 h-5" />
            </span>
            Credit History
          </h1>
          <p className="text-violet-200/80">
            The complete breakdown of your credits!
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        {summary && (
          <div
            className="grid grid-cols-2 md:grid-cols-4
                          gap-3 md:gap-4 mb-8"
          >
            {summaryCards.map((card, i) => (
              <div
                key={i}
                className={`rounded-2xl p-4 border-2 text-center
                           hover:shadow-md transition-shadow
                           ${card.color}`}
              >
                <p className="text-xs font-medium mb-1.5 flex items-center justify-center gap-1">
                  <card.icon className="w-3.5 h-3.5" />
                  {card.label}
                </p>
                <p className="text-2xl md:text-3xl font-black">
                  {card.value}
                </p>
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
                               : "bg-gradient-to-r from-violet-600 to-indigo-600"
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
        {/* --- Redesign note: wrapped in flex-wrap so on very narrow
            screens the "+ Top-Up" pill drops to its own line instead of
            squeezing the three filter tabs into illegibility. */}
        <div className="flex flex-wrap gap-2 mb-5">
          {filterTabs.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-sm
                         font-medium transition
                         inline-flex items-center gap-1.5
                         ${
                           filter === f.key
                             ? "bg-violet-600 text-white shadow-sm shadow-violet-200"
                             : "bg-white text-gray-600 border border-gray-200 hover:border-violet-200"
                         }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}

          <Link
            to="/pricing/#top-up"
            className="ml-auto bg-gradient-to-r from-violet-600
                       to-indigo-600 text-white px-4 py-2
                       rounded-xl text-sm font-bold
                       hover:opacity-90 transition
                       inline-flex items-center gap-1.5
                       shadow-sm shadow-violet-200"
          >
            <Plus className="w-3.5 h-3.5" />
            Top-Up
          </Link>
        </div>

        {/* Transactions */}
        {loading ? (
          // --- Redesign note: replaced plain "Loading..." text with a
          // spinner icon so the loading state carries the same visual
          // language as the buttons elsewhere in the app.
          <div className="flex items-center justify-center gap-2 text-gray-400 py-10">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-10
                          text-center border border-gray-100"
          >
            <div
              className="w-14 h-14 rounded-2xl bg-violet-50
                 text-violet-400 flex items-center justify-center
                 mx-auto mb-3"
            >
              <Inbox className="w-7 h-7" />
            </div>
            <p className="text-gray-400">Koi transactions nahi hain abhi.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((tx) => {
              // --- Redesign note: resolve icon + chip color once per row
              // instead of inline emoji lookup, and fall back gracefully
              // if an unknown action type ever comes back from the API.
              const { icon: ActionIcon, bg: iconBg } =
                ACTION_ICONS[tx.action] || DEFAULT_ICON;

              return (
                <div
                  key={tx._id}
                  className="bg-white rounded-2xl p-4
                           border border-gray-100 shadow-sm
                           hover:shadow-md hover:border-violet-100
                           transition-all
                           flex flex-col sm:flex-row
                           sm:items-center gap-3 sm:gap-4"
                >
                  {/* --- Redesign note: icon + text now share a row on
                      every breakpoint (mobile included); only the amount
                      block moves below on narrow screens, and gets a top
                      border + right-alignment so it still reads clearly
                      as "the number that matters" instead of blending
                      into the description text. */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex
                               items-center justify-center
                               flex-shrink-0
                               ${iconBg}`}
                    >
                      <ActionIcon className="w-5 h-5" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
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
                  </div>

                  {/* Amount */}
                  <div
                    className="text-right flex-shrink-0
                               flex sm:block items-center justify-between
                               pt-3 sm:pt-0 border-t sm:border-t-0
                               border-gray-100 ml-16 sm:ml-0"
                  >
                    <p
                      className={`text-lg font-black flex items-center gap-1
                               ${
                                 tx.type === "credit"
                                   ? "text-emerald-600"
                                   : "text-red-500"
                               }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowDownCircle className="w-4 h-4" />
                      ) : (
                        <ArrowUpCircle className="w-4 h-4" />
                      )}
                      {tx.type === "credit" ? "+" : "-"}
                      {tx.credits}
                    </p>
                    <p className="text-xs text-gray-400">
                      Balance: {tx.balanceAfter}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}