import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Calendar } from "lucide-react";
import { Product, isLowStock } from "../types";

interface HeaderProps {
  currentTab: string;
  lowStockProducts: Product[];
  onOpenStock: () => void;
}

export default function Header({
  currentTab,
  lowStockProducts,
  onOpenStock,
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBreadcrumbs = () => {
    switch (currentTab) {
      case "dashboard":
        return ["herbavi", "Dashboard"];
      case "add-product":
        return ["Product Management", "Add Product"];
      case "edit-product":
        return ["Product Management", "Edit Current Product"];
      case "product-list":
        return ["Product Management", "Products"];
      case "stock-management":
        return ["Product Management", "Stock"];
      case "orders-list":
        return ["Orders Management", "Orders List"];
      case "measurements-master":
        return ["Product Settings", "Measurements Master"];
      case "product-names-master":
        return ["Product Settings", "Product Name"];
      case "customer-list":
        return ["Users", "User List"];
      default:
        return ["herbavi", "Overview"];
    }
  };

  const breadcrumbs = getBreadcrumbs();
  const alertCount = lowStockProducts.length;
  const previewAlerts = useMemo(() => lowStockProducts.slice(0, 5), [lowStockProducts]);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20 px-6 py-3.5 select-none flex items-center justify-between gap-4 mt-[49px] lg:mt-0">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 font-mono">
          <span>{breadcrumbs[0]}</span>
          {breadcrumbs[1] && (
            <>
              <span>/</span>
              <span className="text-[#1f3a28] font-medium">{breadcrumbs[1]}</span>
            </>
          )}
        </div>
        <h2 className="text-xl font-extrabold text-black tracking-tight leading-none lg:mt-1">
          {breadcrumbs[1] || breadcrumbs[0]}
        </h2>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-mono text-gray-700 border border-gray-200">
          <Calendar className="w-3.5 h-3.5 text-[#1f3a28]" />
          <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span className="text-gray-300">|</span>
          <span className="font-bold text-black">{currentTime}</span>
        </div>

        <div className="relative hidden sm:block" ref={panelRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200"
            aria-label="Stock notifications"
          >
            <Bell className="w-4 h-4 text-gray-600" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {alertCount > 9 ? "9+" : alertCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-30">
              <div className="px-4 py-3 border-b border-gray-100 text-left">
                <p className="text-sm font-bold text-black">Stock Alerts</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Products with fewer than 10 units left
                </p>
              </div>
              {previewAlerts.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  All products have healthy stock levels.
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto">
                  {previewAlerts.map((product) => (
                    <div
                      key={product.id}
                      className="px-4 py-3 border-b border-gray-50 text-left flex items-center gap-3"
                    >
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-black truncate">{product.name}</p>
                        <p className="text-xs text-amber-700 font-bold mt-0.5">
                          {product.stock} left
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {alertCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    onOpenStock();
                  }}
                  className="w-full px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#1f3a28] hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Manage Stock
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
