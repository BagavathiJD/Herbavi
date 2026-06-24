import fs from "fs";
import path from "path";
import {
  Measurement,
  ProductName,
  Product,
  Order,
  Customer,
} from "../../admin/src/types.js";
import { getConnection } from "./pool.js";

const DB_JSON_PATH = path.join(process.cwd(), "data", "db.json");

interface SeedData {
  measurements: Measurement[];
  productNames: ProductName[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
}

function loadSeedData(): SeedData {
  if (fs.existsSync(DB_JSON_PATH)) {
    const data = JSON.parse(fs.readFileSync(DB_JSON_PATH, "utf8"));
    return {
      measurements: data.measurements ?? [],
      productNames: data.productNames ?? [],
      products: data.products ?? [],
      orders: data.orders ?? [],
      customers: data.customers ?? [],
    };
  }
  return {
    measurements: [],
    productNames: [],
    products: [],
    orders: [],
    customers: [],
  };
}

export async function isDatabaseEmpty(): Promise<boolean> {
  const conn = await getConnection();
  try {
    const [rows] = await conn.execute(
      "SELECT COUNT(*) AS cnt FROM measurements"
    );
    const count = (rows as { cnt: number }[])[0]?.cnt ?? 0;
    return count === 0;
  } finally {
    conn.release();
  }
}

export async function seedDatabase(data?: SeedData): Promise<void> {
  const seed = data ?? loadSeedData();
  const conn = await getConnection();

  try {
    await conn.beginTransaction();
    await conn.execute("SET FOREIGN_KEY_CHECKS = 0");
    await conn.execute("TRUNCATE TABLE orders");
    await conn.execute("TRUNCATE TABLE products");
    await conn.execute("TRUNCATE TABLE product_names");
    await conn.execute("TRUNCATE TABLE measurements");
    await conn.execute("TRUNCATE TABLE customers");
    await conn.execute("SET FOREIGN_KEY_CHECKS = 1");

    for (const m of seed.measurements) {
      await conn.execute(
        "INSERT INTO measurements (id, name, status, created_at) VALUES (?, ?, ?, ?)",
        [m.id, m.name, m.status, new Date(m.createdAt)]
      );
    }

    for (const pn of seed.productNames) {
      await conn.execute(
        "INSERT INTO product_names (id, name, status, created_at) VALUES (?, ?, ?, ?)",
        [pn.id, pn.name, pn.status, new Date(pn.createdAt)]
      );
    }

    for (const p of seed.products) {
      await conn.execute(
        `INSERT INTO products (id, name, description, image_url, measurement_id, measurement_value, price, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          p.id,
          p.name,
          p.description,
          p.imageUrl,
          p.measurementId,
          p.measurementValue ?? "1",
          p.price,
          p.status,
          new Date(p.createdAt),
        ]
      );
    }

    for (const c of seed.customers) {
      await conn.execute(
        `INSERT INTO customers (id, name, email, phone, total_orders, total_spend, status, join_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          c.id,
          c.name,
          c.email,
          c.phone,
          c.totalOrders,
          c.totalSpend,
          c.status,
          new Date(c.joinDate),
        ]
      );
    }

    for (const o of seed.orders) {
      const productExists = seed.products.some((p) => p.id === o.productId);
      if (!productExists) continue;

      await conn.execute(
        `INSERT INTO orders (
          id, user_id, user_name, product_id, product_name, product_image_url,
          quantity, measurement_name, price, total_amount, order_status, order_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          o.id,
          o.userId,
          o.userName,
          o.productId,
          o.productName,
          o.productImageUrl,
          o.quantity,
          o.measurementName,
          o.price,
          o.totalAmount,
          o.orderStatus,
          new Date(o.orderDate),
        ]
      );
    }

    await conn.commit();
    console.log("Database seeded successfully.");
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function seedIfEmpty(): Promise<void> {
  if (await isDatabaseEmpty()) {
    await seedDatabase();
  }
}
