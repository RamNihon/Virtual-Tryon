import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      setError("Enter Email!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Error aaya!");
    } finally {
      setLoading(false);
    }
  };

  // Success State
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
            📧
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Email has been sent! ✅
          </h2>
          <p className="text-gray-500 mb-2">
            <span className="font-semibold text-gray-700">{email}</span>. ✦
            Reset link sent to this email..
          </p>
          <p className="text-gray-400 text-sm mb-8">
            ⏰ The link is valid for 1 hour only. Please check your spam folder
            also!
          </p>

          <div className="space-y-3">
            <button
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
              className="w-full border-2 border-purple-200
                         text-purple-600 py-3 rounded-xl
                         font-semibold hover:bg-purple-50
                         transition text-sm"
            >
              📧 Send Email Again
            </button>
            <Link
              to="/login"
              className="block w-full bg-gradient-to-r
                         from-purple-600 to-indigo-600
                         text-white py-3 rounded-xl
                         font-semibold text-center
                         hover:opacity-90 transition text-sm"
            >
              ← Go back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50
                    flex items-center justify-center px-4"
    >
      <div className="w-full max-w-md">
        <div
          className="bg-white rounded-3xl shadow-sm
                        p-8 border border-gray-100"
        >
          {/* Icon */}
          <div
            className="w-16 h-16 bg-purple-100 rounded-2xl
                          flex items-center justify-center
                          text-3xl mx-auto mb-6"
          >
            🔐
          </div>

          <h2
            className="text-2xl font-bold text-center
                         text-gray-800 mb-2"
          >
            Forgot Password? 🤔
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            Enter your registered email. We will send you a reset link!
          </p>

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
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                Registered Email
              </label>
              <input
                type="email"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                className="w-full border border-gray-200
                           rounded-xl px-4 py-3
                           focus:outline-none
                           focus:border-purple-500
                           focus:ring-2 focus:ring-purple-100
                           transition text-sm"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r
                         from-purple-600 to-indigo-600
                         text-white py-3.5 rounded-xl
                         font-semibold hover:opacity-90
                         transition disabled:opacity-50
                         shadow-lg shadow-purple-200"
            >
              {loading ? "⏳ Sending email..." : "📧 Send Rest Link"}
            </button>
          </div>

          <Link
            to="/login"
            className="block text-center text-sm
                       text-gray-400 mt-6
                       hover:text-purple-600 transition"
          >
            ← Go back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
