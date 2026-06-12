import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Product, Order, Measurement, ProductName, Customer, SqlQueryLog } from "./src/types";

const app = express();
const PORT = 3000;

// Path to JSON DB file (kept outside src/ so Vite dev server does not reload on writes)
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "db.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Migrate legacy location so existing installs keep their data
const LEGACY_DB_PATH = path.join(process.cwd(), "src", "db.json");
if (!fs.existsSync(DB_PATH) && fs.existsSync(LEGACY_DB_PATH)) {
  fs.renameSync(LEGACY_DB_PATH, DB_PATH);
}

// Helper to double check database file existence and read it
function readDB(): {
  measurements: Measurement[];
  productNames: ProductName[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  sqlLogs: SqlQueryLog[];
} {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
      if (!Array.isArray(data.productNames)) {
        data.productNames = [];
      }
      return data;
    }
  } catch (error) {
    console.error("Error reading database file:", error);
  }
  // Return default fallbacks
  return {
    measurements: [],
    productNames: [],
    products: [],
    orders: [],
    customers: [],
    sqlLogs: []
  };
}

// SQL logs live in memory during dev so read-only API calls do not rewrite db.json
// (which would otherwise trigger Vite full-page reloads).
let sqlLogsCache: SqlQueryLog[] | null = null;

function getSqlLogs(): SqlQueryLog[] {
  if (sqlLogsCache === null) {
    sqlLogsCache = readDB().sqlLogs || [];
  }
  return sqlLogsCache;
}

// Help to write to database file (persists in-memory SQL logs with entity data)
function writeDB(data: any) {
  try {
    data.sqlLogs = getSqlLogs();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to database file:", error);
  }
}

// Helper to append a simulated MySQL Query Log (memory only until next writeDB)
function logSqlQuery(query: string, durationMs?: number) {
  const calculatedDuration = durationMs || parseFloat((Math.random() * 2.5 + 0.4).toFixed(2));

  const newLog: SqlQueryLog = {
    id: "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
    query,
    executedAt: new Date().toISOString(),
    durationMs: calculatedDuration,
    success: true
  };

  sqlLogsCache = [newLog, ...getSqlLogs()].slice(0, 150);
}

// Express setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- API ROUTES ---

// Simulated DB Metrics
app.get("/api/db-metrics", (req, res) => {
  let queryCountSql = "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ecommerce_admin';";
  logSqlQuery(queryCountSql, 0.2);
  
  res.json({
    totalQueries: getSqlLogs().length,
    connectionPool: 5,
    storageSizeKb: Math.round(fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH).size / 1024 : 15),
    activeTransactions: 0
  });
});

// Simulated SQL Logs
app.get("/api/sql-logs", (req, res) => {
  res.json(getSqlLogs());
});

// Clear SQL Logs
app.post("/api/sql-logs/clear", (req, res) => {
  sqlLogsCache = [];
  writeDB(readDB());
  logSqlQuery("TRUNCATE TABLE query_execution_logs;");
  res.json({ status: "success" });
});

// 1. MEASUREMENTS MASTER API
app.get("/api/measurements", (req, res) => {
  const db = readDB();
  const query = "SELECT id, name, status, created_at FROM measurements ORDER BY name ASC;";
  logSqlQuery(query);
  res.json(db.measurements);
});

app.post("/api/measurements", (req, res) => {
  const db = readDB();
  const { name, status } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: "Measurement name is required" });
  }

  const newMeasurement: Measurement = {
    id: "m-" + Date.now(),
    name: String(name).trim(),
    status: status === "Disabled" ? "Disabled" : "Enabled",
    createdAt: new Date().toISOString()
  };

  db.measurements.push(newMeasurement);

  const query = `INSERT INTO measurements (id, name, status, created_at) \nVALUES ('${newMeasurement.id}', '${newMeasurement.name.replace(/'/g, "''")}', '${newMeasurement.status}', NOW());`;
  logSqlQuery(query);
  writeDB(db);

  res.status(201).json(newMeasurement);
});

app.put("/api/measurements/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { name, status } = req.body;

  const mIndex = db.measurements.findIndex((m) => m.id === id);
  if (mIndex === -1) {
    return res.status(404).json({ error: "Measurement not found" });
  }

  if (name) {
    db.measurements[mIndex].name = String(name).trim();
  }
  if (status) {
    db.measurements[mIndex].status = status;
  }

  const query = `UPDATE measurements \nSET name = '${db.measurements[mIndex].name.replace(/'/g, "''")}', status = '${db.measurements[mIndex].status}' \nWHERE id = '${id}';`;
  logSqlQuery(query);
  writeDB(db);

  res.json(db.measurements[mIndex]);
});

