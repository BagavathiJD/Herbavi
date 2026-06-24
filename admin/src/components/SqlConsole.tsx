import React, { useState } from "react";
import { 
  Database, 
  Terminal, 
  RotateCcw, 
  Trash2, 
  HelpCircle, 
  CheckCircle, 
  Zap, 
  Layers,
  FileCode,
  ShieldAlert,
  Cpu,
  ArrowRight
} from "lucide-react";
import { SqlQueryLog, DbMetrics } from "../types";

interface SqlConsoleProps {
  logs: SqlQueryLog[];
  metrics: DbMetrics;
  onClearLogs: () => Promise<void>;
  onReseedDb: () => Promise<void>;
  isProcessing: boolean;
}

export default function SqlConsole({
  logs = [],
  metrics,
  onClearLogs,
  onReseedDb,
  isProcessing
}: SqlConsoleProps) {
  const [selectedTable, setSelectedTable] = useState<string | null>("products");

  // Simple SQL highlighting regex generator
  const highlightSql = (query: string) => {
    if (!query) return "";
    
    // SQL Keywords
    const keywords = [
      "SELECT", "FROM", "WHERE", "INSERT INTO", "UPDATE", "DELETE", "SET", "VALUES", 
      "CREATE TABLE", "CREATE DATABASE", "DROP DATABASE", "USE", "ON", "JOIN", "LEFT JOIN",
      "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "AND", "OR", "TIMESTAMP", "ENUM", 
      "VARCHAR", "TEXT", "DECIMAL", "NOT NULL", "DEFAULT", "TRUNCATE TABLE"
    ];

    let highlighted = query;

    // Safety escaping on HTML
    highlighted = highlighted
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Wrap keywords in bold styled tokens
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      highlighted = highlighted.replace(regex, `<span class="text-indigo-400 font-bold">${keyword}</span>`);
    });

    // Color string parameters inside single quotes
    highlighted = highlighted.replace(/('([^'\\]|\\.)*')/g, '<span class="text-emerald-400">$1</span>');

    // Color numbers
    highlighted = highlighted.replace(/\b(\d+(\.\d+)?)\b/g, '<span class="text-amber-400 font-medium">$1</span>');

    // Mapped comment markers
    highlighted = highlighted.replace(/(--.*)/g, '<span class="text-slate-500 font-mono">$1</span>');

    return highlighted;
  };

  // Schema properties metadata for ER diagrams
  const schemaTables = {
    measurements: [
      { col: "id", type: "VARCHAR(50)", attr: "PRIMARY KEY" },
      { col: "name", type: "VARCHAR(100)", attr: "NOT NULL UNIQUE" },
      { col: "status", type: "ENUM('Enabled', 'Disabled')", attr: "DEFAULT 'Enabled'" },
      { col: "created_at", type: "TIMESTAMP", attr: "DEFAULT CURRENT_TIMESTAMP" },
    ],
    product_names: [
      { col: "id", type: "VARCHAR(50)", attr: "PRIMARY KEY" },
      { col: "name", type: "VARCHAR(255)", attr: "NOT NULL UNIQUE" },
      { col: "status", type: "ENUM('Enabled', 'Disabled')", attr: "DEFAULT 'Enabled'" },
      { col: "created_at", type: "TIMESTAMP", attr: "DEFAULT CURRENT_TIMESTAMP" },
    ],
    products: [
      { col: "id", type: "VARCHAR(50)", attr: "PRIMARY KEY" },
      { col: "name", type: "VARCHAR(255)", attr: "NOT NULL" },
      { col: "description", type: "TEXT", attr: "NULLABLE" },
      { col: "image_url", type: "VARCHAR(500)", attr: "NULLABLE" },
      { col: "measurement_id", type: "VARCHAR(50)", attr: "FOREIGN KEY REFERENCES measurements(id)" },
      { col: "measurement_value", type: "VARCHAR(50)", attr: "NOT NULL DEFAULT '1'" },
      { col: "price", type: "DECIMAL(10,2)", attr: "NOT NULL" },
      { col: "status", type: "ENUM('Active', 'Inactive')", attr: "DEFAULT 'Active'" },
      { col: "created_at", type: "TIMESTAMP", attr: "DEFAULT CURRENT_TIMESTAMP" },
    ],
    orders: [
      { col: "id", type: "VARCHAR(50)", attr: "PRIMARY KEY" },
      { col: "user_id", type: "VARCHAR(50)", attr: "NOT NULL MAPPED" },
      { col: "user_name", type: "VARCHAR(200)", attr: "NOT NULL" },
      { col: "product_id", type: "VARCHAR(50)", attr: "FOREIGN KEY REFERENCES products(id)" },
      { col: "product_name", type: "VARCHAR(255)", attr: "NOT NULL" },
      { col: "product_image_url", type: "VARCHAR(500)", attr: "NULL" },
      { col: "quantity", type: "INT", attr: "NOT NULL" },
      { col: "measurement_name", type: "VARCHAR(100)", attr: "NOT NULL" },
      { col: "price", type: "DECIMAL(10,2)", attr: "NOT NULL" },
      { col: "total_amount", type: "DECIMAL(10,2)", attr: "NOT NULL" },
      { col: "order_status", type: "ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled')", attr: "DEFAULT 'Pending'" },
      { col: "order_date", type: "TIMESTAMP", attr: "DEFAULT CURRENT_TIMESTAMP" },
    ],
    users: [
      { col: "id", type: "INT", attr: "PRIMARY KEY AUTO_INCREMENT" },
      { col: "user_name", type: "VARCHAR(100)", attr: "NOT NULL — sign-up User Name" },
      { col: "password", type: "VARCHAR(255)", attr: "NOT NULL — hashed password" },
      { col: "email", type: "VARCHAR(150)", attr: "UNIQUE NOT NULL — sign-up Mail" },
      { col: "phone_number", type: "VARCHAR(15)", attr: "NOT NULL — sign-up Phone" },
      { col: "role", type: "ENUM('Admin', 'Staff')", attr: "DEFAULT 'Admin'" },
      { col: "created_at", type: "TIMESTAMP", attr: "DEFAULT CURRENT_TIMESTAMP" },
      { col: "updated_at", type: "TIMESTAMP", attr: "ON UPDATE CURRENT_TIMESTAMP" },
    ],
    customers: [
      { col: "id", type: "VARCHAR(50)", attr: "PRIMARY KEY" },
      { col: "name", type: "VARCHAR(150)", attr: "NOT NULL" },
      { col: "email", type: "VARCHAR(150)", attr: "UNIQUE NOT NULL" },
      { col: "phone", type: "VARCHAR(50)", attr: "NULL" },
      { col: "total_orders", type: "INT", attr: "DEFAULT 0" },
      { col: "total_spend", type: "DECIMAL(10,2)", attr: "DEFAULT 0.00" },
      { col: "status", type: "ENUM('Active', 'Blocked')", attr: "DEFAULT 'Active'" },
      { col: "join_date", type: "TIMESTAMP", attr: "DEFAULT CURRENT_TIMESTAMP" },
    ],
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* 1. Left Section: ER-Diagram Schema Visualizer & Db Server Metrics */}
      <div className="xl:col-span-1 space-y-6">
        
        {/* MySQL Realtime Server Stats Cards */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div className="text-left space-y-1 pb-3 border-b border-slate-800/80 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">MySQL Server Engine</h3>
              <p className="text-[11px] text-slate-400">Connection host: localhost:3306</p>
            </div>
            <Cpu className="w-5 h-5 text-indigo-450 text-indigo-400 animate-pulse" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="p-3 bg-[#020617] border border-slate-850/80 rounded-xl space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Engine Type</span>
              <p className="text-xs font-black font-sans text-slate-200">InnoDB (MySQL 8.0)</p>
            </div>
            <div className="p-3 bg-[#020617] border border-slate-850/80 rounded-xl space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Pool Connection</span>
              <p className="text-xs font-black font-mono text-emerald-400">Active (5 threads)</p>
            </div>
            <div className="p-3 bg-[#020617] border border-slate-850/80 rounded-xl space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">Disk Storage Size</span>
              <p className="text-xs font-black font-mono text-slate-250 text-slate-200">{metrics.storageSizeKb} KB</p>
            </div>
            <div className="p-3 bg-indigo-950/30 border border-indigo-900/40 rounded-xl space-y-1">
              <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400">Accumulated Queries</span>
              <p className="text-xs font-black font-mono text-indigo-400">{metrics.totalQueries} runs</p>
            </div>
          </div>
          
          <div className="pt-2 flex gap-2">
            <button
              id="sql-reseed-btn"
              onClick={() => {
                if (confirm("Are you sure you want to RE-SEED the MySQL Database? This will erase all custom added records and restore original templates, generating fully re-created DROP/CREATE logs.")) {
                  onReseedDb();
                }
              }}
              disabled={isProcessing}
              className="flex-1 py-2 px-3 text-[10px] font-black uppercase bg-indigo-650 hover:bg-indigo-700 text-white border border-transparent rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
              title="Reseed tables"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Executing..." : "RESET / SEED DB"}</span>
            </button>

            <button
              id="sql-clear-log-btn"
              onClick={onClearLogs}
              className="py-2 px-3 text-[10px] font-bold text-slate-400 bg-slate-900 hover:bg-[#020617] border border-slate-800 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
              title="Clean terminal session logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Schema ERD Table Structure Inspector */}
        <div className="bg-[#0f172a] p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
          <div className="text-left space-y-1 pb-3 border-b border-slate-800/80">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Relational ER Model</h3>
            <p className="text-xs text-slate-400">Inspect structure parameters and SQL columns</p>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {Object.keys(schemaTables).map((tbl) => (
              <button
                id={`schema-erd-tab-${tbl}`}
                key={tbl}
                onClick={() => setSelectedTable(tbl)}
                className={`py-1 px-2.5 text-[10px] font-black uppercase rounded-lg transition-all border font-mono cursor-pointer ${
                  selectedTable === tbl 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15" 
                    : "bg-[#020617] text-slate-400 border-slate-800 hover:bg-slate-850/80"
                }`}
              >
                {tbl}
              </button>
            ))}
          </div>

          {/* Table Schema mapping */}
          {selectedTable && (
            <div className="text-left bg-[#020617] border border-slate-850/80 rounded-xl p-3.5 space-y-3 font-mono">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-black text-white flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span>TABLE {selectedTable}</span>
                </span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">InnoDB Engine</span>
              </div>
              
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {schemaTables[selectedTable as keyof typeof schemaTables].map((col, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-400">{col.col}</span>
                      <span className="text-slate-400 text-[9px]">{col.type}</span>
                    </div>
                    <span className="text-[8px] text-slate-500 leading-none">{col.attr}</span>
                  </div>
                ))}
              </div>

              {/* Foreign Keys Explainer layout */}
              {selectedTable === "products" && (
                <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/50 rounded-lg text-[9px] text-indigo-400 space-y-1 leading-normal">
                  <div className="flex items-center gap-1 font-bold">
                    <Layers className="w-3" />
                    <span>FOREIGN KEY CONTROLS:</span>
                  </div>
                  <p><code>products.measurement_id</code> ties directly to primary key <code>measurements.id</code>. Relational integrity prevents stray deletions.</p>
                </div>
              )}
              {selectedTable === "orders" && (
                <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/50 rounded-lg text-[9px] text-indigo-400 space-y-1 leading-normal">
                  <div className="flex items-center gap-1 font-bold">
                    <Layers className="w-3" />
                    <span>FOREIGN KEY CONTROLS:</span>
                  </div>
                  <p><code>orders.product_id</code> references <code>products.id</code> on join queries to assemble billing details.</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

      {/* 2. Right Section: Terminal-Style scrolling relational query log */}
      <div className="xl:col-span-2 bg-[#020617] text-slate-100 rounded-2xl shadow-xl border border-slate-800 flex flex-col h-[580px] overflow-hidden select-none">
        
        {/* Terminal Header bar */}
        <div className="bg-[#0f172a] border-b border-slate-800 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.55 flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
            </div>
            <span className="text-slate-400 font-mono text-[10px] tracking-widest pl-3">MYSQL LIVE TERMINAL</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono">
            <Terminal className="w-3.5 h-3.5 text-sky-450 text-sky-400 animate-pulse" />
            <span className="text-[10px] text-sky-400 font-bold bg-sky-950/30 p-1 py-0.5 rounded border border-sky-900/30">
              InnoDB LISTENING
            </span>
          </div>
        </div>

        {/* Terminal Instructions banner */}
        <div className="bg-[#0f172a]/40 p-4 border-b border-slate-850/60 text-left shrink-0">
          <p className="text-indigo-455 text-indigo-400 font-bold font-mono text-[10px] flex items-center gap-1 uppercase">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Interactive Query Console Guidance:</span>
          </p>
          <p className="text-[10.5px] text-slate-400 leading-normal mt-1 text-slate-305">
            Whenever you register merchandise, update statuses, or delete master variables in the admin panel modules, the actual corresponding DML queries are executed, parsed under active schema boundaries, and appended below in real-time.
          </p>
        </div>

        {/* Terminal Logs Listing Area */}
        <div className="flex-1 overflow-y-auto p-5 font-mono text-[11px] leading-relaxed space-y-4 text-left select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {logs.length === 0 ? (
            <div className="text-center py-24 text-slate-655 text-slate-600 space-y-2">
              <Terminal className="w-8 h-8 mx-auto text-slate-700 animate-bounce" />
              <p>No transactions logged in this session.</p>
              <p className="text-[10px]">Add products or complete orders to generate logs</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-3 bg-[#0f172a] rounded-lg border border-slate-850/80 space-y-1.5 hover:border-slate-800 transition-all group">
                
                {/* Meta details header line */}
                <div className="flex items-center justify-between text-[9px] text-slate-500 border-b border-slate-850/60 pb-1.5">
                  <span className="flex items-center gap-1 text-indigo-400 font-bold uppercase tracking-wider">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>QUERY_OK</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-slate-450 text-indigo-400 font-bold bg-[#020617] border border-slate-800 p-0.5 px-1.5 rounded">{log.durationMs}ms</span>
                    <span>{new Date(log.executedAt).toLocaleTimeString()}</span>
                  </div>
                </div>

                {/* The highlighted Query block */}
                <pre 
                  className="whitespace-pre-wrap font-mono text-slate-300 group-hover:text-white transition-colors"
                  dangerouslySetInnerHTML={{ __html: highlightSql(log.query) }}
                />
              </div>
            ))
          )}
        </div>

        {/* Terminal Status bar footer */}
        <div className="bg-[#0f172a] border-t border-slate-800 px-5 py-2.5 text-[10px] font-mono text-slate-500 text-left flex justify-between items-center shrink-0">
          <span>Logs: {logs.length} operations parsed</span>
          <span>Buffer: Safe (SQLite simulation wrappers active)</span>
        </div>

      </div>

    </div>
  );
}
