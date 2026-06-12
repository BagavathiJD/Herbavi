import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { seedDatabase } from "../db/seed.js";
import {
  getSqlLogs,
  clearSqlLogs,
  logSqlQuery,
} from "../services/sqlLogger.js";
import { dbConfig } from "../config/env.js";

const router = Router();

router.get("/db-metrics", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const metricsSql =
      "SELECT COUNT(*) AS cnt FROM information_schema.tables WHERE table_schema = ?";
    logSqlQuery(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'ecommerce_admin';",
      0.2
    );
    const tableRows = await query<RowDataPacket[]>(metricsSql, [
      dbConfig.database,
    ]);

    let storageSizeKb = 0;
    try {
      const sizeRows = await query<RowDataPacket[]>(
        `SELECT ROUND(SUM(data_length + index_length) / 1024, 0) AS size_kb
         FROM information_schema.tables WHERE table_schema = ?`,
        [dbConfig.database]
      );
      storageSizeKb = Number(sizeRows[0]?.size_kb ?? 0);
    } catch {
      storageSizeKb = 0;
    }

    res.json({
      totalQueries: getSqlLogs().length,
      connectionPool: dbConfig.connectionLimit,
      storageSizeKb,
      activeTransactions: 0,
      tableCount: tableRows[0]?.cnt ?? 0,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/sql-logs", (_req: Request, res: Response) => {
  res.json(getSqlLogs());
});

router.post("/sql-logs/clear", (_req: Request, res: Response) => {
  clearSqlLogs();
  logSqlQuery("TRUNCATE TABLE query_execution_logs;");
  res.json({ status: "success" });
});

router.post("/db/reseed", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    clearSqlLogs();
    await seedDatabase();
    logSqlQuery("DROP DATABASE IF EXISTS ecommerce_admin;");
    logSqlQuery("CREATE DATABASE ecommerce_admin;");
    logSqlQuery("USE ecommerce_admin;");
    logSqlQuery("INSERT INTO measurements SELECT * ...;");
    logSqlQuery("INSERT INTO products SELECT * ...;");
    res.json({ message: "Database re-seeded successfully!" });
  } catch (err) {
    next(err);
  }
});

export default router;
