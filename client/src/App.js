import { useEffect, useState } from "react";
import axios from "axios";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { MoonStar, SunMedium } from "lucide-react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import FabricShop from "./pages/FabricShop";
import Pricing from "./pages/Pricing";
import Footer from "./components/Footer";
import ShopFooter from "./components/ShopFooter";
import OrderDetail from "./pages/OrderDetail";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import Analytics from "./pages/Analytics";
import GoogleSuccess from "./pages/GoogleSuccess";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";
import ScrollToTop from "./components/ScrollToTop";
import WidgetGuide from "./pages/WidgetGuide";
import CreditHistory from "./pages/CreditHistory";
import ShopFAQ from "./pages/ShopFAQ";

const RedirectIfLogin = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
};

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

function ThemeToggle({ theme, setTheme }) {
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
      className="group inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 pr-4 text-slate-700 shadow-sm backdrop-blur-md transition-all duration-300 hover:scale-[1.02] hover:shadow-md dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-100"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25">
        {isDark ? (
          <MoonStar className="h-4 w-4 transition-transform duration-300" />
        ) : (
          <SunMedium className="h-4 w-4 transition-transform duration-300" />
        )}
      </span>
      <span className="text-xs font-semibold">{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}

function AppContent() {
  const location = useLocation();
  const isShopPage =
    location.pathname.startsWith("/shop/") ||
    location.pathname.startsWith("/fabric/");

  const isAnalyticsPage = location.pathname.startsWith("/analytics");
  const { logout } = useAuth();

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("analytics-theme");
    if (saved === "dark" || saved === "light") return saved;

    if (window.matchMedia?.("(prefers-color-scheme: dark)")?.matches) {
      return "dark";
    }
    return "light";
  });

  useEffect(() => {
    const root = document.documentElement;

    if (isAnalyticsPage && theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    localStorage.setItem("analytics-theme", theme);
  }, [theme, isAnalyticsPage]);

  useEffect(() => {
    const axiosInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // 👇 यहाँ हमने 403 हटा दिया है, अब यह सिर्फ 401 पर फोकस करेगा
        if (error.response && error.response.status === 401) {
          console.warn("Session Expired. Logging out...");
          logout();
        }
        return Promise.reject(error);
      },
    );

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      // 👇 यहाँ भी सिर्फ 401
      if (response.status === 401) {
        console.warn("Session Expired. Logging out.");
        logout();
      }
      return response;
    };

    return () => {
      axios.interceptors.response.eject(axiosInterceptor);
      window.fetch = originalFetch;
    };
  }, [logout]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <ScrollToTop />
      <Navbar />

      {/* Theme toggle sirf Analytics page par */}
      {isAnalyticsPage ? (
        <div className="fixed right-4 top-4 z-[60] sm:right-6 sm:top-6">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
      ) : null}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              <RedirectIfLogin>
                <Login />
              </RedirectIfLogin>
            }
          />
          <Route
            path="/register"
            element={
              <RedirectIfLogin>
                <Register />
              </RedirectIfLogin>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/shop/:sellerId" element={<Shop />} />
          <Route path="/fabric/:sellerId" element={<FabricShop />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
          <Route path="/widget-guide" element={<WidgetGuide />} />
          <Route path="/order/:orderId" element={<OrderDetail />} />
          <Route path="/credits" element={<CreditHistory />} />
          <Route path="/faq" element={<ShopFAQ />} />
        </Routes>
      </main>

      {/* Shop page par ShopFooter, baki par Footer */}
      {isShopPage ? <ShopFooter /> : <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
