import React, { useState } from "react";
import { 
  ShoppingBag, 
  IndianRupee, 
  ShoppingCart, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Clock,
  ChevronRight,
  Plus,
  PackageCheck
} from "lucide-react";
import { Product, Order, Customer, Measurement, formatProductMeasurement, formatCurrency } from "../types";

interface DashboardModuleProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  measurements: Measurement[];
  setTab: (tab: string) => void;
}

export default function DashboardModule({
  products,
  orders,
  customers,
  measurements,
  setTab
}: DashboardModuleProps) {
  // Statistics Computations
  const totalProducts = products.length;
  const totalOrders = orders.length;

  const totalRevenue = orders
    .filter(o => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCustomers = customers.length;

  // Let's create mock indicators for change compared to last month to enrich visual quality
  const stats = [
    {
      id: "revenue",
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      changeValue: "+14.2%",
      isPositive: true,
      color: "text-[#1f3a28]",
      iconBg: "bg-green-100 border-green-200",
      icon: IndianRupee,
    },
    {
      id: "orders",
      title: "Total Orders",
      value: totalOrders.toString(),
      changeValue: "+8.4%",
      isPositive: true,
      color: "text-blue-700",
      iconBg: "bg-blue-100 border-blue-200",
      icon: ShoppingCart,
    },
    {
      id: "products",
      title: "Total Products",
      value: totalProducts.toString(),
      changeValue: `+${products.filter(p => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length} new this wk`,
      isPositive: true,
      color: "text-amber-700",
      iconBg: "bg-amber-100 border-amber-200",
      icon: ShoppingBag,
    },
    {
      id: "customers",
      title: "Total Customers",
      value: totalCustomers.toString(),
      changeValue: "+4.1%",
      isPositive: true,
      color: "text-teal-700",
      iconBg: "bg-teal-100 border-teal-200",
      icon: Users,
    }
  ];

  // Latest added products (take up to 4 elements)
  const sortedProducts = [...products]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Recent Orders list (take up to 5 elements)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  // Status style helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Delivered":
        return "bg-green-100 text-[#1f3a28] border-green-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // High Fidelity Custom SVG Analytics Graph coordinates
  // Let's draw a beautiful 6-month Revenue trend graph
  const chartMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const revenueTrendData = [12000, 15500, 14200, 19000, 22400, totalRevenue > 0 ? (totalRevenue + 5000) : 18500];
  const maxRevenue = Math.max(...revenueTrendData, 25000);

  // Scale calculations for SVG heights (max height = 150px)
  const chartHeight = 150;
  const chartWidth = 500;
  const computedPoints = revenueTrendData.map((val, idx) => {
    const x = 40 + (idx * (chartWidth - 80)) / (revenueTrendData.length - 1);
    const y = chartHeight - 20 - (val / maxRevenue) * (chartHeight - 40);
    return { x, y, value: val, month: chartMonths[idx] };
  });

  const linePath = computedPoints.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`).join(" ");
  const areaPath = `${linePath} L ${computedPoints[computedPoints.length - 1].x} ${chartHeight - 20} L ${computedPoints[0].x} ${chartHeight - 20} Z`;

  // Custom hover state for graph tooltips
  const [hoveredPointIdx, setHoveredPointIdx] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      
      {/* 1. Quick Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {stats.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="bg-[#0f172a] p-5 rounded-2xl border border-slate-850/80 shadow-md flex items-center justify-between hover:shadow-lg hover:border-slate-800 transition-all duration-200"
            >
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.title}</p>
                <h3 className="text-2xl font-black font-mono text-white tracking-tight">{item.value}</h3>
                
                <div className="flex items-center gap-1">
                  {item.isPositive ? (
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#1f3a28]" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                  )}
                  <span className={`text-xs font-bold font-mono ${item.isPositive ? "text-[#1f3a28]" : "text-red-600"}`}>
                    {item.changeValue}
                  </span>
                  <span className="text-[10px] text-slate-500">vs last month</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex items-center justify-center shrink-0 ${item.iconBg}`}>
                <Icon className={`w-6 h-6 ${item.color}`} strokeWidth={2.25} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Charts and Quick Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales Performance Chart Card */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-850/80 shadow-md lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Revenue Trend</h3>
              <p className="text-xs text-slate-400">Six-month transactional revenue overview</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1f3a28] inline-block"></span>
              <span>INR (₹)</span>
            </div>
          </div>

          {/* SVG Animated Chart View */}
          <div className="relative pt-4 overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[320px]">
              {/* Horizontal grid lines */}
              <line x1="40" y1="20" x2={chartWidth - 40} y2="20" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="65" x2={chartWidth - 40} y2="65" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1="110" x2={chartWidth - 40} y2="110" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3" />
              <line x1="40" y1={chartHeight - 20} x2={chartWidth - 40} y2={chartHeight - 20} stroke="#d1d5db" strokeWidth="1.5" />

              {/* Area Under Curve */}
              <path d={areaPath} fill="url(#chart-gradient)" opacity="0.25" />

              {/* Line Curve */}
              <path d={linePath} fill="none" stroke="#1f3a28" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Grid Nodes & Tooltips */}
              {computedPoints.map((pt, i) => (
                <g 
                  key={i} 
                  onMouseEnter={() => setHoveredPointIdx(i)}
                  onMouseLeave={() => setHoveredPointIdx(null)}
                  className="cursor-pointer"
                >
                  <circle 
                    cx={pt.x} 
                    cy={pt.y} 
                    r={hoveredPointIdx === i ? 6 : 4} 
                    fill="#ffffff" 
                    stroke="#1f3a28" 
                    strokeWidth="2.5" 
                    className="transition-all duration-150"
                  />
                  {/* Month labels */}
                  <text 
                    x={pt.x} 
                    y={chartHeight - 5} 
                    fontSize="9" 
                    fontFamily="monospace" 
                    fill="#4b5563" 
                    textAnchor="middle"
                    className="font-semibold"
                  >
                    {pt.month}
                  </text>
                </g>
              ))}

              {/* Gradient Declaration */}
              <defs>
                <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1f3a28" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
            </svg>

            {/* Interactive Graph Tooltip Overlay */}
            {hoveredPointIdx !== null && (
              <div 
                className="absolute bg-white text-gray-900 px-2.5 py-1.5 rounded-lg text-[10px] font-mono shadow-md border border-gray-200 pointer-events-none transform -translate-x-1/2"
                style={{
                  left: `${(computedPoints[hoveredPointIdx].x / chartWidth) * 100}%`,
                  top: `${(computedPoints[hoveredPointIdx].y / chartHeight) * 100 - 32}%`
                }}
              >
                <p className="text-gray-500 uppercase tracking-widest text-[8px]">Revenue [{computedPoints[hoveredPointIdx].month}]</p>
                <p className="font-bold text-[#1f3a28] text-xs">{formatCurrency(computedPoints[hoveredPointIdx].value, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              </div>
            )}
          </div>

          <div className="pt-2.5 flex items-center gap-2 border-t border-gray-200 justify-between text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#1f3a28]" strokeWidth={2.25} />
              <span>Orders up <strong className="text-gray-900">12%</strong> compared to last quarter</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Simulated DB Live Sync active</span>
          </div>
        </div>

        {/* Latest Added Products Feed */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-850/80 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Latest Added</h3>
              <p className="text-xs text-slate-400">Newly structured e-commerce items</p>
            </div>
            <button 
              id="dashboard-new-product-btn"
              onClick={() => setTab("add-product")}
              className="p-1.5 bg-[#1f3a28] hover:bg-[#172d22] border border-[#1f3a28] text-white rounded-lg transition-colors cursor-pointer"
              title="Add New Product"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No products are currently available.
              </div>
            ) : (
              sortedProducts.map((p) => {
                // Find measurement name
                const measure = measurements.find(m => m.id === p.measurementId);
                return (
                  <div key={p.id} className="flex items-center justify-between p-2 hover:bg-slate-900/50 rounded-xl transition-all border border-transparent hover:border-slate-800/60 group">
                    <div className="flex items-center gap-3">
                      <img 
                        src={p.imageUrl} 
                        alt={p.name} 
                        className="w-10 h-10 object-cover rounded-lg border border-slate-800 bg-[#020617]"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left space-y-0.5 max-w-[130px]">
                        <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-400 transition-colors" title={p.name}>{p.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono font-medium">
                          {formatProductMeasurement(p.measurementValue, measure?.name)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-xs font-bold text-slate-100 font-mono">{formatCurrency(p.price)}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border leading-none inline-block ${
                        p.status === "Active" 
                          ? "bg-green-100 text-[#1f3a28] border-green-200" 
                          : "bg-red-100 text-red-700 border-red-200"
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <button 
            id="dashboard-all-products-link"
            onClick={() => setTab("product-list")}
            className="w-full py-2 bg-gray-50 text-[#1f3a28] hover:bg-[#1f3a28] hover:text-white font-bold text-xs border border-gray-200 hover:border-[#1f3a28] rounded-xl transition-all flex items-center justify-center gap-1"
          >
            <span>View All Products</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* 3. Recent Orders Table Ledger */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-850/80 shadow-md overflow-hidden space-y-1">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-850/60">
          <div className="text-left space-y-0.5">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Recent Orders List</h3>
            <p className="text-xs text-slate-400 font-medium">Live feed of incoming customer purchases</p>
          </div>
          <button 
            id="dashboard-all-orders-link"
            onClick={() => setTab("orders-list")}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#1f3a28] hover:bg-[#172d22] rounded-lg transition-all flex items-center gap-1 self-start cursor-pointer border border-[#1f3a28]"
          >
            <span>Manage Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left" id="dashboard-recent-orders-table">
            <thead className="bg-[#020617] border-b border-slate-850 text-[10px] uppercase text-slate-400 font-bold font-mono">
              <tr>
                <th className="py-3 px-5">Order ID</th>
                <th className="py-3 px-5">Customer</th>
                <th className="py-3 px-5">Items Sourced</th>
                <th className="py-3 px-5">Item Price</th>
                <th className="py-3 px-4">Qty</th>
                <th className="py-3 px-5">Total Amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-500">
                    No orders have been recorded in the database yet.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-bold text-white">{order.id}</td>
                    <td className="py-3.5 px-5 font-semibold text-slate-200">{order.userName}</td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={order.productImageUrl} 
                          alt={order.productName} 
                          className="w-7 h-7 object-cover rounded-lg border border-slate-800 shrink-0 bg-[#020617]"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate max-w-[130px] font-medium text-slate-200" title={order.productName}>
                          {order.productName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-slate-400">{formatCurrency(order.price)}</td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-400">{order.quantity}</td>
                    <td className="py-3.5 px-5 font-bold font-mono text-indigo-400">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[10px]">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
