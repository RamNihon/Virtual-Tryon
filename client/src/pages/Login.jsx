import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

// ─── Loading Animation ────────────────────
function LoggingInAnimation() {
  const [dots, setDots] = useState("");

  useState(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60
                    z-50 flex items-center justify-center
                    backdrop-blur-sm"
    >
      <div
        className="bg-white rounded-3xl p-10
                      text-center shadow-2xl
                      max-w-sm w-full mx-4"
      >
        {/* Animation */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-100"
          ></div>
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-600
                          border-t-transparent
                          border-r-transparent
                          animate-spin"
          ></div>
          <div
            className="absolute inset-3 rounded-full
                          bg-purple-50 animate-pulse
                          flex items-center justify-center
                          text-4xl"
          >
            🔐
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Logging in....!
        </h3>
        <p className="text-purple-600 font-medium animate-pulse">
          Account is getting verified{dots}
        </p>

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full
                         bg-purple-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Login Component ─────────────────
export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password) {
      setError("Sab fields bharo!");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/seller/login`, form);
      login(res.data.seller, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Error Found!");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <>
      {loading && <LoggingInAnimation />}

      <div className="min-h-screen flex">
        {/* Left Side - Decorative */}
        <div
          className="hidden lg:flex lg:w-1/2
                        bg-gradient-to-br from-indigo-600
                        via-purple-700 to-purple-800
                        flex-col items-center justify-center
                        p-12 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div
            className="absolute top-0 right-0 w-96 h-96
                          bg-white opacity-5 rounded-full
                          translate-x-1/2 -translate-y-1/2"
          ></div>
          <div
            className="absolute bottom-0 left-0 w-72 h-72
                          bg-white opacity-5 rounded-full
                          -translate-x-1/3 translate-y-1/3"
          ></div>

          {/* Stats */}
          <div className="relative z-10 text-white text-center">
            <div className="text-7xl mb-6">👗</div>
            <h1 className="text-4xl font-bold mb-3">Welcome Back!</h1>
            <p className="text-purple-200 text-lg mb-12">
              Your Dashboard is ready!
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              {[
                { icon: "🛍️", value: "500+", label: "Sellers" },
                { icon: "👗", value: "10K+", label: "Try-Ons" },
                { icon: "⭐", value: "4.9", label: "Rating" },
                { icon: "📱", value: "24/7", label: "Support" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white bg-opacity-10
                             rounded-2xl p-4 text-center
                             backdrop-blur-sm"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                  <div className="text-purple-200 text-xs">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div
          className="w-full lg:w-1/2 flex items-center
                        justify-center p-6 bg-gray-50"
        >
          <div className="w-full max-w-md">
            {/* Mobile Header */}
            <div className="text-center mb-8 lg:hidden">
              <div className="text-5xl mb-2">👗</div>
              <h2 className="text-2xl font-bold text-purple-700">
                Welcome Back!
              </h2>
            </div>

            <div
              className="bg-white rounded-3xl shadow-sm
                            p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Login Now! 👋
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Access your Dashboard
              </p>

              {error && (
                <div
                  className="bg-red-50 border border-red-100
                                text-red-600 p-3 rounded-xl
                                mb-4 text-sm flex items-center gap-2"
                >
                  <span>❌</span>
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label
                    className="text-sm font-medium
                                    text-gray-700 block mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="yourgmail@gmail.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        email: e.target.value,
                      })
                    }
                    onKeyPress={handleKeyPress}
                    className="w-full border border-gray-200
                               rounded-xl px-4 py-3
                               focus:outline-none
                               focus:border-purple-500
                               focus:ring-2 focus:ring-purple-100
                               transition text-sm"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label
                      className="text-sm font-medium
                                      text-gray-700"
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-purple-600
                                 hover:text-purple-700"
                    >
                      Forgot password? 🤔
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          password: e.target.value,
                        })
                      }
                      onKeyPress={handleKeyPress}
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
                                 hover:text-gray-600 transition
                                 text-xl"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r
                             from-purple-600 to-indigo-600
                             text-white py-3.5 rounded-xl
                             font-semibold text-sm
                             hover:from-purple-700
                             hover:to-indigo-700
                             transition-all duration-200
                             disabled:opacity-50
                             shadow-lg shadow-purple-200
                             hover:shadow-purple-300
                             hover:-translate-y-0.5
                             active:translate-y-0"
                >
                  🚀 Login Now
                </button>
              </div>

              {/* Divider */}

              {/* Google Login */}

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-100"></div>
                <span className="text-gray-500 text-xs">OR</span>
                <div className="flex-1 h-px bg-gray-100"></div>
              </div>
              <a
                href={`${API_URL}/api/auth/google`}
                className="w-full flex items-center justify-center
             gap-3 border-2 border-gray-200
             rounded-xl py-3 font-semibold
             text-gray-700 hover:bg-gray-50
             hover:border-gray-300 transition text-sm"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="w-5 h-5"
                />
                Login with Google
              </a>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-purple-600 font-semibold
                             hover:text-purple-700"
                >
                  Register Now →
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
