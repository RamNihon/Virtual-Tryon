import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import API_URL from "../api";

const checkPassword = (password) => ({
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
});

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const checks = checkPassword(password);
  const isStrong = Object.values(checks).every(Boolean);

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError("Fill both fields!");
      return;
    }
    if (!isStrong) {
      setError("Enter Strong Password!");
      return;
    }
    if (password !== confirmPassword) {
      setError("Both password does't match!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_URL}/api/auth/reset-password/${token}`, {
        password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error aaya!");
    } finally {
      setLoading(false);
    }
  };

  // Success State
  if (success) {
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
                          text-4xl mx-auto mb-6 animate-bounce"
          >
            🎉
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Password Reset Successful!
          </h2>
          <p className="text-gray-500 mb-6">
            You're redirecting to the login page in 3 seconds...
          </p>
          <Link
            to="/login"
            className="block w-full bg-gradient-to-r
                       from-purple-600 to-indigo-600
                       text-white py-3 rounded-xl
                       font-semibold text-center
                       hover:opacity-90 transition"
          >
            🚀 Login Now
          </Link>
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
          <div
            className="w-16 h-16 bg-purple-100 rounded-2xl
                          flex items-center justify-center
                          text-3xl mx-auto mb-6"
          >
            🔑
          </div>

          <h2
            className="text-2xl font-bold text-center
                         text-gray-800 mb-2"
          >
            Make new password!
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            Use Strong Password
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
            {/* New Password */}
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Strong password daalo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-gray-200
                             rounded-xl px-4 py-3 pr-12
                             focus:outline-none
                             focus:border-purple-500
                             focus:ring-2 focus:ring-purple-100
                             transition text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2
                             -translate-y-1/2 text-gray-400
                             hover:text-gray-600 transition text-xl"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>

              {/* Requirements */}
              {password && (
                <div
                  className="mt-2 bg-gray-50 rounded-xl p-3
                                space-y-1.5"
                >
                  {[
                    { check: checks.length, text: "8+ characters" },
                    { check: checks.uppercase, text: "Capital letter" },
                    { check: checks.lowercase, text: "Small letter" },
                    { check: checks.number, text: "Number" },
                    { check: checks.special, text: "Special character" },
                  ].map((req, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span
                        className={`text-sm transition-all
                                       ${
                                         req.check
                                           ? "text-green-500"
                                           : "text-gray-300"
                                       }`}
                      >
                        {req.check ? "✓" : "○"}
                      </span>
                      <span
                        className={`text-xs transition-all
                                       ${
                                         req.check
                                           ? "text-green-600 font-medium"
                                           : "text-gray-400"
                                       }`}
                      >
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                className="text-sm font-medium
                                text-gray-700 block mb-1.5"
              >
                Confirm your Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter Same Password Again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-3
                             pr-10 focus:outline-none
                             focus:ring-2 transition text-sm
                             ${
                               confirmPassword
                                 ? password === confirmPassword
                                   ? "border-green-400 focus:ring-green-100"
                                   : "border-red-400 focus:ring-red-100"
                                 : "border-gray-200 focus:ring-purple-100 focus:border-purple-500"
                             }`}
                />
                {confirmPassword && (
                  <span
                    className="absolute right-3 top-1/2
                                   -translate-y-1/2 text-lg"
                  >
                    {password === confirmPassword ? "✅" : "❌"}
                  </span>
                )}
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  ⚠️ Password does'nt matched!
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading || !isStrong || password !== confirmPassword}
              className="w-full bg-gradient-to-r
                         from-purple-600 to-indigo-600
                         text-white py-3.5 rounded-xl
                         font-semibold hover:opacity-90
                         transition disabled:opacity-40
                         shadow-lg shadow-purple-200"
            >
              {loading
                ? "⏳ Your password is getting Reset..."
                : "🔑 Reset your password"}
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
