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
    // 🌌 Floating Capsule Container - No ugly background blocks
    <div className="sticky top-0 z-50 w-full px-4 py-3 md:px-8 max-w-6xl mx-auto">
      <nav className="relative overflow-hidden bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl px-5 py-2.5 shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] hover:border-white/15 transition-all duration-500 group">
        
        {/* 🎆 Premium Cyber Laser Background Effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500 via-purple-400 via-pink-500 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex justify-between items-center relative z-10">
          
          {/* ⚡ Logo Section with Futuristic Text Gradient */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-base font-bold tracking-tight text-white transition-all duration-300 active:scale-[0.98] whitespace-nowrap group/logo"
          >
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] overflow-hidden">
              {/* Dynamic shining light overlay on logo */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-80 group-hover/logo:scale-110 transition-transform duration-300"></div>
              <span className="relative text-xs animate-pulse">✨</span>
            </div>
            <span className="font-extrabold tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover/logo:from-white group-hover/logo:to-indigo-200 transition-all duration-300">
              Virtual<span className="font-medium text-indigo-400">TryOn</span>
            </span>
          </Link>

          {/* 🎛️ Action Buttons with Advanced Metallic Finishes */}
          <div className="flex gap-3 items-center">
            {seller ? (
              <>
                {/* * Mobile par naam mat dikhao * */}
                <div className="hidden lg:flex items-center gap-2 bg-white/[0.02] border border-white/5 rounded-xl px-3 py-1.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <span className="text-xs text-slate-400 font-medium">
                    Hi, <span className="text-white font-semibold">{seller.name}</span>
                  </span>
                  <span
                    className={`text-[9px] font-extrabold tracking-widest px-2 py-0.5 rounded-md border uppercase ${
                      seller.plan === "elite"
                        ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                        : seller.plan === "pro"
                        ? "bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                        : seller.plan === "basic"
                        ? "bg-gradient-to-r from-sky-500/20 to-blue-500/20 text-sky-400 border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.2)]"
                        : "bg-white/5 text-slate-400 border-white/5"
                    }`}
                  >
                    {seller.plan || "free"}
                  </span>
                </div>
                
                {/* Premium White Glass Dashboard Button */}
                <Link
                  to="/dashboard"
                  className="relative overflow-hidden bg-white text-slate-950 px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-[0_4px_12px_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] whitespace-nowrap flex items-center justify-center group/btn"
                >
                  {/* Luxury laser swipe animation on hover */}
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-slate-900/10 to-transparent -skew-x-12 -translate-x-full group-hover/btn:animate-[shine_0.8s_ease-in-out]"></div>
                  Dashboard
                </Link>
                
                {/* Cyber Red Outline Logout Button */}
                <button
                  onClick={handleLogout}
                  className="bg-white/[0.02] hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] whitespace-nowrap flex items-center justify-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* Login Link */}
                <Link
                  to="/login"
                  className="text-slate-400 hover:text-white font-bold text-xs tracking-wide px-3 py-1.5 rounded-xl transition-all duration-300 whitespace-nowrap"
                >
                  Login
                </Link>
                
                {/* Premium Holographic Register Button */}
                <Link
                  to="/register"
                  className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs tracking-wide shadow-[0_4px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_8px_25px_rgba(168,85,247,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.97] border border-white/20 whitespace-nowrap flex items-center justify-center group/reg"
                >
                  {/* Internal ambient light animation */}
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover/reg:opacity-100 transition-opacity duration-300"></div>
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
