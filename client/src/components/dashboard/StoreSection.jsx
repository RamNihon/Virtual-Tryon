import {
  Pencil,
  Check,
  X,
  ExternalLink,
  Copy,
  MessageCircle,
  Scissors,
  Save,
  Mail,
  Hash,
  Store,
  Shirt,
  Link2,
  Wallet,
//   Phone,
  Crown,
  Sparkles,
  Info,
  IndianRupee,
} from "lucide-react";

/*
  ─── STORE SETTINGS SECTION ─────────────────────────────────
  "Atelier Ledger" v5 — motion pass.

  Colors are untouched from v4 (one ink+brass family, rose only
  on Garment) — that discipline is what fixed the "loud" problem
  and it stays. This round adds dimensionality and motion on
  top of it, kept deliberately narrow so it doesn't reopen the
  same problem in a different form:

  - A glass-like specular highlight is only on the "hero" badges
    (the 3 card headers + the 2 shop-link tile icons — 5 spots
    total). The small row icons (Email, Seller ID, Phone, etc.)
    stay plain gradient, no highlight — they repeat 6-7 times
    per screen, so adding a glint to each would just be v3's
    mistake again, wearing a different costume.
  - Entrance animation runs once on mount, hover-lift only
    exists on interaction. Nothing loops or flashes at rest.
  - The Plan badge gets a single shine-sweep ~0.6s after mount
    — the one "wow" beat — then it's done for good.

  On "3D animation jaisa Lottie deti hai": a real Lottie needs
  either an actual .json export from After Effects/LottieFiles,
  or the lottie-react package rendering one. I can't fabricate
  legitimate Lottie animation data by hand, and pulling in a new
  dependency for one checkmark felt like overkill. So the copy
  success-check below is hand-built with SVG pathLength + a CSS
  stroke-dashoffset transition — same "drawing in" feel Lottie
  checkmarks are known for, zero new dependencies. If you later
  want a genuine Lottie moment (e.g. a fancier save-success
  burst), grab a .json from lottiefiles.com, add `lottie-react`,
  and I'll wire the specific file in.
--------------------------------------------------------------*/

const HEADING_FONT = "'Fraunces', ui-serif, Georgia, serif";

const GEMS = {
  ink: "linear-gradient(135deg, #3A3352, #1C1730)",
  rose: "linear-gradient(135deg, #C48173, #9C4B3E)",
   blue: "linear-gradient(135deg, #3b6fe8, #25deeb)",
    green: "linear-gradient(135deg, #10B981, #05965c)",
     gold: "linear-gradient(135deg, #F59E0B, #efe524)" 
};

const GEM_ICON_COLOR = {
  ink: "#E3C989",
  rose: "#FFFDF7",
  blue: "#F0F5FF", 
  green:  "#FFFFFF",
   gold: "#0807078e" 
};

const GEM_SHADOW =
  "inset 0 1px 1px rgba(255,255,255,0.25), inset 0 -1px 2px rgba(0,0,0,0.18), 0 1px 3px rgba(28,23,48,0.25)";

const GEM_SIZES = {
  sm: { box: "w-[26px] h-[26px]", radius: "rounded-lg", icon: "w-[13px] h-[13px]" },
  md: { box: "w-8 h-8", radius: "rounded-lg", icon: "w-4 h-4" },
  lg: { box: "w-10 h-10", radius: "rounded-xl", icon: "w-[18px] h-[18px]" },
};

/* Scoped keyframes for the handful of one-shot animations. Safe, unlikely
   class names so nothing collides with the rest of your app. Worth moving
   into your global stylesheet once you're happy with it. */
function AtelierStyles() {
  return (
    <style>{`
      @keyframes al-card-in {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .al-card-in { animation: al-card-in 0.55s cubic-bezier(0.16,1,0.3,1) both; }

      @keyframes al-shine {
        0% { transform: translateX(-160%) skewX(-20deg); opacity: 0; }
        15% { opacity: 1; }
        100% { transform: translateX(220%) skewX(-20deg); opacity: 0; }
      }
      .al-shine { position: relative; overflow: hidden; }
      .al-shine::after {
        content: "";
        position: absolute;
        top: 0; left: 0; height: 100%; width: 35%;
        background: linear-gradient(120deg, transparent, rgba(255,255,255,0.5), transparent);
        animation: al-shine 1.3s ease-in-out 0.7s 1 both;
        pointer-events: none;
      }
    `}</style>
  );
}