app.delete("/api/measurements/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const mIndex = db.measurements.findIndex((m) => m.id === id);
  if (mIndex === -1) {
    return res.status(404).json({ error: "Measurement not found" });
  }

  // Check if any product is using this measurement
  const inUse = db.products.some((p) => p.measurementId === id);
  if (inUse) {
    const errorQuery = `DELETE FROM measurements WHERE id = '${id}'; -- FAILED WITH FOREIGN KEY CONSTRAINT`;
    logSqlQuery(errorQuery);
    return res.status(400).json({
      error: "Cannot delete measurement. It is currently in use by one or more products."
    });
  }

  db.measurements.splice(mIndex, 1);

  const query = `DELETE FROM measurements \nWHERE id = '${id}';`;
  logSqlQuery(query);
  writeDB(db);

  res.json({ message: "Measurement deleted successfully" });
});

// 1b. PRODUCT NAMES MASTER API
app.get("/api/product-names", (req, res) => {
  const db = readDB();
  const query = "SELECT id, name, status, created_at FROM product_names ORDER BY name ASC;";
  logSqlQuery(query);
  res.json(db.productNames);
});

app.post("/api/product-names", (req, res) => {
  const db = readDB();
  const { name, status } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Product name is required" });
  }

  const newProductName: ProductName = {
    id: "pn-" + Date.now(),
    name: String(name).trim(),
    status: status === "Disabled" ? "Disabled" : "Enabled",
    createdAt: new Date().toISOString()
  };

  db.productNames.push(newProductName);

  const query = `INSERT INTO product_names (id, name, status, created_at) \nVALUES ('${newProductName.id}', '${newProductName.name.replace(/'/g, "''")}', '${newProductName.status}', NOW());`;
  logSqlQuery(query);
  writeDB(db);

  res.status(201).json(newProductName);
});

app.put("/api/product-names/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { name, status } = req.body;

  const pnIndex = db.productNames.findIndex((pn) => pn.id === id);
  if (pnIndex === -1) {
    return res.status(404).json({ error: "Product name not found" });
  }

  if (name) {
    db.productNames[pnIndex].name = String(name).trim();
  }
  if (status) {
    db.productNames[pnIndex].status = status;
  }

  const query = `UPDATE product_names \nSET name = '${db.productNames[pnIndex].name.replace(/'/g, "''")}', status = '${db.productNames[pnIndex].status}' \nWHERE id = '${id}';`;
  logSqlQuery(query);
  writeDB(db);

  res.json(db.productNames[pnIndex]);
});

app.delete("/api/product-names/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const pnIndex = db.productNames.findIndex((pn) => pn.id === id);
  if (pnIndex === -1) {
    return res.status(404).json({ error: "Product name not found" });
  }

  const productName = db.productNames[pnIndex].name;
  const inUse = db.products.some((p) => p.name === productName);
  if (inUse) {
    const errorQuery = `DELETE FROM product_names WHERE id = '${id}'; -- FAILED WITH FOREIGN KEY CONSTRAINT`;
    logSqlQuery(errorQuery);
    return res.status(400).json({
      error: "Cannot delete product name. It is currently in use by one or more products."
    });
  }

  db.productNames.splice(pnIndex, 1);

  const query = `DELETE FROM product_names \nWHERE id = '${id}';`;
  logSqlQuery(query);
  writeDB(db);

  res.json({ message: "Product name deleted successfully" });
});


// 2. PRODUCTS API
app.get("/api/products", (req, res) => {
  const db = readDB();
  const { search, status } = req.query;
  
  let query = "SELECT p.*, m.name AS measurement_name \nFROM products p \nLEFT JOIN measurements m ON p.measurement_id = m.id";
  const conditions: string[] = [];

  if (search) {
    conditions.push(`(p.name LIKE '%${String(search).replace(/'/g, "''")}%' OR p.description LIKE '%${String(search).replace(/'/g, "''")}%')`);
  }
  if (status) {
    conditions.push(`p.status = '${String(status)}'`);
  }

  if (conditions.length > 0) {
    query += "\nWHERE " + conditions.join(" AND ");
  }
  query += "\nORDER BY p.created_at DESC;";
  
  logSqlQuery(query);
  res.json(db.products);
});

