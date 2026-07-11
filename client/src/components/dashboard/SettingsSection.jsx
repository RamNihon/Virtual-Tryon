import { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Lock,
  Bell,
  // eslint-disable-next-line
  BellRing,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Check,
  Smartphone,
} from "lucide-react";
import API_URL from "../../api";
import {
  isPushSupported,
  getPushStatus,
  enablePushNotifications,
  disablePushNotifications,
} from "../../utils/pushNotifications";

/*
  ─── SETTINGS SECTION ───────────────────────────────────────
  Name update reuses the exact same working endpoint StoreSection
  already uses (PUT /update-profile). Password, notification
  preferences, and account deletion now have real backend routes
  (change-password, notification-preferences, delete-account —
  all added to seller.js) and are fully wired here.
--------------------------------------------------------------*/
export default function SettingsSection({
  seller,
  token,
  editingName,
  setEditingName,
  newName,
  setNewName,
  nameLoading,
  nameMsg,
  updateName,
  onAccountDeleted,
}) {
  return (
    <div className="space-y-5">
      <NameCard
        seller={seller}
        editingName={editingName}
        setEditingName={setEditingName}
        newName={newName}
        setNewName={setNewName}
        nameLoading={nameLoading}
        nameMsg={nameMsg}
        updateName={updateName}
      />
      <PasswordCard token={token} />
      <PushNotificationCard token={token} />
      <NotificationsCard token={token} />
      <DangerZoneCard token={token} onAccountDeleted={onAccountDeleted} />
    </div>
  );
}

/* ─── Account Name (unchanged, still works via /update-profile) ─ */
function NameCard({
  seller,
  editingName,
  setEditingName,
  newName,
  setNewName,
  nameLoading,
  nameMsg,
  updateName,
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-purple-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">Your Name</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            This is shown to customers on your shop page.
          </p>
        </div>
      </div>

      {editingName ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="flex-1 border border-purple-300 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={updateName}
            disabled={nameLoading}
            className="bg-purple-700 text-white px-5 py-2.5 rounded-xl
                       text-sm font-semibold hover:bg-purple-800
                       transition disabled:opacity-50"
          >
            {nameLoading ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setEditingName(false)}
            className="bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl
                       text-sm font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">{seller?.name}</span>
          <button
            onClick={() => {
              setNewName(seller?.name || "");
              setEditingName(true);
            }}
            className="text-purple-600 text-sm font-semibold
                       hover:text-purple-700 bg-purple-50
                       px-4 py-2 rounded-xl transition"
          >
            Edit
          </button>
        </div>
      )}
      {nameMsg && <p className="text-sm text-gray-600 mt-2">{nameMsg}</p>}
    </div>
  );
}

