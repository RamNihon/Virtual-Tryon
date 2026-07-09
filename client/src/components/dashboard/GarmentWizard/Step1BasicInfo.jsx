import { Lightbulb } from "lucide-react";

/*
  ─── STEP 1: BASIC INFO ─────────────────────────────────────
  Brand name, product name, and description. The Hindi guidance
  box about mentioning "model"/"worn by model" is preserved
  exactly as it was — it directly affects try-on fit accuracy,
  so it stays regardless of any UI redesign.
--------------------------------------------------------------*/
export default function Step1BasicInfo({ form, setForm, errors, clearError }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Brand Name
        </label>
        <input
          type="text"
          placeholder="like: Raymond, Zara"
          value={form.brandName || ""}
          onChange={(e) => setForm({ ...form, brandName: e.target.value })}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                     text-sm focus:outline-none focus:border-purple-500"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Product Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          placeholder="like: Men Slim Fit Shirt"
          value={form.name || ""}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            clearError("name");
          }}
          className={`w-full rounded-xl px-4 py-2.5 text-sm
                      focus:outline-none transition border ${
                        errors.name
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Product Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Describe the product's key qualities..."
          value={form.description || ""}
          onChange={(e) => {
            setForm({ ...form, description: e.target.value });
            clearError("description");
          }}
          className={`w-full rounded-xl px-4 py-2.5 text-sm
                      focus:outline-none resize-none transition border ${
                        errors.description
                          ? "border-red-400 bg-red-50 focus:border-red-500"
                          : "border-gray-200 focus:border-purple-500"
                      }`}
        />
        {errors.description && (
          <p className="text-red-500 text-xs mt-1">⚠️ {errors.description}</p>
        )}

        <div className="mt-3 p-3.5 bg-slate-50 border-l-4 border-indigo-600 rounded-md shadow-sm">
          <div className="flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" strokeWidth={2} />
            <div>
              <h4 className="m-0 mb-1 text-sm font-semibold text-slate-800">
                महत्वपूर्ण निर्देश (Important Guide)
              </h4>
              <p className="m-0 text-xs text-slate-600 leading-relaxed">
                यदि आपके कपड़े की फोटो किसी{" "}
                <strong>असली मॉडल (Model)</strong> या{" "}
                <strong>पुतले (Mannequin)</strong> द्वारा पहनी हुई है, तो विवरण
                (Description) में{" "}
                <span className="text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                  "model"
                </span>{" "}
                या{" "}
                <span className="text-indigo-600 font-medium bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                  "worn by model"
                </span>{" "}
                शब्द ज़रूर लिखें। इससे कपड़ों की फिटिंग ग्राहक पर बिल्कुल सटीक
                बैठेगी।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