function GemIcon({ icon: Icon, tone = "ink", size = "sm", glossy = false }) {
  const dims = GEM_SIZES[size];
  return (
    <span
      className={`${dims.box} ${dims.radius} flex items-center justify-center shrink-0
                  transition-transform duration-300 ease-out
                  group-hover:-translate-y-0.5 group-hover:scale-[1.07]`}
      style={{ boxShadow: GEM_SHADOW }}
    >
      <span
        className={`relative w-full h-full ${dims.radius} overflow-hidden flex items-center justify-center`}
        style={{ background: GEMS[tone] }}
      >
        {glossy && (
          <span
            className="absolute top-0.5 left-1 w-[45%] h-[35%] rounded-full
                       bg-white/40 blur-[1px] pointer-events-none"
            aria-hidden="true"
          />
        )}
        <Icon
          className={`${dims.icon} relative`}
          strokeWidth={2.25}
          style={{
            color: GEM_ICON_COLOR[tone],
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.2))",
          }}
        />
      </span>
    </span>
  );
}

/* Hand-built draw-in checkmark (pathLength normalizes the path to 1, so the
   stroke-dashoffset transition works regardless of the actual path shape).
   Kept always-mounted and cross-faded against the plain Copy icon so the
   "drawing" transition actually has something to animate from. */
function DrawCheck({ className = "", active = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M20 6 9 17l-5-5"
        pathLength="1"
        style={{
          strokeDasharray: 1,
          strokeDashoffset: active ? 0 : 1,
          transition: "stroke-dashoffset 0.35s cubic-bezier(0.65,0,0.35,1)",
        }}
      />
    </svg>
  );
}

function CopyIndicator({ copied, size = "w-3.5 h-3.5" }) {
  return (
    <span className={`relative ${size} inline-block shrink-0`}>
      <Copy
        className={`${size} absolute inset-0 transition-opacity duration-150 ${
          copied ? "opacity-0" : "opacity-100"
        }`}
        strokeWidth={2}
      />
      <DrawCheck
        className={`${size} absolute inset-0 transition-opacity duration-150 ${
          copied ? "opacity-100" : "opacity-0"
        }`}
        active={copied}
      />
    </span>
  );
}

