import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Edit2, Package, Save, Search, X } from "lucide-react";
import {
  Product,
  formatCurrency,
  formatProductMeasurement,
  isLowStock,
  LOW_STOCK_THRESHOLD,
  type Measurement,
} from "../types";

interface StockModuleProps {
  products: Product[];
  measurements: Measurement[];
  onSaveStock: (updates: Array<{ id: string; stock: number }>) => Promise<void>;
  isProcessing: boolean;
}

type StockFilter = "all" | "low" | "out";

export default function StockModule({
  products,
  measurements,
  onSaveStock,
  isProcessing,
}: StockModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<StockFilter>("all");
  const [draftStock, setDraftStock] = useState<Record<string, string>>({});
  const [editingIds, setEditingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const next: Record<string, string> = {};
    for (const product of products) {
      next[product.id] = String(product.stock ?? 0);
    }
    setDraftStock(next);
    setEditingIds(new Set());
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toLowerCase().includes(searchTerm.toLowerCase());
      const stockValue = Number(product.stock ?? 0);
      const matchesFilter =
        filter === "all" ||
        (filter === "low" && stockValue > 0 && stockValue < LOW_STOCK_THRESHOLD) ||
        (filter === "out" && stockValue <= 0);
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, filter]);

  const lowStockCount = useMemo(
    () => products.filter((product) => isLowStock(product.stock ?? 0)).length,
    [products]
  );

  const dirtyUpdates = useMemo(() => {
    return products
      .map((product) => {
        if (!editingIds.has(product.id)) return null;
        const raw = draftStock[product.id];
        if (raw == null || raw.trim() === "") return null;
        const nextStock = Math.floor(Number(raw));
        if (isNaN(nextStock) || nextStock < 0) return null;
        if (nextStock === (product.stock ?? 0)) return null;
        return { id: product.id, stock: nextStock };
      })
      .filter((entry): entry is { id: string; stock: number } => entry != null);
  }, [products, draftStock, editingIds]);

  const handleSaveAll = async () => {
    if (dirtyUpdates.length === 0) return;
    await onSaveStock(dirtyUpdates);
  };

  const startEditing = (product: Product) => {
    setEditingIds((prev) => new Set(prev).add(product.id));
    setDraftStock((prev) => ({
      ...prev,
      [product.id]: String(product.stock ?? 0),
    }));
  };

  const cancelEditing = (product: Product) => {
    setEditingIds((prev) => {
      const next = new Set(prev);
      next.delete(product.id);
      return next;
    });
    setDraftStock((prev) => ({
      ...prev,
      [product.id]: String(product.stock ?? 0),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="text-left">
          <h2 className="text-2xl font-bold text-black tracking-tight">Stock Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            Click Edit on a product to update stock. Alerts appear when stock drops below{" "}
            {LOW_STOCK_THRESHOLD}.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isProcessing || dirtyUpdates.length === 0}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1f3a28] hover:bg-[#172d22] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
        >
          <Save className="w-4 h-4" />
          Save Changes ({dirtyUpdates.length})
        </button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-900">
              {lowStockCount} product{lowStockCount === 1 ? "" : "s"} below {LOW_STOCK_THRESHOLD} units
            </p>
            <p className="text-xs text-amber-800 mt-0.5">
              Restock soon to avoid showing out-of-stock on the storefront.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full text-sm pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-black rounded-xl focus:outline-none focus:border-[#1f3a28] focus:ring-2 focus:ring-[#1f3a28]/10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {([
            ["all", "All Products"],
            ["low", "Low Stock"],
            ["out", "Out of Stock"],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide border transition-colors cursor-pointer ${
                filter === value
                  ? "bg-[#1f3a28] text-white border-[#1f3a28]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#1f3a28] hover:text-[#1f3a28]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-[10px] uppercase text-gray-500 font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Measurement</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Update Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    No products match this filter.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const measure = measurements.find((item) => item.id === product.measurementId);
                  const isEditing = editingIds.has(product.id);
                  const draftValue = draftStock[product.id] ?? String(product.stock ?? 0);
                  const parsedDraft = Math.floor(Number(draftValue));
                  const displayStock = product.stock ?? 0;
                  const isDraftLow =
                    !isNaN(parsedDraft) && parsedDraft > 0 && parsedDraft < LOW_STOCK_THRESHOLD;
                  const isDraftOut = !isNaN(parsedDraft) && parsedDraft <= 0;
                  const isDisplayLow = displayStock > 0 && isLowStock(displayStock);
                  const isDisplayOut = displayStock <= 0;

                  return (
                    <tr
                      key={product.id}
                      className={`transition-colors ${
                        isEditing
                          ? "bg-[#1f3a28]/5"
                          : isDisplayOut
                            ? "bg-red-50/70"
                            : isDisplayLow
                              ? "bg-amber-50/70"
                              : "hover:bg-gray-50/80"
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 min-w-[220px]">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <p className="font-bold text-black truncate" title={product.name}>
                              {product.name}
                            </p>
                            <p className="text-[11px] text-gray-400 font-mono truncate">{product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">
                        {formatProductMeasurement(product.measurementValue, measure?.name)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-black">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                            displayStock <= 0
                              ? "bg-red-50 text-red-700 border-red-200"
                              : isLowStock(displayStock)
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          {displayStock}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <input
                            type="number"
                            min={0}
                            step={1}
                            autoFocus
                            value={draftValue}
                            onChange={(event) =>
                              setDraftStock((prev) => ({
                                ...prev,
                                [product.id]: event.target.value,
                              }))
                            }
                            className="w-28 text-sm px-3 py-2 border border-[#1f3a28] rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#1f3a28]/20"
                          />
                        ) : (
                          <span className="text-sm font-semibold text-gray-500">{displayStock}</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          isDraftOut ? (
                            <span className="text-xs font-bold text-red-600">Out of stock</span>
                          ) : isDraftLow ? (
                            <span className="text-xs font-bold text-amber-700">Low stock</span>
                          ) : (
                            <span className="text-xs font-bold text-emerald-700">Available</span>
                          )
                        ) : isDisplayOut ? (
                          <span className="text-xs font-bold text-red-600">Out of stock</span>
                        ) : isDisplayLow ? (
                          <span className="text-xs font-bold text-amber-700">Low stock</span>
                        ) : (
                          <span className="text-xs font-bold text-emerald-700">Available</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => cancelEditing(product)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditing(product)}
                            disabled={isProcessing}
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 border border-gray-900 text-gray-900 rounded-xl text-[11px] font-bold uppercase tracking-wide transition-colors cursor-pointer disabled:opacity-50"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
