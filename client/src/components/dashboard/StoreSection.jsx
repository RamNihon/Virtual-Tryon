import { useState, useEffect } from "react";
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
  IndianRupee,
  Gift,
  Rocket,
  Gem,
  Crown,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";

/*
  ─── STORE SETTINGS SECTION ─────────────────────────────────
  Everything the seller needs to manage their store's identity:
  account info, shop links (garment + fabric), and the WhatsApp
  / UPI details customers and payments rely on.

  Note: `copied` / `onCopy` are passed down from Dashboard.jsx
  because the same clipboard state is shared with the
  Integration section — keeping it lifted avoids two separate
  "copied" indicators fighting each other.
--------------------------------------------------------------*/
/* --- Redesign note: back to the original violet/indigo/white system —
   same one used on the Pricing and Credit History pages, so the whole
   seller dashboard reads as one product. A warm cream/gold "Atelier
   Ledger" treatment was tried in between and didn't land well for the
   seller ("aankh me chubhne jaisa"), so the palette reverts here. Every
   functional upgrade built during that detour carries forward unchanged:
     - nameMsg/settingsMsg render as auto-dismissing toasts instead of a
       banner that sits on screen forever.
     - The WhatsApp/UPI form tracks unsaved changes locally: Save is
       disabled until something actually changed, shows a spinner while
       saving, shows an "Unsaved changes" pill, and warns before an
       accidental tab close.
     - WhatsApp/UPI inputs get a live format-check tick.
     - Shop Name editing supports Enter-to-save / Escape-to-cancel.
     - The Plan row/badge icon swaps per tier (Gift/Rocket/Gem/Crown),
       matching the plan iconography already used on the Pricing page.
     - Shop links show a small "Live" indicator.
   None of this changes how updateName / saveShopSettings / onCopy are
   called — Dashboard.jsx doesn't need any changes.
--------------------------------------------------------------*/

// Plan tier → icon + color, mirrors the tier icons on the Pricing page
// so the same tier reads identically everywhere in the app.
const PLAN_META = {
  free: { icon: Gift, className: "bg-slate-100 text-slate-700" },
  basic: { icon: Rocket, className: "bg-blue-100 text-blue-700" },
  pro: { icon: Gem, className: "bg-violet-100 text-violet-700" },
  elite: { icon: Crown, className: "bg-amber-100 text-amber-700" },
};

// Light heuristic so a plain success/error string from Dashboard.jsx
// still gets styled as success or error without needing a new prop.
const isErrorMessage = (msg = "") => {
  const lower = msg.toLowerCase();
  return ["error", "fail", "wrong", "invalid", "nahi", "galat"].some((w) =>
    lower.includes(w),
  );
};

// Small "this shop link is live" signal.
function LiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold
                 text-emerald-600 bg-emerald-50 border border-emerald-200
                 px-2 py-0.5 rounded-full"
    >
      <span className="relative flex w-1.5 h-1.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
      </span>
      Live
    </span>
  );
}

// Hand-drawn "draws in" checkmark (pathLength normalizes the path to 1,
// so the stroke-dashoffset transition works regardless of path shape).
// Reused for both the copy-confirmation icon and the WhatsApp/UPI field
// validity ticks — one motif for "confirmed correct" everywhere instead
// of mixing checkmark styles across the page.
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

// Floating, auto-dismissing toast — success/error styling decided by the
// isErrorMessage heuristic above.
function Toast({ message, visible, onClose }) {
  const isError = isErrorMessage(message);
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`flex items-start gap-2.5 w-full sm:w-80 bg-white
                 border rounded-2xl shadow-lg px-4 py-3
                 transition-all duration-300
                 ${
                   visible
                     ? "opacity-100 translate-y-0"
                     : "opacity-0 translate-y-2 pointer-events-none"
                 }
                 ${isError ? "border-red-200" : "border-emerald-200"}`}
    >
      {isError ? (
        <AlertCircle className="w-[18px] h-[18px] text-red-500 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="w-[18px] h-[18px] text-emerald-500 flex-shrink-0 mt-0.5" />
      )}
      <p className="text-sm text-gray-700 flex-1">{message}</p>
      <button
        onClick={onClose}
        aria-label="Dismiss"
        className="text-gray-300 hover:text-gray-500 transition flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// Small icon chip used for every row/header icon — plain colored tint,
