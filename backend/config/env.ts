export const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: (process.env.DB_PASSWORD || "").replace(/^"|"$/g, ""),
  database: process.env.DB_NAME || "ecommerce_admin",
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
};
