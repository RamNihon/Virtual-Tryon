import { useState } from "react";
import {
  Plus,
  LayoutGrid,
  List as ListIcon,
  Copy,
  Eye,
  Pencil,
  Trash2,
  Package,
} from "lucide-react";
import DashboardImageSlider from "./DashboardImageSlider";

/*
  ─── GARMENT SHOP SECTION ───────────────────────────────────
  Product catalogue with a Grid/Table view toggle, matching
  the pattern larger marketplaces (Amazon/Flipkart Seller
  Central) use for listing management.

  "Views" and "Clone" are wired into the UI now so the layout
  never needs to change again, but they're placeholders until
  their backend support exists (Phase 3B):
    - Views  → shows "—" until viewCount is tracked server-side
    - Clone  → shows a "Coming soon" toast until the duplicate
               endpoint is built
--------------------------------------------------------------*/
export default function GarmentShopSection({
  products,
  onAddNew,
  onEdit,
  onToggleStock,
  onDelete,
}) {
  const [view, setView] = useState("grid"); // "grid" | "table"
  const [comingSoonMsg, setComingSoonMsg] = useState("");

  const showComingSoon = (feature) => {
    setComingSoonMsg(`${feature} is coming soon!`);
    setTimeout(() => setComingSoonMsg(""), 2500);
  };

  return (
    <div className="space-y-5">
      {/* ─── Header: title + Add New + view toggle ─────── */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Garment Shop</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} listed
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                  view === "grid"
                    ? "bg-white shadow-sm text-purple-700"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <LayoutGrid className="w-4 h-4" strokeWidth={2} />
              </button>
              <button
                onClick={() => setView("table")}
                aria-label="Table view"
                className={`w-8 h-8 flex items-center justify-center rounded-lg transition ${
                  view === "table"
                    ? "bg-white shadow-sm text-purple-700"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <ListIcon className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>

            {/* Add New — the big, hard-to-miss CTA */}
            <button
              onClick={onAddNew}
              className="flex items-center gap-1.5 bg-gradient-to-r
                         from-purple-600 to-fuchsia-500 text-white
                         px-4 py-2 rounded-xl text-sm font-semibold
                         shadow-sm hover:shadow-md hover:-translate-y-0.5
                         transition-all"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add New Product
            </button>
          </div>
        </div>

        {/* Coming soon toast for Views/Clone */}
        {comingSoonMsg && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium rounded-lg px-3 py-2 mb-3">
            {comingSoonMsg}
          </div>
        )}

        {/* ─── Empty state ───────────────────────────────── */}
        {products.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-gray-400 text-sm mb-4">
              No products yet — add your first one to get started.
            </p>
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 bg-purple-50
                         text-purple-700 px-4 py-2 rounded-xl text-sm
                         font-semibold hover:bg-purple-100 transition"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Your First Product
            </button>
          </div>
        )}

        {/* ─── Grid View ─────────────────────────────────── */}
        {products.length > 0 && view === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onEdit={onEdit}
                onToggleStock={onToggleStock}
                onDelete={onDelete}
                onClone={() => showComingSoon("Clone")}
              />
            ))}
          </div>
        )}

        {/* ─── Table View ────────────────────────────────── */}
        {products.length > 0 && view === "table" && (
          <div className="overflow-x-auto -mx-5 sm:mx-0">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wide border-b border-gray-100">
                  <th className="pb-3 pl-5 sm:pl-0 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Views</th>
                  <th className="pb-3 pr-5 sm:pr-0 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow
                    key={product._id}
                    product={product}
                    onEdit={onEdit}
                    onToggleStock={onToggleStock}
                    onDelete={onDelete}
                    onClone={() => showComingSoon("Clone")}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Grid card ──────────────────────────────────────────── */
function ProductCard({ product, onEdit, onToggleStock, onDelete, onClone }) {
  const inStock = product.inStock !== false;
  const images =
    product.images?.length > 0 ? product.images : [product.imageUrl];

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
      <div className="relative aspect-square bg-gray-50">
        <DashboardImageSlider images={images} className="w-full h-full object-cover" />
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full ${
            inStock
              ? "bg-emerald-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </div>

      <div className="p-3">
        <p className="font-semibold text-sm text-gray-800 truncate">
          {product.name}
        </p>
        <p className="text-purple-600 font-bold text-sm mt-0.5">
          ₹{product.price}
        </p>
        <p className="text-gray-400 text-xs capitalize mt-0.5">
          {product.category?.replace("_", " ")}
        </p>

        <div className="flex items-center gap-1 text-gray-400 text-xs mt-2">
          <Eye className="w-3 h-3" strokeWidth={2} />
          <span>—</span>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <IconAction
            icon={Pencil}
            label="Edit"
            onClick={() => onEdit(product)}
          />
          <IconAction icon={Copy} label="Clone" onClick={onClone} />
          <IconAction
            icon={Package}
            label={inStock ? "Mark OOS" : "Mark In Stock"}
            active={!inStock}
            onClick={() => onToggleStock(product)}
          />
          <IconAction
            icon={Trash2}
            label="Delete"
            danger
            onClick={() => onDelete(product)}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Table row ──────────────────────────────────────────── */
function ProductRow({ product, onEdit, onToggleStock, onDelete, onClone }) {
  const inStock = product.inStock !== false;
  const image = product.images?.[0] || product.imageUrl;

  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/60 transition">
      <td className="py-3 pl-5 sm:pl-0">
        <div className="flex items-center gap-3">
          <img
            src={image}
            alt={product.name}
            className="w-11 h-11 rounded-lg object-cover shrink-0 bg-gray-100"
          />
          <div className="min-w-0">
            <p className="font-medium text-gray-800 truncate max-w-[160px]">
              {product.name}
            </p>
            <p className="text-gray-400 text-xs capitalize">
              {product.category?.replace("_", " ")}
            </p>
          </div>
        </div>
      </td>
      <td className="py-3 font-semibold text-purple-600">₹{product.price}</td>
      <td className="py-3">
        <span
          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            inStock
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {inStock ? "In Stock" : "Out of Stock"}
        </span>
      </td>
      <td className="py-3 text-gray-400 text-xs">
        <div className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" strokeWidth={2} />
          —
        </div>
      </td>
      <td className="py-3 pr-5 sm:pr-0">
        <div className="flex items-center justify-end gap-1">
          <IconAction icon={Pencil} label="Edit" onClick={() => onEdit(product)} compact />
          <IconAction icon={Copy} label="Clone" onClick={onClone} compact />
          <IconAction
            icon={Package}
            label={inStock ? "Mark OOS" : "Mark In Stock"}
            active={!inStock}
            onClick={() => onToggleStock(product)}
            compact
          />
          <IconAction icon={Trash2} label="Delete" danger onClick={() => onDelete(product)} compact />
        </div>
      </td>
    </tr>
  );
}

/* ─── Small reusable icon button with tooltip-style label ──
   Used in both the grid card action row and the table row so
   the same visual language for actions is used everywhere. */
function IconAction({ icon: Icon, label, onClick, danger, active, compact }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex items-center justify-center rounded-lg transition
                  ${compact ? "w-7 h-7" : "w-8 h-8"}
                  ${
                    danger
                      ? "text-gray-400 hover:bg-red-50 hover:text-red-600"
                      : active
                      ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  }`}
    >
      <Icon className={compact ? "w-3.5 h-3.5" : "w-4 h-4"} strokeWidth={2} />
    </button>
  );
}
