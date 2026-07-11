import { useState, useEffect } from "react";
import axios from "axios";
import API_URL from "../api";
import {
  Send,
  Users,
  Lock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from "lucide-react";

/*
  ─── ADMIN PUSH PAGE ────────────────────────────────────────
  Not linked from anywhere in the dashboard UI — reached only
  by navigating directly to its route (see App.js: keep the
  path itself non-obvious, e.g. /ops-push-panel rather than
  /admin). The password below is checked against ADMIN_SECRET
  on the backend for every request; this page holds no special
  privilege on its own beyond knowing that secret.

  Templates are just local convenience presets (click to fill
  the form) — no backend template storage, keeping this simple
  for a single-operator tool. If reusable saved templates become
  worth persisting, that's a small additive change later
  (a Template model + two more routes), not a redesign.
--------------------------------------------------------------*/

const TEMPLATES = [
  {
    label: "New Feature",
    title: "New Feature Just Landed! ✨",
    body: "Check out what's new on your dashboard — tap to explore.",
  },
  {
    label: "Weekend Reminder",
    title: "Your Shop is Waiting 🛍️",
    body: "Customers are browsing all weekend — make sure your products are fresh!",
  },
  {
    label: "Low Activity Nudge",
    title: "Boost Your Shop Today",
    body: "Adding new products regularly helps customers discover your shop more.",
  },
  {
    label: "Festive Offer",
    title: "Special Offer Inside 🎉",
    body: "Limited-time credit bonus available — check your Billing page.",
  },
];

export default function AdminPush() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");

  const [sellers, setSellers] = useState([]);
  const [target, setTarget] = useState("all");
  const [plan, setPlan] = useState("free");
  const [selectedIds, setSelectedIds] = useState([]);

  const [form, setForm] = useState({ title: "", body: "", url: "/dashboard" });
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authed) fetchSellers();
    // eslint-disable-next-line
  }, [authed]);

  const fetchSellers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/sellers`, {
        headers: { "x-admin-secret": secret },
      });
      setSellers(res.data.sellers);
    } catch (err) {
      setAuthError("Couldn't load sellers — check your secret.");
    }
  };

  const handleAuth = async () => {
    setAuthError("");
    try {
      await axios.get(`${API_URL}/api/admin/sellers`, {
        headers: { "x-admin-secret": secret },
      });
      setAuthed(true);
    } catch (err) {
      setAuthError("Incorrect admin secret.");
    }
  };

  const toggleSeller = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const applyTemplate = (tpl) => {
    setForm({ title: tpl.title, body: tpl.body, url: "/dashboard" });
  };

  const handleSend = async () => {
    setError("");
    setResult(null);

    if (!form.title || !form.body) {
      setError("Title and message are required.");
      return;
    }
    if (target === "selected" && selectedIds.length === 0) {
      setError("Select at least one seller.");
      return;
    }

    setSending(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/admin/send-push`,
        {
          title: form.title,
          body: form.body,
          url: form.url,
          target,
          plan: target === "plan" ? plan : undefined,
          sellerIds: target === "selected" ? selectedIds : undefined,
        },
        { headers: { "x-admin-secret": secret } },
      );
      setResult(res.data);
      setForm({ title: "", body: "", url: "/dashboard" });
      setSelectedIds([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send.");
    } finally {
      setSending(false);
    }
  };

  // ─── Password gate ──────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-purple-600" strokeWidth={2} />
          </div>
          <h1 className="text-lg font-bold text-gray-800 mb-1">Admin Access</h1>
          <p className="text-gray-400 text-sm mb-5">
            Enter the admin secret to continue.
          </p>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAuth()}
            placeholder="Admin secret"
            autoFocus
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500 mb-3"
          />
          {authError && (
            <p className="text-red-500 text-xs mb-3">{authError}</p>
          )}
          <button
            onClick={handleAuth}
            className="w-full bg-purple-700 text-white py-2.5 rounded-xl
                       text-sm font-semibold hover:bg-purple-800 transition"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ─── Main panel ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-extrabold text-gray-800">
            Send Push Notification
          </h1>
          <p className="text-gray-400 text-sm">
            {sellers.length} sellers total
          </p>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-500" strokeWidth={2} />
            <h2 className="text-sm font-bold text-gray-700">Quick Templates</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((tpl, i) => (
              <button
                key={i}
                onClick={() => applyTemplate(tpl)}
                className="text-left bg-gray-50 hover:bg-purple-50 rounded-xl
                           px-3 py-2.5 text-xs font-semibold text-gray-600
                           hover:text-purple-700 transition"
              >
                {tpl.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message form */}
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Notification title"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                         text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Message
            </label>
            <textarea
              rows={3}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Notification body"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                         text-sm focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Link (opens on click)
            </label>
            <input
              type="text"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              placeholder="/dashboard"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                         text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Targeting */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-400" strokeWidth={2} />
            <h2 className="text-sm font-bold text-gray-700">Send To</h2>
          </div>

          <div className="flex gap-2 mb-3">
            {[
              { value: "all", label: "Everyone" },
              { value: "plan", label: "By Plan" },
              { value: "selected", label: "Choose Sellers" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTarget(opt.value)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  target === opt.value
                    ? "bg-purple-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {target === "plan" && (
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                         text-sm focus:outline-none focus:border-purple-500 bg-white"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
          )}

          {target === "selected" && (
            <div className="max-h-56 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
              {sellers.map((s) => (
                <label
                  key={s._id}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s._id)}
                    onChange={() => toggleSeller(s._id)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">{s.name}</span>
                  <span className="text-xs text-gray-400 ml-auto capitalize">
                    {s.plan}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" strokeWidth={2} />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {result && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" strokeWidth={2} />
            <p className="text-emerald-700 text-sm">{result.message}</p>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2
                     bg-gradient-to-r from-purple-600 to-fuchsia-500
                     text-white py-3.5 rounded-2xl text-sm font-bold
                     shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" strokeWidth={2} />
          {sending ? "Sending..." : "Send Notification"}
        </button>
      </div>
    </div>
  );
}