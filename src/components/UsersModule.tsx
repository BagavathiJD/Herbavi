import React, { useState } from "react";
import { 
  Users, 
  Search, 
  Mail, 
  Phone, 
  Calendar, 
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle,
  Ban
} from "lucide-react";
import { Customer } from "../types";

interface UsersModuleProps {
  customers: Customer[];
}

export default function UsersModule({ customers = [] }: UsersModuleProps) {
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Filtering Customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (c.phone && c.phone.includes(searchTerm));
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const activeCustomers = customers.filter(c => c.status === "Active").length;
  const highestSpend = customers.length > 0 
    ? Math.max(...customers.map(c => c.totalSpend)) 
    : 0;

  return (
    <div className="space-y-6">
      
      {/* 1. Header KPIs grids */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-850/80 shadow-md flex items-center gap-3 text-left">
          <div className="p-2.5 bg-indigo-950/30 border border-indigo-900/45 rounded-lg text-indigo-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Enrolled Accounts</p>
            <p className="text-lg font-extrabold font-mono text-white mt-1">{customers.length} users</p>
          </div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-850/80 shadow-md flex items-center gap-3 text-left">
          <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/45 rounded-lg text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Trust-Pass Ratio</p>
            <p className="text-lg font-extrabold font-mono text-emerald-400 mt-1">
              {Math.round((activeCustomers / (customers.length || 1)) * 100)}% active
            </p>
          </div>
        </div>

        <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-850/80 shadow-md flex items-center gap-3 text-left">
          <div className="p-2.5 bg-indigo-950/30 border border-indigo-900/45 rounded-lg text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Max Life Spend Record</p>
            <p className="text-lg font-extrabold font-mono text-indigo-400 mt-1">${highestSpend.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 2. Search panel toolbar */}
      <div className="bg-[#0f172a] rounded-xl border border-slate-850/80 p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            id="usr-search-box"
            type="text"
            placeholder="Search by Username, Email domain, Phone or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 p-2.5 bg-[#020617] border border-slate-800 text-white focus:bg-[#020617] rounded-xl focus:outline-none focus:border-indigo-550 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Account Status:</span>
          <select
            id="usr-filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-2.5 bg-[#020617] text-white border border-slate-800 rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="All">All statuses</option>
            <option value="Active">Active only</option>
            <option value="Blocked">Blocked only</option>
          </select>
        </div>
      </div>

      {/* 3. Customers Table elements */}
      <div className="bg-[#0f172a] rounded-2xl border border-slate-850/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left" id="customers-ledger-table">
            <thead className="bg-[#020617] border-b border-slate-850 text-[10px] uppercase text-slate-400 font-bold font-mono">
              <tr>
                <th className="py-4 px-6">User ID</th>
                <th className="py-4 px-6">Client Info Details</th>
                <th className="py-4 px-6">Phone line</th>
                <th className="py-4 px-6 text-center">Cumulative orders</th>
                <th className="py-4 px-6 text-right">Total spend amount</th>
                <th className="py-4 px-6 text-center font-mono">Status Mapped</th>
                <th className="py-4 px-6 font-center">Enrolled At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-20 text-slate-500">
                    No customer accounts matching filter parameters.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#020617]/50 transition-colors">
                    {/* Customer Unique ID */}
                    <td className="py-4 px-6 font-mono font-bold text-white">{c.id}</td>

                    {/* Customer Info (Name + Email) */}
                    <td className="py-4 px-6 text-left">
                      <p className="font-bold text-white">{c.name}</p>
                      <span className="flex items-center gap-1 text-[10px] text-slate-450 text-slate-400 mt-0.5">
                        <Mail className="w-3 w-3" />
                        <span>{c.email}</span>
                      </span>
                    </td>

                    {/* Telephone Line */}
                    <td className="py-4 px-6 font-mono text-slate-350">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{c.phone || "None Sourced"}</span>
                      </span>
                    </td>

                    {/* Total orders placed count */}
                    <td className="py-4 px-6 text-center font-bold font-mono text-slate-300">
                      {c.totalOrders === 0 ? (
                        <span className="text-slate-500 text-xs">-</span>
                      ) : (
                        <span>{c.totalOrders} items</span>
                      )}
                    </td>

                    {/* Sourced Total dollar volume */}
                    <td className="py-4 px-6 text-right font-extrabold font-mono text-indigo-405 text-indigo-400">
                      ${c.totalSpend.toFixed(2)}
                    </td>

                    {/* Active vs Blocked account status pill */}
                    <td className="py-4 px-6">
                      <div className="flex justify-center">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border flex items-center gap-1 leading-none ${
                          c.status === "Active" 
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50" 
                            : "bg-rose-955/40 bg-rose-950/40 text-rose-400 border-rose-900/50"
                        }`}>
                          {c.status === "Active" ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-400" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3 h-3 text-rose-400" />
                              <span>Blocked</span>
                            </>
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Join date stamp */}
                    <td className="py-4 px-6 text-slate-500 font-mono text-[10px]">
                      {new Date(c.joinDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Index Metrics info footer */}
        <div className="p-4 bg-[#020617]/70 border-t border-slate-850 text-xs text-slate-400 font-mono text-left flex justify-between items-center">
          <span>Row count: {filteredCustomers.length} profiles</span>
          <span>Authentication sync status: SECURE</span>
        </div>
      </div>

    </div>
  );
}
