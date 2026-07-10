// eslint-disable-next-line
import { useState } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CreditCard,
  TrendingUp,
  Crown,
  ArrowUpRight,
  Receipt,
  Sparkles,
  Zap,
} from "lucide-react";
import API_URL from "../../api";

/*
  ─── BILLING SECTION ────────────────────────────────────────
  Pulls together what used to live only in the top-of-dashboard
  stat cards (credits, monthly usage, plan) plus the actual
  transaction log from GET /api/seller/credit-transactions —
  giving the seller one place to see "what do I have" and
  "where did it go", with a clear upgrade path.
--------------------------------------------------------------*/
export default function BillingSection({ token, seller, dashboard }) {
  const credits = dashboard?.seller?.credits || 0;
  const monthlyUsed = dashboard?.seller?.monthlyCreditsUsed || 0;
  const monthlyLimit = dashboard?.seller?.monthlyCreditsLimit || 100;
  const plan = (dashboard?.seller?.plan || "free").toLowerCase();
  const usagePercent = Math.min((monthlyUsed / monthlyLimit) * 100, 100);
  const isLowCredits = credits < 50;
  const isNearLimit = monthlyUsed >= monthlyLimit * 0.9;

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["creditTransactions", token],
    enabled: !!token,
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/api/seller/credit-transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.transactions || [];
    },
  });

  return (
    <div className="space-y-5">
      {/* ─── Overview cards ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <OverviewCard
          icon={CreditCard}
          label="Credits Remaining"
          value={credits}
          accent={isLowCredits ? "red" : "purple"}
          footer={
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isLowCredits
                    ? "bg-gradient-to-r from-red-500 to-orange-500"
                    : "bg-gradient-to-r from-purple-600 to-fuchsia-500"
                }`}
                style={{ width: `${Math.min((credits / 100) * 100, 100)}%` }}
              />
            </div>
          }
        />

        <OverviewCard
          icon={TrendingUp}
          label="Used This Month"
          value={monthlyUsed}
          sub={`of ${monthlyLimit} limit`}
          accent={isNearLimit ? "amber" : "blue"}
          footer={
            <div className="w-full h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isNearLimit
                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                    : "bg-gradient-to-r from-blue-500 to-cyan-500"
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          }
        />

        <OverviewCard
          icon={Crown}
          label="Current Plan"
          value={plan.toUpperCase()}
          accent="fuchsia"
          isPlan
        />
      </div>

      {/* ─── Low credits / near-limit banners ───────────── */}
      {isLowCredits && (
        <UpgradeBanner
          icon={Zap}
          title="Running Low on Credits"
          desc={`Only ${credits} credits left — top up to keep try-ons running smoothly.`}
          ctaLabel="Top Up Now"
        />
      )}
      {isNearLimit && !isLowCredits && (
        <UpgradeBanner
          icon={TrendingUp}
          title="Monthly Limit Almost Reached"
          desc={`${monthlyUsed}/${monthlyLimit} credits used this month.`}
          ctaLabel="Upgrade Plan"
          tone="amber"
        />
      )}

      {/* ─── Upgrade CTA (always visible unless already Elite) ─ */}
      {plan !== "elite" && (
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#4c1d95,#7c3aed,#c026d3)",
          }}
        >
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">
                  Unlock more with a higher plan
                </h3>
                <p className="text-purple-100 text-xs mt-0.5 max-w-sm">
                  More credits, higher monthly limits, and Fabric Shop access
                  on Pro and Elite.
                </p>
              </div>
            </div>
            <Link
              to="/pricing"
              className="flex items-center gap-1.5 bg-white text-purple-700
                         px-5 py-2.5 rounded-xl text-sm font-bold
                         shrink-0 hover:bg-purple-50 transition"
            >
              View Plans
              <ArrowUpRight className="w-4 h-4" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      )}

      {/* ─── Transaction history ────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Receipt className="w-4 h-4 text-gray-400" strokeWidth={2} />
          <h2 className="text-base font-bold text-gray-800">
            Credit History
          </h2>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-400 text-sm py-8">Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">
            No transactions yet.
          </p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <TransactionRow key={tx._id} tx={tx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OverviewCard({ icon: Icon, label, value, sub, accent, footer, isPlan }) {
  const accentMap = {
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    red: { bg: "bg-red-50", text: "text-red-600" },
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    amber: { bg: "bg-amber-50", text: "text-amber-600" },
    fuchsia: { bg: "bg-fuchsia-50", text: "text-fuchsia-600" },
  };
  const colors = accentMap[accent] || accentMap.purple;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}
        >
          <Icon className={`w-4 h-4 ${colors.text}`} strokeWidth={2} />
        </div>
        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p
        className={`font-extrabold text-gray-800 ${
          isPlan ? "text-xl" : "text-2xl"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-gray-400 text-xs mt-0.5">{sub}</p>}
      {footer}
    </div>
  );
}

function UpgradeBanner({ icon: Icon, title, desc, ctaLabel, tone = "red" }) {
  const toneMap = {
    red: {
      bg: "linear-gradient(135deg,#fff5f5,#fff)",
      border: "#fecaca",
      titleColor: "#dc2626",
      descColor: "#ef4444",
      btn: "linear-gradient(135deg,#dc2626,#f97316)",
    },
    amber: {
      bg: "linear-gradient(135deg,#fffbeb,#fff)",
      border: "#fed7aa",
      titleColor: "#d97706",
      descColor: "#f59e0b",
      btn: "linear-gradient(135deg,#d97706,#f59e0b)",
    },
  };
  const c = toneMap[tone];

  return (
    <div
      className="rounded-2xl px-5 py-4 flex items-center justify-between gap-3 flex-wrap"
      style={{ background: c.bg, border: `1px solid ${c.border}` }}
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 shrink-0" style={{ color: c.titleColor }} strokeWidth={2} />
        <div>
          <p className="font-bold text-sm" style={{ color: c.titleColor }}>
            {title}
          </p>
          <p className="text-xs mt-0.5" style={{ color: c.descColor }}>
            {desc}
          </p>
        </div>
      </div>
      <Link
        to="/pricing"
        className="text-white text-sm font-bold px-4 py-2 rounded-xl shrink-0"
        style={{ background: c.btn }}
      >
        {ctaLabel} →
      </Link>
    </div>
  );
}

// Matches the actual `action` values the backend logs (confirmed
// against CreditHistory.jsx) — the earlier guessed names (tryon,
// fabricGen, purchase) didn't match what the API actually sends.
const ACTION_LABELS = {
  readyTryon: { label: "Garment Shop Try-On", icon: "👗" },
  fabricGen: { label: "Fabric Generation", icon: "🧵" },
  fabricTryon: { label: "Fabric Shop Try-On", icon: "✨" },
  styleAdvice: { label: "Style Advice", icon: "💡" },
  planPurchase: { label: "Plan Purchase", icon: "🚀" },
  topupPurchase: { label: "Credit Top-Up", icon: "💳" },
  adminCredit: { label: "Bonus Credit", icon: "🎁" },
};

function TransactionRow({ tx }) {
  const meta = ACTION_LABELS[tx.action] || { label: tx.action, icon: "📌" };
  // The backend always sends `credits` as a positive magnitude —
  // whether it was added or spent is told by `tx.type` ("credit" vs
  // "debit"), not by the sign of the number itself. Assuming the
  // number's sign was the original bug: every transaction showed "+"
  // because tx.credits > 0 was always true.
  const isCredit = tx.type === "credit";

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <span className="text-lg shrink-0">{meta.icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-700">{meta.label}</p>
          <p className="text-gray-400 text-xs">
            {new Date(tx.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <span
        className={`text-sm font-bold shrink-0 ${
          isCredit ? "text-emerald-600" : "text-red-500"
        }`}
      >
        {isCredit ? "+" : "-"}
        {tx.credits}
      </span>
    </div>
  );
}