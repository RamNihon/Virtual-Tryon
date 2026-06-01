import { useState } from "react";
import axios from "axios";
import API_URL from "../api";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("Sab fields bharo!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/auth/contact`, form);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Found some errors! Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div
        className="min-h-screen bg-gray-50
                      flex items-center justify-center px-4"
      >
        <div
          className="bg-white rounded-3xl shadow-sm
                        p-10 w-full max-w-md text-center
                        border border-gray-100"
        >
          <div
            className="w-20 h-20 bg-green-100 rounded-full
                          flex items-center justify-center
                          text-4xl mx-auto mb-6"
          >
            ✅
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Message received! 🎉
          </h2>
          <p className="text-gray-500 mb-8">
           We'll reply within 24 hours. Keep checking your email!
          </p>
          <button
            onClick={() => {
              setSent(false);
              setForm({
                name: "",
                email: "",
                subject: "",
                message: "",
              });
            }}
            className="w-full bg-gradient-to-r
                       from-purple-600 to-indigo-600
                       text-white py-3 rounded-xl
                       font-semibold hover:opacity-90
                       transition"
          >
            📧 Message Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div
        className="bg-gradient-to-br from-slate-900
                      via-purple-900 to-indigo-900
                      py-16 px-6 text-center"
      >
        <div className="text-5xl mb-4">💬</div>
        <h1
          className="text-3xl md:text-4xl font-black
                       text-white mb-3"
        >
          Contact Us!
        </h1>
        <p className="text-purple-200 max-w-xl mx-auto">
          Any questions? We're here to help! 24-hour reply guaranteed. 🎯
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Meet Us👋
            </h2>

            {[
              {
                icon: "📧",
                title: "Email",
                value: "support@virtualtryon.com",
                link: "mailto:virtualtryon.service@gmail.com",
                color: "bg-purple-50",
              },
              {
                icon: "📱",
                title: "WhatsApp",
                value: "+91 XXXXXXXXXX",
                link: "https://wa.me/91XXXXXXXXXX",
                color: "bg-green-50",
              },
              {
                icon: "⏰",
                title: "Support Hours",
                value: "Mon-Sat, 10am - 6pm",
                color: "bg-blue-50",
              },
              {
                icon: "⚡",
                title: "Response Time",
                value: "Usually within 24 hours",
                color: "bg-orange-50",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`${item.color} rounded-2xl p-5
                            border border-transparent
                            hover:shadow-md transition-all`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{item.icon}</div>
                  <div>
                    <p
                      className="text-xs text-gray-400
                                  font-medium uppercase
                                  tracking-wide"
                    >
                      {item.title}
                    </p>
                    {item.link ? (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-700 font-semibold
                                   text-sm hover:text-purple-600
                                   transition"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p
                        className="text-gray-700 font-semibold
                                    text-sm"
                      >
                        {item.value}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Social */}
            <div
              className="bg-white rounded-2xl p-5
                            border border-gray-100"
            >
              <p className="text-sm font-bold text-gray-700 mb-3">
                Social Media 📣
              </p>
              <div className="flex gap-3">
                {[
                  { icon: "ⓕ", label: "Facebook" },
                  { icon: "📸", label: "Instagram" },
                  { icon: "🐦", label: "Twitter" },
                ].map((s, i) => (
                  <button
                    key={i}
                    className="flex-1 bg-gray-50 rounded-xl
                               py-2 text-center text-sm
                               hover:bg-purple-50 transition
                               border border-gray-100"
                  >
                    <div className="text-xl">{s.icon}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {s.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-3xl shadow-sm
                            p-8 border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Send Message 📩
              </h2>

              {error && (
                <div
                  className="bg-red-50 border border-red-100
                                text-red-600 p-3 rounded-xl
                                mb-4 text-sm flex items-center gap-2"
                >
                  <span>❌</span> {error}
                </div>
              )}

              <div className="space-y-4">
                <div
                  className="grid grid-cols-1 md:grid-cols-2
                                gap-4"
                >
                  <div>
                    <label
                      className="text-sm font-medium
                                      text-gray-700 block mb-1.5"
                    >
                      Name*
                    </label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={form.name}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          name: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200
                                 rounded-xl px-4 py-3
                                 focus:outline-none
                                 focus:border-purple-500
                                 focus:ring-2 focus:ring-purple-100
                                 transition text-sm"
                    />
                  </div>
                  <div>
                    <label
                      className="text-sm font-medium
                                      text-gray-700 block mb-1.5"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      placeholder="youremail@gmail.com"
                      value={form.email}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          email: e.target.value,
                        })
                      }
                      className="w-full border border-gray-200
                                 rounded-xl px-4 py-3
                                 focus:outline-none
                                 focus:border-purple-500
                                 focus:ring-2 focus:ring-purple-100
                                 transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label
                    className="text-sm font-medium
                                    text-gray-700 block mb-1.5"
                  >
                    Subject *
                  </label>
                  <select
                    value={form.subject}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subject: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200
                               rounded-xl px-4 py-3
                               focus:outline-none
                               focus:border-purple-500
                               focus:ring-2 focus:ring-purple-100
                               transition text-sm bg-white"
                  >
                    <option value="">Select Subject</option>
                    <option value="technical">🔧 Technical Support</option>
                    <option value="billing">💰 Billing / Payment</option>
                    <option value="refund">↩️ Refund Request</option>
                    <option value="feature">💡 Feature Request</option>
                    <option value="partnership">🤝 Partnership</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                <div>
                  <label
                    className="text-sm font-medium
                                    text-gray-700 block mb-1.5"
                  >
                    Message *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Write your problem or question here..."
                    value={form.message}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        message: e.target.value,
                      })
                    }
                    className="w-full border border-gray-200
                               rounded-xl px-4 py-3
                               focus:outline-none
                               focus:border-purple-500
                               focus:ring-2 focus:ring-purple-100
                               transition text-sm resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1 text-right">
                    {form.message.length}/500
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r
                             from-purple-600 to-indigo-600
                             text-white py-4 rounded-xl
                             font-bold hover:opacity-90
                             transition disabled:opacity-50
                             shadow-lg shadow-purple-200
                             flex items-center justify-center gap-2"
                >
                  {loading ? "⏳ Sending..." : "📩 Send Message"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