app.post("/api/products", (req, res) => {
  const db = readDB();
  const { name, description, imageUrl, measurementId, price, status } = req.body;

  if (!name || !measurementId || price === undefined) {
    return res.status(400).json({ error: "Product name, measurement level, and price are required." });
  }

  const newProduct: Product = {
    id: "p-" + Date.now(),
    name: String(name).trim(),
    description: String(description || "").trim(),
    imageUrl: String(imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200").trim(),
    measurementId: String(measurementId),
    price: Number(price),
    status: status === "Inactive" ? "Inactive" : "Active",
    createdAt: new Date().toISOString()
  };

  db.products.push(newProduct);

  const query = `INSERT INTO products (id, name, description, image_url, measurement_id, price, status, created_at) \nVALUES ('${newProduct.id}', '${newProduct.name.replace(/'/g, "''")}', '${newProduct.description.replace(/'/g, "''")}', '${newProduct.imageUrl}', '${newProduct.measurementId}', ${newProduct.price}, '${newProduct.status}', NOW());`;
  logSqlQuery(query);
  writeDB(db);

  res.status(201).json(newProduct);
});

app.put("/api/products/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { name, description, imageUrl, measurementId, price, status } = req.body;

  const pIndex = db.products.findIndex((p) => p.id === id);
  if (pIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  const p = db.products[pIndex];
  if (name !== undefined) p.name = String(name).trim();
  if (description !== undefined) p.description = String(description).trim();
  if (imageUrl !== undefined) p.imageUrl = String(imageUrl).trim();
  if (measurementId !== undefined) p.measurementId = String(measurementId);
  if (price !== undefined) p.price = Number(price);
  if (status !== undefined) p.status = status;

  const query = `UPDATE products \nSET name = '${p.name.replace(/'/g, "''")}', description = '${p.description.replace(/'/g, "''")}', image_url = '${p.imageUrl}', measurement_id = '${p.measurementId}', price = ${p.price}, status = '${p.status}' \nWHERE id = '${id}';`;
  logSqlQuery(query);
  writeDB(db);

  res.json(p);
});

app.delete("/api/products/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;

  const pIndex = db.products.findIndex((p) => p.id === id);
  if (pIndex === -1) {
    return res.status(404).json({ error: "Product not found" });
  }

  db.products.splice(pIndex, 1);

  const query = `DELETE FROM products \nWHERE id = '${id}';`;
  logSqlQuery(query);
  writeDB(db);

  res.json({ message: "Product deleted successfully" });
});


// 3. ORDERS API
app.get("/api/orders", (req, res) => {
  const db = readDB();
  const { search, status } = req.query;

  let query = "SELECT o.* FROM orders o";
  const conditions: string[] = [];

  if (search) {
    conditions.push(`(o.user_name LIKE '%${String(search).replace(/'/g, "''")}%' OR o.product_name LIKE '%${String(search).replace(/'/g, "''")}%' OR o.id LIKE '%${String(search).replace(/'/g, "''")}%')`);
  }
  if (status) {
    conditions.push(`o.order_status = '${String(status)}'`);
  }

  if (conditions.length > 0) {
    query += "\nWHERE " + conditions.join(" AND ");
  }
  query += "\nORDER BY o.order_date DESC;";

  logSqlQuery(query);
  res.json(db.orders);
});

app.put("/api/orders/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { orderStatus } = req.body;

  const oIndex = db.orders.findIndex((o) => o.id === id);
  if (oIndex === -1) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (!orderStatus) {
    return res.status(400).json({ error: "Order status is required" });
  }

  const oldStatus = db.orders[oIndex].orderStatus;
  db.orders[oIndex].orderStatus = orderStatus;

  // If status changes to standard complete, we might update customer statistics
  if (orderStatus === "Delivered" && oldStatus !== "Delivered") {
    const customer = db.customers.find(c => c.id === db.orders[oIndex].userId);
    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpend += db.orders[oIndex].totalAmount;
      customer.totalSpend = parseFloat(customer.totalSpend.toFixed(2));
    }
  }

  const query = `UPDATE orders \nSET order_status = '${orderStatus}' \nWHERE id = '${id}';`;
  logSqlQuery(query);
  writeDB(db);

  res.json(db.orders[oIndex]);
});

// Mock Order Simulation Endpoint
app.post("/api/orders/simulate", (req, res) => {
  const db = readDB();

  if (db.products.length === 0) {
    return res.status(400).json({ error: "Cannot simulate orders. Product database is currently empty." });
  }
  if (db.customers.length === 0) {
    return res.status(400).json({ error: "Cannot simulate orders. Customer database is empty." });
  }

  // Choose random product and customer
  const randomProduct = db.products[Math.floor(Math.random() * db.products.length)];
  const randomCustomer = db.customers[Math.floor(Math.random() * db.customers.length)];
  
  // Choose random quantity
  const qty = Math.floor(Math.random() * 4) + 1;

  // Resolve measurement name
  const measure = db.measurements.find(m => m.id === randomProduct.measurementId);
  const measureName = measure ? measure.name.split(" ")[0] : "Piece";

  const total = parseFloat((randomProduct.price * qty).toFixed(2));

  const newOrder: Order = {
    id: "o-" + Date.now(),
    userId: randomCustomer.id,
    userName: randomCustomer.name,
    productId: randomProduct.id,
    productName: randomProduct.name,
    productImageUrl: randomProduct.imageUrl,
    quantity: qty,
    measurementName: measure ? measure.name : "Piece (pcs)",
    price: randomProduct.price,
    totalAmount: total,
    orderStatus: "Pending",
    orderDate: new Date().toISOString()
  };

  db.orders.push(newOrder);

  const sqlInsert = `INSERT INTO orders (\n  id, user_id, user_name, product_id, product_name, \n  product_image_url, quantity, measurement_name, price, \n  total_amount, order_status, order_date\n) VALUES (\n  '${newOrder.id}', '${newOrder.userId}', '${newOrder.userName.replace(/'/g, "''")}', \n  '${newOrder.productId}', '${newOrder.productName.replace(/'/g, "''")}', '${newOrder.productImageUrl}', \n  ${newOrder.quantity}, '${newOrder.measurementName}', ${newOrder.price}, \n  ${newOrder.totalAmount}, 'Pending', NOW()\n);`;
  logSqlQuery(sqlInsert);
  writeDB(db);

  res.status(201).json(newOrder);
});


