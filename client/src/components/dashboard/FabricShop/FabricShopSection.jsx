import { Plus, Trash2, Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardImageSlider from "../DashboardImageSlider";

/*
  ─── FABRIC SHOP SECTION ────────────────────────────────────
  Grid-only list (fabric catalogues tend to be smaller than
  garment catalogues, so a table view wasn't asked for here —
  can be added later the same way Garment Shop's toggle was,
  if it turns out to be needed).

  Pro/Elite plan gate is preserved exactly as it was in the
  original FabricDashboard — free/basic sellers see the upgrade
  prompt instead of the catalogue.
--------------------------------------------------------------*/
export default function FabricShopSection({
  seller,
  products,
  onAddNew,
  onToggleStock,
  onDelete,
}) {
  const isPlanAllowed =
    seller?.plan?.toLowerCase() === "pro" ||
    seller?.plan?.toLowerCase() === "elite";

  if (!isPlanAllowed) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center border border-gray-100">
        <div className="text-6xl mb-4">🧵</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Fabric Shop — Pro/Elite Only
        </h2>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          Upload unstitched fabric, AI designs the stitched garment, and
          customers try it on!
        </p>
        <Link
          to="/pricing"
          className="bg-gradient-to-r from-purple-600 to-indigo-600
                     text-white px-8 py-3 rounded-2xl font-bold
                     hover:opacity-90 transition inline-block"
        >
          🚀 Buy Pro Plan!
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-800">Fabric Shop</h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {products.length} fabric{products.length !== 1 ? "s" : ""} listed
            </p>
          </div>

          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 bg-gradient-to-r
                       from-purple-600 to-fuchsia-500 text-white
                       px-4 py-2 rounded-xl text-sm font-semibold
                       shadow-sm hover:shadow-md hover:-translate-y-0.5
                       transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Fabric
          </button>
        </div>

        {products.length === 0 && (
          <div className="text-center py-16">
            <Scissors className="w-10 h-10 text-gray-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-gray-400 text-sm mb-4">
              No fabric products yet — add your first one to get started.
            </p>
            <button
              onClick={onAddNew}
              className="inline-flex items-center gap-1.5 bg-purple-50
                         text-purple-700 px-4 py-2 rounded-xl text-sm
                         font-semibold hover:bg-purple-100 transition"
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Add Your First Fabric
            </button>
          </div>
        )}

        {products.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <FabricCard
                key={product._id}
                product={product}
                onToggleStock={onToggleStock}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FabricCard({ product, onToggleStock, onDelete }) {
  const inStock = product.inStock !== false;
  const images =
    product.fabricImages?.length > 0
      ? product.fabricImages
      : [product.fabricImageUrl].filter(Boolean);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
      <div className="relative aspect-square bg-gray-50">
        <DashboardImageSlider images={images} className="w-full h-full object-cover" />
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-1 rounded-full ${
            inStock ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
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
        <p className="text-gray-400 text-xs mt-0.5">
          ₹{product.pricePerMeter}/meter
        </p>

        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onToggleStock(product)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition ${
              inStock
                ? "text-gray-500 hover:bg-gray-100"
                : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
            }`}
          >
            {inStock ? "Mark OOS" : "Mark In Stock"}
          </button>
          <button
            onClick={() => onDelete(product)}
            aria-label="Delete"
            className="w-8 h-8 flex items-center justify-center rounded-lg
                       text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
          >
            <Trash2 className="w-3.5 h-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  );
}
