import React, { useState, useEffect } from "react";
import { 
  Bell, 
  RefreshCw, 
  Calendar,
} from "lucide-react";

interface HeaderProps {
  currentTab: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export default function Header({ 
  currentTab, 
  onRefresh,
  isRefreshing
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Elegant current date-time representation matching 2026 UTC local system
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
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
        return ["Product Visits", "Product List"];
      case "orders-list":
        return ["Orders Management", "Orders List"];
      case "measurements-master":
        return ["Product Settings", "Measurements Master"];
      case "product-names-master":
        return ["Product Settings", "Product Name"];
      case "customer-list":
        return ["Users", "Customer List"];
      default:
        return ["herbavi", "Overview"];
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="bg-[#020617] border-b border-slate-850 sticky top-0 z-20 px-6 py-3.5 select-none flex items-center justify-between gap-4 mt-[49px] lg:mt-0">
      
      {/* Left section: Breadcrumbs & Current context */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 font-mono">
          <span>{breadcrumbs[0]}</span>
          {breadcrumbs[1] && (
            <>
              <span>/</span>
              <span className="text-indigo-400 font-medium">{breadcrumbs[1]}</span>
            </>
          )}
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight leading-none lg:mt-1">
          {breadcrumbs[1] || breadcrumbs[0]}
        </h2>
      </div>

      {/* Right section: Global status, shortcuts, notifications & admin metadata */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Real-time Dynamic Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg text-xs font-mono text-slate-300 border border-slate-800">
          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
          <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span className="text-slate-700">|</span>
          <span className="font-bold text-slate-200">{currentTime}</span>
        </div>

        {/* Global Manual Re-sync Button */}
        <button
          id="header-sync-btn"
          onClick={onRefresh}
          disabled={isRefreshing}
          className={`p-2 bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 transition-colors rounded-lg ${isRefreshing ? "text-indigo-400" : ""}`}
          title="Force Database Synchronize (Simulated Relational Scan)"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-400" : ""}`} />
        </button>

        {/* Global Alert Notification bell */}
        <div className="relative cursor-pointer hover:bg-slate-900/60 p-2 rounded-lg transition-colors border border-transparent hover:border-slate-800 hidden sm:block">
          <Bell className="w-4 h-4 text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-bounce"></span>
        </div>

        {/* Current Database Mode Widget */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase tracking-widest bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900 self-end">
            ACTIVE CONNECTION
          </span>
          <span className="text-[10px] text-slate-400 font-mono mt-0.5">schema: ecommerce_admin</span>
        </div>
      </div>

    </header>
  );
}
