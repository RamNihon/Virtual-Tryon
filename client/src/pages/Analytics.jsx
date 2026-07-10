import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  Copy,
  Crown,
  Gauge,
  Package,
  PieChart,
  RefreshCw,
  Rocket,
  Scissors,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  WandSparkles,
  ShoppingBag,
  CreditCard,
  Activity,
} from "lucide-react";

function formatNumber(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-IN").format(Number.isFinite(num) ? num : 0);
}

function buildFallbackAnalytics(seller) {
  return {
    stats: {
      totalTryons: 0,
      totalProducts: 0,
      recentTryons: 0,
      previousTryons: 0,
      totalOrders: 0,
      recentOrders: 0,
      previousOrders: 0,
      fabricGenCount: 0,
      fabricTryonCount: 0,
      plan: seller?.plan || "free",
      credits: seller?.credits ?? seller?.remainingCredits ?? 0,
      monthlyCreditsUsed: seller?.monthlyCreditsUsed ?? 0,
      monthlyCreditsLimit: seller?.monthlyCreditsLimit ?? 100,
      conversionRate: 0,
      tryonGrowth: 0,
      orderGrowth: 0,
      healthScore: 0,
      grade: "C",
    },
    dailyData: [],
    productTryons: [],
    insights: [],
    summary: {
      bestDay: null,
      worstDay: null,
      topProduct: null,
    },
  };
}

function getHealthTone(score) {
  if (score >= 90) return "emerald";
  if (score >= 80) return "blue";
  if (score >= 70) return "violet";
  if (score >= 50) return "amber";
  return "rose";
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  note,
  trend,
  trendText,
}) {
  return (
    <div className="group relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-50 text-slate-900 ring-1 ring-slate-200 transition group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>

        <div
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            trend === "up"
              ? "bg-emerald-50 text-emerald-700"
              : trend === "down"
                ? "bg-rose-50 text-rose-700"
                : "bg-slate-50 text-slate-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3" />
          ) : trend === "down" ? (
            <TrendingDown className="h-3 w-3" />
          ) : (
            <Activity className="h-3 w-3" />
          )}
          {trendText}
        </div>
      </div>

      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">
        {value}
      </p>
      {note ? (
        <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
      ) : null}
    </div>
  );
}

