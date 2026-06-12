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
