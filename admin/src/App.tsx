import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Terminal, 
  AlertCircle
} from "lucide-react";

// Submodule imports
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardModule from "./components/DashboardModule";
import ProductForm from "./components/ProductForm";
import ProductVisitsModule from "./components/ProductVisitsModule";
import StockModule from "./components/StockModule";
import OrdersManagementModule from "./components/OrdersManagementModule";
import ProductSettingsModule from "./components/ProductSettingsModule";
import ProductNamesModule from "./components/ProductNamesModule";
import UsersModule from "./components/UsersModule";
import AuthGate from "./registration/AuthGate";
import { authHeaders, clearToken, getToken, hasActiveSession, markSessionActive, normalizeRole } from "./registration/auth";
import { useNotification } from "./context/NotificationContext";
// Types
import { Product, Order, Measurement, ProductName, Customer, AppUser, SqlQueryLog, DbMetrics, AdminUser, isLowStock, LOW_STOCK_THRESHOLD } from "./types";

export default function App() {
  const { showSuccess, showError, showWarning } = useNotification();
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

  // Edit variables
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null);

  // Interface Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingForm, setIsProcessingForm] = useState<boolean>(false);
  const [isSimulatingOrder, setIsSimulatingOrder] = useState<boolean>(false);

  // Dynamic Floating SQL Log alerts
  const [activeToast, setActiveToast] = useState<{ query: string; duration: number } | null>(null);
  const lowStockNotifiedRef = useRef("");
  const prevProductsRef = useRef<Product[]>([]);
  const initialStockAlertRef = useRef(false);

  const lowStockProducts = useMemo(
    () => products.filter((product) => isLowStock(product.stock ?? 0)),
    [products]
  );

  const showLowStockWarning = (items: Product[], prefix?: string) => {
    if (items.length === 0) return;

    const signature = items
      .map((product) => `${product.id}:${product.stock}`)
      .sort()
      .join("|");
    if (lowStockNotifiedRef.current === signature) {
      return;
    }

    lowStockNotifiedRef.current = signature;
    const previewNames = items
      .slice(0, 3)
      .map((product) => `${product.name} (${product.stock} left)`)
      .join(", ");
    const suffix = items.length > 3 ? ` and ${items.length - 3} more` : "";
    const lead = prefix ? `${prefix} ` : "";
    showWarning(
      `${lead}${items.length} product(s) below ${LOW_STOCK_THRESHOLD} units: ${previewNames}${suffix}.`
    );
  };

  const notifyLowStockIfNeeded = (items: Product[]) => {
    const prevById = new Map(prevProductsRef.current.map((product) => [product.id, product.stock ?? 0]));
    const crossedBelow = items.filter((product) => {
      const current = product.stock ?? 0;
      if (!isLowStock(current)) return false;
      const previous = prevById.get(product.id);
      if (previous === undefined) return false;
      return previous >= LOW_STOCK_THRESHOLD && current < LOW_STOCK_THRESHOLD;
    });

    prevProductsRef.current = items;

    if (crossedBelow.length > 0) {
      showLowStockWarning(crossedBelow, "Stock dropped after a purchase:");
      return;
    }

    const currentlyLow = items.filter((product) => isLowStock(product.stock ?? 0));
    if (!initialStockAlertRef.current && currentlyLow.length > 0) {
      initialStockAlertRef.current = true;
      showLowStockWarning(currentlyLow);
      return;
    }

    if (currentlyLow.length === 0) {
      lowStockNotifiedRef.current = "";
    }
  };

  const headers = () => ({
    ...authHeaders(),
    "Content-Type": "application/json",
  });

  const readApiError = async (res: Response, fallback: string): Promise<string> => {
    const text = await res.text();
    if (!text) return fallback;
    try {
      const data = JSON.parse(text) as { error?: string };
      return data.error || fallback;
    } catch {
      if (text.trimStart().startsWith("<!DOCTYPE") || text.trimStart().startsWith("<html")) {
        return "Stock API is unavailable. Restart the dev server (npm run dev) and try again.";
      }
      return fallback;
    }
  };

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
      notifyLowStockIfNeeded(Array.isArray(prods) ? prods : []);

      // Trigger a quick toast alert if a new query has written to the database!
      if (logs.length > 0 && logs[0].query && !silently) {
        triggerSqlToast(logs[0].query, logs[0].durationMs);
      }
    } catch (error) {
      console.error("Critical error synchronizing MySQL DB segments:", error);
    } finally {
      setIsLoading(false);
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
          if (normalizeRole(user.role) === "admin") {
            if (!hasActiveSession()) {
              markSessionActive();
            }
            setAuthUser(user);
          }
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
    if (authUser && authUser.role !== "User") {
      syncDatabaseState();
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser || String(authUser.role).trim().toLowerCase() !== "admin") {
      return;
    }

    const intervalId = window.setInterval(() => {
      syncDatabaseState(true);
    }, 30000);

    return () => window.clearInterval(intervalId);
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
      showSuccess(isEdit ? "Product updated successfully!" : "Product added successfully!");

      // Select the correct tab to redirect
      setTab("product-list");
      setSelectedProductForEdit(null);
    } catch (err: any) {
      showError(err.message || "An issue occurred on product submission.");
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
        const err = await res.json();
        throw new Error(err.error || "Could not delete selected catalog row.");
      }

      await syncDatabaseState(true);
      showSuccess("Product deleted successfully!");
    } catch (error: any) {
      showError(error.message || "Could not delete selected catalog row.");
    }
  };

  // Trigger form entry to edit a product
  const handleEditProductTrigger = (product: Product) => {
    const latestProduct = products.find((item) => item.id === product.id) ?? product;
    setSelectedProductForEdit(latestProduct);
    setTab("edit-product");
  };

  // Cancel form
  const handleCancelForm = () => {
    setSelectedProductForEdit(null);
    setTab("product-list");
  };

  const handleSaveStock = async (updates: Array<{ id: string; stock: number }>) => {
    setIsProcessingForm(true);
    try {
      const res = await fetch("/api/products/stock/bulk", {
        method: "PUT",
        headers: headers(),
        body: JSON.stringify({ updates }),
      });

      if (!res.ok) {
        throw new Error(await readApiError(res, "Failed to update stock."));
      }

      await syncDatabaseState(true);
      showSuccess("Stock updated successfully!");
    } catch (error: any) {
      showError(error.message || "Failed to update stock.");
    } finally {
      setIsProcessingForm(false);
    }
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
      showSuccess("Order simulated successfully!");
    } catch (err: any) {
      showError(err.message || "Simulation error on database transactions.");
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
      showSuccess("Order status updated successfully!");
    } catch (error: any) {
      showError(error.message || "Could not change status row.");
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
      showSuccess("Measurement added successfully!");
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
      showSuccess("Measurement updated successfully!");
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
      showSuccess("Measurement deleted successfully!");
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
      showSuccess("Product name added successfully!");
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
      showSuccess("Product name updated successfully!");
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
      showSuccess("Product name deleted successfully!");
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
            onAddProduct={() => setTab("add-product")}
          />
        );

      case "stock-management":
        return (
          <StockModule
            products={products}
            measurements={measurements}
            onSaveStock={handleSaveStock}
            isProcessing={isProcessingForm}
          />
        );

      case "orders-list":
        return (
          <OrdersManagementModule
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
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
      <div className="min-h-screen bg-white flex items-center justify-center admin-app">
        <div className="w-8 h-8 border-4 border-[#1f3a28] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return <AuthGate onAuthenticated={setAuthUser} />;
  }

  if (String(authUser.role).trim().toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 admin-app">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-black shadow-xl">
          <h1 className="text-2xl font-bold mb-4 text-black">Access denied</h1>
          <p className="text-sm text-gray-600 mb-6">
            Your account does not have access to the Herbavi admin panel.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 bg-[#1f3a28] hover:bg-[#172d22] text-white rounded-xl text-sm font-semibold transition"
          >
            Sign out and sign in with an admin account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden font-sans text-xs antialiased text-black admin-app">
      
      {/* Dynamic Left Sidebar Drawer */}
      <Sidebar 
        currentTab={currentTab} 
        setTab={setTab}
        user={authUser}
        onLogout={handleLogout}
      />

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-white">
        
        {/* Dynamic Header desk */}
        <Header
          currentTab={currentTab}
          lowStockProducts={lowStockProducts}
          onOpenStock={() => setTab("stock-management")}
        />

        {/* Global Loading screen or core Content layout */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth bg-white">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-24 text-gray-600 gap-3">
              <div className="w-8 h-8 border-4 border-[#1f3a28] border-t-transparent rounded-full animate-spin"></div>
              <div>
                <p className="text-xs font-bold text-black">Loading...</p>
              </div>
            </div>
          ) : (
            <div id="module-container" className="max-w-7xl mx-auto pb-10">
              {renderCurrentModule()}
            </div>
          )}
        </main>

      </div>

      {/* --- GLOBAL INTUITIVE SQL NOTIFICATION ALERTS --- */}
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
      )}

    </div>
  );
}
