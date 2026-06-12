import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import { dbConfig } from "../config/env";
import { getPool } from "./pool";

const MIGRATIONS_DIR = path.join(process.cwd(), "migrations");

async function schemaIsCompatible(
  connection: mysql.Connection
): Promise<boolean> {
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'measurements' AND COLUMN_NAME = 'status'`,
    [dbConfig.database]
  );
  return rows.length > 0;
}

async function ensureCustomerPasswordHash(
  connection: mysql.Connection
): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'password_hash'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE customers ADD COLUMN password_hash VARCHAR(255) NULL AFTER phone"
    );
    console.log("Added password_hash column to customers.");
  }
}

async function migrateAdminUsersToCustomers(
  connection: mysql.Connection
): Promise<void> {
  const [tables] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'`,
    [dbConfig.database]
  );
  if (tables.length === 0) return;

  await connection.query(
    `INSERT INTO customers (id, name, email, phone, password_hash, total_orders, total_spend, status, join_date)
     SELECT au.id, au.name, au.email, au.phone, au.password_hash, 0, 0.00, 'Active', au.created_at
     FROM admin_users au
     WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.email = au.email)`
  );
  await connection.query("DROP TABLE IF EXISTS admin_users");
  console.log("Migrated admin_users into customers and removed admin_users table.");
}

async function ensureImageColumns(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT DATA_TYPE, CHARACTER_MAXIMUM_LENGTH
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'image_url'`,
    [dbConfig.database]
  );

  if (cols.length > 0 && cols[0].DATA_TYPE !== "mediumtext" && cols[0].DATA_TYPE !== "longtext") {
    await connection.query("ALTER TABLE products MODIFY image_url MEDIUMTEXT");
    await connection.query("ALTER TABLE orders MODIFY product_image_url MEDIUMTEXT");
    console.log("Expanded image_url columns to MEDIUMTEXT for uploaded images.");
  }
}

async function rebuildSchema(connection: mysql.Connection): Promise<void> {
  console.log("Rebuilding schema (incompatible or missing tables detected)...");
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  await connection.query("DROP TABLE IF EXISTS orders");
  await connection.query("DROP TABLE IF EXISTS products");
  await connection.query("DROP TABLE IF EXISTS product_names");
  await connection.query("DROP TABLE IF EXISTS measurements");
  await connection.query("DROP TABLE IF EXISTS customers");
  await connection.query("DROP TABLE IF EXISTS schema_migrations");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

export async function runMigrations(): Promise<void> {
  const connection = await mysql.createConnection({
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    multipleStatements: true,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``
    );
    await connection.query(`USE \`${dbConfig.database}\``);

    const compatible = await schemaIsCompatible(connection);
    if (!compatible) {
      await rebuildSchema(connection);
    }

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      await connection.query(sql);
      console.log(`Migration applied: ${file}`);
    }

    await ensureCustomerPasswordHash(connection);
    await migrateAdminUsersToCustomers(connection);
    await ensureImageColumns(connection);
  } finally {
    await connection.end();
  }

  const pool = getPool();
  for (const file of fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    await pool.execute(
      "INSERT IGNORE INTO schema_migrations (filename) VALUES (?)",
      [file]
    );
  }
}