function SectionCard({ icon: Icon, title, subtitle, children, rightCta }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-950">
              {title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
          </div>
        </div>
        {rightCta ? <div>{rightCta}</div> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function MiniPill({ children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-600",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export default function Analytics() {
  const { seller, token } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(buildFallbackAnalytics(seller));
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const isFreePlan = String(seller?.plan || "").toLowerCase() === "free";

  const fetchAnalytics = useCallback(
    async ({ quiet = false } = {}) => {
      try {
        const res = await axios.get(`${API_URL}/api/seller/analytics`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 95000,
        });

        if (res.data?.success) {
          setAnalytics(res.data);
          if (!quiet) showToast("success", "Analytics refreshed successfully.");
        } else {
          setAnalytics(buildFallbackAnalytics(seller));
          if (!quiet) {
            showToast(
              "error",
              "Analytics could not be loaded. Showing the latest safe summary.",
            );
          }
        }
      } catch (err) {
        console.log("Analytics error:", err.message);
        setAnalytics(buildFallbackAnalytics(seller));
        if (!quiet) {
          showToast(
            "error",
            "Analytics could not be loaded. Showing the latest safe summary.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [seller, showToast, token],
  );

  useEffect(() => {
    if (!seller || !token) {
      navigate("/login");
      return;
    }

    fetchAnalytics({ quiet: true });

    return () => {
      if (toastRef.current) clearTimeout(toastRef.current);
    };
  }, [fetchAnalytics, navigate, seller, token]);

  const stats = analytics?.stats || buildFallbackAnalytics(seller).stats;
  const insights = Array.isArray(analytics?.insights) ? analytics.insights : [];
  const summary = analytics?.summary || buildFallbackAnalytics(seller).summary;

  const dailyData = useMemo(() => {
    const dailyDataRaw = Array.isArray(analytics?.dailyData)
      ? analytics.dailyData
      : [];
    return dailyDataRaw.map((item) => ({
      ...item,
      tryons: Number(item.tryons || 0),
      orders: Number(item.orders || 0),
      fabricGens: Number(item.fabricGens || 0),
    }));
  }, [analytics?.dailyData]);

  const topProducts = useMemo(() => {
    const productTryonsRaw = Array.isArray(analytics?.productTryons)
      ? analytics.productTryons
      : [];
    return productTryonsRaw
      .map((item, idx) => ({
        name:
          item.name || item.productName || item.title || `Product ${idx + 1}`,
        count: Number(item.tryonCount ?? item.count ?? item.tryons ?? 0),
        brandName: item.brandName || "",
        imageUrl: item.imageUrl || "",
        price: Number(item.price || 0),
        category: item.category || "",
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [analytics?.productTryons]);

  const totalTryons = Number(stats.totalTryons || 0);
  const totalOrders = Number(stats.totalOrders || 0);
  const recentTryons = Number(stats.recentTryons || 0);
  const previousTryons = Number(stats.previousTryons || 0);
  const recentOrders = Number(stats.recentOrders || 0);
  const previousOrders = Number(stats.previousOrders || 0);
  const fabricGenCount = Number(stats.fabricGenCount || 0);
  const fabricTryonCount = Number(stats.fabricTryonCount || 0);
  const totalProducts = Number(stats.totalProducts || 0);
  const credits = Number(stats.credits || 0);
  const conversionRate = Number(stats.conversionRate || 0);
  const tryonGrowth = Number(stats.tryonGrowth || 0);
  const orderGrowth = Number(stats.orderGrowth || 0);
  const healthScore = Number(stats.healthScore || 0);
  const grade = stats.grade || "C";
  const healthTone = getHealthTone(healthScore);

  const topProduct = summary?.topProduct || topProducts[0] || null;

  const trendLabel = useMemo(() => {
    if (dailyData.length < 4) return "Not enough data";
    if (tryonGrowth > 0) return `${Math.round(tryonGrowth)}% growth`;
    if (tryonGrowth < 0) return `${Math.abs(Math.round(tryonGrowth))}% dip`;
    return "Stable momentum";
  }, [dailyData.length, tryonGrowth]);

  const trendDescription = useMemo(() => {
    if (dailyData.length < 4) {
      return "Collect a few more days of activity to unlock trend insights.";
    }
    if (tryonGrowth > 0) {
      return `Try-on volume is rising, and orders are changing by ${
        orderGrowth > 0 ? "+" : ""
      }${Math.round(orderGrowth)}% compared to the earlier period.`;
    }
    if (tryonGrowth < 0) {
      return "Try-on volume is slightly lower. Highlight best-selling products and promote them more visibly.";
    }
    return "Your activity is steady. A stronger CTA on the shop page can improve engagement.";
  }, [dailyData.length, orderGrowth, tryonGrowth]);

  const handleCopySummary = async () => {
    const bestDay = summary?.bestDay || null;
    const worstDay = summary?.worstDay || null;

    const text = [
      `VirtualTryOn Analytics Summary`,
      `Seller: ${seller?.name || "Store"}`,
      `Grade: ${grade}`,
      `Health Score: ${healthScore}/100`,
      `Try-Ons: ${formatNumber(totalTryons)}`,
      `Orders: ${formatNumber(totalOrders)}`,
      `Conversion Rate: ${conversionRate.toFixed(1)}%`,
      `Recent Try-Ons: ${formatNumber(recentTryons)}`,
      `Recent Orders: ${formatNumber(recentOrders)}`,
      bestDay ? `Best Day: ${bestDay}` : "",
      worstDay ? `Lowest Day: ${worstDay}` : "",
      topProduct
        ? `Top Product: ${topProduct.name} (${formatNumber(topProduct.count)})`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      showToast("success", "Analytics summary copied to clipboard.");
    } catch {
      showToast("error", "Copy failed. Please try again.");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await fetchAnalytics();
  };

  const openUpgrade = () => {
    navigate("/pricing");
  };

  if (!seller || !token) {
    return null;
  }

  if (!loading && isFreePlan) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-slate-900">
        <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-2xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
            <div className="bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.15),transparent_35%),linear-gradient(to_right,#ffffff,#faf5ff)] px-6 py-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
                <ShieldCheck className="h-4 w-4" />
                Premium analytics
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950">
                Unlock detailed store analytics
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                Upgrade to Basic, Pro, or Elite to view conversion charts,
                product performance, activity trends, and business insights in
                real time.
              </p>
            </div>

            <div className="px-6 py-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { icon: BarChart3, text: "Daily try-on graph" },
                  { icon: Target, text: "Conversion tracking" },
                  { icon: Package, text: "Product performance" },
                  { icon: Clock3, text: "Activity history" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.text}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-violet-600 ring-1 ring-slate-200">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={openUpgrade}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
                >
                  <Rocket className="h-4 w-4" />
                  Upgrade Plan
                </button>

                <Link
                  to="/dashboard"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to Dashboard
                </Link>
              </div>

              <p className="mt-5 text-center text-xs text-slate-500">
                Premium analytics are available on paid plans only.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-slate-900">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
              <div className="h-4 w-24 rounded-full bg-slate-200" />
              <div className="mt-4 h-8 w-72 rounded-full bg-slate-200" />
              <div className="mt-3 h-4 w-96 max-w-full rounded-full bg-slate-100" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.04)]"
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="h-[360px] rounded-[2rem] border border-slate-200 bg-white" />
              <div className="h-[360px] rounded-[2rem] border border-slate-200 bg-white" />
            </div>

            <div className="h-[220px] rounded-[2rem] border border-slate-200 bg-white" />
          </div>
        </div>
      </div>
    );
  }

  const healthToneClass =
    healthTone === "emerald"
      ? "bg-emerald-50 text-emerald-600"
      : healthTone === "blue"
        ? "bg-blue-50 text-blue-600"
        : healthTone === "violet"
          ? "bg-violet-50 text-violet-600"
          : healthTone === "amber"
            ? "bg-amber-50 text-amber-600"
            : "bg-rose-50 text-rose-600";

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900">
      {/* Toast */}
      {toast ? (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`max-w-md rounded-2xl border px-4 py-3 shadow-[0_18px_55px_rgba(15,23,42,0.12)] backdrop-blur-xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full ${
                  toast.type === "success" ? "bg-emerald-100" : "bg-rose-100"
                }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  {toast.type === "success" ? "Success" : "Attention"}
                </p>
                <p className="mt-1 text-sm leading-6">{toast.message}</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div className="border-b border-slate-200 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_30%),linear-gradient(to_bottom,#ffffff,#f8fafc)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 transition hover:text-violet-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">
                <BarChart3 className="h-3.5 w-3.5" />
                Analytics Dashboard
              </div>

              <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Seller performance at a glance
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                {seller?.name ? `${seller.name}'s` : "Your"} store analytics,
                trend signals, product insights, and conversion metrics in one
                clean view.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <MiniPill tone="emerald">
                  <BadgeCheck className="mr-1 h-3.5 w-3.5" />
                  {grade} grade
                </MiniPill>
                <MiniPill tone={healthTone}>
                  <Gauge className="mr-1 h-3.5 w-3.5" />
                  {healthScore}/100 health
                </MiniPill>
                <MiniPill tone="violet">
                  <Sparkles className="mr-1 h-3.5 w-3.5" />
                  Trend: {trendLabel}
                </MiniPill>
                <MiniPill tone="slate">
                  <Clock3 className="mr-1 h-3.5 w-3.5" />
                  {new Date().toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </MiniPill>
              </div>
            </div>

            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_16px_45px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-10">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Business Health
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-950">
                    {grade} • {healthScore}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${healthToneClass}`}
                >
                  <Gauge className="h-6 w-6" />
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-600">
                {healthTone === "emerald"
                  ? "Healthy conversion and good buyer interest."
                  : healthTone === "blue"
                    ? "Good traction with room to improve conversion."
                    : healthTone === "violet"
                      ? "Strong momentum. Keep promoting top products."
                      : healthTone === "amber"
                        ? "Try-on activity is present, but conversion can improve."
                        : "Business needs attention. Focus on product visibility."}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-sm">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Last refreshed</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {loading ? "Updating..." : "Live"}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-slate-500">Products</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatNumber(totalProducts)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              Secure seller data
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <PieChart className="h-4 w-4 text-violet-500" />
              Daily activity insights
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              AI-ready summaries
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              onClick={handleCopySummary}
              className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
            >
              <Copy className="h-4 w-4" />
              Copy Summary
            </button>

            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
            >
              <Crown className="h-4 w-4" />
              Upgrade
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={ShoppingBag}
            label="Total Try-Ons"
            value={formatNumber(totalTryons)}
            accent="bg-gradient-to-r from-violet-500 to-fuchsia-500"
            note="All virtual try-on sessions generated by customers."
            trend={totalTryons > 0 ? "up" : "neutral"}
            trendText={totalTryons > 0 ? "Active" : "No data"}
          />
          <StatCard
            icon={CheckCircle2}
            label="Total Orders"
            value={formatNumber(totalOrders)}
            accent="bg-gradient-to-r from-emerald-500 to-green-500"
            note="Orders coming from the customer shop and WhatsApp flow."
            trend={totalOrders > 0 ? "up" : "neutral"}
            trendText={totalOrders > 0 ? "Selling" : "No data"}
          />
          <StatCard
            icon={TrendingUp}
            label="Conversion Rate"
            value={`${conversionRate.toFixed(1)}%`}
            accent="bg-gradient-to-r from-indigo-500 to-cyan-500"
            note="Orders divided by total try-ons."
            trend={conversionRate > 0 ? "up" : "neutral"}
            trendText={conversionRate > 0 ? "Good" : "0%"}
          />
          <StatCard
            icon={Activity}
            label="Recent Try-Ons"
            value={formatNumber(recentTryons)}
            accent="bg-gradient-to-r from-orange-500 to-amber-500"
            note="Latest activity window from your analytics feed."
            trend={recentTryons > 0 ? "up" : "neutral"}
            trendText={recentTryons > 0 ? "Fresh" : "No data"}
          />
          <StatCard
            icon={Scissors}
            label="Fabric Generations"
            value={formatNumber(fabricGenCount)}
            accent="bg-gradient-to-r from-cyan-500 to-blue-500"
            note="Fabric to garment generation activity."
            trend={fabricGenCount > 0 ? "up" : "neutral"}
            trendText={fabricGenCount > 0 ? "Live" : "No data"}
          />
          <StatCard
            icon={WandSparkles}
            label="Fabric Try-Ons"
            value={formatNumber(fabricTryonCount)}
            accent="bg-gradient-to-r from-pink-500 to-rose-500"
            note="Customer interactions inside fabric flow."
            trend={fabricTryonCount > 0 ? "up" : "neutral"}
            trendText={fabricTryonCount > 0 ? "Fresh" : "No data"}
          />
          <StatCard
            icon={Package}
            label="Products"
            value={formatNumber(totalProducts)}
            accent="bg-gradient-to-r from-slate-700 to-slate-900"
            note="Total published products in your store."
            trend={totalProducts > 0 ? "up" : "neutral"}
            trendText={totalProducts > 0 ? "Ready" : "No data"}
          />
          <StatCard
            icon={CreditCard}
            label="Credits Left"
            value={formatNumber(credits)}
            accent={
              credits < 50
                ? "bg-gradient-to-r from-rose-500 to-red-500"
                : "bg-gradient-to-r from-emerald-500 to-teal-500"
            }
            note={
              credits < 50
                ? "Low credits — consider topping up soon."
                : "Healthy balance available."
            }
            trend={credits < 50 ? "down" : "up"}
            trendText={credits < 50 ? "Low" : "Good"}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <SectionCard
            icon={TrendingUp}
            title="Last 7 Days Activity"
            subtitle="Daily try-ons and orders tracked in a premium, easy-to-read chart."
            rightCta={
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <Activity className="h-3.5 w-3.5 text-violet-600" />
                Trend-driven activity
              </div>
            }
          >
            <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <ResponsiveContainer
                  width="100%"
                  height={320}
                  key={dailyData.length}
                >
                  <LineChart
                    data={dailyData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="tryonsLine"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#7C3AED" />
                        <stop offset="100%" stopColor="#EC4899" />
                      </linearGradient>
                      <linearGradient
                        id="ordersLine"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "16px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="tryons"
                      stroke="url(#tryonsLine)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#7C3AED", strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                      name="Try-Ons"
                      isAnimationActive
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="url(#ordersLine)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
                      activeDot={{ r: 7 }}
                      name="Orders"
                      isAnimationActive
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Conversion
                      </p>
                      <p className="mt-1 text-3xl font-black text-slate-950">
                        {conversionRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                      <Target className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-600 to-emerald-500 transition-all duration-700"
                      style={{
                        width: `${Math.min(conversionRate * 10, 100)}%`,
                      }}
                    />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Orders generated from your total try-on activity.
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Momentum
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {trendLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {trendDescription}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Best performing product
                  </p>
                  <p className="mt-2 text-xl font-black text-slate-950">
                    {topProduct?.name || "No product data yet"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {topProduct
                      ? `${formatNumber(topProduct.count)} try-ons recorded for this item.`
                      : "Add more products to unlock product-level insights."}
                  </p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            icon={BarChart3}
            title="Try-Ons vs Orders"
            subtitle="A quick comparison of how engagement turns into sales."
          >
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <ResponsiveContainer
                width="100%"
                height={320}
                key={"bar-" + dailyData.length}
              >
                <BarChart
                  data={dailyData}
                  margin={{ top: 5, right: 18, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="tryonsBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                    <linearGradient id="ordersBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#34D399" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15,23,42,0.08)",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="tryons"
                    fill="url(#tryonsBar)"
                    name="Try-Ons"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={42}
                  />
                  <Bar
                    dataKey="orders"
                    fill="url(#ordersBar)"
                    name="Orders"
                    radius={[10, 10, 0, 0]}
                    maxBarSize={42}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Try-on intensity
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {totalProducts > 0
                    ? formatNumber(Math.round(totalTryons / totalProducts))
                    : 0}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Average try-ons per product. More products usually create more
                  discovery.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Recent orders
                </p>
                <p className="mt-2 text-3xl font-black text-slate-950">
                  {formatNumber(recentOrders)}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Latest order activity in the current reporting window.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            icon={ShoppingBag}
            title="Top Products"
            subtitle="Your best-performing items ranked by try-ons."
          >
            {topProducts.length > 0 ? (
              <div className="space-y-4">
                {topProducts.map((item, index) => {
                  const max = Math.max(...topProducts.map((p) => p.count), 1);
                  const pct = (item.count / max) * 100;

                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className="rounded-[1.25rem] border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-950">
                            {index + 1}. {item.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatNumber(item.count)} try-ons
                          </p>
                        </div>
                        <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-700">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-violet-600 ring-1 ring-slate-200">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">
                  No product analytics yet
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Publish more products and customers will start generating
                  try-on insights here.
                </p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            icon={Crown}
            title="Executive Insight"
            subtitle="A compact summary that helps you take action faster."
            rightCta={
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                Auto-generated
              </div>
            }
          >
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-violet-50 to-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Performance summary
                </p>
                <h3 className="mt-2 text-2xl font-black text-slate-950">
                  {grade} • {healthScore}/100
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {healthTone === "emerald"
                    ? "Healthy conversion and good buyer interest."
                    : healthTone === "blue"
                      ? "Good traction with room to improve conversion."
                      : healthTone === "violet"
                        ? "Strong momentum. Keep promoting top products."
                        : healthTone === "amber"
                          ? "Try-on activity is present, but conversion can improve."
                          : "Business needs attention. Focus on product visibility."}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Recommended action
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {conversionRate < 4
                    ? "Highlight best-selling products and improve the first image in each product card."
                    : recentTryons < recentOrders
                      ? "Customers are converting well. Keep the current visual strategy and test more products."
                      : "Increase product variety and promote the top three items more prominently on the shop page."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Credits balance
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {formatNumber(credits)}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {credits < 50 ? "Low balance" : "Healthy balance"}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Momentum
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {trendLabel}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    Activity signal for this reporting period.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Next best step
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {isFreePlan
                    ? "Upgrade to access detailed analytics and product-level performance."
                    : "Refresh the dashboard after adding new products to see fresh engagement signals."}
                </p>
              </div>

              {insights.length > 0 ? (
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    AI insights
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {insights.slice(0, 4).map((item, idx) => (
                      <li key={`${item}-${idx}`} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-violet-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </div>

        <SectionCard
          icon={Target}
          title="Conversion Rate"
          subtitle="A simple performance meter showing how try-ons turn into orders."
          rightCta={
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
              Live KPI
            </div>
          }
        >
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Try-on to order conversion
                  </p>
                  <p className="mt-2 text-4xl font-black text-slate-950">
                    {conversionRate.toFixed(1)}%
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
                    healthTone === "emerald"
                      ? "bg-emerald-50 text-emerald-700"
                      : healthTone === "blue"
                        ? "bg-blue-50 text-blue-700"
                        : healthTone === "violet"
                          ? "bg-violet-50 text-violet-700"
                          : healthTone === "amber"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                  }`}
                >
                  {grade} grade
                </div>
              </div>

              <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${Math.min(conversionRate * 10, 100)}%` }}
                />
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Conversion rate is one of the clearest indicators of how well
                your shop is turning attention into sales.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Most active day
                </p>
                <p className="mt-2 text-xl font-black text-slate-950">
                  {summary?.bestDay || "N/A"}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  The day with the highest try-on activity.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Orders this period
                </p>
                <p className="mt-2 text-xl font-black text-slate-950">
                  {formatNumber(totalOrders)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Combined orders from all tracked customer interactions.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Recent try-ons
                </p>
                <p className="mt-2 text-xl font-black text-slate-950">
                  {formatNumber(recentTryons)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Try-on activity in the latest reporting window.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Previous period
                </p>
                <p className="mt-2 text-xl font-black text-slate-950">
                  {formatNumber(previousTryons)} /{" "}
                  {formatNumber(previousOrders)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Try-ons / orders from the earlier comparison window.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Premium CTA */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.12),transparent_32%),linear-gradient(to_right,#ffffff,#faf5ff)] shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
          <div className="px-6 py-8 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700">
                  <Sparkles className="h-4 w-4" />
                  Premium seller insights
                </div>
                <h3 className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Turn analytics into faster decisions
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Use this dashboard to understand which products attract
                  attention, where conversions are strongest, and what to
                  improve next.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh data
                </button>

                <button
                  onClick={handleCopySummary}
                  className="inline-flex items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                >
                  <Copy className="h-4 w-4" />
                  Copy summary
                </button>

                <Link
                  to="/pricing"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
                >
                  <Crown className="h-4 w-4" />
                  Upgrade plan
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
