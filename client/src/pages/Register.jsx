import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api";

// ─── Lottie animation sources ─────────────
// Place the 3 .lottie files inside your project's `public/animations/`
// folder (e.g. public/animations/register-clip.lottie). If you keep them
// somewhere else, just update these 3 paths — nothing else needs to change.
const LOTTIE = {
  clip: "/animations/register-clip.lottie",
  processing: "/animations/register-process.lottie",
  welcome: "/animations/register-welcome.lottie",
  error: "/animations/login-error.lottie", // reused here for any register error
};

// How long each stage STAYS on screen — this is a hard timer controlled
// by us (setTimeout), not the animation library's "onComplete" event.
// This is the actual fix for the "animation dikhta hi nahi, dashboard
// turant khul jaata hai" issue: onComplete can fire early/unreliably
// depending on the .lottie file and library version, so we don't trust
// it for timing anymore — we just hold each stage for a fixed duration
// that matches (or slightly exceeds) the animation's real length.
const CLIP_DISPLAY_MS = 4000; // register-clip's natural length
const WELCOME_DISPLAY_MS = 5000; // paired with WELCOME_SPEED below

// Speed multiplier so the ~7s welcome clip visually finishes inside
// WELCOME_DISPLAY_MS instead of still being mid-animation when we cut away.
const WELCOME_SPEED = 1.4;
const CLIP_SPEED = 1; // 4s clip plays at its natural pace

// register-process.lottie is an INTERACTIVE file — it has a real state
// machine inside it (states: "process" and "tick"), not a fixed timeline.
// Check the "Asset & Embed" tab on the LottieFiles page for the exact
// state machine id if this doesn't match what you see there.
const PROCESSING_STATE_MACHINE_ID = "StateMachine1";
// How long we let the "tick" (checkmark) state stay on screen before
// switching over to the separate register-welcome.lottie file.
const TICK_HOLD_MS = 1200;

// Requests to the backend get this long before we give up and show
// a timeout error (see the "why frontend" note in the chat reply).
const REQUEST_TIMEOUT_MS = 60000;

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

