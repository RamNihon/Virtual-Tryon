import {
  KeyRound,
  Code2,
  Share2,
  ShieldAlert,
  BookOpen,
  Copy,
  Check,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

/*
  ─── INTEGRATION SECTION ────────────────────────────────────
  Premium redesign of the old "Integration" tab. Same three
  capabilities (API key, embeddable widget, shareable shop
  link) — now with clear section framing, English copy, and
  consistent CTA styling so a seller understands what each
  card does in a glance.

  `copiedKey` / `onCopy` are lifted from Dashboard.jsx (shared
  clipboard state, same pattern as StoreSection) so all copy
  buttons across the dashboard behave identically.
--------------------------------------------------------------*/
export default function IntegrationSection({
  apiKey,
  widgetCode,
  shopUrl,
  onCopy,
  copiedKey,
}) {
  return (
    <div className="space-y-5">
      {/* ─── API Key Card ───────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5 text-purple-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Your API Key</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Used to authenticate requests from your website or app.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" strokeWidth={2} />
          <p className="text-amber-700 text-xs font-medium">
            Keep this key private — don't share it publicly.
          </p>
        </div>

        <div className="flex gap-2 items-center">
          <code className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-sm flex-1 overflow-hidden truncate text-gray-700">
            {apiKey}
          </code>
          <CopyButton
            active={copiedKey === "apiKey"}
            onClick={() => onCopy(apiKey, "apiKey")}
          />
        </div>
      </div>

      {/* ─── Widget Embed Card ──────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Code2 className="w-5 h-5 text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">
                Add to Your Website
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">
                Paste this snippet into your site to enable virtual try-on.
              </p>
            </div>
          </div>

          <a
            href="/widget-guide"
            className="hidden sm:flex items-center gap-1 text-purple-600
                       text-xs font-semibold hover:text-purple-700
                       shrink-0 whitespace-nowrap"
          >
            <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
            Full Guide
            <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
          </a>
        </div>

        <a
          href="/widget-guide"
          className="sm:hidden flex items-center gap-1.5 bg-purple-50
                     text-purple-700 px-3.5 py-2 rounded-xl text-xs
                     font-semibold w-fit mb-4"
        >
          <BookOpen className="w-3.5 h-3.5" strokeWidth={2} />
          Read Full Guide
          <ArrowRight className="w-3 h-3" strokeWidth={2.5} />
        </a>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-amber-700 text-xs leading-relaxed">
            If the widget doesn't detect your products automatically, add
            the class <code className="bg-amber-100 px-1 rounded">tryon-product</code>{" "}
            to each product element using JavaScript.
          </p>
        </div>

        <p className="text-gray-500 text-xs font-medium mb-2">
          Paste this before the closing{" "}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">
            &lt;/body&gt;
          </code>{" "}
          tag:
        </p>

        <div className="bg-gray-900 rounded-xl p-4 text-emerald-400 text-xs font-mono overflow-x-auto max-w-full mb-3">
          {widgetCode}
        </div>

        <CopyButton
          active={copiedKey === "widgetCode"}
          onClick={() => onCopy(widgetCode, "widgetCode")}
          label="Copy Code"
          fullWidth
        />
      </div>

      {/* ─── Shareable Shop Link Card ───────────────────── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5 text-emerald-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Don't Have a Website?
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Share this link directly with your customers instead.
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center mb-3">
          <code className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-sm flex-1 truncate text-gray-700">
            {shopUrl}
          </code>
          <CopyButton
            active={copiedKey === "integrationShopUrl"}
            onClick={() => onCopy(shopUrl, "integrationShopUrl")}
          />
        </div>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(
            `Check out my shop! ${shopUrl}`,
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full sm:w-fit
                     bg-gradient-to-r from-emerald-500 to-green-600
                     text-white px-6 py-2.5 rounded-xl text-sm font-semibold
                     shadow-sm hover:shadow-md transition-all"
        >
          <MessageCircle className="w-4 h-4" strokeWidth={2} />
          Share on WhatsApp
        </a>
      </div>
    </div>
  );
}

/* Small reusable copy button so all three cards behave and
   look identical — matches the pattern already used in
   StoreSection for consistency across the dashboard. */
function CopyButton({ active, onClick, label = "Copy", fullWidth }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 px-4 py-2.5
                  rounded-xl text-sm font-bold transition shrink-0
                  ${fullWidth ? "w-full" : ""}
                  ${
                    active
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-purple-700 text-white hover:bg-purple-800"
                  }`}
    >
      {active ? (
        <>
          <Check className="w-4 h-4" strokeWidth={2.5} />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" strokeWidth={2} />
          {label}
        </>
      )}
    </button>
  );
}
