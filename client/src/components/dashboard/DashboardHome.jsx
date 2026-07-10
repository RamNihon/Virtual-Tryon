import { Link } from "react-router-dom";

/*
  ─── DASHBOARD HOME ─────────────────────────────────────────
  The "Dashboard" (overview/home) sidebar section: welcome
  header, the credits/usage/products/plan stat cards, low-credit
  and near-limit warnings, and quick links to Analytics and
  Credit History.

  This used to live inline inside pages/Dashboard.jsx across
  three separate `{activeTab === "dashboard" && (...)}` blocks
  (a holdover from an earlier refactor pass) — pulled out here
  to match every other section's pattern of being its own file.
--------------------------------------------------------------*/
export default function DashboardHome({ seller, dashboard }) {
  return (
    <>
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">
              👋 Welcome, {seller?.name}!
            </h1>
            <p className="text-gray-500 mt-1">Your seller dashboard</p>
          </div>

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

    </>
  );
}