// no gradient/bevel, so it stays quiet and doesn't compete with the
// gradient CTAs which are the page's one deliberate "shiny" element.
function IconChip({ icon: Icon, className = "bg-violet-100 text-violet-600", size = "sm" }) {
  const box = size === "lg" ? "w-10 h-10 rounded-2xl" : "w-8 h-8 rounded-xl";
  const iconSize = size === "lg" ? "w-5 h-5" : "w-4 h-4";
  return (
    <span className={`${box} flex items-center justify-center shrink-0 ${className}`}>
      <Icon className={iconSize} strokeWidth={2.25} />
    </span>
  );
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <IconChip icon={icon} size="lg" />
      <div>
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
    </div>
  );
}

const CARD =
  "bg-white rounded-2xl shadow-sm relative overflow-hidden hover:shadow-md transition-shadow";
// Thin gradient accent bar — the one recurring "signature" element
// repeated across all three cards instead of three different decorations.
const CARD_ACCENT =
  "absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-violet-500";

const PRIMARY_BTN =
  "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm hover:shadow-md transition";
const SECONDARY_BTN =
  "bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200/60 transition";
const SECONDARY_BTN_COPIED =
  "bg-emerald-50 text-emerald-600 border border-emerald-200 transition";

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
  const planMeta = PLAN_META[planRaw.toLowerCase()];
  const PlanIcon = planMeta?.icon || Gem;

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
    <svg viewBox="0 0 24 24" width="15" height="15" fill="#FFFFFF" style={{ display: "block", margin: "auto" }}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );

  // Local toast visibility, decoupled from whatever Dashboard.jsx does
  // with its own nameMsg/settingsMsg strings — these flip back to false
  // on a timer regardless, so the message actually disappears on screen.
  const [nameToastVisible, setNameToastVisible] = useState(false);
  const [settingsToastVisible, setSettingsToastVisible] = useState(false);

  useEffect(() => {
    if (!nameMsg) return;
    setNameToastVisible(true);
    const t = setTimeout(() => setNameToastVisible(false), 4000);
    return () => clearTimeout(t);
  }, [nameMsg]);

  useEffect(() => {
    if (!settingsMsg) return;
    setSettingsToastVisible(true);
    const t = setTimeout(() => setSettingsToastVisible(false), 4000);
    return () => clearTimeout(t);
  }, [settingsMsg]);

  // Local "saving" flag so Save Settings can show a spinner and disable
  // itself mid-request, whether saveShopSettings is sync or async.
  const [saving, setSaving] = useState(false);
  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await saveShopSettings();
    } finally {
      setSaving(false);
    }
  };

  // Unsaved-changes tracking for the WhatsApp/UPI form. Captured once on
  // mount, then resynced whenever a non-error settingsMsg comes back
  // (read as "the save succeeded"). Powers the disabled Save button, the
  // "Unsaved changes" pill, and the leave-page warning below.
  const [savedSnapshot, setSavedSnapshot] = useState({
    whatsapp: shopSettings?.whatsapp || "",
    upiId: shopSettings?.upiId || "",
  });

  useEffect(() => {
    if (settingsMsg && !isErrorMessage(settingsMsg)) {
      setSavedSnapshot({
        whatsapp: shopSettings?.whatsapp || "",
        upiId: shopSettings?.upiId || "",
      });
    }
    // eslint-disable-next-line
  }, [settingsMsg]);

  const isDirty =
    (shopSettings?.whatsapp || "") !== savedSnapshot.whatsapp ||
    (shopSettings?.upiId || "") !== savedSnapshot.upiId;

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Light inline format hints — purely advisory, they never block saving.
  const whatsappValue = shopSettings?.whatsapp || "";
  const upiValue = shopSettings?.upiId || "";
  const whatsappLooksValid = /^\d{10,12}$/.test(whatsappValue);
  const upiLooksValid = /^[\w.-]+@[a-zA-Z]+$/.test(upiValue);

  return (
    <div className="space-y-5">
      {/* ─── Account Info Card ─────────────────────────── */}
      <div className={CARD}>
        <div className={CARD_ACCENT} />
        <div className="p-6">
          <SectionHeader
            icon={Store}
            title="Account Overview"
            subtitle="Your identity, plan & storefront name"
          />

          <div className="space-y-3">
            {/* Email */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="flex items-center gap-2.5 text-gray-500 text-sm">
                <IconChip icon={Mail} />
                Email
                <Lock className="w-3 h-3 text-gray-300" strokeWidth={2.5} />
              </span>
              <span className="font-medium text-sm text-gray-800">
                {seller?.email}
              </span>
            </div>

            {/* Seller ID */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="flex items-center gap-2.5 text-gray-500 text-sm">
                <IconChip icon={Hash} />
                Seller ID
                <Lock className="w-3 h-3 text-gray-300" strokeWidth={2.5} />
              </span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs text-gray-800 font-medium">
                  {dashboard?.seller?.sellerId}
                </span>
                <button
                  onClick={() => onCopy(dashboard?.seller?.sellerId, "sellerId")}
                  aria-label="Copy Seller ID"
                  className="w-6 h-6 flex items-center justify-center rounded-md
                             text-gray-300 hover:bg-violet-50 hover:text-violet-600
                             transition active:scale-90"
                >
                  <CopyIndicator copied={copiedKey === "sellerId"} size="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Plan */}
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="flex items-center gap-2.5 text-gray-500 text-sm">
                <IconChip
                  icon={PlanIcon}
                  className={planMeta?.className || "bg-violet-100 text-violet-600"}
                />
                Plan
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-bold
                            px-2.5 py-1 rounded-full capitalize
                            ${planMeta?.className || "bg-gray-100 text-gray-600"}`}
              >
                <PlanIcon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {planLabel}
              </span>
            </div>

            {/* Shop Name — editable */}
            <div className="flex justify-between items-center py-3">
              <span className="flex items-center gap-2.5 text-gray-500 text-sm">
                <IconChip icon={Store} />
                Shop Name
              </span>
              <div className="flex items-center gap-2">
                {editingName ? (
                  <>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      // Enter saves, Escape cancels — no change in behaviour
                      // for anyone who just clicks the buttons.
                      onKeyDown={(e) => {
                        if (e.key === "Enter") updateName();
                        if (e.key === "Escape") setEditingName(false);
                      }}
                      onFocus={(e) => e.target.select()}
                      className="border border-violet-300 rounded-lg
                                 px-3 py-1.5 text-sm focus:outline-none
                                 focus:border-violet-500 focus:ring-2
                                 focus:ring-violet-100 w-36"
                      placeholder="Enter new name"
                      autoFocus
                    />
                    <button
                      onClick={updateName}
                      disabled={nameLoading}
                      aria-label="Save name"
                      className="w-8 h-8 flex items-center justify-center
                                 rounded-lg bg-emerald-50 text-emerald-600
                                 hover:bg-emerald-100 transition
                                 disabled:opacity-50"
                    >
                      {nameLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" strokeWidth={2.5} />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingName(false)}
                      aria-label="Cancel"
                      className="w-8 h-8 flex items-center justify-center
                                 rounded-lg bg-gray-100 text-gray-500
                                 hover:bg-red-50 hover:text-red-600 transition"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="font-medium text-sm text-gray-800">
                      {seller?.name}
                    </span>
                    <button
                      onClick={() => {
                        setNewName(seller?.name || "");
                        setEditingName(true);
                      }}
                      className="flex items-center gap-1 text-violet-600 text-xs
                                 font-semibold hover:text-violet-700 bg-violet-50
                                 px-2.5 py-1.5 rounded-lg transition"
                    >
                      <Pencil className="w-3 h-3" strokeWidth={2.5} />
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Shop Links Card ───────────────────────────── */}
      <div className={CARD}>
        <div className={CARD_ACCENT} />
        <div className="p-6 space-y-4">
          <SectionHeader
            icon={Link2}
            title="Shop Links"
            subtitle="Share these with your customers"
          />

          {/* Garment Shop Link */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <IconChip icon={Shirt} />
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                Garment Shop
              </p>
              {dashboard?.shopUrl && <LiveBadge />}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div
                className="flex-1 min-w-0 bg-violet-50/60 border border-violet-100
                           rounded-xl px-3 py-2.5 font-mono text-xs text-violet-700
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
                >
                  View Shop
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>

          {/* Fabric Shop Link — Pro/Elite only */}
          {showFabricShop && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <IconChip icon={Scissors} className="bg-indigo-100 text-indigo-600" />
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
                  Fabric Shop
                </p>
                <LiveBadge />
              </div>

              <div
                className="bg-violet-50/60 border border-violet-100 rounded-xl
                           px-3 py-2.5 font-mono text-xs text-violet-700
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
                >
                  <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
                  View Fabric Shop
                </button>
              </div>

              <a
                href={
                  "https://wa.me/?text=" +
                  encodeURIComponent("Fabric Shop dekhein! 🧵 " + fabricUrl)
                }
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full
                           bg-gradient-to-r from-emerald-500 to-green-600
                           text-white py-2.5 rounded-xl text-xs font-bold
                           shadow-sm hover:shadow-md transition"
              >
                <MessageCircle className="w-3.5 h-3.5" strokeWidth={2} />
                Share on WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>

      {/* ─── WhatsApp / UPI Settings Card ──────────────── */}
      <div className={CARD}>
        <div className={CARD_ACCENT} />
        <div className="p-6">
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <SectionHeader
              icon={Wallet}
              title="Order & Payment Details"
              subtitle="These are shown to customers when they order."
            />
            {/* Unsaved-changes pill, only shown once the seller has
                actually edited something. */}
            {isDirty && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold
                           text-amber-600 bg-amber-50 border border-amber-200
                           px-2.5 py-1 rounded-full mb-5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Unsaved changes
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <IconChip icon={WhatsAppIconSVG} className="bg-emerald-500 text-white" />
                WhatsApp Number
              </label>
              <p className="text-gray-400 text-xs mb-2 ml-10">
                Orders will be sent to this number.
              </p>
              {/* Validity tick reuses the same hand-drawn checkmark used
                  for Copy — one motif for "confirmed correct". */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="91XXXXXXXXXX"
                  value={shopSettings.whatsapp}
                  onChange={(e) =>
                    setShopSettings({ ...shopSettings, whatsapp: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl
                             px-4 pr-10 py-2.5 text-sm focus:outline-none
                             focus:border-violet-500 focus:ring-2
                             focus:ring-violet-100 transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                  <DrawCheck
                    className="w-4 h-4"
                    active={whatsappValue.length > 0 && whatsappLooksValid}
                  />
                </span>
              </div>
              <p className="text-amber-500 text-xs mt-1.5">
                Include the country code — e.g. 91XXXXXXXXXX
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                <IconChip icon={IndianRupee} className="bg-amber-100 text-amber-700" />
                UPI ID
              </label>
              <p className="text-gray-400 text-xs mb-2 ml-10">Used for payments.</p>
              <div className="relative">
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={shopSettings.upiId}
                  onChange={(e) =>
                    setShopSettings({ ...shopSettings, upiId: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl
                             px-4 pr-10 py-2.5 text-sm focus:outline-none
                             focus:border-violet-500 focus:ring-2
                             focus:ring-violet-100 transition"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-500">
                  <DrawCheck
                    className="w-4 h-4"
                    active={upiValue.length > 0 && upiLooksValid}
                  />
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveSettings}
              disabled={saving || !isDirty}
              title={!isDirty ? "No changes to save yet" : undefined}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl
                         text-sm font-semibold
                         disabled:opacity-40 disabled:cursor-not-allowed
                         disabled:shadow-none ${PRIMARY_BTN}`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" strokeWidth={2} />
              )}
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating toast stack — fixed to the viewport so it works the
          same whether this section is scrolled deep inside the Dashboard
          layout or not. Auto-dismisses via the effects above; the X lets
          the seller close it early. */}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-3
                   items-end w-[calc(100%-3rem)] sm:w-auto"
      >
        {nameMsg && (
          <Toast
            message={nameMsg}
            visible={nameToastVisible}
            onClose={() => setNameToastVisible(false)}
          />
        )}
        {settingsMsg && (
          <Toast
            message={settingsMsg}
            visible={settingsToastVisible}
            onClose={() => setSettingsToastVisible(false)}
          />
        )}
      </div>
    </div>
  );
}