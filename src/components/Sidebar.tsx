import React, { useState } from "react";
import { 
  LayoutDashboard, 
  PackagePlus, 
  Eye, 
  ShoppingCart, 
  Settings,
  Type,
  Users, 
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Boxes
} from "lucide-react";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function Sidebar({ currentTab, setTab }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    {
      group: "Core",
      items: [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      ]
    },
    {
      group: "Product Management",
      items: [
        { id: "add-product", label: "Add Product", icon: PackagePlus },
      ]
    },
    {
      group: "Product Visits",
      items: [
        { id: "product-list", label: "Product List", icon: Eye },
      ]
    },
    {
      group: "Orders",
      items: [
        { id: "orders-list", label: "Orders List", icon: ShoppingCart },
      ]
    },
    {
      group: "Product Settings",
      items: [
        { id: "measurements-master", label: "Measurements Master", icon: Settings },
        { id: "product-names-master", label: "Product Name", icon: Type },
      ]
    },
    {
      group: "Users",
      items: [
        { id: "customer-list", label: "Customer List", icon: Users },
      ]
    },
  ];

  const handleSelectTab = (id: string) => {
    setTab(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-200 border-r border-[#1e293b] select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#1e293b]">
        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-600/30">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-white tracking-wider uppercase">herbavi</h1>
          <p className="text-[10px] text-slate-400 font-mono">v1.2.0 • RELATIONAL</p>
        </div>
      </div>

      {/* User Mini Profile */}
      <div className="px-6 py-4 border-b border-[#1e293b] bg-[#111c34]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150" 
              alt="Admin Profile" 
              className="w-10 h-10 rounded-full border-2 border-indigo-500 object-cover"
              referrerPolicy="no-referrer"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#111c34] rounded-full"></span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Sarah Jenkins</h4>
            <span className="text-[11px] text-indigo-400 font-medium">System Administrator</span>
          </div>
        </div>
      </div>

      {/* Menu Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {menuItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group.group}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id || 
                  (item.id === "add-product" && currentTab === "edit-product");
                return (
                  <button
                    id={`sidebar-tab-${item.id}`}
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group duration-150 ${
                      isActive 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                        : "text-slate-400 hover:bg-[#1e293b]/50 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? "text-white" : "text-slate-400 group-hover:scale-110"}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold bg-[#1e293b] text-indigo-400 rounded-full border border-[#334155]">
                        {item.badge}
                      </span>
                    ) : (
                      <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isActive ? "hidden" : ""}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Banner */}
      <div className="p-4 border-t border-[#1e293b] bg-[#0c1322]">
        <div className="flex items-center justify-between p-3 bg-[#111c34] rounded-lg border border-[#1e293b]">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[10px] text-slate-300 font-semibold font-mono">MYSQL SIMULATOR</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-bold">ONLINE</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f172a] text-white border-b border-[#1e293b] fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-indigo-500" />
          <span className="font-semibold text-xs uppercase tracking-wider">herbavi</span>
        </div>
        <button 
          id="mobile-sidebar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 hover:bg-[#1e293b] rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Off-canvas background overlay */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile drawer container */}
      <aside className={`lg:hidden fixed top-[49px] bottom-0 left-0 w-64 z-50 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}>
        <SidebarContent />
      </aside>
    </>
  );
}
