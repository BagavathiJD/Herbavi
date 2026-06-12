import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { mapCustomer } from "../db/rowMappers.js";
import { logSqlQuery } from "../services/sqlLogger.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sql = "SELECT * FROM customers ORDER BY join_date DESC";
    logSqlQuery(sql + ";");
    const rows = await query<RowDataPacket[]>(sql);
    res.json(rows.map(mapCustomer));
  } catch (err) {
    next(err);
  }
});

export default router;