// ─── Registration Animation Overlay ───────
// stage: "clip" (intro checklist) → "processing" (waits for backend)
// → "welcome" (success), driven entirely by the parent's `stage` state.
function RegisterAnimationOverlay({
  stage,
  serverWaking,
  errorMessage,
  processingSuccess,
  onProcessingDone,
  onDismissError,
}) {
  const processingMessages = useMemo(
    () =>
      serverWaking
        ? [
            "Server is starting...",
            "First request can take a few seconds...",
            "Almost ready...",
          ]
        : [
            "Creating your account...",
            "Securing your password...",
            "Setting up your shop...",
          ],
    [serverWaking],
  );

  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    if (stage !== "processing") return;
    setMsgIndex(0);
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev === processingMessages.length - 1 ? 0 : prev + 1));
    }, 1500);
    return () => clearInterval(interval);
  }, [stage, processingMessages.length]);

  // register-process.lottie is interactive (a state machine, not a fixed
  // timeline) — it just sits in its "process" state looping until we
  // explicitly tell it to jump to "tick". We hold the player instance in
  // a ref via dotLottieRefCallback so we can call that directly.
  const dotLottieRef = useRef(null);
  const tickFiredRef = useRef(false);

  useEffect(() => {
    if (stage !== "processing") {
      tickFiredRef.current = false;
      return;
    }
    if (!processingSuccess || tickFiredRef.current) return;
    tickFiredRef.current = true;

    try {
      dotLottieRef.current?.stateMachineOverrideState("tick", true);
    } catch (e) {
      console.warn("Could not force the 'tick' state:", e);
    }

    const t = setTimeout(() => onProcessingDone(), TICK_HOLD_MS);
    return () => clearTimeout(t);
  }, [stage, processingSuccess, onProcessingDone]);

  const captions = {
    clip: {
      title: "Getting things ready! ✨",
      subtitle: "Checking your details...",
    },
    processing: {
      title: "Hang tight!",
      subtitle: processingSuccess ? "All set! 🎉" : processingMessages[msgIndex],
    },
    welcome: {
      title: "Welcome to VirtualTryOn! 🎉",
      subtitle: "Your shop is ready. Taking you to your dashboard...",
    },
    error: {
      title: "Oops, something went wrong!",
      subtitle: errorMessage,
    },
  }[stage];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60
                    z-50 flex items-center justify-center
                    backdrop-blur-sm"
    >
      <div
        className="bg-white rounded-3xl p-8
                      text-center shadow-2xl
                      max-w-sm w-full mx-4"
      >
        {/* Lottie animation for the current stage */}
        <div className="w-40 h-40 mx-auto mb-4">
          {stage === "clip" && (
            <DotLottieReact
              src={LOTTIE.clip}
              autoplay
              loop={false}
              speed={CLIP_SPEED}
            />
          )}
          {stage === "processing" && (
            <DotLottieReact
              dotLottieRefCallback={(instance) => (dotLottieRef.current = instance)}
              src={LOTTIE.processing}
              stateMachineId={PROCESSING_STATE_MACHINE_ID}
              autoplay
            />
          )}
          {stage === "welcome" && (
            <DotLottieReact
              src={LOTTIE.welcome}
              autoplay
              loop={false}
              speed={WELCOME_SPEED}
            />
          )}
          {stage === "error" && (
            <DotLottieReact src={LOTTIE.error} autoplay loop={false} />
          )}
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {captions.title}
        </h3>
        <p
          className={
            stage === "error"
              ? "text-red-500 font-medium"
              : "text-purple-600 font-medium animate-pulse"
          }
        >
          {captions.subtitle}
        </p>

        {/* Progress dots (only while waiting on the backend) */}
        {stage === "processing" && (
          <div className="flex justify-center gap-2 mt-6">
            {processingMessages.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-500
                           ${
                             i === msgIndex
                               ? "w-6 bg-purple-600"
                               : "w-2 bg-gray-200"
                           }`}
              />
            ))}
          </div>
        )}

        {/* Retry button — only the error stage needs a manual dismiss,
            every other stage moves forward on its own */}
        {stage === "error" && (
          <button
            onClick={onDismissError}
            className="mt-6 w-full bg-gradient-to-r
                       from-purple-600 to-indigo-600
                       text-white py-2.5 rounded-xl
                       font-semibold text-sm
                       hover:from-purple-700 hover:to-indigo-700
                       transition"
          >
            Try Again
          </button>
        )}
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
  // stage: null | "clip" | "processing" | "welcome"
  const [stage, setStage] = useState(null);
  const [clipDone, setClipDone] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null); // null | "success" | "error"
  const [backendErrorMsg, setBackendErrorMsg] = useState("");
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
  const [serverWaking, setServerWaking] = useState(false);

  // Holds the { seller, token } from the login call until we're actually
  // ready to land on the dashboard. We deliberately do NOT call login()
  // as soon as the backend responds — if anything else in the app (e.g.
  // a route guard that redirects already-logged-in users away from
  // /register) reacts to auth state changing, calling login() early would
  // cause exactly the "dashboard opens in 2-3 seconds" jump you saw,
  // completely bypassing our animation timers. Calling login() only at
  // the same moment we navigate ourselves avoids that.
  const pendingAuthRef = useRef(null);

  // Step 1: clip animation plays for its own ~4s regardless of backend timing.
  // Step 2: once the clip finishes, "processing" shows — looping if the
  // backend hasn't replied yet, and forced into its "tick" state as soon
  // as it has (handled inside the overlay via the state machine).
  // Step 3: welcome animation plays once, then we navigate to the dashboard.
  // Clip stage always stays up for CLIP_DISPLAY_MS, no matter how fast
  // (or slow) the backend responds — this is the actual "jaan bujh kar
  // dikhana" fix: a real timer we control, not the animation event.
  useEffect(() => {
    if (stage !== "clip") return;
    const t = setTimeout(() => setClipDone(true), CLIP_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [stage]);

  // Move to "processing" once the clip is done — whether the backend is
  // still pending (loop shows) or has already succeeded (tick is forced,
  // see the overlay's own effect for that).
  useEffect(() => {
    if (clipDone && backendStatus !== "error") {
      setStage("processing");
    }
  }, [clipDone, backendStatus]);

  // Backend failed — no need to wait for the clip to finish, show the
  // error stage (with the exact message) right away.
  useEffect(() => {
    if (backendStatus !== "error") return;
    setError(backendErrorMsg);
    setStage("error");
  }, [backendStatus, backendErrorMsg]);

  // Welcome stage also gets a real timer instead of onComplete, so the
  // dashboard never opens before the animation has actually played out.
  // login() is called right here — the last possible moment — together
  // with navigate(), for the reason explained on pendingAuthRef above.
  useEffect(() => {
    if (stage !== "welcome") return;
    const t = setTimeout(() => {
      if (pendingAuthRef.current) {
        login(pendingAuthRef.current.seller, pendingAuthRef.current.token);
      }
      navigate("/dashboard");
    }, WELCOME_DISPLAY_MS);
    return () => clearTimeout(t);
  }, [stage, navigate, login]);

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("All fields are required!");
      setStage("error");
      return;
    }
    if (!isEmailValid) {
      setError("Enter a valid email!");
      setStage("error");
      return;
    }
    if (!isPasswordValid) {
      setError("Use a Strong password!");
      setStage("error");
      return;
    }

    setError("");
    setClipDone(false);
    setBackendStatus(null);
    setBackendErrorMsg("");
    setStage("clip");
    setServerWaking(true);

    try {
      // Wake-up ping — ignore failures here, it's just a warm-up call.
      await axios.get(`${API_URL}/`, { timeout: REQUEST_TIMEOUT_MS }).catch(() => {});
      setServerWaking(false);

      const res = await axios.post(`${API_URL}/api/seller/register`, form, {
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (res.data.success) {
        const loginRes = await axios.post(
          `${API_URL}/api/seller/login`,
          { email: form.email, password: form.password },
          { timeout: REQUEST_TIMEOUT_MS },
        );
        pendingAuthRef.current = {
          seller: loginRes.data.seller,
          token: loginRes.data.token,
        };
        setBackendStatus("success");
      } else {
        setBackendErrorMsg(res.data.message || "Registration failed!");
        setBackendStatus("error");
      }
    } catch (err) {
      setServerWaking(false);
      setBackendErrorMsg(
        err.code === "ECONNABORTED"
          ? "Server is taking too long to respond. Please try again!"
          : err.response?.data?.message || "Failed to connect with server!",
      );
      setBackendStatus("error");
    }
  };

  return (
    <>
      {/* Registration Animation Overlay */}
      {stage && (
        <RegisterAnimationOverlay
          stage={stage}
          serverWaking={serverWaking}
          errorMessage={error}
          processingSuccess={backendStatus === "success"}
          onProcessingDone={() => setStage("welcome")}
          onDismissError={() => setStage(null)}
        />
      )}

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
              Empower your business with AI Try-On and effortless WhatsApp sales!
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
                      placeholder="Create a secure password"
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
                                 hover:text-gray-600 transition"
                    >
                      {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
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
                  disabled={!!stage}
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

                {/* Divider */}
                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-100" />
                  <span className="text-gray-500 text-xs">OR</span>
                  <div className="flex-1 h-px bg-gray-100" />
                </div>

                {/* Google Register */}

                <a
                  href={`${API_URL}/api/auth/google`}
                  className="w-full flex items-center justify-center
             gap-3 border-2 border-gray-200
             rounded-xl py-3 font-semibold
             text-gray-700 hover:bg-gray-50
             transition text-sm"
                >
                  <img
                    src="https://www.google.com/favicon.ico"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Signup with Google
                </a>
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