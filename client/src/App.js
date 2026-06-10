import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import FabricShop from './pages/FabricShop'
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
import CreditHistory from './pages/CreditHistory'

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
      <ScrollToTop />
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
