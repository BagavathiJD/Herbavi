import React, { useState } from "react";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Plus,
  SlidersHorizontal,
} from "lucide-react";
import {
  Product,
  Measurement,
  formatCurrency,
  getProductDiscountPercent,
  isLowStock,
} from "../types";

interface ProductVisitsModuleProps {
  products: Product[];
  measurements: Measurement[];
  onEditTrigger: (product: Product) => void;
  onDeleteProduct: (id: string) => Promise<void>;
  onAddProduct: () => void;
}

function formatProductSku(id: string): string {
  const sku = id.replace(/^p-/, "HB-").toUpperCase();
  return sku.length > 18 ? `${sku.slice(0, 18)}…` : sku;
}

function getProductVisits(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 450) + 1;
}

export default function ProductVisitsModule({
  products,
  measurements,
  onEditTrigger,
  onDeleteProduct,
  onAddProduct,
}: ProductVisitsModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [measurementFilter, setMeasurementFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMeasurement =
      measurementFilter === "All" || p.measurementId === measurementFilter;
    const matchesStatus =
      statusFilter === "All" || p.status === statusFilter;
    return matchesSearch && matchesMeasurement && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-black tracking-tight">Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"} in catalog
          </p>
        </div>
        <button
          type="button"
          id="product-list-add-btn"
          onClick={onAddProduct}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-black hover:bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="vst-search-products"
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-black rounded-xl focus:outline-none focus:border-[#1f3a28] focus:ring-2 focus:ring-[#1f3a28]/10 transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-gray-500">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">
              Filters
            </span>
          </div>
          <select
            id="vst-filter-measurement"
            value={measurementFilter}
            onChange={(e) => setMeasurementFilter(e.target.value)}
            className="text-sm py-2.5 px-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:border-[#1f3a28] cursor-pointer"
          >
            <option value="All">All Measurements</option>
            {measurements.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            id="vst-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm py-2.5 px-3 bg-white text-black border border-gray-200 rounded-xl focus:outline-none focus:border-[#1f3a28] cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl py-20 text-center shadow-sm">
          <p className="text-gray-500 text-sm">No products matching your search.</p>
          <button
            type="button"
            onClick={onAddProduct}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#1f3a28] border border-[#1f3a28] rounded-xl hover:bg-[#1f3a28] hover:text-white transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add your first product
          </button>
        </div>
      ) : (
        <div
          id="product-list-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
        >
          {filteredProducts.map((p) => {
            const visits = getProductVisits(p.id);
            const actualPrice =
              p.originalPrice != null && p.originalPrice > p.price
                ? p.originalPrice
                : null;
            const discountPercent =
              actualPrice != null
                ? getProductDiscountPercent(actualPrice, p.price)
                : null;

            return (
              <article
                key={p.id}
                className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-[#f7f7f7] border-b border-gray-100">
                  <span
                    className={`absolute top-3 left-3 z-10 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${
                      (p.stock ?? 0) <= 0
                        ? "bg-gray-100 text-gray-600 border-gray-200"
                        : isLowStock(p.stock ?? 0)
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {(p.stock ?? 0) <= 0 ? "Out of stock" : `${p.stock} in stock`}
                  </span>
                  {discountPercent != null && (
                    <span className="absolute top-3 right-3 z-10 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200">
                      {discountPercent}% OFF
                    </span>
                  )}
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="p-4 flex flex-col flex-1 text-left">
                  <p
                    className="text-[10px] font-mono text-gray-400 uppercase tracking-wide truncate"
                    title={`SKU: ${p.id}`}
                  >
                    SKU: {formatProductSku(p.id)}
                  </p>
                  <h3
                    className="mt-1 text-sm font-bold text-black truncate"
                    title={p.name}
                  >
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5 truncate">
                    {p.category ?? "Ayurveda"}
                  </p>

                  <div className="mt-3 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-base font-bold text-black">
                          {formatCurrency(p.price)}
                        </span>
                        {actualPrice != null && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatCurrency(actualPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-xs text-gray-500">
                      <Eye className="w-3.5 h-3.5 text-red-400" />
                      <span>
                        {visits} {visits === 1 ? "view" : "views"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      id={`vst-edit-btn-${p.id}`}
                      onClick={() => onEditTrigger(p)}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-900 text-gray-900 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer"
                      title={`Edit ${p.name}`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      id={`vst-delete-btn-${p.id}`}
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete "${p.name}"? This cannot be undone.`
                          )
                        ) {
                          onDeleteProduct(p.id);
                        }
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white hover:bg-red-50 border border-red-300 text-red-600 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer"
                      title={`Delete ${p.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