function InfoNote({ children }) {
  if (!children) return null;
  return (
    <div
      className="flex items-center justify-center gap-1.5 text-xs font-medium
                 text-[#6B6577] bg-[#FBF9F5] border border-[#F1EDE4]
                 rounded-lg px-3 py-2.5"
    >
      <Info className="w-3.5 h-3.5 text-[#B8873D] shrink-0" strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5 group">
      <GemIcon icon={icon} tone="ink" size="lg" glossy />
      <div>
        <h2
          className="text-lg font-bold text-[#1C1730] tracking-tight"
          style={{ fontFamily: HEADING_FONT }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-[11px] text-[#948E9F] font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

const CARD =
  "bg-white rounded-2xl p-6 sm:p-7 border border-[#EFEAE0] al-card-in " +
  "shadow-[0_1px_2px_rgba(28,23,48,0.05),0_12px_32px_-18px_rgba(28,23,48,0.2)] " +
  "transition-[transform,box-shadow] duration-300 ease-out " +
  "hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(28,23,48,0.06),0_20px_40px_-20px_rgba(28,23,48,0.3)]";

const PRIMARY_BTN =
  "bg-gradient-to-br from-[#2E2748] to-[#140F22] text-white transition " +
  "hover:-translate-y-0.5 hover:shadow-[0_6px_16px_-4px_rgba(28,23,48,0.5)] active:scale-[0.97]";
const PRIMARY_BTN_SHADOW = {
  boxShadow:
    "inset 0 1px 0 rgba(255,255,255,0.1), 0 3px 8px -2px rgba(28,23,48,0.4)",
};

const SECONDARY_BTN =
  "bg-[#F5F3EE] text-[#5A5468] hover:bg-[#EFEAE0] hover:text-[#1C1730] transition active:scale-[0.97]";
const SECONDARY_BTN_COPIED = "bg-[#E7F1EA] text-[#2F6F4E] active:scale-[0.97]";

export default function StoreSection({
  seller = {},
  dashboard = {},
  editingName = false,
  setEditingName = () => {},
  newName = "",
  setNewName = () => {},
  nameLoading = false,
  nameMsg = "",
  updateName = () => {},
  shopSettings = { whatsapp: "", upiId: "" },
  setShopSettings = () => {},
  settingsMsg = "",
  saveShopSettings = () => {},
  onCopy = () => {},
  copiedKey = null,
}) {
  const planRaw = (dashboard?.seller?.plan || seller?.plan || "").toString();
  const planLabel = planRaw
    ? planRaw.charAt(0).toUpperCase() + planRaw.slice(1).toLowerCase()
    : "—";
  const isPremiumPlan = ["pro", "elite"].includes(planRaw.toLowerCase());

  const showFabricShop =
    seller?.plan?.toLowerCase() === "pro" ||
    seller?.plan?.toLowerCase() === "elite" ||
    dashboard?.plan?.toLowerCase() === "pro";

  const fabricSellerId =
    dashboard?.sellerId || dashboard?.id || seller?.sellerId;
  const fabricUrl = fabricSellerId
    ? `${window.location.origin}/fabric/${fabricSellerId}`
    : "";

  const openLink = (url) => {
    if (!url) return;
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    window.open(url, isStandalone ? "_self" : "_blank", "noopener,noreferrer");
  };
const WhatsAppIconSVG = () => (
  // Ekdum asli WhatsApp logo ka math aur spacing fix kiya hai
  <svg 
    viewBox="0 0 24 24" 
    width="15" 
    height="15" 
    fill="#FFFFFF"
    style={{ display: 'block', margin: 'auto' }}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);


  return (
    <div className="space-y-6">
      <AtelierStyles />
      {/* Swap this for a <link> in your app's <head> once you're happy with it */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap"
      />

      {/* ─── Account Info Card ─────────────────────────── */}
      <div className={CARD} style={{ animationDelay: "0s" }}>
        <SectionHeader
          icon={Store}
          title="Account Overview"
          subtitle="Your identity, plan & storefront name"
        />

        <div>
          {/* Email */}
          <div className="flex justify-between items-center py-3.5 border-b border-[#F1EDE4] group">
            <span className="flex items-center gap-2.5 text-[#6B6577] text-sm">
              <GemIcon icon={Mail} tone="ink" />
              Email
            </span>
            <span className="font-medium text-sm text-[#1C1730]">
              {seller?.email}
            </span>
          </div>

          {/* Seller ID */}
          <div className="flex justify-between items-center py-3.5 border-b border-[#F1EDE4] group">
            <span className="flex items-center gap-2.5 text-[#6B6577] text-sm">
              <GemIcon icon={Hash} tone="ink" />
              Seller ID
            </span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs text-[#1C1730] font-medium">
                {dashboard?.seller?.sellerId}
              </span>
              <button
                onClick={() => onCopy(dashboard?.seller?.sellerId, "sellerId")}
                aria-label="Copy Seller ID"
                className="w-6 h-6 flex items-center justify-center rounded-md
                           text-[#A6A0B0] hover:bg-[#F7F1E3] hover:text-[#B8873D]
                           transition active:scale-90"
              >
                <CopyIndicator
                  copied={copiedKey === "sellerId"}
                  size="w-3 h-3"
                />
              </button>
            </div>
          </div>

          {/* Plan */}
          <div className="flex justify-between items-center py-3.5 border-b border-[#F1EDE4] group">
            <span className="flex items-center gap-2.5 text-[#6B6577] text-sm">
              <GemIcon icon={Sparkles} tone="ink" />
              Plan
            </span>
            <span
              className={`al-shine inline-flex items-center gap-1 pl-2.5 pr-3 py-1.5
                          rounded-full text-xs font-bold transition-transform
                          duration-300 hover:scale-105 ${
                            isPremiumPlan
                              ? "text-[#E3C989] ring-1 ring-[#E3C989]/40"
                              : "bg-[#F1EDE4] text-[#6B6577]"
                          }`}
              style={
                isPremiumPlan
                  ? {
                      background: GEMS.ink,
                      boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.08), 0 1px 3px rgba(28,23,48,0.25)",
                    }
                  : undefined
              }
            >
              {isPremiumPlan && (
                <Crown
                  className="w-3 h-3"
                  strokeWidth={2.5}
                  style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.25))" }}
                />
              )}
              {planLabel}
            </span>
          </div>

          {/* Shop Name — editable */}
          <div className="flex justify-between items-center py-3.5 group">
            <span className="flex items-center gap-2.5 text-[#6B6577] text-sm">
              <GemIcon icon={Store} tone="ink" />
              Shop Name
            </span>
            <div className="flex items-center gap-2">
              {editingName ? (
                <>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="border border-[#D8C9A3] rounded-lg
                               px-3 py-1.5 text-sm focus:outline-none
                               focus:border-[#B8873D] w-36 text-[#1C1730]"
                    placeholder="Enter new name"
                    autoFocus
                  />
                  <button
                    onClick={updateName}
                    disabled={nameLoading}
                    aria-label="Save name"
                    className="w-8 h-8 flex items-center justify-center
                               rounded-lg bg-[#E7F1EA] text-[#2F6F4E]
                               hover:bg-[#DAEBDF] transition
                               disabled:opacity-50 active:scale-90"
                  >
                    {nameLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-[#2F6F4E] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" strokeWidth={2.5} />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingName(false)}
                    aria-label="Cancel"
                    className="w-8 h-8 flex items-center justify-center
                               rounded-lg bg-[#F3F0EA] text-[#948E9F]
                               hover:bg-[#FBEAE6] hover:text-[#9C4B3E] transition
                               active:scale-90"
                  >
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </>
              ) : (
                <>
                  <span className="font-medium text-sm text-[#1C1730]">
                    {seller?.name}
                  </span>
                  <button
                    onClick={() => {
                      setNewName(seller?.name || "");
                      setEditingName(true);
                    }}
                    className="flex items-center gap-1 text-[#9C7A2E] text-xs
                               font-semibold hover:text-[#7A5F20] bg-[#FBF3E3]
                               px-2.5 py-1.5 rounded-lg transition active:scale-95"
                  >
                    <Pencil className="w-3 h-3" strokeWidth={2.5} />
                    Edit
                  </button>
                </>
              )}
            </div>
          </div>
          {nameMsg && (
            <div className="pt-3">
              <InfoNote>{nameMsg}</InfoNote>
            </div>
          )}
        </div>
      </div>

      {/* ─── Shop Links Card ───────────────────────────── */}
      <div className={CARD + " space-y-5"} style={{ animationDelay: "0.08s" }}>
        <SectionHeader
          icon={Link2}
          title="Shop Links"
          subtitle="Share these with your customers"
        />

        {/* Garment Shop Link — the one deliberate color accent (rose) */}
        <div>
          <div className="flex items-center gap-2.5 mb-3 group">
            <GemIcon icon={Shirt} tone="rose" size="md" glossy />
            <p className="text-[#948E9F] text-[11px] font-bold uppercase tracking-wider">
              Garment Shop
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div
              className="flex-1 min-w-0 bg-[#FBF9F5] border border-[#F1EDE4]
                         rounded-xl px-3.5 py-2.5 font-mono text-xs text-[#5A5468]
                         truncate flex items-center"
            >
              {dashboard?.shopUrl}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => onCopy(dashboard?.shopUrl, "garment")}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl
                            text-xs font-bold shrink-0 ${
                              copiedKey === "garment"
                                ? SECONDARY_BTN_COPIED
                                : SECONDARY_BTN
                            }`}
              >
                <CopyIndicator copied={copiedKey === "garment"} />
                {copiedKey === "garment" ? "Copied" : "Copy"}
              </button>
              <button
                onClick={() => openLink(dashboard?.shopUrl)}
                className={`flex items-center gap-1.5 font-bold px-3.5 py-2.5
                            rounded-xl text-xs shrink-0 ${PRIMARY_BTN}`}
                style={PRIMARY_BTN_SHADOW}
              >
                Open
                <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Fabric Shop Link — Pro/Elite only, back in the base ink family */}
        {showFabricShop && (
          <div className="relative pt-6">
            <div
              className="absolute top-0 left-0 right-0 flex items-center justify-center"
              aria-hidden="true"
            >
              <div className="w-full border-t-2 border-dashed border-[#E3C989]/70" />
              <span className="absolute w-1.5 h-1.5 rounded-full bg-[#E3C989] ring-4 ring-white" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 mb-3 group">
                <GemIcon icon={Scissors} tone="blue" size="md" glossy />
                <p className="text-[#948E9F] text-[11px] font-bold uppercase tracking-wider">
                  Fabric Shop
                </p>
              </div>

              <div
                className="bg-[#FBF9F5] border border-[#F1EDE4] rounded-xl
                           px-3.5 py-2.5 font-mono text-xs text-[#5A5468]
                           break-all mb-3"
              >
                {fabricUrl}
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  onClick={() => onCopy(fabricUrl, "fabric")}
                  className={`flex items-center justify-center gap-1.5 py-2.5
                              rounded-xl text-xs font-bold ${
                                copiedKey === "fabric"
                                  ? SECONDARY_BTN_COPIED
                                  : SECONDARY_BTN
                              }`}
                >
                  <CopyIndicator copied={copiedKey === "fabric"} />
                  {copiedKey === "fabric" ? "Copied" : "Copy Link"}
                </button>
                <button
                  onClick={() => openLink(fabricUrl)}
                  className={`flex items-center justify-center gap-1.5 py-2.5
                              rounded-xl text-xs font-bold ${PRIMARY_BTN}`}
                  style={PRIMARY_BTN_SHADOW}
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  Open Shop
                </button>
              </div>

              <a
                href={
                  "https://wa.me/?text=" +
                  encodeURIComponent("View My Fabric Shop! 🧵 " + fabricUrl)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full
                           bg-gradient-to-br from-[#22C55E] to-[#128C42]
                           text-white py-2.5 rounded-xl text-xs font-bold
                           transition hover:-translate-y-0.5 active:scale-[0.97]"
                style={{
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 6px -1px rgba(18,140,66,0.4)",
                }}
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Share on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>


      {/* ─── WhatsApp / UPI Settings Card ──────────────── */}
      <div className={CARD} style={{ animationDelay: "0.16s" }}>
        <SectionHeader
          icon={Wallet}
          title="Order & Payment Details"
          subtitle="Shown to customers when they order"
        />
        <div className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-[#1C1730] flex items-center gap-2.5 mb-1.5 group">
              <GemIcon icon={WhatsAppIconSVG} tone="green" />
              WhatsApp Number
            </label>
            <p className="text-[#948E9F] text-xs mb-2 ml-[34px]">
              Orders will be sent to this number.
            </p>
            <input
              type="text"
              placeholder="91XXXXXXXXXX"
              value={shopSettings.whatsapp}
              onChange={(e) =>
                setShopSettings({ ...shopSettings, whatsapp: e.target.value })
              }
              className="w-full border border-[#EFEAE0] rounded-xl
                         px-4 py-2.5 text-sm focus:outline-none
                         focus:border-[#B8873D] transition text-[#1C1730]"
            />
          <p className="text-[#B8873D] text-xs mt-1.5">
              Include the country code — e.g. 91XXXXXXXXXX
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-[#1C1730] flex items-center gap-2.5 mb-1.5 group">
              <GemIcon icon={IndianRupee} tone="gold" />
              UPI ID
            </label>
            <p className="text-[#948E9F] text-xs mb-2 ml-[34px]">
              Used for payments.
            </p>
            <input
              type="text"
              placeholder="yourname@upi"
              value={shopSettings.upiId}
              onChange={(e) =>
                setShopSettings({ ...shopSettings, upiId: e.target.value })
              }
              className="w-full border border-[#EFEAE0] rounded-xl
                         px-4 py-2.5 text-sm focus:outline-none
                         focus:border-[#B8873D] transition text-[#1C1730]"
            />
          </div>

          {settingsMsg && <InfoNote>{settingsMsg}</InfoNote>}

          <button
            onClick={saveShopSettings}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full
                        text-sm font-semibold ${PRIMARY_BTN}`}
            style={PRIMARY_BTN_SHADOW}
          >
            <Save className="w-4 h-4" strokeWidth={2} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}