// 4. CUSTOMERS API
app.get("/api/customers", (req, res) => {
  const db = readDB();
  const query = "SELECT * FROM customers ORDER BY join_date DESC;";
  logSqlQuery(query);
  res.json(db.customers);
});


// 5. SERVER INITIAL SEED & UTILS FOR RE-SEEDING
app.post("/api/db/reseed", (req, res) => {
  const defaultSeeds = {
    measurements: [
      { id: "m1", name: "Kilogram (Kg)", status: "Enabled", createdAt: new Date().toISOString() },
      { id: "m2", name: "Gram (g)", status: "Enabled", createdAt: new Date().toISOString() },
      { id: "m3", name: "Liter (L)", status: "Enabled", createdAt: new Date().toISOString() },
      { id: "m4", name: "Milliliter (ml)", status: "Enabled", createdAt: new Date().toISOString() },
      { id: "m5", name: "Piece (pcs)", status: "Enabled", createdAt: new Date().toISOString() },
      { id: "m6", name: "Box", status: "Enabled", createdAt: new Date().toISOString() }
    ],
    productNames: [
      { id: "pn1", name: "Premium Organic Honey", status: "Enabled", createdAt: new Date().toISOString() },
      { id: "pn2", name: "Arabica Coffee Beans", status: "Enabled", createdAt: new Date().toISOString() },
      { id: "pn3", name: "Cold-Pressed Avocado Oil", status: "Enabled", createdAt: new Date().toISOString() }
    ],
    products: [
      {
        id: "p1",
        name: "Premium Organic Honey",
        description: "Pure, cold-pressed raw honey harvested from wild forest blooms.",
        imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=200",
        measurementId: "m1",
        price: 18.5,
        status: "Active",
        createdAt: "2026-06-02T14:30:22Z"
      },
      {
        id: "p2",
        name: "Arabica Coffee Beans",
        description: "Medium roast coffee beans with undertones of toasted hazelnut and citrus.",
        imageUrl: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=200",
        measurementId: "m2",
        price: 12.99,
        status: "Active",
        createdAt: "2026-06-03T10:15:05Z"
      },
      {
        id: "p3",
        name: "Cold-Pressed Avocado Oil",
        description: "Extra virgin oil suitable for high-heat cooking, roasting, salad dressings.",
        imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=200",
        measurementId: "m3",
        price: 24.0,
        status: "Active",
        createdAt: "2026-06-04T08:22:41Z"
      }
    ],
    orders: [
      {
        id: "o1",
        userId: "c1",
        userName: "Jane Doe1",
        productId: "p1",
        productName: "Premium Organic Honey",
        productImageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=200",
        quantity: 2,
        measurementName: "Kilogram (Kg)",
        price: 18.5,
        totalAmount: 37.0,
        orderStatus: "Delivered",
        orderDate: "2026-06-08T15:20:00Z"
      }
    ],
    customers: [
      { id: "c1", name: "Jane Doe1", email: "jane.doe@example.com", phone: "+1-555-0199", totalOrders: 1, totalSpend: 37.00, status: "Active", joinDate: "2026-05-15T09:12:00Z" }
    ],
    sqlLogs: []
  };

  sqlLogsCache = [];
  writeDB(defaultSeeds);
  logSqlQuery("DROP DATABASE IF EXISTS ecommerce_admin;");
  logSqlQuery("CREATE DATABASE ecommerce_admin;");
  logSqlQuery("USE ecommerce_admin;");
  logSqlQuery("INSERT INTO measurements SELECT * ...;");
  logSqlQuery("INSERT INTO products SELECT * ...;");

  res.json({ message: "Database re-seeded successfully!" });
});


// --- VITE MIDDLEWARE SETUP ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: [
            path.join(process.cwd(), "data"),
            path.join(process.cwd(), "data", "**"),
            path.join(process.cwd(), "src", "db.json"),
          ],
        },
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
