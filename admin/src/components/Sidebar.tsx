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
  Boxes,
  LogOut
} from "lucide-react";
import { AdminUser } from "../types";

interface SidebarProps {
  currentTab: string;
  setTab: (tab: string) => void;
  user: AdminUser;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, setTab, user, onLogout }: SidebarProps) {
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
        { id: "customer-list", label: "User List", icon: Users },
      ]
    },
  ];

  const handleSelectTab = (id: string) => {
    setTab(id);
    setMobileOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-black border-r border-gray-200 select-none">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="p-2 bg-[#1f3a28] rounded-lg text-white shadow-md">
          <Boxes className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-black tracking-wider uppercase">herbavi</h1>
          <p className="text-[10px] text-gray-500 font-mono">Admin Panel</p>
        </div>
      </div>

      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-2 border-[#1f3a28] bg-white flex items-center justify-center text-[#1f3a28] font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-black truncate">{user.name}</h4>
            <span className="text-[11px] text-[#1f3a28] font-medium">{user.role}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-[11px] font-semibold text-gray-600 hover:text-[#1f3a28] hover:bg-white rounded-lg border border-gray-200 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {menuItems.map((group, groupIdx) => (
          <div key={groupIdx} className="space-y-1.5">
            <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{group.group}</p>
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
                        ? "bg-[#1f3a28] text-white shadow-md" 
                        : "text-gray-600 hover:bg-gray-100 hover:text-[#1f3a28]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 transition-transform duration-150 ${isActive ? "text-white" : "text-gray-500 group-hover:text-[#1f3a28]"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isActive ? "hidden" : ""}`} />
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white text-black border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="flex items-center gap-2">
          <Boxes className="w-5 h-5 text-[#1f3a28]" />
          <span className="font-semibold text-xs uppercase tracking-wider">herbavi</span>
        </div>
        <button 
          id="mobile-sidebar-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      <aside className="hidden lg:block w-64 h-screen sticky top-0 shrink-0 z-30">
        <SidebarContent />
      </aside>

      <aside className={`lg:hidden fixed top-[49px] bottom-0 left-0 w-64 z-50 transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out`}>
        <SidebarContent />
      </aside>
    </>
  );
}
