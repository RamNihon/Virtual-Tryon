import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

// ─── Password Strength Check ──────────────
const checkPassword = (password) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
};

const getStrengthScore = (checks) => {
  return Object.values(checks).filter(Boolean).length;
};

const getStrengthInfo = (score) => {
  if (score <= 1)
    return {
      label: "Very Weak 😖",
      color: "bg-red-500",
      textColor: "text-red-500",
      width: "w-1/5",
    };
  if (score === 2)
    return {
      label: "Weak 😞",
      color: "bg-orange-500",
      textColor: "text-orange-500",
      width: "w-2/5",
    };
  if (score === 3)
    return {
      label: "Medium 😊",
      color: "bg-yellow-500",
      textColor: "text-yellow-500",
      width: "w-3/5",
    };
  if (score === 4)
    return {
      label: "Strong 😀",
      color: "bg-blue-500",
      textColor: "text-blue-500",
      width: "w-4/5",
    };
  return {
    label: "Very Strong! 💪",
    color: "bg-green-500",
    textColor: "text-green-500",
    width: "w-full",
  };
};

// ─── Email Validation ─────────────────────
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ─── Loading Animation ────────────────────
function RegisteringAnimation() {
  const messages = [
    { emoji: "📝", text: "Account is being created..." },
    { emoji: "🔐", text: "Password is getting secured..." },
    { emoji: "🏪", text: "Shop is getting ready..." },
    { emoji: "✨", text: "Almost done 😊..." },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev === messages.length - 1 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        {/* Animated Circle */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          {/* Outer ring */}
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-100"
          ></div>
          {/* Spinning ring */}
          <div
            className="absolute inset-0 rounded-full
                          border-4 border-purple-600
                          border-t-transparent border-r-transparent
                          animate-spin"
          ></div>
          {/* Inner pulse */}
          <div
            className="absolute inset-3 rounded-full
                          bg-purple-50 animate-pulse
                          flex items-center justify-center"
          >
            <span className="text-4xl">{messages[index].emoji}</span>
          </div>
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          You are getting Registered!
        </h3>
        <p
          className="text-purple-600 font-medium
                      animate-pulse"
        >
          {messages[index].text}
        </p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-6">
          {messages.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-500
                         ${
                           i === index ? "w-6 bg-purple-600" : "w-2 bg-gray-200"
                         }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Register Component ──────────────
export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const passwordChecks = checkPassword(form.password);
  const strengthScore = getStrengthScore(passwordChecks);
  const strengthInfo = getStrengthInfo(strengthScore);
  const isEmailValid = validateEmail(form.email);
  const isPasswordValid = strengthScore === 5;

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Sab fields bharo!");
      return;
    }
    if (!isEmailValid) {
      setError("Enter a valid email!");
      return;
    }
    if (!isPasswordValid) {
      setError("Use a Strong password!");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/seller/register`, form);
      if (res.data.success) {
        const loginRes = await axios.post(`${API_URL}/api/seller/login`, {
          email: form.email,
          password: form.password,
        });
        login(loginRes.data.seller, loginRes.data.token);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to connect with server!");
      setLoading(false);
    }
  };

  return (
    <>
      {/* Loading Animation */}
      {loading && <RegisteringAnimation />}

      <div className="min-h-screen flex">
        {/* Left Side - Decorative */}
        <div
          className="hidden lg:flex lg:w-1/2
                        bg-gradient-to-br from-purple-600
                        via-purple-700 to-indigo-800
                        flex-col items-center justify-center
                        p-12 relative overflow-hidden"
        >
          {/* Background Circles */}
          <div
            className="absolute top-0 left-0 w-96 h-96
                          bg-white opacity-5 rounded-full
                          -translate-x-1/2 -translate-y-1/2"
          ></div>
          <div
            className="absolute bottom-0 right-0 w-80 h-80
                          bg-white opacity-5 rounded-full
                          translate-x-1/3 translate-y-1/3"
          ></div>

          {/* Content */}
          <div className="relative z-10 text-white text-center">
            <div className="text-7xl mb-8">👗</div>
            <h1 className="text-4xl font-bold mb-4">VirtualTryOn</h1>
            <p
              className="text-purple-200 text-lg mb-12
                          max-w-sm leading-relaxed"
            >
              India's first Ai-powered virtual online platform for sellers!
            </p>

            {/* Features */}
            <div className="space-y-4 text-left">
              {[
                { icon: "🤖", text: "AI-Powered Try-On" },
                { icon: "🛍️", text: "Instant Shop Page" },
                { icon: "📱", text: "WhatsApp Orders" },
                { icon: "✨", text: "AI Style Advice" },
              ].map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3
                             bg-white bg-opacity-10
                             rounded-2xl px-5 py-3"
                >
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-white font-medium">{f.text}</span>
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
            {/* Header */}
            <div className="text-center mb-8 lg:hidden">
              <div className="text-5xl mb-2">👗</div>
              <h2 className="text-2xl font-bold text-purple-700">
                VirtualTryOn
              </h2>
            </div>

            <div
              className="bg-white rounded-3xl shadow-sm
                            p-8 border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                Create Account! 🚀
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                Start in Free - No credit card needed!
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
                {/* Name Field */}
                <div>
                  <label
                    className="text-sm font-medium
                                    text-gray-700 block mb-1.5"
                  >
                    Your Shop Name
                  </label>
                  <input
                    type="text"
                    placeholder="Like: WanderLust"
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

                {/* Email Field */}
                <div>
                  <label
                    className="text-sm font-medium
                                    text-gray-700 block mb-1.5"
                  >
                    Email Address
                  </label>
                  <div className="relative">
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
                      onBlur={() => setEmailTouched(true)}
                      className={`w-full border rounded-xl px-4 py-3
                                 pr-10 focus:outline-none
                                 focus:ring-2 transition text-sm
                                 ${
                                   emailTouched
                                     ? isEmailValid
                                       ? "border-green-400 focus:border-green-500 focus:ring-green-100"
                                       : form.email
                                         ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                                         : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                                     : "border-gray-200 focus:border-purple-500 focus:ring-purple-100"
                                 }`}
                    />
                    {/* Email Status Icon */}
                    {emailTouched && form.email && (
                      <div
                        className="absolute right-3 top-1/2
                                      -translate-y-1/2 text-lg"
                      >
                        {isEmailValid ? "✔️" : "❌"}
                      </div>
                    )}
                  </div>

                  {/* Email Error Message */}
                  {emailTouched && form.email && !isEmailValid && (
                    <p
                      className="text-red-500 text-xs mt-1
                                  flex items-center gap-1"
                    >
                      ⚠️ Enter a valid Email (eg: name@gmail.com)
                    </p>
                  )}
                  {emailTouched && isEmailValid && (
                    <p
                      className="text-green-500 text-xs mt-1
                                  flex items-center gap-1"
                    >
                      ✓ Email is valid!
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    className="text-sm font-medium
                                    text-gray-700 block mb-1.5"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Strong password daalo"
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value });
                        setPasswordTouched(true);
                      }}
                      className="w-full border border-gray-200
                                 rounded-xl px-4 py-3 pr-12
                                 focus:outline-none
                                 focus:border-purple-500
                                 focus:ring-2 focus:ring-purple-100
                                 transition text-sm"
                    />
                    {/* Eye Button */}
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

                  {/* Password Strength Bar */}
                  {passwordTouched && form.password && (
                    <div className="mt-2">
                      <div
                        className="flex justify-between
                                      items-center mb-1"
                      >
                        <span className="text-xs text-gray-400">
                          Password Strength:
                        </span>
                        <span
                          className={`text-xs font-medium
                                         ${strengthInfo.textColor}`}
                        >
                          {strengthInfo.label}
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full">
                        <div
                          className={`h-full rounded-full
                                        transition-all duration-500
                                        ${strengthInfo.color}
                                        ${strengthInfo.width}`}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Password Requirements */}
                  {passwordTouched && form.password && (
                    <div
                      className="mt-3 bg-gray-50 rounded-xl
                                    p-3 space-y-1.5"
                    >
                      {[
                        {
                          check: passwordChecks.length,
                          text: "minimum 8 characters",
                        },
                        {
                          check: passwordChecks.uppercase,
                          text: "one Capital letter (A-Z)",
                        },
                        {
                          check: passwordChecks.lowercase,
                          text: "one small letter (a-z)",
                        },
                        {
                          check: passwordChecks.number,
                          text: "one number (0-9)",
                        },
                        {
                          check: passwordChecks.special,
                          text: "one special character (!@#$)",
                        },
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

                {/* Submit Button */}
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
                  🚀 Register Now for Free!
                </button>
              </div>

              <p
                className="text-center text-sm
                            text-gray-400 mt-6"
              >
                Already have a account?{" "}
                <Link
                  to="/login"
                  className="text-purple-600 font-semibold
                             hover:text-purple-700"
                >
                  Login Now
                </Link>
              </p>

              <p
                className="text-center text-xs
                            text-gray-300 mt-4"
              >
                Register karke aap hamari{" "}
                <Link to="/terms" className="hover:text-gray-400 underline">
                  Terms
                </Link>{" "}
                aur{" "}
                <Link to="/privacy" className="hover:text-gray-400 underline">
                  Privacy Policy
                </Link>{" "}
                se agree karte ho
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
