import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { seller, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname.startsWith("/shop/")) {
    return null;
  }
  if (location.pathname.startsWith("/order/")) {
    return null;
  }
   if (location.pathname.startsWith("/fabric/")) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-purple-700 text-white px-4 py-3">
      <div
        className="max-w-6xl mx-auto flex 
                      justify-between items-center"
      >
        {/* Logo */}
        <Link to="/" className="text-lg font-bold whitespace-nowrap">
          👗 VirtualTryOn
        </Link>

        {/* Buttons */}
        <div className="flex gap-2 items-center">
          {seller ? (
            <>
              {/* Mobile par naam mat dikhao */}
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-sm truncate max-w-32">
                  👋Hi, {seller.name}!
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full
                   font-bold uppercase
                   ${
                     seller.plan === "elite"
                       ? "bg-yellow-400 text-yellow-900"
                       : seller.plan === "pro"
                         ? "bg-purple-300 text-purple-900"
                         : seller.plan === "basic"
                           ? "bg-blue-300 text-blue-900"
                           : "bg-gray-200 text-gray-600"
                   }`}
                >
                  {seller.plan || "free"}
                </span>
              </div>
              <Link
                to="/dashboard"
                className="bg-white text-purple-700
                           px-3 py-1.5 rounded-full
                           font-semibold text-sm
                           whitespace-nowrap"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-purple-500 px-3 py-1.5
                           rounded-full text-sm
                           whitespace-nowrap"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-white text-sm
                           whitespace-nowrap"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-purple-700
                           px-3 py-1.5 rounded-full
                           font-semibold text-sm
                           whitespace-nowrap"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
