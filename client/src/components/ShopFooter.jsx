import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Shirt,
  Smartphone,
  CreditCard,
  ShoppingBag,
  Headphones,
  ArrowRight,
} from "lucide-react";

export default function ShopFooter() {
  // eslint-disable-next-line no-unused-vars
  const location = useLocation();

  const currentWhatsAppNumber =
    localStorage.getItem("live_shop_whatsapp") || "";

  // व्हाट्सएप का 100% सटीक और सुरक्षित लिंक
  const whatsappLink = `https://wa.me/${currentWhatsAppNumber}?text=${encodeURIComponent(
    "Hi! I need help with this product.",
  )}`;

  const lovePoints = [
    { icon: ShoppingBag, text: "Try before you buy" },
    { icon: Sparkles, text: "AI style suggestions" },
    { icon: MessageCircle, text: "Order on WhatsApp" },
    { icon: CreditCard, text: "Secure Payments" },
    { icon: Smartphone, text: "No app required" },
  ];

  const quickLinks = [
    { label: "Privacy Policy", to: "/privacy" },
    { label: "Terms of Service", to: "/terms" },
    { label: "Refund Policy", to: "/refund" },
    { label: "FAQ", to: "/faq" },
  ];

  
  return (
    <footer className="mt-auto border-t border-white/10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.10),transparent_30%),linear-gradient(to_bottom,#020617,#0f172a)] px-6 py-10 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500 shadow-lg shadow-purple-500/20 ring-1 ring-white/10">
                <Shirt className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  Virtual<span className="text-purple-300">TryOn</span>
                </h3>
                <p className="text-[11px] uppercase tracking-[0.22em] text-white/45">
                  AI shopping experience
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-sm leading-7 text-white/65">
              See how outfits look on you before you buy. Shop with more
              confidence using AI virtual try-on.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {["AI Powered", "Secure", "Made for Fashion"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur-sm"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Why customers love it */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 bg-gradient-to-r from-purple-300 via-pink-200 to-white bg-clip-text text-transparent text-sm font-extrabold uppercase tracking-[0.2em]">
              <Sparkles className="h-4 w-4 text-purple-400 shrink-0" />
              Why customers love it
            </h4>

            <ul className="space-y-2 text-sm text-white/72">
              {lovePoints.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.text} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                      <Icon className="h-3.5 w-3.5 text-purple-300" />
                    </span>
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Shop with confidence
              </div>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Try the look first, then place your order.
              </p>
            </div>
          </div>

          {/* Links + CTA */}
          <div>
            <h4 className="mb-4 flex items-center gap-2 bg-gradient-to-r from-cyan-300 via-indigo-200 to-white bg-clip-text text-transparent text-sm font-extrabold uppercase tracking-[0.2em]">
              <svg
                className="w-4 h-4 text-cyan-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://w3.org"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              Links
            </h4>

            <ul className="space-y-2 text-sm text-white/72">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.to} className="text-white/60 hover:text-white transition-all duration-200 ease-in-out font-medium">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm ">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <Headphones className="h-4 w-4 text-purple-300" />
                Need help?
              </div>
              <p className="mt-2 text-sm leading-6 text-white/65">
                Ask the seller about size, fit, availability, or order updates.
              </p>

              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Chat on WhatsApp <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs text-white/45">
              © 2025 VirtualTryOn. All rights reserved.
            </p>
            <p className="text-xs text-white/45">
              Powered by <span className="text-purple-300">VirtualTryOn</span> •
              See the outfit before you buy
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
