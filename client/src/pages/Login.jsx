import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

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
      setError("Sare fields bhariye!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/seller/login`, form);
      login(res.data.seller, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to connect with server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4">
      {/* Purana Sahi Card Box layout */}
      <div className="bg-white rounded-2xl shadow-sm p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-6 flex flex-col items-center justify-center gap-2">
          <span>🔥</span> Login Now
        </h2>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* --- Email Input Container --- */}
          <div className="relative">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full border rounded-full px-5 py-3 focus:outline-none transition-colors ${
                form.email === ""
                  ? "border-gray-300 focus:border-purple-500"
                  : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                    ? "border-green-500 bg-green-50 focus:border-green-500"
                    : "border-red-500 bg-red-50 focus:border-red-500"
              }`}
            />
            {form.email !== "" &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                <span className="absolute right-5 top-3.5 text-green-600 font-bold pointer-events-none">
                  ✓
                </span>
              )}
            {form.email !== "" &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                <p className="text-[11px] text-red-500 mt-1 pl-4">
                  Sahi email format likhein (e.g., abc@gmail.com)
                </p>
              )}
          </div>

          {/* --- Password Input Container --- */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-3.5 text-gray-500 hover:text-gray-700 select-none text-lg leading-none"
            >
              {showPassword ? "👁️" : "🙈"}
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-700 text-white
                       py-3 rounded-full font-semibold
                       hover:bg-purple-800 transition
                       disabled:opacity-50"
          >
            {loading ? "⏳ Loading..." : "🚀 Login Now"}
          </button>
        </div>

        <p
          className="text-center text-sm 
                      text-gray-500 mt-6"
        >
          No Accounts?{" "}
          <Link to="/register" className="text-purple-700 font-semibold">
            Register Now
          </Link>
        </p>
      </div>
    </div>
  );
}
