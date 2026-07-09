import { useState } from "react";

/*
  ─── DASHBOARD IMAGE SLIDER ─────────────────────────────────
  Small image carousel used anywhere a product's multiple
  images need to be browsed inline (product list rows/cards).

  Originally this was hard-coded to a fixed 64x64 size for the
  old list view. It's now sized by its parent (`w-full h-full`)
  so it can be dropped into a square grid card, a 44px table
  thumbnail, or anywhere else — pass a `className` to control
  the box, the image itself always fills it.
--------------------------------------------------------------*/
export default function DashboardImageSlider({ images, className = "" }) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className={`relative w-full h-full ${className}`.trim()}>
      <img
        src={images[current]}
        alt="product"
        className="w-full h-full object-cover"
      />
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between px-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
            }}
            aria-label="Previous image"
            className="w-5 h-5 bg-black bg-opacity-50 text-white
                       rounded-full text-xs flex items-center justify-center"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));
            }}
            aria-label="Next image"
            className="w-5 h-5 bg-black bg-opacity-50 text-white
                       rounded-full text-xs flex items-center justify-center"
          >
            ›
          </button>
        </div>
      )}
      {images.length > 1 && (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {images.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === current ? "w-2 h-1 bg-white" : "w-1 h-1 bg-white opacity-50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
