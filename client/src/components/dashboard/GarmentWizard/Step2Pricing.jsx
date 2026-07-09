/*
  ─── STEP 2: PRICING ────────────────────────────────────────
  Original price, final price, live discount preview, and
  category. Category moved here (rather than Step 3) because
  it's a core identity field like price — it also drives the
  smart try-on routing (upper/lower/dress), so it belongs early.
--------------------------------------------------------------*/
export default function Step2Pricing({ form, setForm, errors, clearError }) {
  const showDiscount =
    form.originalPrice &&
    form.price &&
    parseFloat(form.originalPrice) > parseFloat(form.price);

  const discountPercent = showDiscount
    ? Math.round(
        ((parseFloat(form.originalPrice) - parseFloat(form.price)) /
          parseFloat(form.originalPrice)) *
          100,
      )
    : 0;

  const savings = showDiscount
    ? Math.round(parseFloat(form.originalPrice) - parseFloat(form.price))
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Original Price (₹)
          </label>
          <input
            type="number"
            placeholder="eg. 1499"
            value={form.originalPrice || ""}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Final Price (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder="eg. 999"
            value={form.price || ""}
            onChange={(e) => {
              setForm({ ...form, price: e.target.value });
              clearError("price");
            }}
            className={`w-full rounded-xl px-4 py-2.5 text-sm
                        focus:outline-none transition border ${
                          errors.price
                            ? "border-red-400 bg-red-50 focus:border-red-500"
                            : "border-gray-200 focus:border-purple-500"
                        }`}
          />
          {errors.price && (
            <p className="text-red-500 text-xs mt-1">⚠️ {errors.price}</p>
          )}
        </div>
      </div>

      {showDiscount && (
        <div className="bg-green-50 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <span className="text-green-600 font-bold text-sm">
            {discountPercent}% OFF
          </span>
          <span className="text-gray-400 text-xs">savings: ₹{savings}</span>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "upper_body", label: "Upper Body", emoji: "👕" },
            { value: "lower_body", label: "Lower Body", emoji: "👖" },
            { value: "dress", label: "Full Dress", emoji: "👗" },
          ].map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setForm({ ...form, category: cat.value })}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl
                          border-2 transition ${
                            form.category === cat.value
                              ? "border-purple-600 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
            >
              <span className="text-2xl">{cat.emoji}</span>
              <span
                className={`text-xs font-semibold ${
                  form.category === cat.value ? "text-purple-700" : "text-gray-500"
                }`}
              >
                {cat.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-gray-400 text-xs mt-2">
          This decides which AI try-on model is used for the best fit.
        </p>
      </div>
    </div>
  );
}
