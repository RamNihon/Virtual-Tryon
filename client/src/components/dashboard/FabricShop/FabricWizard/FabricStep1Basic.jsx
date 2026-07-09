/*
  ─── FABRIC STEP 1: BASIC INFO ──────────────────────────────
  Name, Type, Brand, Material, Description — same validation
  behavior as the Garment wizard's Step 1 (inline error clears
  as soon as the seller starts fixing the field).
--------------------------------------------------------------*/
export default function FabricStep1Basic({ form, setForm, errors, clearError }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Fabric Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="German Silk, Premium Khadi Cotton..."
            value={form.name}
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
            Fabric Type
          </label>
          <input
            type="text"
            placeholder="Denim, Jersey, Muslin, Linen..."
            value={form.fabricType}
            onChange={(e) => setForm({ ...form, fabricType: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Brand Name
          </label>
          <input
            type="text"
            placeholder="Raymond, Grasim, Siyaram..."
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
            Material
          </label>
          <input
            type="text"
            placeholder="Cotton, Wool, Silk, Nylon, Polyester"
            value={form.material}
            onChange={(e) => setForm({ ...form, material: e.target.value })}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                       text-sm focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Fabric ke baare mein likhen..."
          value={form.description}
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
      </div>
    </div>
  );
}
