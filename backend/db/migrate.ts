import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
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

async function ensureUsersRoleColumn(
  connection: mysql.Connection
): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE users ADD COLUMN role ENUM('Admin','User') NOT NULL DEFAULT 'User' AFTER phone_number"
    );
    console.log("Added role column to users.");
  } else {
    await connection.query(
      "ALTER TABLE users MODIFY COLUMN role ENUM('Admin','User') NOT NULL DEFAULT 'User'"
    );
  }
}

async function migrateLegacyAdminUsers(
  connection: mysql.Connection
): Promise<void> {
  const [tables] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admin_users'`,
    [dbConfig.database]
  );
  if (tables.length === 0) return;

  await connection.query(
    `INSERT INTO users (user_name, password, email, phone_number, role, created_at, updated_at)
     SELECT au.name, au.password_hash, au.email,
            COALESCE(NULLIF(au.phone, ''), '0000000000'), 'Admin', au.created_at, au.created_at
     FROM admin_users au
     WHERE NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(au.email))`
  );
  await connection.query("DROP TABLE IF EXISTS admin_users");
  console.log("Migrated admin_users into users and removed admin_users table.");
}

async function migrateCustomerCredentialsToUsers(
  connection: mysql.Connection
): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers' AND COLUMN_NAME = 'password_hash'`,
    [dbConfig.database]
  );
  if (cols.length === 0) return;

  await connection.query(
    `INSERT INTO users (user_name, password, email, phone_number, role, created_at, updated_at)
     SELECT c.name, c.password_hash, c.email,
              COALESCE(NULLIF(c.phone, ''), '0000000000'), 'User', c.join_date, c.join_date
       FROM customers c
       WHERE c.password_hash IS NOT NULL AND c.password_hash != ''
       AND NOT EXISTS (SELECT 1 FROM users u WHERE LOWER(u.email) = LOWER(c.email))`
    );

  await connection.query("ALTER TABLE customers DROP COLUMN password_hash");
  console.log(
    "Moved login credentials from customers to users as User role and removed password_hash column."
  );
}

async function ensureMeasurementValueColumn(
  connection: mysql.Connection
): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'measurement_value'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE products ADD COLUMN measurement_value VARCHAR(50) NOT NULL DEFAULT '1' AFTER measurement_id"
    );
    console.log("Added measurement_value column to products.");
  }
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

async function ensureUserAddressColumn(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'address'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE users ADD COLUMN address TEXT NULL AFTER phone_number"
    );
    console.log("Added address column to users.");
  }
}

async function ensureUsersDobColumn(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = 'dob'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query("ALTER TABLE users ADD COLUMN dob DATE NULL AFTER phone_number");
    console.log("Added dob column to users.");
  }
}

async function ensureUserDetailsAddressColumn(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_details' AND COLUMN_NAME = 'address'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE user_details ADD COLUMN address TEXT NULL AFTER phone_number"
    );
    console.log("Added address column to user_details.");
  }
}

