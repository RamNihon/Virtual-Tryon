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
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 px-4 py-2.5 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-white transition-transform duration-200 active:scale-[0.98] whitespace-nowrap group"
        >
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] group-hover:rotate-6 transition-transform duration-300 text-sm">
            ✨
          </span>
          <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            VirtualTryOn
          </span>
        </Link>

        {/* Buttons */}
        <div className="flex gap-3 items-center">
          {seller ? (
            <>
              {/* Mobile par naam mat dikhao */}
              <div className="hidden lg:flex items-center gap-2.5 bg-slate-800/40 border border-slate-800/60 rounded-xl px-3 py-1.5 shadow-inner">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                  👋
                </span>
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px] tracking-wide">
                  Hi, {seller.name}!
                </span>
                <span
                  className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded-md border uppercase shadow-sm ${
                    seller.plan === "elite"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                      : seller.plan === "pro"
                      ? "bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.15)]"
                      : seller.plan === "basic"
                      ? "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.15)]"
                      : "bg-slate-700/30 text-slate-400 border-slate-700/50"
                  }`}
                >
                  {seller.plan || "free"}
                </span>
              </div>
              
              {/* Premium Dashboard Button */}
              <Link
                to="/dashboard"
                className="relative overflow-hidden bg-white hover:bg-slate-50 text-slate-900 px-4 py-1.5 rounded-xl font-semibold text-xs tracking-wide shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] whitespace-nowrap flex items-center justify-center border border-slate-200/80 group"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-slate-900/5 to-transparent -skew-x-12 -translate-x-full group-hover:animate-[shine_0.8s_ease-in-out]"></div>
                Dashboard
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="bg-slate-800/60 hover:bg-red-500/10 text-slate-300 hover:text-red-400 border border-slate-700/50 hover:border-red-500/20 px-4 py-1.5 rounded-xl font-semibold text-xs tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] whitespace-nowrap flex items-center justify-center"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login Link */}
              <Link
                to="/login"
                className="text-slate-300 hover:text-white font-semibold text-xs tracking-wide px-3 py-1.5 rounded-xl transition-colors duration-200 whitespace-nowrap"
              >
                Login
              </Link>
              
              {/* Register Link with Glowing Effect */}
              <Link
                to="/register"
                className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-xl font-semibold text-xs tracking-wide shadow-[0_4px_15px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] border border-white/10 whitespace-nowrap flex items-center justify-center group"
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
