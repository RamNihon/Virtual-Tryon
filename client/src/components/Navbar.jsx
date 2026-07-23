import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import {
  CreditCard,
  Play,
  LogIn,
  LayoutDashboard,
  LogOut,
  ArrowRight,
  User,
  HelpCircle,
} from "lucide-react";

/*
  ─── WHERE THIS NAVBAR APPEARS ──────────────────────────────
  Previously this component used a blocklist (7 separate
  `if (path.startsWith(...)) return null` checks) to hide itself
  on Dashboard, Privacy, Terms, Refund, FAQ, Credits, and
  Analytics. That pattern is fragile — any new page added later
  needs to remember to be added to this list too, or it silently
  gets this navbar by default without anyone deciding that.

  Flipped to a whitelist: this navbar is the *public marketing*
  nav (Home, Pricing, Login, Register, and legal pages that still
  want the public header). Everything else — most importantly the
  whole /dashboard tree, which has its own DashboardSidebar — is
  hidden by default. Adding a new authenticated page later means
  it's hidden automatically, which is the safer default.
--------------------------------------------------------------*/
const VISIBLE_ON = ["/", "/pricing"];

export default function Navbar() {
  const { seller, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const isHome = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 10);
      if (menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [menuOpen]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  // Also hide on shop/order/fabric customer-facing pages, which
  // have their own ShopFooter/branding and shouldn't show the
  // seller-facing marketing nav at all.
  const excludedPrefixes = ["/shop/", "/order/", "/fabric/"];
  const isExcludedPrefix = excludedPrefixes.some((p) =>
    location.pathname.startsWith(p),
  );

  const isVisible =
    !isExcludedPrefix &&
    (VISIBLE_ON.includes(location.pathname) ||
      location.pathname.startsWith("/privacy") ||
      location.pathname.startsWith("/terms") ||
      location.pathname.startsWith("/refund"));

  if (!isVisible) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const planMeta = {
    elite: {
      label: "ELITE",
      gradient: "linear-gradient(135deg,#f59e0b,#ef4444)",
      glow: "#f59e0b",
      icon: "⚡",
    },
    pro: {
      label: "PRO",
      gradient: "linear-gradient(135deg,#a855f7,#d946ef)",
      glow: "#d946ef",
      icon: "👑",
    },
    basic: {
      label: "BASIC",
      gradient: "linear-gradient(135deg,#3b82f6,#06b6d4)",
      glow: "#06b6d4",
      icon: "✦",
    },
  };
  const plan = seller?.plan ? planMeta[seller.plan.toLowerCase()] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        :root {
          --nb-deep:    #0d0118;
          --nb-royal:   #5b21b6;
          --nb-vivid:   #7c3aed;
          --nb-glow:    #a855f7;
          --nb-magenta: #d946ef;
          --nb-surface: rgba(255,255,255,0.06);
          --nb-border:  rgba(168,85,247,0.2);
          --nb-h:       64px;
          --nb-font:    'Inter', system-ui, sans-serif;
        }

        /* ── BASE ── */
        .nb {
          position: fixed;
          inset: 0 0 auto 0;
          z-index: 1000;
          font-family: var(--nb-font);
          height: var(--nb-h);
          display: flex;
          align-items: center;
          padding: 0 20px;
          transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
          background: transparent;
          border-bottom: 1px solid transparent;
        }

        .nb.home-top {
          background: rgba(13, 1, 24, 0.95);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(168, 85, 247, 0.2);
        }
        .nb.home-scrolled {
          background: rgba(13, 1, 24, 0.82);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border-bottom: 1px solid var(--nb-border);
          box-shadow: 0 1px 40px rgba(168,85,247,0.12);
        }

        .nb.solid {
          background: var(--nb-deep);
          border-bottom: 1px solid var(--nb-border);
          box-shadow: 0 1px 0 rgba(168,85,247,0.15);
        }

        /* ── INNER ── */
        .nb-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        /* ── LOGO ── */
        .nb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
          position: relative;
        }
        .nb-logo-ring {
          position: absolute;
          left: -4px; top: -4px;
          width: 44px; height: 44px;
          border-radius: 14px;
          border: 1.5px solid transparent;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.3s;
          pointer-events: none;
        }
        .nb-logo:hover .nb-logo-ring {
          border-color: var(--nb-magenta);
          box-shadow: 0 0 18px rgba(217,70,239,0.5);
          transform: scale(1.12) rotate(6deg);
        }
        .nb-logo-icon {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, var(--nb-vivid), var(--nb-magenta));
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .nb-logo:hover .nb-logo-icon {
          transform: rotate(-8deg) scale(1.05);
        }
        .nb-logo-text {
          font-size: 1.1rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          background: linear-gradient(100deg, #fff 0%, #c4b5fd 60%, var(--nb-magenta) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }
        .nb-logo-text span {
          -webkit-text-fill-color: transparent;
        }

        /* ── CENTER NAV LINKS (desktop, logged-out only) ── */
        .nb-center {
          display: none;
          align-items: center;
          gap: 4px;
        }
        @media (min-width: 700px) { .nb-center { display: flex; } }
        .nb-center-link {
          padding: 7px 14px;
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          text-decoration: none;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nb-center-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.06);
        }
        .nb-center-link.active {
          color: #fff;
          background: rgba(124,58,237,0.2);
        }

        /* ── RIGHT ── */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── SELLER INFO (desktop) ── */
        .nb-seller {
          display: none;
          align-items: center;
          gap: 8px;
        }
        @media (min-width: 600px) { .nb-seller { display: flex; } }

        .nb-name {
          font-size: 0.78rem;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ── PLAN BADGE ── */
        .nb-plan {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 9px 3px 7px;
          border-radius: 999px;
          font-size: 0.6rem;
          font-weight: 800;
          letter-spacing: 0.1em;
          color: #fff;
          white-space: nowrap;
          position: relative;
        }
        .nb-plan-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: rgba(255,255,255,0.9);
          animation: nb-pulse 2.2s ease infinite;
        }
        @keyframes nb-pulse {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(0.6); opacity:0.4; }
        }

        /* ── DIVIDER ── */
        .nb-sep {
          width: 1px; height: 22px;
          background: rgba(255,255,255,0.1);
          display: none;
        }
        @media (min-width: 600px) { .nb-sep { display: block; } }

        /* ── DASHBOARD PILL (desktop) ── */
        .nb-dash {
          display: none;
        }
        @media (min-width: 560px) {
          .nb-dash {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 7px 14px;
            background: rgba(124,58,237,0.15);
            border: 1px solid rgba(124,58,237,0.3);
            border-radius: 10px;
            font-size: 0.78rem;
            font-weight: 600;
            color: rgba(255,255,255,0.88);
            text-decoration: none;
            transition: background 0.22s, border-color 0.22s, box-shadow 0.22s, transform 0.18s;
          }
          .nb-dash:hover {
            background: rgba(124,58,237,0.35);
            border-color: rgba(168,85,247,0.6);
            box-shadow: 0 0 16px rgba(124,58,237,0.3);
            transform: translateY(-1px);
          }
        }

        /* ── LOGOUT BTN ── */
        .nb-logout {
          padding: 7px 15px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, var(--nb-vivid) 0%, var(--nb-magenta) 100%);
          color: #fff;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: var(--nb-font);
          cursor: pointer;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.22s, transform 0.18s;
          /* Desktop only — on mobile, Logout lives inside the
             drawer instead, so there's exactly one way to log
             out per screen size, never two controls at once. */
          display: none;
        }
        @media (min-width: 700px) {
          .nb-logout { display: inline-block; }
        }
        .nb-logout::before {
          content:'';
          position:absolute; inset:0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
          opacity:0;
          transition: opacity 0.2s;
        }
        .nb-logout:hover {
          box-shadow: 0 0 22px rgba(217,70,239,0.55);
          transform: translateY(-1px);
        }
        .nb-logout:hover::before { opacity:1; }
        .nb-logout:active { transform: translateY(0); }

        /* ── AUTH BUTTONS (logged out) ── */
        .nb-login {
          padding: 7px 12px;
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.7);
          text-decoration: none;
          border-radius: 8px;
          transition: color 0.2s, background 0.2s;
        }
        .nb-login:hover {
          color: #fff;
          background: rgba(255,255,255,0.07);
        }
        .nb-register {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 7px 16px;
          background: #fff;
          color: #5b21b6;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.22s, box-shadow 0.22s, transform 0.18s;
        }
        .nb-register:hover {
          background: #ede9fe;
          box-shadow: 0 0 18px rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }

        /* ── HAMBURGER ── */
        .nb-ham {
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 5px;
          width: 36px; height: 36px;
          border: none;
          background: rgba(255,255,255,0.06);
          border-radius: 8px;
          cursor: pointer;
          padding: 0 8px;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .nb-ham:hover { background: rgba(255,255,255,0.1); }
        @media (min-width: 700px) { .nb-ham { display: none; } }

        .nb-ham-line {
          width: 100%; height: 1.5px;
          background: rgba(255,255,255,0.8);
          border-radius: 2px;
          transition: transform 0.28s ease, opacity 0.2s;
          transform-origin: center;
        }
        .nb-ham.open .nb-ham-line:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .nb-ham.open .nb-ham-line:nth-child(2) { opacity: 0; }
        .nb-ham.open .nb-ham-line:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

        /* ── MOBILE DRAWER ── */
        .nb-drawer {
          position: fixed;
          top: var(--nb-h);
          left: 0; right: 0;
          background: rgba(10, 2, 20, 0.97);
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          border-bottom: 1px solid var(--nb-border);
          padding: 0 20px;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4,0,0.2,1),
                      padding 0.3s ease,
                      opacity 0.25s ease;
          opacity: 0;
          z-index: 999;
        }
        .nb-drawer.open {
          max-height: 420px;
          padding: 16px 20px 20px;
          opacity: 1;
        }
        .nb-drawer-seller {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 12px;
        }
        .nb-drawer-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255,255,255,0.75);
        }
        .nb-drawer-links {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .nb-drawer-link {
          display: block;
          padding: 11px 14px;
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(124,58,237,0.22);
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          color: rgba(255,255,255,0.88);
          text-decoration: none;
          text-align: center;
          transition: background 0.2s, border-color 0.2s;
        }
        .nb-drawer-link:hover {
          background: rgba(124,58,237,0.28);
          border-color: rgba(168,85,247,0.45);
        }
        .nb-drawer-logout {
          display: block;
          width: 100%;
          padding: 11px 14px;
          background: linear-gradient(135deg, var(--nb-vivid), var(--nb-magenta));
          border: none;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: var(--nb-font);
          color: #fff;
          cursor: pointer;
          text-align: center;
          transition: box-shadow 0.2s;
        }
        .nb-drawer-logout:hover {
          box-shadow: 0 0 20px rgba(217,70,239,0.45);
        }

        /* ── BOTTOM NEON SHIMMER LINE ── */
        .nb-accent {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1.4px;
          background: linear-gradient(
            90deg,
            #7c3aed, #a855f7, #d946ef, #ec4899, #f59e0b, #06b6d4, #7c3aed
          );
          background-size: 300% 100%;
          animation: nb-neon-slide 4s linear infinite;
          opacity: 1;
          filter: blur(0.5px) brightness(1.4);
        }
        @keyframes nb-neon-slide {
          0%   { background-position: 0% 0%; }
          100% { background-position: 300% 0%; }
        }

        /* ── SPACER ── */
        .nb-spacer { height: var(--nb-h); }
      `}</style>

      {/* ── NAVBAR ── */}
      <nav
        className={`nb ${
          isHome ? (scrolled ? "home-scrolled" : "home-top") : "solid"
        }`}
      >
        <div className="nb-inner">
          {/* Logo */}
          <Link to="/" className="nb-logo">
            <div className="nb-logo-ring" />
            <div className="nb-logo-icon">👗</div>
            <span className="nb-logo-text">
              <span style={{ fontWeight: 400 }}>Virtual</span>TryOn
            </span>
          </Link>

          {/* Center links — only shown when logged out, so a
              logged-in seller's header stays focused on their
              account rather than mixing marketing nav with it */}
          {!seller && (
            <div className="nb-center">
              <Link
                to="/pricing"
                className={`nb-center-link ${
                  location.pathname === "/pricing" ? "active" : ""
                }`}
              >
                Pricing
              </Link>
              <a href="/#demo" className="nb-center-link">
                See How It Works
              </a>
            </div>
          )}

          {/* Right */}
          <div className="nb-right" ref={menuRef}>
            {seller ? (
              <>
                {/* Seller info — desktop */}
                <div className="nb-seller">
                  <span className="nb-name">Hi, {seller.name}</span>
                  {plan && (
                    <span
                      className="nb-plan"
                      style={{
                        background: plan.gradient,
                        boxShadow: `0 0 10px ${plan.glow}44`,
                      }}
                    >
                      <span className="nb-plan-dot" />
                      {plan.label}
                    </span>
                  )}
                </div>

                <div className="nb-sep" />

                {/* Dashboard — desktop */}
                <Link to="/dashboard" className="nb-dash">
                  <span>📊</span> Dashboard
                </Link>

                {/* Logout — desktop */}
                <button onClick={handleLogout} className="nb-logout">
                  Logout
                </button>

                {/* Hamburger — mobile */}
                <button
                  className={`nb-ham ${menuOpen ? "open" : ""}`}
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                >
                  <div className="nb-ham-line" />
                  <div className="nb-ham-line" />
                  <div className="nb-ham-line" />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nb-login ${menuOpen ? "hidden" : "flex"}`}
                >
                  Login
                </Link>
                {/* Matches the "Create Your Free Store" CTA used
                    on the Home page hero/final CTA — same action,
                    same wording, everywhere it appears. */}
                <Link
                  to="/register"
                  className={`nb-register whitespace-nowrap ${menuOpen ? "!hidden" : "inline-block"}`}
                >
                  Create <span className="hidden md:inline">Free</span> Store
                </Link>

                {/* Hamburger — mobile, logged-out state.
                    Previously only rendered when a seller was
                    logged in, so a logged-out visitor on mobile
                    had no way to reach Pricing without it being
                    squeezed into the header itself. */}
                <button
                  className={`nb-ham ${menuOpen ? "open" : ""}`}
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label={menuOpen ? "Close menu" : "Open menu"}
                  aria-expanded={menuOpen}
                  style={{ display: undefined }}
                >
                  <div className="nb-ham-line" />
                  <div className="nb-ham-line" />
                  <div className="nb-ham-line" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Animated accent line */}
        <div className="nb-accent" />
      </nav>

      {/* ── MOBILE DRAWER ── */}
      {/* ── MOBILE DRAWER (CLEANED & DISPUTE-FREE VERSION) ── */}
      <div
        className={`fixed top-[64px] right-0 bottom-0 w-full max-w-[340px] 
              bg-[#0f0a1c]/95 backdrop-blur-xl border-l border-white/5 
              p-6 flex flex-col justify-between z-[99] transition-transform duration-300 ease-in-out
              ${menuOpen ? "translate-x-0 shadow-2xl shadow-purple-950/50" : "translate-x-full"}`}
      >
        {seller ? (
          <div className="flex flex-col justify-between h-full w-full">
            <div className="flex flex-col gap-6 w-full">
              {/* Profile / Seller Header */}
              <div className="flex flex-col gap-3 pb-5 border-b border-white/10 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-md">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400">Welcome back</span>
                    <span className="text-sm font-bold text-white tracking-wide">
                      {seller.name}
                    </span>
                  </div>
                </div>

                {/* Dynamic Premium Plan Badge */}
                {plan && (
                  <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold w-fit mt-1 text-white border border-white/10"
                    style={{
                      background: plan.gradient,
                      boxShadow: `0 4px 15px ${plan.glow}33`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>
                      {plan.icon} {plan.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Navigation Links (Logged In) */}
              <div className="flex flex-col gap-2.5 w-full">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-medium text-gray-300 bg-white/5 border border-white/[0.02] hover:bg-white/10 hover:text-white hover:border-purple-500/30 transition-all duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <LayoutDashboard size={18} className="text-purple-400" />
                  <span>View Your Dashboard</span>
                </Link>

                <Link
                  to="/pricing"
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-medium text-gray-300 bg-white/5 border border-white/[0.02] hover:bg-white/10 hover:text-white hover:border-purple-500/30 transition-all duration-200"
                  onClick={() => setMenuOpen(false)}
                >
                  <CreditCard size={18} className="text-purple-400" />
                  <span>Upgrade Your Plan</span>
                </Link>
              </div>
            </div>

            {/* Logout Section for Seller */}
            <div className="pt-4 border-t border-white/5 w-full">
              <button
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 rounded-xl text-[14px] font-semibold text-red-400 bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-between h-full w-full">
            {/* 1. TOP SECTION: Core App Navigation Links */}
            <div className="flex flex-col gap-3 w-full">
              <Link
                to="/pricing"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-medium text-gray-300 bg-white/5 border border-white/[0.02] hover:bg-white/10 hover:text-white transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <CreditCard size={18} className="text-purple-400" />
                <span>Our Pricing</span>
              </Link>

              <a
                href="/#demo"
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[14px] font-medium text-gray-300 bg-white/5 border border-white/[0.02] hover:bg-white/10 hover:text-white transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <Play
                  size={18}
                  className="text-purple-400 fill-purple-400/10"
                />
                <span>See How It Works</span>
              </a>

              <Link
                to="/login"
                className="flex items-center justify-center w-full mt-4 px-4 py-3.5 rounded-xl text-[14px] font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <LogIn size={16} className="mr-2 text-purple-400" />
                <span>Account Login</span>
              </Link>
            </div>

            {/* 2. MIDDLE SECTION: Real Support Link Only (खाली स्पेस बैलेंस करने के लिए) */}
            <div className="flex flex-col gap-2 w-full my-6 border-t border-b border-white/5 py-5">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-2 mb-1">
                Support & Help
              </span>

              {/* आपका असली लोकल कॉन्टैक्ट पेज रूट बाइंड कर दिया */}
              <Link
                to="/contact"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium text-gray-300 bg-white/5 border border-white/[0.02] hover:bg-white/10 hover:text-white hover:border-purple-500/30 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <HelpCircle size={16} className="text-purple-400" />
                <span>Contact Support Desk</span>
              </Link>

              {/* एक छोटा, प्रीमियम और साफ माइक्रो-नोट जो स्पेस भी भरेगा और रिलायबल लगेगा */}
              <p className="text-[11px] text-gray-500 px-3 mt-2 leading-relaxed">
                Need assistance with your Virtual Identity setup or try-on
                configurations? Connect with our desk directly.
              </p>
            </div>

            {/* 3. BOTTOM SECTION: Core Premium CTA (Thumb Zone Approved) */}
            <div className="w-full mt-auto">
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-[14px] shadow-lg shadow-purple-950/50 hover:opacity-95 transition-all duration-200 active:scale-[0.99]"
                onClick={() => setMenuOpen(false)}
              >
                <span>Create Your Free Store</span>
                <ArrowRight size={16} className="animate-pulse" />
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="nb-spacer" />
    </>
  );
}