async function ensureUserDetailsTable(connection: mysql.Connection): Promise<void> {
  const [tables] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT TABLE_NAME FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_details'`,
    [dbConfig.database]
  );
  if (tables.length === 0) {
    return;
  }

  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'user_details' AND COLUMN_NAME = 'full_name'`,
    [dbConfig.database]
  );
  if (cols.length > 0) {
    return;
  }

  await connection.query("DROP TABLE IF EXISTS user_details");
  await connection.query(`
    CREATE TABLE user_details (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      user_id         INT NULL,
      full_name       VARCHAR(150) NOT NULL,
      email           VARCHAR(150) NOT NULL,
      phone_number    VARCHAR(20) NOT NULL,
      address         TEXT NULL,
      country         VARCHAR(100) NOT NULL,
      city            VARCHAR(100) NOT NULL,
      state           VARCHAR(100) NOT NULL,
      zip_code        VARCHAR(20) NOT NULL,
      delivery_method ENUM('Delivery', 'Pickup') NOT NULL DEFAULT 'Delivery',
      discount_code   VARCHAR(50) NULL,
      discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
      shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
      total_amount    DECIMAL(10,2) NOT NULL DEFAULT 0,
      cart_items      JSON NULL,
      terms_accepted  TINYINT(1) NOT NULL DEFAULT 0,
      created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_user_details_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
    )
  `);
  console.log("Rebuilt user_details table for checkout schema.");
}

async function ensureProductCategoryColumn(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'category'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE products ADD COLUMN category ENUM('Siddha', 'Ayurveda', 'Unani') NOT NULL DEFAULT 'Ayurveda' AFTER status"
    );
    console.log("Added category column to products.");
    return;
  }

  await connection.query(
    "ALTER TABLE products MODIFY COLUMN category ENUM('Siddha', 'Ayurveda', 'Unani') NOT NULL DEFAULT 'Ayurveda'"
  );
}

async function ensureProductGalleryImagesColumn(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'gallery_images'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE products ADD COLUMN gallery_images JSON NULL AFTER image_url"
    );
    console.log("Added gallery_images column to products.");
  }

  await connection.query(
    `UPDATE products
     SET gallery_images = JSON_ARRAY(image_url)
     WHERE gallery_images IS NULL
       AND image_url IS NOT NULL
       AND TRIM(image_url) <> ''`
  );
}

async function migrateEcommerceAdminUsers(connection: mysql.Connection): Promise<void> {
  // The cross-database migration from `herbavi` is disabled.
  // All data should be created and stored in the configured database (see DB_DATABASE).
  // If you previously had a separate `herbavi` schema and need to migrate,
  // implement an explicit one-off migration outside of this automated runner.
  console.log("Skipping migrateEcommerceAdminUsers: cross-database migration disabled.");
}

async function ensureDefaultUsers(connection: mysql.Connection): Promise<void> {
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    "SELECT COUNT(*) AS cnt FROM users"
  );
  const userCount = Number(rows[0]?.cnt ?? 0);
  if (userCount > 0) {
    return;
  }

  const adminHash = await bcrypt.hash("Admin123!", 10);
  const userHash = await bcrypt.hash("User123!", 10);

  await connection.query(
    `INSERT INTO users (user_name, password, email, phone_number, role, created_at, updated_at)
     VALUES
       ('Admin User', ?, 'admin@herbavi.com', '0000000000', 'Admin', NOW(), NOW()),
       ('Normal User', ?, 'user@herbavi.com', '0000000000', 'User', NOW(), NOW())`,
    [adminHash, userHash]
  );

  console.log(
    "Created default Herbavi auth users: admin@herbavi.com, user@herbavi.com."
  );
}

async function rebuildSchema(connection: mysql.Connection): Promise<void> {
  console.log("Rebuilding schema (incompatible or missing tables detected)...");
  await connection.query("SET FOREIGN_KEY_CHECKS = 0");
  await connection.query("DROP TABLE IF EXISTS orders");
  await connection.query("DROP TABLE IF EXISTS products");
  await connection.query("DROP TABLE IF EXISTS product_names");
  await connection.query("DROP TABLE IF EXISTS measurements");
  await connection.query("DROP TABLE IF EXISTS customers");
  await connection.query("DROP TABLE IF EXISTS users");
  await connection.query("DROP TABLE IF EXISTS schema_migrations");
  await connection.query("SET FOREIGN_KEY_CHECKS = 1");
}

async function ensureProductOriginalPriceColumn(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'original_price'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE products ADD COLUMN original_price DECIMAL(10,2) NULL AFTER price"
    );
    console.log("Added original_price column to products.");
  }
}

async function ensureProductStockColumn(connection: mysql.Connection): Promise<void> {
  const [cols] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'products' AND COLUMN_NAME = 'stock'`,
    [dbConfig.database]
  );
  if (cols.length === 0) {
    await connection.query(
      "ALTER TABLE products ADD COLUMN stock INT NOT NULL DEFAULT 100 AFTER original_price"
    );
    console.log("Added stock column to products.");
  }
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
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8").trim();
      if (!sql || sql.startsWith("--")) {
        continue;
      }

      try {
        await connection.query(sql);
        console.log(`Migration applied: ${file}`);
      } catch (err: unknown) {
        const code =
          err && typeof err === "object" && "code" in err
            ? String((err as { code?: string }).code)
            : "";
        if (code === "ER_DUP_FIELDNAME" || code === "ER_TABLE_EXISTS_ERROR") {
          console.log(`Migration skipped (already applied): ${file}`);
          continue;
        }
        throw err;
      }
    }

    // await ensureCustomerPasswordHash(connection);
    // await migrateAdminUsersToCustomers(connection);
    await ensureMeasurementValueColumn(connection);
    await ensureUsersRoleColumn(connection);
    await migrateLegacyAdminUsers(connection);
    await migrateCustomerCredentialsToUsers(connection);
    await ensureDefaultUsers(connection);
    await ensureImageColumns(connection);
    await ensureUsersDobColumn(connection);
    await ensureUserDetailsTable(connection);
    await ensureUserDetailsAddressColumn(connection);
    await ensureProductCategoryColumn(connection);
    await ensureProductGalleryImagesColumn(connection);
    await ensureProductOriginalPriceColumn(connection);
    await ensureProductStockColumn(connection);
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
