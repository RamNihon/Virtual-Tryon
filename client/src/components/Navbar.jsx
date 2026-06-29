import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { seller, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (location.pathname.startsWith("/shop/")) return null;
  if (location.pathname.startsWith("/order/")) return null;
  if (location.pathname.startsWith("/fabric/")) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const planConfig = {
    elite: {
      bg: "linear-gradient(135deg, #f59e0b, #f97316)",
      text: "#1a0533",
      glow: "#f59e0b",
      label: "⚡ ELITE",
    },
    pro: {
      bg: "linear-gradient(135deg, #7c3aed, #e040fb)",
      text: "#fff",
      glow: "#e040fb",
      label: "👑 PRO",
    },
    basic: {
      bg: "linear-gradient(135deg, #3b82f6, #06b6d4)",
      text: "#fff",
      glow: "#06b6d4",
      label: "✦ BASIC",
    },
  };

  const plan = planConfig[seller?.plan] || null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

        .vto-navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          font-family: 'Inter', sans-serif;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          padding: 0 1.5rem;
        }

        .vto-navbar.scrolled {
          background: rgba(15, 3, 30, 0.75);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          border-bottom: 1px solid rgba(124, 58, 237, 0.25);
          box-shadow:
            0 4px 32px rgba(124, 58, 237, 0.15),
            0 1px 0 rgba(224, 64, 251, 0.1) inset;
        }

        .vto-navbar.top {
          background: transparent;
          border-bottom: 1px solid transparent;
        }

        /* Purple page pe always frosted */
        .vto-navbar.purple-page {
          background: rgba(15, 3, 30, 0.6);
          backdrop-filter: blur(20px) saturate(160%);
          -webkit-backdrop-filter: blur(20px) saturate(160%);
          border-bottom: 1px solid rgba(124, 58, 237, 0.2);
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        /* ── LOGO ── */
        .vto-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          flex-shrink: 0;
        }

        .logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #7c3aed, #e040fb);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(224, 64, 251, 0.5);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .vto-logo:hover .logo-icon {
          box-shadow: 0 0 28px rgba(224, 64, 251, 0.8);
          transform: rotate(-5deg) scale(1.05);
        }

        .logo-wordmark {
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #ffffff 30%, #c084fc 70%, #e040fb 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }

        /* ── RIGHT SECTION ── */
        .nav-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        /* ── SELLER GREETING ── */
        .seller-greeting {
          display: none;
          align-items: center;
          gap: 0.5rem;
        }

        @media (min-width: 768px) {
          .seller-greeting { display: flex; }
        }

        .greeting-text {
          font-size: 0.8rem;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
          white-space: nowrap;
          max-width: 120px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ── PLAN BADGE ── */
        .plan-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
          cursor: default;
        }

        .plan-badge::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 999px;
          padding: 1px;
          background: inherit;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          opacity: 0.4;
        }

        .badge-pulse {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s ease infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        /* ── DIVIDER ── */
        .nav-divider {
          width: 1px;
          height: 24px;
          background: rgba(255,255,255,0.12);
          display: none;
        }
        @media (min-width: 768px) {
          .nav-divider { display: block; }
        }

        /* ── DASHBOARD LINK ── */
        .dashboard-link {
          display: none;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.9rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
        }

        @media (min-width: 640px) {
          .dashboard-link { display: inline-flex; }
        }

        .dashboard-link:hover {
          background: rgba(124, 58, 237, 0.3);
          border-color: rgba(124, 58, 237, 0.5);
          color: #fff;
          box-shadow: 0 0 16px rgba(124, 58, 237, 0.3);
          transform: translateY(-1px);
        }

        /* ── LOGOUT BUTTON ── */
        .logout-btn {
          padding: 0.45rem 0.9rem;
          background: linear-gradient(135deg, #7c3aed, #e040fb);
          border: none;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          white-space: nowrap;
        }

        .logout-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }

        .logout-btn:hover {
          box-shadow: 0 0 20px rgba(224, 64, 251, 0.5);
          transform: translateY(-1px);
        }

        .logout-btn:hover::after { opacity: 1; }

        /* ── MOBILE MENU BUTTON ── */
        .mobile-menu-btn {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px;
          cursor: pointer;
          background: none;
          border: none;
        }

        @media (min-width: 640px) {
          .mobile-menu-btn { display: none; }
        }

        .menu-line {
          width: 20px;
          height: 2px;
          background: rgba(255,255,255,0.8);
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .mobile-menu-btn.open .menu-line:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }
        .mobile-menu-btn.open .menu-line:nth-child(2) {
          opacity: 0;
        }
        .mobile-menu-btn.open .menu-line:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
        }

        /* ── MOBILE DROPDOWN ── */
        .mobile-dropdown {
          position: fixed;
          top: 64px;
          left: 0;
          right: 0;
          background: rgba(15, 3, 30, 0.95);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(124, 58, 237, 0.25);
          padding: 1rem 1.5rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transform: translateY(-110%);
          opacity: 0;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999;
        }

        .mobile-dropdown.open {
          transform: translateY(0);
          opacity: 1;
        }

        .mobile-dashboard-link {
          padding: 0.75rem 1rem;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          text-decoration: none;
          text-align: center;
          transition: all 0.2s;
        }

        .mobile-dashboard-link:hover {
          background: rgba(124, 58, 237, 0.25);
          border-color: rgba(124, 58, 237, 0.4);
        }

        .mobile-logout-btn {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #7c3aed, #e040fb);
          border: none;
          border-radius: 10px;
          font-size: 0.9rem;
          font-weight: 600;
          color: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        /* ── AUTH BUTTONS (logged out) ── */
        .login-link {
          font-size: 0.82rem;
          font-weight: 500;
          color: rgba(255,255,255,0.75);
          text-decoration: none;
          padding: 0.4rem 0.5rem;
          transition: color 0.2s;
          white-space: nowrap;
        }
        .login-link:hover { color: #fff; }

        .register-link {
          padding: 0.45rem 1rem;
          background: #fff;
          color: #6d28d9;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.25s ease;
          white-space: nowrap;
          box-shadow: 0 0 0 0 rgba(255,255,255,0.3);
        }
        .register-link:hover {
          background: #f3e8ff;
          box-shadow: 0 0 20px rgba(255,255,255,0.25);
          transform: translateY(-1px);
        }

        /* ── SHIMMER LINE ── */
        .shimmer-line {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(224, 64, 251, 0.6) 30%,
            rgba(124, 58, 237, 0.8) 50%,
            rgba(224, 64, 251, 0.6) 70%,
            transparent 100%
          );
          background-size: 200% 100%;
          animation: shimmer 4s linear infinite;
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* Push page content below fixed navbar */
        .navbar-spacer { height: 64px; }
      `}</style>

      <nav className={`vto-navbar ${scrolled ? "scrolled" : "top"} ${
        location.pathname === "/" ? "purple-page" : ""
      }`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="vto-logo">
            <div className="logo-icon">👗</div>
            <span className="logo-wordmark">VirtualTryOn</span>
          </Link>

          {/* Right side */}
          <div className="nav-right">
            {seller ? (
              <>
                {/* Greeting + Plan (desktop) */}
                <div className="seller-greeting">
                  <span className="greeting-text">Hi, {seller.name}!</span>
                  {plan && (
                    <span
                      className="plan-badge"
                      style={{
                        background: plan.bg,
                        color: plan.text,
                        boxShadow: `0 0 12px ${plan.glow}55`,
                      }}
                    >
                      <span className="badge-pulse" style={{ color: plan.text }} />
                      {plan.label}
                    </span>
                  )}
                </div>

                <div className="nav-divider" />

                {/* Dashboard (desktop) */}
                <Link to="/dashboard" className="dashboard-link">
                  📊 Dashboard
                </Link>

                {/* Logout (desktop) */}
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                  style={{ display: menuOpen ? "none" : undefined }}
                >
                  Logout
                </button>

                {/* Mobile hamburger */}
                <button
                  className={`mobile-menu-btn ${menuOpen ? "open" : ""}`}
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-label="Menu"
                >
                  <div className="menu-line" />
                  <div className="menu-line" />
                  <div className="menu-line" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="login-link">Login</Link>
                <Link to="/register" className="register-link">Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Animated shimmer bottom border */}
        <div className="shimmer-line" />
      </nav>

      {/* Mobile dropdown */}
      {seller && (
        <div className={`mobile-dropdown ${menuOpen ? "open" : ""}`}>
          {plan && (
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.5rem 0",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "0.25rem",
            }}>
              <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.6)" }}>
                {seller.name}
              </span>
              <span
                className="plan-badge"
                style={{
                  background: plan.bg,
                  color: plan.text,
                  boxShadow: `0 0 10px ${plan.glow}55`,
                }}
              >
                <span className="badge-pulse" style={{ color: plan.text }} />
                {plan.label}
              </span>
            </div>
          )}
          <Link
            to="/dashboard"
            className="mobile-dashboard-link"
            onClick={() => setMenuOpen(false)}
          >
            📊 Dashboard
          </Link>
          <button className="mobile-logout-btn" onClick={() => { setMenuOpen(false); handleLogout(); }}>
            Logout
          </button>
        </div>
      )}

      <div className="navbar-spacer" />
    </>
  );
}
