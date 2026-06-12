import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  ShieldCheck,
  Check,
  AlertCircle
} from "lucide-react";
import { ProductName } from "../types";

interface ProductNamesModuleProps {
  productNames: ProductName[];
  onAddProductName: (name: string, status: "Enabled" | "Disabled") => Promise<void>;
  onUpdateProductName: (id: string, name: string, status: "Enabled" | "Disabled") => Promise<void>;
  onDeleteProductName: (id: string) => Promise<void>;
  isProcessing: boolean;
}

export default function ProductNamesModule({
  productNames = [],
  onAddProductName,
  onUpdateProductName,
  onDeleteProductName,
  isProcessing
}: ProductNamesModuleProps) {
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<"Enabled" | "Disabled">("Enabled");
  const [errorMessage, setErrorMessage] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingStatus, setEditingStatus] = useState<"Enabled" | "Disabled">("Enabled");

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!newName.trim()) {
      setErrorMessage("Product name cannot be empty.");
      return;
    }

    try {
      await onAddProductName(newName.trim(), newStatus);
      setNewName("");
      setNewStatus("Enabled");
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while adding product name.");
    }
  };

  const startEditing = (pn: ProductName) => {
    setEditingId(pn.id);
    setEditingName(pn.name);
    setEditingStatus(pn.status);
    setErrorMessage("");
  };

  const handleSaveEdit = async (id: string) => {
    setErrorMessage("");

    if (!editingName.trim()) {
      setErrorMessage("Product name must contain letters/symbols.");
      return;
    }

    try {
      await onUpdateProductName(id, editingName.trim(), editingStatus);
      setEditingId(null);
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while updating product name.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div className="space-y-6">
        <div className="bg-[#0f172a] text-slate-200 p-5 rounded-2xl border border-[#1e293b] shadow-md flex flex-col justify-between text-left">
          <div className="space-y-2">
            <h4 className="text-xs font-black font-mono tracking-widest text-indigo-400 uppercase">Schema Mapping Desk</h4>
            <p className="text-xs text-slate-300">
              The products table can reference the product_names master table for standardized catalog naming:
            </p>
            <div className="p-3 bg-[#0a0f1d] rounded-lg border border-slate-800 text-[10px] font-mono text-emerald-400 space-y-1">
              <p className="text-slate-500">// Relational Schema Constraint</p>
              <p>CREATE TABLE product_names (</p>
              <p className="pl-4">id VARCHAR(50) PRIMARY KEY,</p>
              <p className="pl-4">name VARCHAR(255) NOT NULL,</p>
              <p className="pl-4">status ENUM('Enabled', 'Disabled')</p>
              <p>);</p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Referential Integrity: Active</span>
          </div>
        </div>

        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-850/80 shadow-md space-y-4">
          <div className="text-left space-y-1 pb-3 border-b border-slate-850">
            <h3 className="text-sm font-extrabold text-white">Add Product Name</h3>
            <p className="text-xs text-slate-400">Insert a new product name into master data</p>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-4">
            {errorMessage && !editingId && (
              <div className="p-3 bg-red-950/40 text-red-400 border border-red-900/50 text-xs rounded-xl flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
              <input
                id="pn-new-name"
                disabled={isProcessing}
                type="text"
                placeholder="e.g. Organic Green Tea"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full text-xs p-3 bg-[#020617] border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-550 transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Default Status</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 p-2 px-3 bg-[#020617] hover:bg-slate-900/55 border border-slate-800 rounded-xl text-xs font-semibold text-emerald-400 cursor-pointer select-none flex-1">
                  <input
                    type="radio"
                    name="newProductNameStatus"
                    checked={newStatus === "Enabled"}
                    onChange={() => setNewStatus("Enabled")}
                    className="accent-emerald-500 cursor-pointer"
                  />
                  <span>Enabled</span>
                </label>
                <label className="flex items-center gap-1.5 p-2 px-3 bg-[#020617] hover:bg-slate-900/55 border border-slate-800 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer select-none flex-1">
                  <input
                    type="radio"
                    name="newProductNameStatus"
                    checked={newStatus === "Disabled"}
                    onChange={() => setNewStatus("Disabled")}
                    className="accent-slate-500 cursor-pointer"
                  />
                  <span>Disabled</span>
                </label>
              </div>
            </div>

            <button
              id="pn-btn-insert"
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-indigo-650 hover:bg-indigo-600 border border-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-1 cursor-pointer transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isProcessing ? "Processing statement..." : "INSERT INTO product_names;"}</span>
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-2 bg-[#0f172a] rounded-2xl border border-slate-850/80 shadow-md overflow-hidden flex flex-col h-full justify-between">
        <div className="space-y-1">
          <div className="p-5 text-left border-b border-slate-850">
            <h3 className="text-sm font-extrabold text-[#ffffff] uppercase tracking-wider">Product Name Master Table</h3>
            <p className="text-xs text-slate-400">Standardized product names referenced by the catalog</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left" id="product-names-master-table">
              <thead className="bg-[#020617] border-b border-slate-850 text-[10px] uppercase text-slate-400 font-bold font-mono">
                <tr>
                  <th className="py-4 px-6">Name ID</th>
                  <th className="py-4 px-6">Product Name</th>
                  <th className="py-4 px-6">Status Condition</th>
                  <th className="py-4 px-6">Action Commands</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs text-slate-300">
                {productNames.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 px-6 text-center text-slate-500">
                      No product names defined yet. Add one using the form on the left.
                    </td>
                  </tr>
                ) : (
                  productNames.map((pn) => {
                    const isEditing = editingId === pn.id;
                    return (
                      <tr key={pn.id} className="hover:bg-[#020617]/50 transition-colors">
                        <td className="py-4 px-6 font-mono font-bold text-white">{pn.id}</td>
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <input
                              id={`pn-edit-name-${pn.id}`}
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              className="p-1 px-2.5 text-xs border border-slate-800 bg-[#020617] text-white rounded focus:outline-none focus:border-indigo-550"
                            />
                          ) : (
                            <span className="font-semibold text-white">{pn.name}</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <select
                              id={`pn-edit-status-${pn.id}`}
                              value={editingStatus}
                              onChange={(e) => setEditingStatus(e.target.value as "Enabled" | "Disabled")}
                              className="p-1 text-xs border border-slate-800 rounded bg-[#020617] text-white focus:outline-none cursor-pointer"
                            >
                              <option value="Enabled">Enabled</option>
                              <option value="Disabled">Disabled</option>
                            </select>
                          ) : (
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border leading-none inline-block ${
                              pn.status === "Enabled"
                                ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/50"
                                : "bg-slate-900 text-slate-400 border-slate-800"
                            }`}>
                              {pn.status}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <button
                                id={`pn-save-btn-${pn.id}`}
                                onClick={() => handleSaveEdit(pn.id)}
                                className="p-1 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                title="Commit update statement"
                              >
                                <Check className="w-3 h-3" />
                                <span>Save</span>
                              </button>
                              <button
                                id={`pn-cancel-btn-${pn.id}`}
                                onClick={() => setEditingId(null)}
                                className="p-1 px-2 bg-[#020617] hover:bg-slate-900 text-slate-300 border border-slate-800 rounded text-[10px] font-bold flex items-center gap-0.5 cursor-pointer"
                                title="Discard parameters"
                              >
                                <X className="w-3 h-3" />
                                <span>Discard</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <button
                                id={`pn-edit-btn-${pn.id}`}
                                onClick={() => startEditing(pn)}
                                className="p-1 hover:bg-indigo-950/50 rounded text-indigo-400 border border-indigo-900/40 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                                title="Edit Row parameters"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Edit</span>
                              </button>
                              <button
                                id={`pn-delete-btn-${pn.id}`}
                                onClick={async () => {
                                  if (confirm(`Are you sure you want to delete "${pn.name}"? This operation performs DELETE query with foreign key checks.`)) {
                                    try {
                                      await onDeleteProductName(pn.id);
                                    } catch (err: any) {
                                      alert(err.message || "Failed to delete product name.");
                                    }
                                  }
                                }}
                                className="p-1 hover:bg-rose-950/50 rounded text-rose-400 border border-rose-900/40 text-[10px] font-bold flex items-center gap-0.5 cursor-pointer transition-colors"
                                title="Delete Row"
                              >
                                <Trash2 className="w-3 h-3" />
                                <span>Delete</span>
                              </button>
                            </div>
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

        <div className="p-4 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 font-mono text-left flex justify-between items-center">
          <span>Row Count: {productNames.length} instances active</span>
          <span>F_KEY RESTRICT: ACTIVE</span>
        </div>
      </div>

    </div>
  );
}