/* ─── Password ───────────────────────────────────────────── */
function PasswordCard({ token }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState("success");

  const handleSubmit = async () => {
    setMsg("");

    if (!form.current || !form.next || !form.confirm) {
      setMsg("Please fill in all fields.");
      setMsgType("error");
      return;
    }
    if (form.next.length < 8) {
      setMsg("New password must be at least 8 characters.");
      setMsgType("error");
      return;
    }
    if (form.next !== form.confirm) {
      setMsg("New password and confirmation don't match.");
      setMsgType("error");
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${API_URL}/api/seller/change-password`,
        { currentPassword: form.current, newPassword: form.next },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setMsg("Password updated successfully!");
      setMsgType("success");
      setForm({ current: "", next: "", confirm: "" });
    } catch (err) {
      setMsg(err.response?.data?.message || "Something went wrong.");
      setMsgType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5 text-blue-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-800">Password</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Change your account password.
          </p>
        </div>
      </div>

       <div className="space-y-2.5">
        <PasswordInput
          placeholder="Current password"
          value={form.current}
          onChange={(v) => setForm({ ...form, current: v })}
          show={showCurrent}
          onToggleShow={() => setShowCurrent(!showCurrent)}
          onFocus={() => setMsg("")}
        />
        <PasswordInput
          placeholder="New password (min 8 characters)"
          value={form.next}
          onChange={(v) => setForm({ ...form, next: v })}
          show={showNext}
          onToggleShow={() => setShowNext(!showNext)}
          onFocus={() => setMsg("")}
        />
        <PasswordInput
          placeholder="Confirm new password"
          value={form.confirm}
          onChange={(v) => setForm({ ...form, confirm: v })}
          show={showNext}
          onFocus={() => setMsg("")}
        />

        {msg && (
          <p
            className={`text-xs font-medium ${
              msgType === "error" ? "text-red-500" : "text-emerald-600"
            }`}
          >
            {msg}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-purple-700 text-white px-5 py-2.5 rounded-xl
                     text-sm font-semibold hover:bg-purple-800
                     transition disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </div>
    </div>
  );
}

function PasswordInput({ placeholder, value, onChange, show, onToggleShow, onFocus }) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
         onFocus={onFocus}
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                   pr-11 text-sm focus:outline-none focus:border-purple-500"
      />
      {onToggleShow && (
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                     hover:text-gray-600"
        >
          {show ? (
            <EyeOff className="w-4 h-4" strokeWidth={2} />
          ) : (
            <Eye className="w-4 h-4" strokeWidth={2} />
          )}
        </button>
      )}
    </div>
  );
}

/* ─── Browser Push Notifications ─────────────────────────── */
function PushNotificationCard({ token }) {
  const [status, setStatus] = useState({ supported: false });
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
 
  useEffect(() => {
    getPushStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }, []);
 
  const handleToggle = async () => {
    setError("");
    setToggling(true);
    try {
      if (status.subscribed) {
        await disablePushNotifications(token);
        setStatus((s) => ({ ...s, subscribed: false }));
      } else {
        await enablePushNotifications(token);
        setStatus((s) => ({ ...s, subscribed: true, permission: "granted" }));
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setToggling(false);
    }
  };
 
  if (!isPushSupported()) return null; // hide entirely on unsupported browsers
 
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-purple-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Push Notifications
            </h2>
            <p className="text-gray-400 text-xs mt-0.5 max-w-xs">
              Get an instant alert on this device the moment a new order
              comes in.
            </p>
          </div>
        </div>
 
        {!loading && (
          <ToggleSwitch
            checked={!!status.subscribed}
            onChange={handleToggle}
            disabled={
              toggling || status.permission === "denied" || status.unavailable
            }
          />
        )}
      </div>
 
      {status.unavailable && (
        <p className="text-gray-500 text-xs mt-3 bg-gray-50 rounded-lg px-3 py-2">
          {status.reason || "Push notifications aren't available right now."}
        </p>
      )}
      {status.permission === "denied" && (
        <p className="text-amber-600 text-xs mt-3 bg-amber-50 rounded-lg px-3 py-2">
          Notifications are blocked for this site in your browser settings.
          Enable them there, then refresh this page.
        </p>
      )}
      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
    </div>
  );
}


/* ─── Notifications ──────────────────────────────────────── */
function NotificationsCard({ token }) {
  const [prefs, setPrefs] = useState({
    newOrders: true,
    lowCreditAlerts: true,
    weeklySummary: true,
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios
      .get(`${API_URL}/api/seller/notification-preferences`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (!cancelled) setPrefs(res.data.preferences);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const toggle = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await axios.put(
        `${API_URL}/api/seller/notification-preferences`,
        updated,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch (e) {
      // Revert on failure so the toggle reflects reality
      setPrefs(prefs);
    }
  };

  const OPTIONS = [
    { key: "newOrders", label: "New orders", desc: "Get notified when a customer places an order." },
    { key: "lowCreditAlerts", label: "Low credit alerts", desc: "Warn me when credits are running low." },
    { key: "weeklySummary", label: "Weekly summary", desc: "A weekly email with your shop's activity." },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-amber-600" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">Email Alerts</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Choose which email alerts you receive.
            </p>
          </div>
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold shrink-0">
            <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
            Saved
          </span>
        )}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <div className="space-y-1">
          {OPTIONS.map((opt) => (
            <div
              key={opt.key}
              className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{opt.label}</p>
                <p className="text-gray-400 text-xs">{opt.desc}</p>
              </div>
              <ToggleSwitch
                checked={prefs[opt.key]}
                onChange={() => toggle(opt.key)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      type="button" // Form submit hone se rokne ke liye zaroori hai
      className={`w-11 h-6 rounded-full transition-colors duration-200 shrink-0 flex items-center p-0.5 focus:outline-none ${
        checked ? "bg-purple-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`w-5 h-5 bg-white rounded-full shadow-sm border border-gray-100 transition-transform duration-200 ease-in-out ${
          // Flex items-center p-0.5 lagane se ab ye exact pixel perfect move karega
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}


/* ─── Danger Zone ────────────────────────────────────────── */
function DangerZoneCard({ token, onAccountDeleted }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!password) {
      setError("Please enter your password to confirm.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.delete(`${API_URL}/api/seller/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { password },
      });
      onAccountDeleted();
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-100">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600" strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-base font-bold text-red-700">Danger Zone</h2>
          <p className="text-gray-400 text-xs mt-0.5">
            Irreversible actions — proceed with caution.
          </p>
        </div>
      </div>

      {!confirmOpen ? (
        <div className="flex items-center justify-between bg-red-50/60 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-red-400" strokeWidth={2} />
            <span className="text-sm text-red-700 font-medium">
              Delete Account
            </span>
          </div>
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-red-600 text-xs font-bold bg-white border
                       border-red-200 px-3.5 py-1.5 rounded-lg
                       hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      ) : (
        <div className="bg-red-50 rounded-xl p-4 space-y-3">
          <p className="text-red-700 text-sm font-semibold">
            This will permanently delete your shop, products, and account.
            This cannot be undone.
          </p>
          <input
            type="password"
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-red-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-red-500 bg-white"
          />
          {error && <p className="text-red-600 text-xs">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 text-white py-2.5 rounded-xl
                         text-sm font-bold hover:bg-red-700 transition
                         disabled:opacity-50"
            >
              {loading ? "Deleting..." : "Yes, Delete My Account"}
            </button>
            <button
              onClick={() => {
                setConfirmOpen(false);
                setPassword("");
                setError("");
              }}
              className="px-5 border border-gray-200 rounded-xl text-sm
                         text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}