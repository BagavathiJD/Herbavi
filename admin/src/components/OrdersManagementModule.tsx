import React, { useState } from "react";
import { 
  Search, 
  ShoppingCart, 
  Eye, 
  ArrowRight,
  TrendingUp,
  Package,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles
} from "lucide-react";
import { Order, formatCurrency } from "../types";

interface OrdersManagementModuleProps {
  orders: Order[];
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>;
  onViewOrderDetails: (order: Order) => void;
  onSimulateOrder: () => Promise<void>;
  isSimulating: boolean;
}

export default function OrdersManagementModule({
  orders,
  onUpdateStatus,
  onViewOrderDetails,
  onSimulateOrder,
  isSimulating
}: OrdersManagementModuleProps) {
  // Filters & State Holds
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Status Styling Helpers
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-amber-950/40 text-amber-400 border-amber-900/50";
      case "Processing":
        return "bg-blue-950/40 text-blue-400 border-blue-900/50";
      case "Shipped":
        return "bg-purple-950/40 text-purple-400 border-purple-900/50";
      case "Delivered":
        return "bg-emerald-950/40 text-emerald-400 border-emerald-900/50";
      case "Cancelled":
        return "bg-rose-950/40 text-rose-400 border-rose-900/50";
      default:
        return "bg-slate-900 text-slate-300 border-slate-800";
    }
  };

  // Perform dynamic search and status filtering
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = o.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.userId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "All" || o.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination bounds
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  
  // Safe bounds auto correction
  const safeCurrentPage = currentPage > totalPages ? totalPages : currentPage;
  const startIndex = (safeCurrentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Stats
  const pendingCount = orders.filter(o => o.orderStatus === "Pending").length;
  const totalVolumeAmount = orders.filter(o => o.orderStatus !== "Cancelled").reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* 1. Orders KPI row summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-850/80 shadow-md flex items-center gap-3 text-left">
          <div className="p-2.5 bg-amber-950/30 rounded-lg text-amber-400 border border-amber-900/45">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Awaiting Processing</p>
            <p className="text-lg font-extrabold font-mono text-white mt-1">{pendingCount} orders</p>
          </div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-850/80 shadow-md flex items-center gap-3 text-left">
          <div className="p-2.5 bg-indigo-950/30 rounded-lg text-indigo-400 border border-indigo-900/45">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Net Commerce Volume</p>
            <p className="text-lg font-extrabold font-mono text-indigo-400 mt-1">{formatCurrency(totalVolumeAmount)}</p>
          </div>
        </div>

        {/* Dynamic relational random placement simulator */}
        <div className="bg-[#0f172a] text-white p-4 rounded-xl border border-slate-850/80 shadow-md flex items-center justify-between text-left">
          <div className="space-y-0.5">
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Interactive Sandbox</p>
            <h4 className="text-xs font-bold text-slate-200">Relational DB inserts</h4>
          </div>
          <button
            id="order-btn-simulate"
            onClick={onSimulateOrder}
            disabled={isSimulating}
            className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-600 border border-indigo-700 font-bold text-[10px] rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSimulating ? "Inserting query..." : "Simulate Order"}</span>
          </button>
        </div>
      </div>

      {/* 2. Actions Filter Toolbar */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-850/80 p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input elements */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="ord-search-box"
            type="text"
            placeholder="Search by Purchaser, Item, ID, or user ID..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset page on query change
            }}
            className="w-full text-xs pl-10 p-2.5 bg-[#020617] border border-slate-800 text-white focus:bg-[#020617] rounded-xl focus:outline-none focus:border-indigo-550 transition-all font-medium"
          />
        </div>

        {/* State filters dropdown selection */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Order Status:</span>
          <select
            id="ord-filter-dropdown"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs p-2.5 bg-[#020617] text-white border border-slate-800 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

      </div>

      {/* 3. Orders Master Data List table */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-850/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs" id="orders-master-grid-table">
            <thead className="bg-[#020617] border-b border-slate-850 text-[10px] uppercase text-slate-400 font-bold font-mono">
              <tr>
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-6">User (purchaser)</th>
                <th className="py-3.5 px-6">Product Item</th>
                <th className="py-3.5 px-4 font-center">Qty / Measure</th>
                <th className="py-3.5 px-6 text-right">Price</th>
                <th className="py-3.5 px-6 text-right">Total Amount</th>
                <th className="py-3.5 px-6 text-center">Status Mapped</th>
                <th className="py-3.5 px-6 font-center">Log Date</th>
                <th className="py-3.5 px-6 text-center">Admin Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-slate-300">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-20 text-slate-500">
                    No customer orders found matching current criteria.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#020617]/50 transition-colors">
                    {/* Order ID */}
                    <td className="py-4 px-6 font-mono font-bold text-white">{o.id}</td>
                    
                    {/* User ID & User Name */}
                    <td className="py-4 px-6 text-left">
                      <p className="font-bold text-white">{o.userName}</p>
                      <p className="text-[10px] font-mono text-slate-500">uid: {o.userId}</p>
                    </td>

                    {/* Sourced Product (image & name) */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <img 
                          src={o.productImageUrl} 
                          alt={o.productName} 
                          className="w-8 h-8 object-cover rounded-xl border border-slate-850 bg-[#020617] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <span className="truncate max-w-[120px] font-medium text-slate-300" title={o.productName}>
                          {o.productName}
                        </span>
                      </div>
                    </td>

                    {/* Quantity + Sourced Measurement type */}
                    <td className="py-4 px-4 text-center space-y-0.5">
                      <p className="font-bold font-mono text-slate-200">{o.quantity}</p>
                      <p className="text-[9px] uppercase font-mono text-slate-500 leading-none">{o.measurementName}</p>
                    </td>

                    {/* Retail Sourced unit price */}
                    <td className="py-4 px-6 text-right font-mono text-slate-400">
                      {formatCurrency(o.price)}
                    </td>

                    {/* Total billing price */}
                    <td className="py-4 px-6 text-right font-bold font-mono text-indigo-400">
                      {formatCurrency(o.totalAmount)}
                    </td>

                    {/* Order Status change dropdown */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-[9px] font-black uppercase inline-block px-2 py-0.5 border rounded-full leading-none tracking-wide ${getStatusStyle(o.orderStatus)}`}>
                          {o.orderStatus}
                        </span>
                        
                        <select
                          id={`ord-status-update-${o.id}`}
                          value={o.orderStatus}
                          onChange={(e) => onUpdateStatus(o.id, e.target.value)}
                          className="text-[9px] font-bold text-slate-300 bg-[#020617] hover:bg-slate-900 p-1 border border-slate-800 rounded focus:outline-none cursor-pointer"
                          title="Update Mysql relational status"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </td>

                    {/* Date stamp */}
                    <td className="py-4 px-6 text-slate-500 font-mono text-[10px]">
                      {new Date(o.orderDate).toLocaleDateString()}
                    </td>

                    {/* Details click helper */}
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <button
                          id={`ord-details-btn-${o.id}`}
                          onClick={() => onViewOrderDetails(o)}
                          className="p-1 px-2.5 text-[10px] hover:bg-slate-805 hover:bg-slate-800 rounded-lg text-slate-300 font-extrabold border border-slate-800 transition-colors flex items-center gap-0.5 cursor-pointer"
                          title="Inspect raw values"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Interactive Pagination controls */}
        <div className="p-4 bg-[#020617]/80 border-t border-slate-850 text-xs font-mono text-slate-400 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <span>Matching index: {totalItems} orders (page {safeCurrentPage} of {totalPages})</span>
          
          <div className="flex items-center gap-2">
            <button
              id="ord-page-prev"
              disabled={safeCurrentPage === 1}
              onClick={() => setCurrentPage(safeCurrentPage - 1)}
              className="p-1.5 bg-[#020617] border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-white text-xs px-2">{safeCurrentPage}</span>
            <button
              id="ord-page-next"
              disabled={safeCurrentPage === totalPages}
              onClick={() => setCurrentPage(safeCurrentPage + 1)}
              className="p-1.5 bg-[#020617] border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
