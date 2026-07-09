/*
  ─── FABRIC STEP 3: ATTRIBUTES ──────────────────────────────
  Colors (multi-select swatches), occasion, pattern, and which
  garment types this fabric can become (used by the AI garment
  generator on the customer-facing fabric shop). All optional —
  no validation blocks moving forward from this step.
--------------------------------------------------------------*/
const COLOR_OPTIONS = [
  { value: "red", hex: "#EF4444" },
  { value: "blue", hex: "#3B82F6" },
  { value: "green", hex: "#22C55E" },
  { value: "yellow", hex: "#EAB308" },
  { value: "black", hex: "#171717" },
  { value: "white", hex: "#F9FAFB" },
  { value: "pink", hex: "#EC4899" },
  { value: "purple", hex: "#A855F7" },
  { value: "orange", hex: "#F97316" },
  { value: "brown", hex: "#92400E" },
  { value: "grey", hex: "#6B7280" },
  { value: "navy", hex: "#1E3A8A" },
];

// These must exactly match the `enum` values in server/models/FabricProduct.js —
// the backend rejects anything outside this list, so the label shown to the
// seller and the value actually submitted are kept separate on purpose.
const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "formal", label: "Formal" },
  { value: "wedding", label: "Wedding" },
  { value: "festival", label: "Festival" },
  { value: "party", label: "Party" },
  { value: "any", label: "Any" },
];
const PATTERNS = [
  { value: "solid", label: "Solid" },
  { value: "stripes", label: "Stripes" },
  { value: "checks", label: "Checks" },
  { value: "floral", label: "Floral" },
  { value: "geometric", label: "Geometric" },
  { value: "printed", label: "Printed" },
  { value: "other", label: "Other" },
];
const GARMENT_TYPES = [
  { value: "shirt_full", label: "Full Sleeve Shirt" },
  { value: "shirt_half", label: "Half Sleeve Shirt" },
  { value: "pant", label: "Formal Pant" },
  { value: "kurta", label: "Kurta" },
  { value: "salwar_suit", label: "Salwar Suit" },
  { value: "kurti", label: "Kurti" },
  { value: "saree", label: "Saree" },
];

export default function FabricStep3Attributes({ form, setForm }) {
  const toggleColor = (color) => {
    const colors = form.colors || [];
    setForm({
      ...form,
      colors: colors.includes(color)
        ? colors.filter((c) => c !== color)
        : [...colors, color],
    });
  };

  const toggleGarmentType = (type) => {
    const types = form.garmentTypes || [];
    setForm({
      ...form,
      garmentTypes: types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type],
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          Available Colors
        </label>
        <div className="flex flex-wrap gap-2.5">
          {COLOR_OPTIONS.map((color) => {
            const isSelected = (form.colors || []).includes(color.value);
            return (
              <button
                key={color.value}
                type="button"
                onClick={() => toggleColor(color.value)}
                title={color.value}
                className={`w-9 h-9 rounded-full border-2 flex items-center
                            justify-center transition ${
                              isSelected
                                ? "border-purple-600 ring-2 ring-purple-200"
                                : "border-gray-200"
                            }`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <span
                    className={`text-xs font-bold ${
                      ["white", "yellow"].includes(color.value)
                        ? "text-gray-800"
                        : "text-white"
                    }`}
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Occasion
          </label>
          <select
            value={form.occasion || ""}
            onChange={(e) => setForm({ ...form, occasion: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="">Select...</option>
            {OCCASIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Pattern
          </label>
          <select
            value={form.pattern || ""}
            onChange={(e) => setForm({ ...form, pattern: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500 bg-white"
          >
            <option value="">Select...</option>
            {PATTERNS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          Suitable Garment Types
        </label>
        <p className="text-gray-400 text-xs mb-2.5">
          Customers will be able to preview this fabric stitched into these
          styles.
        </p>
        <div className="flex flex-wrap gap-2">
          {GARMENT_TYPES.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => toggleGarmentType(g.value)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold
                          border-2 transition ${
                            (form.garmentTypes || []).includes(g.value)
                              ? "bg-purple-600 text-white border-purple-600"
                              : "border-gray-200 text-gray-600 hover:border-purple-300"
                          }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}