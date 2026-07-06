import { Link, useLocation } from "react-router-dom";
import {
  Shirt
} from "lucide-react";

const footerLinks = {
  product: [
    { label: "What You Get", href: "/#what-you-get" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Email Support", href:"mailto:virtualtryon.service@gmail.com" },  
    { label: "FAQ", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund Policy", href: "/refund" },
  ],
};

export default function Footer() {
  const location = useLocation();

  if (location.pathname.startsWith("/privacy")) {
    return null;
  }

  if (location.pathname.startsWith("/terms")) {
    return null;
  }

  if (location.pathname.startsWith("/refund")) {
    return null;
  }
   if (location.pathname.startsWith("/order")) {
    return null;
  }
     if (location.pathname.startsWith("/faq")) {
    return null;
  }
  //  if (location.pathname.startsWith("/fabric")) {
  //   return null;
  // }
  //  if (location.pathname.startsWith("/shop")) {
  //   return null;
  // }

  return (
      
      <footer className="bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-fuchsia-500">
                <Shirt className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Virtual<span className="text-purple-300">TryOn</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
              AI-powered virtual try-on solution for Indian fashion sellers.
              Create a store, share it, and let customers try before they buy.
            </p>
           
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Product</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              {footerLinks.product.map((item) => (
                <li key={item.label}>
                  {item.href.startsWith("#") ? (
                    <a href={item.href} className="transition hover:text-white">
                      {item.label}
                    </a>
                  ) : (
                    <Link to={item.href} className="transition hover:text-white">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Support</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              {footerLinks.support.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-white">Legal</h4>
            <ul className="mt-5 space-y-3 text-sm text-white/60">
              {footerLinks.legal.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 pt-6 text-center text-sm text-white/50">
          © 2025 VirtualTryOn. All rights reserved.
           <p className="mt-4 text-sm text-white/50">Made with ❤️ for Indian Sellers</p>
        </div>
      </footer>
  );
}
