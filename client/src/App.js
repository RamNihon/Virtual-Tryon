import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import Pricing from "./pages/Pricing";
import Footer from "./components/Footer";
import ShopFooter from "./components/ShopFooter";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Refund from "./pages/Refund";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Contact from "./pages/Contact";
import GoogleSuccess from "./pages/GoogleSuccess";
import Navbar from "./components/Navbar";
import { useAuth } from "./context/AuthContext";

const RedirectIfLogin = ({ children }) => {
  const { token } = useAuth();
  return token ? <Navigate to="/dashboard" replace /> : children;
};
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

function AppContent() {
  const location = useLocation();
  const isShopPage = location.pathname.startsWith("/shop/");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
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
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />
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
