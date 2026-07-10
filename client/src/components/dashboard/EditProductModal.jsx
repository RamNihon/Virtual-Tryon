import { useState } from "react";
import axios from "axios";
 // eslint-disable-next-line
import { X, Trash2, Upload } from "lucide-react";
import API_URL from "../../api";

/*
  ─── EDIT PRODUCT MODAL ─────────────────────────────────────
  Pre-filled version of the product form, opened from the
  Garment Shop list's "Edit" action. Talks to the new
  PUT /api/seller/products/:productId route (Phase 3B).

  Existing images are shown with a remove (✕) option; the
  seller can also add new photos. On submit, the images the
  seller kept are sent as `existingImages` and new files as
  `productImages` — the backend appends them in that order.
--------------------------------------------------------------*/
export default function EditProductModal({ product, token, onClose, onSaved }) {
  const [form, setForm] = useState({
    brandName: product.brandName || "",
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    originalPrice: product.originalPrice || "",
    category: product.category || "upper_body",
    productUrl: product.productUrl || "",
  });
  const [existingImages, setExistingImages] = useState(
    product.images?.length > 0 ? product.images : [product.imageUrl].filter(Boolean),
  );
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const totalImageCount = existingImages.length + newFiles.length;

  const handleRemoveExisting = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setNewFiles((prev) => [...prev, ...files]);
    const previews = files.map((f) => URL.createObjectURL(f));
    setNewPreviews((prev) => [...prev, ...previews]);
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setErrorMsg("");
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append("brandName", form.brandName);
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("originalPrice", form.originalPrice);
      formData.append("category", form.category);
      formData.append("productUrl", form.productUrl);

      existingImages.forEach((url) => formData.append("existingImages", url));
      newFiles.forEach((file) => formData.append("productImages", file));

      const res = await axios.put(
        `${API_URL}/api/seller/products/${product._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      onSaved(res.data.product);
    } catch (err) {
      if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      } else {
        setErrorMsg(err.response?.data?.message || "Kuch error aa gaya!");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center
                 justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh]
                   overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-800">Edit Product</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {errorMsg && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
          )}

          {/* Brand Name */}
          <Field label="Brand Name">
            <input
              type="text"
              value={form.brandName}
              onChange={(e) => setForm({ ...form, brandName: e.target.value })}
              placeholder="like: Raymond, Zara"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                         text-sm focus:outline-none focus:border-purple-500"
            />
          </Field>

          {/* Product Name */}
          <Field label="Product Name" required error={fieldErrors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="like: Men Slim Fit Shirt"
              className={`w-full rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none transition border ${
                           fieldErrors.name
                             ? "border-red-400 bg-red-50"
                             : "border-gray-200 focus:border-purple-500"
                         }`}
            />
          </Field>

          {/* Description */}
          <Field label="Description" required error={fieldErrors.description}>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe the product's key qualities..."
              className={`w-full rounded-xl px-4 py-2.5 text-sm
                         focus:outline-none transition border resize-none ${
                           fieldErrors.description
                             ? "border-red-400 bg-red-50"
                             : "border-gray-200 focus:border-purple-500"
                         }`}
            />
          </Field>

          {/* Pricing row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price" required error={fieldErrors.price}>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="999"
                className={`w-full rounded-xl px-4 py-2.5 text-sm
                           focus:outline-none transition border ${
                             fieldErrors.price
                               ? "border-red-400 bg-red-50"
                               : "border-gray-200 focus:border-purple-500"
                           }`}
              />
            </Field>
            <Field label="Original Price">
              <input
                type="number"
                value={form.originalPrice}
                onChange={(e) =>
                  setForm({ ...form, originalPrice: e.target.value })
                }
                placeholder="1499"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                           text-sm focus:outline-none focus:border-purple-500"
              />
            </Field>
          </div>

          {/* Category */}
          <Field label="Category" required error={fieldErrors.category}>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5
                         text-sm focus:outline-none focus:border-purple-500 bg-white"
            >
              <option value="upper_body">Upper Body</option>
              <option value="lower_body">Lower Body</option>
              <option value="dress">Dress</option>
            </select>
          </Field>

          {/* Images */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
              Photos <span className="text-red-500">*</span>
            </label>

            <div className="grid grid-cols-4 gap-2 mb-2">
              {existingImages.map((url, i) => (
                <div key={`existing-${i}`} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full object-cover object-top" />
                  <button
                    onClick={() => handleRemoveExisting(i)}
                    aria-label="Remove image"
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60
                               text-white rounded-full flex items-center
                               justify-center text-xs opacity-0
                               group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
              ))}
              {newPreviews.map((url, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={url} alt="" className="w-full h-full  object-contain" />
                  <span className="absolute bottom-1 left-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    New
                  </span>
                  <button
                    onClick={() => handleRemoveNewFile(i)}
                    aria-label="Remove image"
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60
                               text-white rounded-full flex items-center
                               justify-center text-xs opacity-0
                               group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" strokeWidth={2.5} />
                  </button>
                </div>
              ))}

              <label
                className="aspect-square rounded-lg border-2 border-dashed
                           border-gray-200 flex flex-col items-center
                           justify-center gap-1 cursor-pointer
                           hover:border-purple-400 hover:bg-purple-50/50 transition"
              >
                <Upload className="w-4 h-4 text-gray-400" strokeWidth={2} />
                <span className="text-[10px] text-gray-400 font-medium">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAddFiles}
                  className="hidden"
                />
              </label>
            </div>

            {fieldErrors.images && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.images}</p>
            )}
            <p className="text-gray-400 text-xs mt-1">
              {totalImageCount} photo{totalImageCount !== 1 ? "s" : ""} — minimum 2 required
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold
                       text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2.5 rounded-full text-sm font-semibold
                       text-white bg-purple-700 hover:bg-purple-800
                       transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
