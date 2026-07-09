/*
  ─── FABRIC STEP 2: PRICING ─────────────────────────────────
  Total bundle price + optional price-per-meter — matches the
  original form's fields exactly, just isolated into its own
  step with the same validation pattern as Garment Step 2.
--------------------------------------------------------------*/
export default function FabricStep2Pricing({ form, setForm, errors, clearError }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Total Fabric Bundle Price (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="eg. 2499"
          value={form.price}
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
        <p className="text-gray-400 text-xs mt-1.5">
          This is the price for the whole bundle, not per meter.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Price per Meter (₹) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="eg. 350"
          value={form.pricePerMeter}
          onChange={(e) => {
            setForm({ ...form, pricePerMeter: e.target.value });
            clearError("pricePerMeter");
          }}
          className={`w-full rounded-xl px-4 py-2.5 text-sm
                      focus:outline-none transition border ${
                        errors.pricePerMeter
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
        />
        {errors.pricePerMeter && (
          <p className="text-red-500 text-xs mt-1">⚠️ {errors.pricePerMeter}</p>
        )}
        <p className="text-gray-400 text-xs mt-1.5">
          Helps customers estimate cost if they need a custom length.
        </p>
      </div>
    </div>
  );
}
