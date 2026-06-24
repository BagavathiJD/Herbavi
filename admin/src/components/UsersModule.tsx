import React, { useState } from "react";
import { Users, Search, Mail, Phone, Calendar } from "lucide-react";
import { AppUser } from "../types";

interface UsersModuleProps {
  users: AppUser[];
}

export default function UsersModule({ users = [] }: UsersModuleProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.userName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.includes(searchTerm) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm))
    );
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-850/80 shadow-md flex items-center gap-3 text-left">
        <div className="p-2.5 bg-indigo-950/30 border border-indigo-900/45 rounded-lg text-indigo-400">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered Accounts</p>
          <p className="text-lg font-extrabold font-mono text-white mt-1">{users.length} users</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Table: users • Database: herbavi</p>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-xl border border-slate-850/80 p-4 shadow-md">
        <div className="relative max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 p-2.5 bg-[#020617] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-2xl border border-slate-850/80 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#020617] border-b border-slate-850 text-[10px] uppercase text-slate-400 font-bold font-mono">
              <tr>
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-6">User Name</th>
                <th className="py-4 px-6">Mail</th>
                <th className="py-4 px-6">Phone Number</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Registered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-20 text-slate-500">
                    No users yet. Sign up from the login page.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, index) => (
                  <tr key={u.id} className="hover:bg-[#020617]/50">
                    <td className="py-4 px-6 font-mono font-bold text-white">{index + 1}</td>
                    <td className="py-4 px-6 font-semibold text-white">{u.userName}</td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500" />
                        {u.email}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500" />
                        {u.phoneNumber || "—"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === "Admin"
                          ? "bg-indigo-950/50 text-indigo-400 border border-indigo-900/50"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(u.createdAt).toLocaleString()}
                      </span>
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
