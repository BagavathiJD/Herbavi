import React, { useState, useEffect } from "react";
import { 
  X, 
  Terminal, 
  Check, 
  Sparkles, 
  FileJson,
  Plus, 
  Database,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

// Submodule imports
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardModule from "./components/DashboardModule";
import ProductForm from "./components/ProductForm";
import ProductVisitsModule from "./components/ProductVisitsModule";
import OrdersManagementModule from "./components/OrdersManagementModule";
import ProductSettingsModule from "./components/ProductSettingsModule";
import ProductNamesModule from "./components/ProductNamesModule";
import UsersModule from "./components/UsersModule";
import AuthGate from "./registration/AuthGate";
import { authHeaders, clearToken, getToken } from "./registration/auth";
// Types
import { Product, Order, Measurement, ProductName, Customer, AppUser, SqlQueryLog, DbMetrics, AdminUser, formatProductMeasurement, formatCurrency } from "./types";

export default function App() {
  const [authUser, setAuthUser] = useState<AdminUser | null>(null);
  const [authChecking, setAuthChecking] = useState(true);

  // Navigation Routing tab state
  const [currentTab, setTab] = useState<string>("dashboard");

  // Core Entity data lists
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [productNames, setProductNames] = useState<ProductName[]>([]);
  // Database activity & query parameters metrics
  const [sqlLogs, setSqlLogs] = useState<SqlQueryLog[]>([]);
  const [dbMetrics, setDbMetrics] = useState<DbMetrics>({
    totalQueries: 0,
    connectionPool: 5,
    storageSizeKb: 15,
    activeTransactions: 0
  });

  // Edit / Details Inspector variables
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);
  const [selectedOrderForView, setSelectedOrderForView] = useState<Order | null>(null);

  // Interface Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isProcessingForm, setIsProcessingForm] = useState<boolean>(false);
  const [isSimulatingOrder, setIsSimulatingOrder] = useState<boolean>(false);

  // Dynamic Floating SQL Log alerts ("Toast" system)
  const [activeToast, setActiveToast] = useState<{ query: string; duration: number } | null>(null);

  const headers = () => ({
    ...authHeaders(),
    "Content-Type": "application/json",
  });

  // Primary Fetcher
  const syncDatabaseState = async (silently = false) => {
    if (!silently) setIsLoading(true);
    try {
      const fetchOpts = { headers: authHeaders() };
      const [resProducts, resOrders, resCustomers, resUsers, resMeasurements, resProductNames, resLogs, resMetrics] = await Promise.all([
        fetch("/api/products", fetchOpts),
        fetch("/api/orders", fetchOpts),
        fetch("/api/customers", fetchOpts),
        fetch("/api/users", fetchOpts),
        fetch("/api/measurements", fetchOpts),
        fetch("/api/product-names", fetchOpts),
        fetch("/api/sql-logs", fetchOpts),
        fetch("/api/db-metrics", fetchOpts)
      ]);

      const [prods, ords, custs, appUsers, measures, names, logs, metrics] = await Promise.all([
        resProducts.json(),
        resOrders.json(),
        resCustomers.json(),
        resUsers.ok ? resUsers.json() : [],
        resMeasurements.json(),
        resProductNames.json(),
        resLogs.json(),
        resMetrics.json()
      ]);

      setProducts(prods);
      setOrders(ords);
      setCustomers(custs);
      setUsers(Array.isArray(appUsers) ? appUsers : []);
      setMeasurements(measures);
      setProductNames(names);
      setSqlLogs(logs);
      setDbMetrics(metrics);

      // Trigger a quick toast alert if a new query has written to the database!
      if (logs.length > 0 && logs[0].query && !silently) {
        triggerSqlToast(logs[0].query, logs[0].durationMs);
      }
    } catch (error) {
      console.error("Critical error synchronizing MySQL DB segments:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setAuthChecking(false);
        return;
      }
      try {
        const res = await fetch("/api/auth/me", { headers: authHeaders() });
        if (res.ok) {
          const user = await res.json();
          setAuthUser(user);
        } else {
          clearToken();
        }
      } catch {
        clearToken();
      } finally {
        setAuthChecking(false);
      }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (authUser) {
      syncDatabaseState();
    }
  }, [authUser]);

  const handleLogout = () => {
    clearToken();
    setAuthUser(null);
    setTab("dashboard");
  };

  // Float an alert card whenever query execution wraps
  const triggerSqlToast = (query: string, durationMs: number) => {
    setActiveToast({
      query: query.split("\n")[0], // Keep toast singleline
      duration: durationMs
    });
    // Auto-dismiss in 4 seconds
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  };

  const handleManualReSync = async () => {
    setIsRefreshing(true);
    await syncDatabaseState(true);
  };

  // --- 1. PRODUCT METADATA MANAGEMENT EVENT ACTIONS ---
  
  // Submit new product or commit updates
  const handleProductFormSubmit = async (formData: any) => {
    setIsProcessingForm(true);
    try {
      let isEdit = !!selectedProductForEdit;
      let url = isEdit ? `/api/products/${selectedProductForEdit?.id}` : "/api/products";
      let method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: headers(),
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to commit product rows.");
      }

      // Success
      await syncDatabaseState(true);
      
      // Select the correct tab to redirect
      setTab("product-list");
      setSelectedProductForEdit(null);
    } catch (err: any) {
      alert(err.message || "An issue occurred on product submission.");
    } finally {
      setIsProcessingForm(false);
    }
  };

  // Delete product row
  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        throw new Error("Could not delete selected catalog row.");
      }

      await syncDatabaseState(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Trigger form entry to edit a product
  const handleEditProductTrigger = (product: Product) => {
    setSelectedProductForEdit(product);
    setTab("edit-product");
  };

  // Cancel form
  const handleCancelForm = () => {
    setSelectedProductForEdit(null);
    setTab("product-list");
  };


  // --- 2. ORDER DIRECTIVES EVENT ACTIONS ---

  // Order Simulation POST
  const handleSimulatePurchaseOrder = async () => {
    setIsSimulatingOrder(true);
    try {
      const res = await fetch("/api/orders/simulate", { method: "POST", headers: authHeaders() });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Simulated purchase failed.");
      }

      await syncDatabaseState(true);
    } catch (err: any) {
      alert(err.message || "Simulation error on database transactions.");
    } finally {
      setIsSimulatingOrder(false);
    }
  };

  // Update order status dropdown trigger
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ orderStatus: newStatus })
      });

      if (!res.ok) {
        throw new Error("Fail to update client order status on MySQL segment.");
      }

      await syncDatabaseState(true);
    } catch (error: any) {
      alert(error.message || "Could not change status row.");
    }
  };


  // --- 3. CONFIGURATION / MEASUREMENTS MASTER EVENT ACTIONS ---

  const handleAddMeasurement = async (name: string, status: "Enabled" | "Disabled") => {
    setIsProcessingForm(true);
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ name, status })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Insertion failed.");
      }

      await syncDatabaseState(true);
    } catch (err: any) {
      throw err; // bubble up to handle error banner inside sub-form
    } finally {
      setIsProcessingForm(false);
    }
  };

  const handleUpdateMeasurement = async (id: string, name: string, status: "Enabled" | "Disabled") => {
    setIsProcessingForm(true);
    try {
      const res = await fetch(`/api/measurements/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name, status })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update transaction failed.");
      }

      await syncDatabaseState(true);
    } catch (error: any) {
      throw error;
    } finally {
      setIsProcessingForm(false);
    }
  };

  const handleDeleteMeasurement = async (id: string) => {
    try {
      const res = await fetch(`/api/measurements/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Foreign Key RESTRICT block error.");
      }

      await syncDatabaseState(true);
    } catch (error: any) {
      throw error; // Bubble restrict failures to trigger alert modal gracefully
    }
  };

  const handleAddProductName = async (name: string, status: "Enabled" | "Disabled") => {
    setIsProcessingForm(true);
    try {
      const res = await fetch("/api/product-names", {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ name, status })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Insertion failed.");
      }

      await syncDatabaseState(true);
    } catch (err: any) {
      throw err;
    } finally {
      setIsProcessingForm(false);
    }
  };

  const handleUpdateProductName = async (id: string, name: string, status: "Enabled" | "Disabled") => {
    setIsProcessingForm(true);
    try {
      const res = await fetch(`/api/product-names/${id}`, {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ name, status })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update transaction failed.");
      }

      await syncDatabaseState(true);
    } catch (error: any) {
      throw error;
    } finally {
      setIsProcessingForm(false);
    }
  };

  const handleDeleteProductName = async (id: string) => {
    try {
      const res = await fetch(`/api/product-names/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Foreign Key RESTRICT block error.");
      }

      await syncDatabaseState(true);
    } catch (error: any) {
      throw error;
    }
  };

  // --- VIEW RENDERING TAB SWITCH ROUTER ---
  const renderCurrentModule = () => {
    switch (currentTab) {
      case "dashboard":
        return (
          <DashboardModule
            products={products}
            orders={orders}
            customers={customers}
            measurements={measurements}
            setTab={setTab}
            onViewOrder={(order) => setSelectedOrderForView(order)}
          />
        );

      case "add-product":
        return (
          <ProductForm
            initialProduct={null}
            measurements={measurements}
            productNames={productNames}
            onSubmit={handleProductFormSubmit}
            onCancel={() => setTab("product-list")}
            isSubmitting={isProcessingForm}
          />
        );

      case "edit-product":
        return (
          <ProductForm
            initialProduct={selectedProductForEdit}
            measurements={measurements}
            productNames={productNames}
            onSubmit={handleProductFormSubmit}
            onCancel={handleCancelForm}
            isSubmitting={isProcessingForm}
          />
        );

      case "product-list": // Product Visits Tab
        return (
          <ProductVisitsModule
            products={products}
            measurements={measurements}
            onEditTrigger={handleEditProductTrigger}
            onDeleteProduct={handleDeleteProduct}
            onViewProductDetails={(p) => setSelectedProductForView(p)}
          />
        );

      case "orders-list":
        return (
          <OrdersManagementModule
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onViewOrderDetails={(order) => setSelectedOrderForView(order)}
            onSimulateOrder={handleSimulatePurchaseOrder}
            isSimulating={isSimulatingOrder}
          />
        );

      case "measurements-master":
        return (
          <ProductSettingsModule
            measurements={measurements}
            onAddMeasurement={handleAddMeasurement}
            onUpdateMeasurement={handleUpdateMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
            isProcessing={isProcessingForm}
          />
        );

      case "product-names-master":
        return (
          <ProductNamesModule
            productNames={productNames}
            onAddProductName={handleAddProductName}
            onUpdateProductName={handleUpdateProductName}
            onDeleteProductName={handleDeleteProductName}
            isProcessing={isProcessingForm}
          />
        );

      case "customer-list":
        return <UsersModule users={users} />;

      default:
        return (
          <div className="py-20 text-center text-gray-500">
            <AlertCircle className="w-8 h-8 mx-auto text-gray-300" />
            <p className="mt-2 font-bold text-sm">Module Not Found</p>
          </div>
        );
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return <AuthGate onAuthenticated={setAuthUser} />;
  }

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans text-xs antialiased text-slate-200">
      
      {/* Dynamic Left Sidebar Drawer */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab}
        user={authUser}
        onLogout={handleLogout}
      />

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#020617]">
        
        {/* Dynamic Header desk */}
        <Header 
          currentTab={currentTab} 
          onRefresh={handleManualReSync}
          isRefreshing={isRefreshing}
        />

        {/* Global Loading screen or core Content layout */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth bg-[#020617]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-xs font-bold text-white">Connecting MySQL Server...</p>
                <p className="text-[10px] text-slate-500 font-mono">schema: ecommerce_admin</p>
              </div>
            </div>
          ) : (
            <div id="module-container" className="max-w-7xl mx-auto pb-10">
              {renderCurrentModule()}
            </div>
          )}
        </main>

      </div>

      {/* --- GLOBAL INTUITIVE SQL NOTIFICATION ALERTS ("Toast") --- */}
      {activeToast && (
        <div 
          id="sql-floating-toast"
          onClick={() => setActiveToast(null)}
          className="fixed bottom-6 right-6 z-50 bg-[#0f172a] text-slate-100 p-4 rounded-xl shadow-2xl border border-slate-800 max-w-sm flex items-start gap-3 select-none cursor-pointer hover:border-indigo-500/50 hover:bg-[#121b30] duration-200 transition-all"
        >
          <div className="p-1.5 bg-indigo-950 text-indigo-400 border border-indigo-900 rounded-lg shrink-0 mt-0.5">
            <Terminal className="w-4 h-4 animate-pulse" />
          </div>
          <div className="text-left space-y-1">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[9px] font-black font-mono text-emerald-400 uppercase tracking-widest">Query Ok • {activeToast.duration}ms</span>
              <span className="text-[8px] text-indigo-400 font-medium">Click to dismiss</span>
            </div>
            <p className="text-[10.5px] font-mono leading-tight truncate text-slate-350">{activeToast.query}</p>
          </div>
        </div>
      )}      {/* --- MODAL 1: ORDER DETAILS DETAILED METADATA ROW INSPECTOR --- */}
      {selectedOrderForView && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl max-w-2xl w-full border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#020617] text-white flex items-center justify-between border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold font-mono text-white">Row Inspector: order_id [{selectedOrderForView.id}]</h4>
                  <p className="text-[9px] text-slate-400 font-mono">Database table: orders</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForView(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              
              {/* Columns Segment Mapping layout */}
              <div className="grid grid-cols-2 gap-4">
                
                {/* Product Section */}
                <div className="p-4 bg-[#020617]/60 border border-slate-800 rounded-xl space-y-3">
                  <span className="text-[10px] font-black text-indigo-400 uppercase font-mono tracking-widest block">Purchased Merchandise</span>
                  <div className="flex gap-3">
                    <img 
                      src={selectedOrderForView.productImageUrl} 
                      alt={selectedOrderForView.productName} 
                      className="w-12 h-12 object-cover border border-slate-800 rounded-xl bg-[#0f172a]"
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-0.5">
                      <p className="font-bold text-white text-xs">{selectedOrderForView.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">sku: {selectedOrderForView.productId}</p>
                      <p className="text-xs font-bold text-indigo-400 font-mono">{formatCurrency(selectedOrderForView.price)}</p>
                    </div>
                  </div>
                </div>

                {/* Customer / Purchaser card Section */}
                <div className="p-4 bg-[#020617]/60 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-black text-indigo-400 uppercase font-mono tracking-widest block">Client profile</span>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-xs">{selectedOrderForView.userName}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Customer ID: {selectedOrderForView.userId}</p>
                    <p className="text-[10px] text-slate-400 font-mono">Purchase Date: {new Date(selectedOrderForView.orderDate).toLocaleString()}</p>
                  </div>
                </div>

              </div>

              {/* Numerical Transaction Ledger columns */}
              <div className="p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 leading-none">Formula billing details</span>
                  <p className="text-xs font-semibold text-slate-300">
                    Sourced: {selectedOrderForView.quantity} × {selectedOrderForView.measurementName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 leading-none">Net amount</span>
                  <p className="text-lg font-black font-mono text-indigo-400 leading-none mt-1">
                    {formatCurrency(selectedOrderForView.totalAmount)}
                  </p>
                </div>
              </div>

              {/* Copyable JSON Row value block */}
              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Row Object (JSON notation):</span>
                </span>
                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-[10px] leading-relaxed max-height-[160px] overflow-auto select-all border border-slate-850">
                  {JSON.stringify(selectedOrderForView, null, 2)}
                </pre>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#020617]/80 border-t border-slate-850 flex justify-end">
              <button
                onClick={() => setSelectedOrderForView(null)}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Close Row Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 2: PRODUCT ROW DETAILS AND METADATA INSPECTOR --- */}
      {selectedProductForView && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f172a] rounded-2xl max-w-2xl w-full border border-slate-800 overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            
            {/* Modal Header */}
            <div className="p-4 bg-[#020617] text-white flex items-center justify-between border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" />
                <div>
                  <h4 className="text-sm font-bold font-mono text-white">Row Inspector: product_id [{selectedProductForView.id}]</h4>
                  <p className="text-[9px] text-slate-400 font-mono">Database table: products</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProductForView(null)}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
              
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Large visual preview */}
                <img 
                  src={selectedProductForView.imageUrl} 
                  alt={selectedProductForView.name} 
                  className="w-full sm:w-48 h-48 object-cover rounded-2xl border border-slate-800 bg-[#020617]"
                  referrerPolicy="no-referrer"
                />

                {/* Primary properties details */}
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border inline-block select-none ${
                      selectedProductForView.status === "Active"
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                        : "bg-rose-950/40 text-rose-400 border border-rose-900/50"
                    }`}>
                      {selectedProductForView.status}
                    </span>
                    <h3 className="text-base font-extrabold text-white">{selectedProductForView.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">ID key: {selectedProductForView.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                    <div className="p-2 py-2.5 bg-[#020617]/50 border border-slate-850 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Measurement Volume</span>
                      <span className="text-xs font-mono font-bold text-slate-200 inline-block mt-1">
                        {selectedProductForView.measurementValue || "1"}
                      </span>
                    </div>

                    <div className="p-2 py-2.5 bg-[#020617]/50 border border-slate-850 rounded-xl">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block leading-none">Full Measurement</span>
                      <span className="text-xs font-bold text-slate-200 inline-block mt-1">
                        {formatProductMeasurement(
                          selectedProductForView.measurementValue,
                          measurements.find(m => m.id === selectedProductForView.measurementId)?.name
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-indigo-950/20 border border-indigo-900/35 rounded-xl">
                    <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block leading-none">Catalog Sourced Price</span>
                    <span className="text-base font-black font-mono text-indigo-400 inline-block mt-1">{formatCurrency(selectedProductForView.price)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 bg-[#020617]/50 border border-slate-850 p-4 rounded-xl text-xs text-slate-300">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest font-mono">Product description catalog entry</span>
                <p className="leading-relaxed mt-1">{selectedProductForView.description || "No customized product descriptions are recorded on the relational schema rows."}</p>
              </div>

              {/* Copyable JSON Row value block */}
              <div className="space-y-1.5 font-mono">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <FileJson className="w-3.5 h-3.5" />
                  <span>Row Tuple (JSON notation):</span>
                </span>
                <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-[10px] leading-relaxed overflow-auto select-all border border-slate-850">
                  {JSON.stringify(selectedProductForView, null, 2)}
                </pre>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#020617]/80 border-t border-slate-850 flex justify-end">
              <button
                onClick={() => setSelectedProductForView(null)}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl transition-all cursor-pointer shadow-md"
              >
                Close Row Inspector
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
