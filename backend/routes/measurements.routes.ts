import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { mapMeasurement } from "../db/rowMappers.js";
import { logSqlQuery } from "../services/sqlLogger.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sql =
      "SELECT id, name, status, created_at FROM measurements ORDER BY name ASC";
    logSqlQuery(sql + ";");
    const rows = await query<RowDataPacket[]>(sql);
    res.json(rows.map(mapMeasurement));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status } = req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "Measurement name is required" });
      return;
    }

    const trimmedName = String(name).trim();
    const resolvedStatus = status === "Disabled" ? "Disabled" : "Enabled";
    const id = "m-" + Date.now();

    const existing = await query<RowDataPacket[]>(
      "SELECT id FROM measurements WHERE name = ?",
      [trimmedName]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "Measurement name already exists" });
      return;
    }

    await query(
      "INSERT IGNORE  INTO measurements (id, name, status, created_at) VALUES (?, ?, ?, NOW())",
      [id, trimmedName, resolvedStatus]
    );

    logSqlQuery(
      `INSERT INTO measurements (id, name, status, created_at) \nVALUES ('${id}', '${trimmedName.replace(/'/g, "''")}', '${resolvedStatus}', NOW());`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, status, created_at FROM measurements WHERE id = ?",
      [id]
    );
    res.status(201).json(mapMeasurement(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const existing = await query<RowDataPacket[]>(
      "SELECT id, name, status, created_at FROM measurements WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "Measurement not found" });
      return;
    }

    const updatedName = name !== undefined ? String(name).trim() : existing[0].name;
    const updatedStatus =
      status !== undefined ? status : existing[0].status;

    if (name !== undefined) {
      const duplicate = await query<RowDataPacket[]>(
        "SELECT id FROM measurements WHERE name = ? AND id != ?",
        [updatedName, id]
      );
      if (duplicate.length > 0) {
        res.status(409).json({ error: "Measurement name already exists" });
        return;
      }
    }

    await query(
      "UPDATE measurements SET name = ?, status = ? WHERE id = ?",
      [updatedName, updatedStatus, id]
    );

    logSqlQuery(
      `UPDATE measurements \nSET name = '${String(updatedName).replace(/'/g, "''")}', status = '${updatedStatus}' \nWHERE id = '${id}';`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, status, created_at FROM measurements WHERE id = ?",
      [id]
    );
    res.json(mapMeasurement(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const existing = await query<RowDataPacket[]>(
        "SELECT id FROM measurements WHERE id = ?",
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json({ error: "Measurement not found" });
        return;
      }

      const inUse = await query<RowDataPacket[]>(
        "SELECT id FROM products WHERE measurement_id = ? LIMIT 1",
        [id]
      );
      if (inUse.length > 0) {
        logSqlQuery(
          `DELETE FROM measurements WHERE id = '${id}'; -- FAILED WITH FOREIGN KEY CONSTRAINT`
        );
        res.status(400).json({
          error:
            "Cannot delete measurement. It is currently in use by one or more products.",
        });
        return;
      }

      await query("DELETE FROM measurements WHERE id = ?", [id]);
      logSqlQuery(`DELETE FROM measurements \nWHERE id = '${id}';`);
      res.json({ message: "Measurement deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
