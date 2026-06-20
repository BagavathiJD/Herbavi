import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { mapAppUser } from "../db/rowMappers.js";
import { logSqlQuery } from "../services/sqlLogger.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sql =
      "SELECT id, user_name, email, phone_number, role, created_at FROM users ORDER BY created_at DESC";
    logSqlQuery(sql + ";");
    const rows = await query<RowDataPacket[]>(sql);
    res.json(rows.map(mapAppUser));
  } catch (err) {
    next(err);
  }
});

export default router;
