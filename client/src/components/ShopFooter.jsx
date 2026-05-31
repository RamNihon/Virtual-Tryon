export default function ShopFooter() {
  return (
    <footer
      className="bg-gray-900 text-gray-400 
                       py-8 px-6 mt-auto"
    >
      <div className="max-w-6xl mx-auto">
        <div
          className="grid grid-cols-1 md:grid-cols-3 
                        gap-8 mb-6"
        >
          {/* Brand */}
          <div>
            <h3
              className="text-white text-lg 
                           font-bold mb-2"
            >
              👗 Virtual Shop
            </h3>
            <p className="text-sm">
              Try clothes from your home! Virtual try-on powered by AI.
            </p>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-white font-semibold mb-3">✨ Features</h4>
            <ul className="space-y-2 text-sm">
              <li>👗 Virtual Try-On</li>
              <li>🤖 AI Style Advice</li>
              <li>📱 WhatsApp Orders</li>
              <li>💳 UPI Payment</li>
            </ul>
          </div>

          {/* Powered By */}
          <div>
            <h4 className="text-white font-semibold mb-3">🔗 Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-white transition">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div
          className="border-t border-gray-800 pt-4
                        flex flex-col md:flex-row
                        justify-between items-center gap-3"
        >
          <p className="text-xs">© 2025 All rights reserved.</p>
          <p className="text-xs">
            Powered by{" "}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="text-purple-400 
                         hover:text-purple-300"
            >
              VirtualTryOn ✨
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
