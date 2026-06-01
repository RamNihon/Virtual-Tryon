import { Link, useLocation } from "react-router-dom";

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

  return (
    <footer
      className="bg-gray-900 text-gray-400 
                       py-12 px-6 mt-auto"
    >
      <div className="max-w-6xl mx-auto">
        {/* Top Section */}
        <div
          className="grid grid-cols-1 md:grid-cols-4 
                        gap-8 mb-8"
        >
          {/* Brand */}
          <div className="md:col-span-1">
            <h3
              className="text-white text-xl 
                           font-bold mb-3"
            >
              👗 VirtualTryOn
            </h3>
            <p className="text-sm leading-relaxed">
              AI powered virtual try-on solution for Indian fashion sellers.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4
              className="text-white font-semibold 
                           mb-3"
            >
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Free Trial
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4
              className="text-white font-semibold 
                           mb-3"
            >
              Support
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="virtualtryon.service@gmail.com"
                  className="hover:text-white transition"
                >
                  Email Support
                </a>
              </li>
              <li>
                <a
                  href="https://wa.me/919801227970"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                >
                  WhatsApp Support
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4
              className="text-white font-semibold 
                           mb-3 "
            >
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-white transition">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div
          className="border-t border-gray-800 pt-6
                        flex flex-col md:flex-row
                        justify-between items-center
                        gap-4"
        >
          <p className="text-sm">© 2025 VirtualTryOn. All rights reserved.</p>
          <p className="text-sm">Made with ❤️ for Indian Sellers</p>
        </div>
      </div>
    </footer>
  );
}
