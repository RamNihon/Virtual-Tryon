import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Store,
  Shirt,
  Scissors,
  Package,
  BarChart3,
  CreditCard,
  Plug,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

/*
  ─── SIDEBAR SECTIONS ───────────────────────────────────────
  Single source of truth for the nav items. Both the desktop
  rail and the mobile drawer render from this same list, so
  adding/renaming a section only ever needs to happen here.
--------------------------------------------------------------*/
const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "store", label: "Store Settings", icon: Store },
  { key: "garments", label: "Garment Shop", icon: Shirt },
  { key: "fabric", label: "Fabric Shop", icon: Scissors },
  { key: "orders", label: "Orders", icon: Package },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "billing", label: "Billing", icon: CreditCard },
  { key: "integration", label: "Integration", icon: Plug },
  { key: "settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar({ activeSection, onSectionChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { seller, logout } = useAuth();
  const navigate = useNavigate();

  // Close the mobile drawer whenever the section changes, so picking
  // a link always returns the seller to a clean, full view.
  useEffect(() => {
    setMobileOpen(false);
  }, [activeSection]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNavClick = (key) => {
    if (key === "analytics") {
      navigate("/analytics");
      setMobileOpen(false);
      return;
    }
    onSectionChange(key);
  };

  return (
    <>
      {/* ─── MOBILE TOP BAR (hamburger trigger) ─────────────── */}
      <div
        className="lg:hidden sticky top-0 z-30 flex items-center
                   justify-between bg-white border-b border-gray-200
                   px-4 py-3"
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="w-10 h-10 flex items-center justify-center
                     rounded-xl text-gray-600 hover:bg-gray-100
                     transition"
        >
          <Menu className="w-5 h-5" strokeWidth={2} />
        </button>
        <span className="font-bold text-gray-800 text-sm">
          {NAV_ITEMS.find((n) => n.key === activeSection)?.label ||
            "Dashboard"}
        </span>
        <div className="w-10" /> {/* spacer to keep title centered */}
      </div>

      {/* ─── MOBILE DRAWER OVERLAY ───────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── MOBILE DRAWER PANEL ─────────────────────────────── */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 z-50
                    w-[280px] bg-white shadow-2xl
                    transition-transform duration-300 ease-out
                    flex flex-col
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarHeader seller={seller} onClose={() => setMobileOpen(false)} />
        <SidebarNav
          activeSection={activeSection}
          onNavClick={handleNavClick}
        />
        <SidebarFooter onLogout={handleLogout} />
      </div>

      {/* ─── DESKTOP / TABLET PERMANENT SIDEBAR ─────────────── */}
      <div
        className="hidden lg:flex lg:flex-col lg:fixed lg:top-0
                    lg:left-0 lg:bottom-0 lg:w-[248px]
                    bg-white border-r border-gray-100 z-20"
      >
        <SidebarHeader seller={seller} />
        <SidebarNav
          activeSection={activeSection}
          onNavClick={handleNavClick}
        />
        <SidebarFooter onLogout={handleLogout} />
      </div>
    </>
  );
}

/* ─── Shared sub-pieces ──────────────────────────────────── */

function SidebarHeader({ seller, onClose }) {
  return (
    <div className="px-5 pt-6 pb-5 border-b border-gray-200 flex items-start justify-between">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-xl bg-gradient-to-br
                          from-purple-600 to-fuchsia-500 flex
                          items-center justify-center shrink-0"
          >
            <span className="text-white font-black text-sm">V</span>
          </div>
          <span className="font-extrabold text-gray-800 text-[15px] truncate">
           <a href="/"> VirtualTryOn</a>
          </span>
        </div>
        <p className="text-gray-400 text-xs truncate pl-10">
          {seller?.name || "Seller"}
        </p>
      </div>

      {/* Close button — mobile drawer only */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close menu"
          className="w-8 h-8 flex items-center justify-center
                     rounded-lg text-gray-400 hover:bg-gray-100
                     hover:text-gray-600 transition shrink-0"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

function SidebarNav({ activeSection, onNavClick }) {
  return (
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = activeSection === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onNavClick(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5
                        rounded-xl text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-purple-50 text-purple-700"
                            : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                        }`}
          >
            <item.icon
              className={`w-[18px] h-[18px] shrink-0 ${
                isActive ? "text-purple-600" : "text-gray-400"
              }`}
              strokeWidth={2}
            />
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ onLogout }) {
  return (
    <div className="px-3 py-4 border-t border-gray-200">
      <button
        onClick={onLogout}
        className="w-full flex items-center gap-3 px-3 py-2.5
                   rounded-xl text-sm font-medium text-gray-500
                   hover:bg-red-50 hover:text-red-600 transition-colors"
      >
        <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
        Logout
      </button>
    </div>
  );
}
