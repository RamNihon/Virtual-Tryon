import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import {
  isPushSupported,
  getPushStatus,
  enablePushNotifications,
} from "../utils/pushNotifications";

/*
  ─── NOTIFICATION SOFT-ASK MODAL ────────────────────────────
  Shows a custom, friendly prompt BEFORE ever triggering the
  browser's real permission dialog — never the other way around.

  Why this matters: a browser's notification permission can only
  be meaningfully asked once. If a seller reflexively clicks
  "Block" on a prompt they weren't expecting (e.g. it fires the
  instant they land on the dashboard, before they understand why),
  that seller is locked out of push notifications permanently —
  JavaScript can never re-trigger the browser prompt once it's
  denied; they'd have to find their way into browser settings
  manually, which most people never do.

  This component only ever calls enablePushNotifications() (which
  triggers the real browser prompt) in response to an explicit
  "Enable Alerts" click. Dismissing this modal ("Not Now") leaves
  the browser's permission state untouched at "default", so it's
  safe to show this soft-ask again on a later visit.

  Mounted once near the top of the dashboard (see integration
  note at the bottom of this file) — it decides on its own
  whether there's anything to show.
--------------------------------------------------------------*/
export default function NotificationPermissionModal({ seller, token }) {
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    checkWhetherToShow();
    // eslint-disable-next-line
  }, []);

  const checkWhetherToShow = async () => {
    if (!isPushSupported()) return;

    // Don't re-show every single visit if the seller already
    // dismissed it recently — respect a short cool-down instead
    // of nagging on every login.
    const dismissedAt = localStorage.getItem("pushSoftAskDismissedAt");
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    const status = await getPushStatus();
    // Only show when the browser has never been asked at all
    // ("default") — if it's already granted or denied, there's
    // nothing this modal should do.
    if (status.permission === "default" && !status.unavailable) {
      setVisible(true);
    }
  };

  const handleEnable = async () => {
    setRequesting(true);
    try {
      await enablePushNotifications(token);
    } catch (err) {
      // Permission denied or something failed — either way, the
      // modal's job is done; Settings > Push Notifications remains
      // available for the seller to retry manually later.
    } finally {
      setRequesting(false);
      setVisible(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem("pushSoftAskDismissedAt", String(Date.now()));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/50 flex items-center
                 justify-center p-4"
    >
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div
          className="p-6 text-center relative"
          style={{ background: "linear-gradient(135deg,#7C3AED,#C026D3)" }}
        >
          <button
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="absolute top-4 right-4 w-7 h-7 rounded-full
                       bg-white/15 hover:bg-white/25 flex items-center
                       justify-center text-white transition"
          >
            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
          </button>

          <div
            className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/15
                       flex items-center justify-center"
          >
            <Bell className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-white font-bold text-lg">
            Never Miss an Order
          </h2>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-500 text-sm text-center leading-relaxed mb-6">
            {seller?.name ? `Hey ${seller.name}! ` : ""}
            Turn on notifications to get an instant alert the moment a
            customer places an order — right on this device.
          </p>

          <button
            onClick={handleEnable}
            disabled={requesting}
            className="w-full flex items-center justify-center gap-2
                       bg-gradient-to-r from-purple-600 to-fuchsia-500
                       text-white py-3.5 rounded-2xl text-sm font-bold
                       shadow-sm hover:shadow-md transition-all
                       disabled:opacity-50 mb-2.5"
          >
            <Bell className="w-4 h-4" strokeWidth={2} />
            {requesting ? "Requesting..." : "Enable Alerts"}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full text-gray-400 text-sm font-medium py-2
                       hover:text-gray-600 transition"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}

/*
  ─── HOW TO USE ─────────────────────────────────────────────
  In Dashboard.jsx, near the other component renders (alongside
  EditProductModal, etc.):

    import NotificationPermissionModal from
      "../components/NotificationPermissionModal";

    ...

    <NotificationPermissionModal seller={seller} token={token} />

  No props needed beyond seller (for the personalized greeting)
  and token (to call enablePushNotifications, which saves the
  subscription to the backend). The component is entirely
  self-contained — it decides on its own whether to render
  anything at all.
--------------------------------------------------------------*/