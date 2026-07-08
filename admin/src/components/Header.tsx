import React, { useState, useEffect } from "react";
import { 
  Bell, 
  Calendar,
} from "lucide-react";

interface HeaderProps {
  currentTab: string;
}

export default function Header({ 
  currentTab
}: HeaderProps) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
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
        return ["Users", "User List"];
      default:
        return ["herbavi", "Overview"];
    }
  };

  const breadcrumbs = getBreadcrumbs();

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

        <div className="relative cursor-pointer hover:bg-gray-100 p-2 rounded-lg transition-colors border border-transparent hover:border-gray-200 hidden sm:block">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-bounce"></span>
        </div>
      </div>
    </header>
  );
}
