/*
  ─── STEP 3: ATTRIBUTES ─────────────────────────────────────
  Sizes, then the highlight fields (pack/color/fabric/occasion),
  pattern, and suitable-for. Nothing required here — these are
  all optional enrichments, so there's no validation blocking
  the seller from moving on.
--------------------------------------------------------------*/
const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const PATTERNS = ["Solid", "Striped", "Printed", "Checked", "Floral", "Geometric", "Abstract"];
const SUITABLE_FOR = ["Western Wear", "Traditional Wear", "Party Wear", "Sportswear", "Ethnic Wear"];

export default function Step3Attributes({ form, setForm }) {
  const toggleSize = (size) => {
    const sizes = form.sizes || [];
    setForm({
      ...form,
      sizes: sizes.includes(size)
        ? sizes.filter((s) => s !== size)
        : [...sizes, size],
    });
  };

  const setHighlight = (key, value) => {
    setForm({
      ...form,
      highlights: { ...form.highlights, [key]: value },
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          Available Sizes
        </label>
        <div className="flex gap-2 flex-wrap">
          {SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-3.5 py-1.5 rounded-xl text-sm font-semibold
                          border-2 transition ${
                            (form.sizes || []).includes(size)
                              ? "bg-purple-600 text-white border-purple-600"
                              : "border-gray-200 text-gray-600 hover:border-purple-300"
                          }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-3">
          Product Highlights
        </label>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {[
            { k: "packOf", l: "Pack Of", p: "1, 2, 3..." },
            { k: "color", l: "Color", p: "Blue, Red, Black..." },
            { k: "fabric", l: "Fabric", p: "Cotton, Polyester..." },
            { k: "occasion", l: "Occasion", p: "Casual, Formal..." },
          ].map((f) => (
            <div key={f.k} className="grid grid-cols-2 gap-2 items-center">
              <label className="text-xs text-gray-500 font-medium">{f.l}</label>
              <input
                type="text"
                placeholder={f.p}
                value={form.highlights?.[f.k] || ""}
                onChange={(e) => setHighlight(f.k, e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs
                           focus:outline-none focus:border-purple-500 bg-white"
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="text-xs text-gray-500 font-medium">Pattern</label>
            <select
              value={form.highlights?.pattern || "Solid"}
              onChange={(e) => setHighlight("pattern", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs
                         focus:outline-none focus:border-purple-500 bg-white"
            >
              {PATTERNS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2 items-center">
            <label className="text-xs text-gray-500 font-medium">Suitable For</label>
            <select
              value={form.highlights?.suitableFor || ""}
              onChange={(e) => setHighlight("suitableFor", e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs
                         focus:outline-none focus:border-purple-500 bg-white"
            >
              <option value="">Select...</option>
              {SUITABLE_FOR.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
