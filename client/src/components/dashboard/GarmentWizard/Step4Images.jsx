import { useRef, useState } from "react";
import { Upload, X, GripVertical, Star } from "lucide-react";
import useReorderableThumbnails from "../useReorderableThumbnails";

/*
  ─── STEP 4: IMAGES ─────────────────────────────────────────
  Replaces the old 5-fixed-labeled-slots pattern with a single
  drop/select zone (multi-select) + drag-to-reorder thumbnails,
  the way Amazon/Flipkart seller panels work. Whichever image
  ends up first is the cover image — a "Cover" badge makes that
  obvious at a glance, and there's no separate concept of
  "front/back view" to configure anymore.

  Reordering works with both mouse (desktop) and touch
  (mobile/tablet) via the shared useReorderableThumbnails hook —
  see that file for why touch needed separate handling.

  `form.seqImages` holds File objects for newly selected photos
  (this name is kept because handleAddProduct in Dashboard.jsx
  already expects it — no backend/submit-logic changes needed).
--------------------------------------------------------------*/
export default function Step4Images({ form, setForm, errors }) {
  const [previews, setPreviews] = useState(
    (form.seqImages || []).map((file) => URL.createObjectURL(file)),
  );
  const fileInputRef = useRef(null);

  const images = form.seqImages || [];

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    if (files.length === 0) return;
    const newPreviews = files.map((f) => URL.createObjectURL(f));
    setForm({ ...form, seqImages: [...images, ...files] });
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = ""; // allow re-selecting the same file later
  };

  const handleDrop = (e) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setForm({ ...form, seqImages: images.filter((_, i) => i !== index) });
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const { getItemProps, isActive } = useReorderableThumbnails(
    images,
    (newImages) => {
      // previews must be reordered in lockstep with the files,
      // so reorder is applied by index-mapping the old preview
      // array against the new file order.
      const newPreviews = newImages.map((file) => {
        const oldIndex = images.indexOf(file);
        return previews[oldIndex];
      });
      setForm({ ...form, seqImages: newImages });
      setPreviews(newPreviews);
    },
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          Product Photos <span className="text-red-500">*</span> (min 2 required)
        </label>
        <p className="text-gray-400 text-xs mb-3">
          Add all your photos here, then drag them into the order you want
          (press and hold to drag on mobile). The first photo becomes your
          cover image.
        </p>

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl py-8 flex flex-col
                      items-center justify-center gap-2 cursor-pointer
                      transition-colors ${
                        errors.images
                          ? "border-red-300 bg-red-50/50"
                          : "border-gray-200 hover:border-purple-400 hover:bg-purple-50/40"
                      }`}
        >
          <Upload className="w-6 h-6 text-gray-400" strokeWidth={1.75} />
          <p className="text-sm font-semibold text-gray-600">
            Click or drop photos here
          </p>
          <p className="text-gray-400 text-xs">You can select multiple at once</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
        </div>

        {errors.images && (
          <p className="text-red-500 text-xs mt-1.5">⚠️ {errors.images}</p>
        )}

        {/* Reorderable thumbnails */}
        {previews.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
            {previews.map((src, i) => (
              <div
                key={i}                               
                {...getItemProps(i)}
                className={`relative aspect-rectangle rounded-xl overflow-hidden
                            border-2 cursor-grab active:cursor-grabbing
                            select-none group transition ${
                              isActive(i)
                                ? "border-purple-400 opacity-50"
                                : "border-gray-100"
                            }`}
              >
                <img src={src} alt="" className="w-full h-full object-cover object-top pointer-events-none" />

                {i === 0 && (
                  <span
                    className="absolute top-1.5 left-1.5 flex items-center gap-1
                               bg-purple-600 text-white text-[9px] font-bold
                               px-2 py-0.5 rounded-full"
                  >
                    <Star className="w-2.5 h-2.5 fill-white" strokeWidth={0} />
                    Cover
                  </span>
                )}

                <div
                  className="absolute inset-x-0 bottom-0 bg-black/40 flex
                             items-center justify-center py-1 opacity-0
                             group-hover:opacity-100 transition-opacity"
                >
                  <GripVertical className="w-3.5 h-3.5 text-white" strokeWidth={2} />
                </div>

                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  aria-label="Remove image"
                  className="absolute top-1.5 right-1.5 w-5 h-5 bg-black/60
                             text-white rounded-full flex items-center
                             justify-center opacity-0 group-hover:opacity-100
                             transition-opacity"
                >
                  <X className="w-3 h-3" strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}