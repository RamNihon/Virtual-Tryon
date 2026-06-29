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
    // 🌌 Solid White & Slate Background Capsule with absolute contrast
    <div className="sticky top-0 z-50 w-full px-4 py-3 md:px-8 max-w-6xl mx-auto">
      <nav className="relative overflow-hidden bg-slate-900 border border-slate-800/80 rounded-2xl px-5 py-2.5 shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:border-slate-700/80 transition-all duration-300 group">
        
        {/* 🎆 Premium Laser Neon Border Line */}
        <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-indigo-500 via-purple-500 to-transparent opacity-100"></div>

        <div className="flex justify-between items-center relative z-10">
          
          {/* ⚡ High-Contrast Logo Section */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 text-base font-bold tracking-tight text-white transition-all duration-300 active:scale-[0.98] whitespace-nowrap group/logo"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border border-white/20 shadow-[0_0_15px_rgba(168,85,247,0.3)] overflow-hidden">
              <span className="relative text-xs text-white">✨</span>
            </div>
            <span className="font-extrabold tracking-wide text-white group-hover/logo:text-indigo-300 transition-colors duration-200">
              Virtual<span className="font-semibold text-indigo-400">TryOn</span>
            </span>
          </Link>

          {/* 🎛️ Dynamic Action Buttons */}
          <div className="flex gap-3 items-center">
            {seller ? (
              <>
                {/* * Mobile par naam mat dikhao * */}
                <div className="hidden lg:flex items-center gap-2 bg-slate-800/60 border border-slate-700/50 rounded-xl px-3 py-1.5 shadow-inner">
                  <span className="text-xs text-slate-300 font-medium">
                    Hi, <span className="text-white font-semibold">{seller.name}</span>
                  </span>
                  <span
                    className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded-md border uppercase ${
                      seller.plan === "elite"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]"
                        : seller.plan === "pro"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                        : seller.plan === "basic"
                        ? "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.1)]"
                        : "bg-slate-700/30 text-slate-400 border-slate-700/50"
                    }`}
                  >
                    {seller.plan || "free"}
                  </span>
                </div>
                
                {/* Dashboard Button */}
                <Link
                  to="/dashboard"
                  className="bg-white hover:bg-slate-100 text-slate-950 px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] whitespace-nowrap flex items-center justify-center border border-slate-200"
                >
                  Dashboard
                </Link>
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-slate-800 hover:bg-red-500/10 text-slate-200 hover:text-red-400 border border-slate-700/80 hover:border-red-500/20 px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] whitespace-nowrap flex items-center justify-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Link */}
                <Link
                  to="/login"
                  className="text-slate-300 hover:text-white font-bold text-xs tracking-wide px-3 py-1.5 rounded-xl transition-all duration-200 whitespace-nowrap"
                >
                  Login
                </Link>
                
                {/* Register Button */}
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-[0_4px_15px_rgba(99,102,241,0.3)] hover:shadow-[0_6px_20px_rgba(168,85,247,0.4)] transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] border border-white/10 whitespace-nowrap flex items-center justify-center"
                >
                  Register
                </Link>
              </>
            )}
          </div>

        </div>
      </nav>
    </div>
  );
}
