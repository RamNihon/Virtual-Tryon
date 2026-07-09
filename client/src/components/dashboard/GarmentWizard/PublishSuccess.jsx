import { PartyPopper, Plus, Store, Share2 } from "lucide-react";

/*
  ─── PUBLISH SUCCESS SCREEN ─────────────────────────────────
  Full-screen celebration shown right after a product is
  published. Gives the seller three clear next actions instead
  of just dropping them back into the list — small dopamine hit
  + obvious next step, so they don't have to think about what
  to do next.
--------------------------------------------------------------*/
export default function PublishSuccess({
  productName,
  shopUrl,
  onAddAnother,
  onViewShop,
  onDone,
}) {
  return (
    <div className="fixed inset-0 z-[110] bg-white flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <div
          className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br
                      from-purple-500 to-fuchsia-500 flex items-center
                      justify-center shadow-lg shadow-purple-200"
        >
          <PartyPopper className="w-9 h-9 text-white" strokeWidth={1.75} />
        </div>

        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">
          Product Published!
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          <span className="font-semibold text-gray-700">{productName}</span>{" "}
          is now live on your shop.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={onAddAnother}
            className="w-full flex items-center justify-center gap-2
                       bg-gradient-to-r from-purple-600 to-fuchsia-500
                       text-white py-3 rounded-2xl text-sm font-semibold
                       shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Another Product
          </button>

          <button
            onClick={onViewShop}
            className="w-full flex items-center justify-center gap-2
                       bg-purple-50 text-purple-700 py-3 rounded-2xl
                       text-sm font-semibold hover:bg-purple-100 transition"
          >
            <Store className="w-4 h-4" strokeWidth={2} />
            View My Shop
          </button>

          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Check out my shop! ${shopUrl}`,
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2
                       bg-emerald-50 text-emerald-700 py-3 rounded-2xl
                       text-sm font-semibold hover:bg-emerald-100 transition"
          >
            <Share2 className="w-4 h-4" strokeWidth={2} />
            Share Shop on WhatsApp
          </a>

          <button
            onClick={onDone}
            className="w-full text-gray-400 text-sm font-medium py-2
                       hover:text-gray-600 transition"
          >
            Back to Product List
          </button>
        </div>
      </div>
    </div>
  );
}
