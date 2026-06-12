import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { mapProduct } from "../db/rowMappers.js";
import { logSqlQuery } from "../services/sqlLogger.js";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status } = req.query;
    let sql =
      "SELECT p.id, p.name, p.description, p.image_url, p.measurement_id, p.price, p.status, p.created_at FROM products p";
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      conditions.push("(p.name LIKE ? OR p.description LIKE ?)");
      const term = `%${String(search)}%`;
      params.push(term, term);
    }
    if (status) {
      conditions.push("p.status = ?");
      params.push(String(status));
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY p.created_at DESC";

    const displaySql =
      "SELECT p.*, m.name AS measurement_name \nFROM products p \nLEFT JOIN measurements m ON p.measurement_id = m.id" +
      (conditions.length > 0
        ? "\nWHERE " +
          conditions
            .map((c) =>
              c.includes("LIKE")
                ? c.replace(/\?/g, `'${String(search).replace(/'/g, "''")}%'`)
                : c.replace("?", `'${String(status)}'`)
            )
            .join(" AND ")
        : "") +
      "\nORDER BY p.created_at DESC;";
    logSqlQuery(displaySql);

    const rows = await query<RowDataPacket[]>(sql, params);
    res.json(rows.map(mapProduct));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, imageUrl, measurementId, price, status } =
      req.body;

    if (!name || !measurementId || price === undefined) {
      res.status(400).json({
        error: "Product name, measurement level, and price are required.",
      });
      return;
    }

    const id = "p-" + Date.now();
    const resolvedName = String(name).trim();
    const resolvedDescription = String(description || "").trim();
    const resolvedImageUrl = String(
      imageUrl ||
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=200"
    ).trim();
    const resolvedMeasurementId = String(measurementId);
    const resolvedPrice = Number(price);
    const resolvedStatus = status === "Inactive" ? "Inactive" : "Active";

    const measurement = await query<RowDataPacket[]>(
      "SELECT id FROM measurements WHERE id = ?",
      [resolvedMeasurementId]
    );
    if (measurement.length === 0) {
      res.status(400).json({ error: "Measurement not found" });
      return;
    }

    await query(
      `INSERT INTO products (id, name, description, image_url, measurement_id, price, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        resolvedName,
        resolvedDescription,
        resolvedImageUrl,
        resolvedMeasurementId,
        resolvedPrice,
        resolvedStatus,
      ]
    );

    logSqlQuery(
      `INSERT INTO products (id, name, description, image_url, measurement_id, price, status, created_at) \nVALUES ('${id}', '${resolvedName.replace(/'/g, "''")}', '${resolvedDescription.replace(/'/g, "''")}', '${resolvedImageUrl}', '${resolvedMeasurementId}', ${resolvedPrice}, '${resolvedStatus}', NOW());`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, description, image_url, measurement_id, price, status, created_at FROM products WHERE id = ?",
      [id]
    );
    res.status(201).json(mapProduct(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, imageUrl, measurementId, price, status } =
      req.body;

    const existing = await query<RowDataPacket[]>(
      "SELECT id, name, description, image_url, measurement_id, price, status, created_at FROM products WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const row = existing[0];
    const updatedName = name !== undefined ? String(name).trim() : row.name;
    const updatedDescription =
      description !== undefined ? String(description).trim() : row.description;
    const updatedImageUrl =
      imageUrl !== undefined ? String(imageUrl).trim() : row.image_url;
    const updatedMeasurementId =
      measurementId !== undefined ? String(measurementId) : row.measurement_id;
    const updatedPrice =
      price !== undefined ? Number(price) : Number(row.price);
    const updatedStatus = status !== undefined ? status : row.status;

    if (measurementId !== undefined) {
      const measurement = await query<RowDataPacket[]>(
        "SELECT id FROM measurements WHERE id = ?",
        [updatedMeasurementId]
      );
      if (measurement.length === 0) {
        res.status(400).json({ error: "Measurement not found" });
        return;
      }
    }

    await query(
      `UPDATE products SET name = ?, description = ?, image_url = ?, measurement_id = ?, price = ?, status = ? WHERE id = ?`,
      [
        updatedName,
        updatedDescription,
        updatedImageUrl,
        updatedMeasurementId,
        updatedPrice,
        updatedStatus,
        id,
      ]
    );

    logSqlQuery(
      `UPDATE products \nSET name = '${String(updatedName).replace(/'/g, "''")}', description = '${String(updatedDescription).replace(/'/g, "''")}', image_url = '${updatedImageUrl}', measurement_id = '${updatedMeasurementId}', price = ${updatedPrice}, status = '${updatedStatus}' \nWHERE id = '${id}';`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, description, image_url, measurement_id, price, status, created_at FROM products WHERE id = ?",
      [id]
    );
    res.json(mapProduct(rows[0]));
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
        "SELECT id FROM products WHERE id = ?",
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json({ error: "Product not found" });
        return;
      }

      const orderRef = await query<RowDataPacket[]>(
        "SELECT id FROM orders WHERE product_id = ? LIMIT 1",
        [id]
      );
      if (orderRef.length > 0) {
        res.status(400).json({
          error: "Cannot delete product. It is referenced by existing orders.",
        });
        return;
      }

      await query("DELETE FROM products WHERE id = ?", [id]);
      logSqlQuery(`DELETE FROM products \nWHERE id = '${id}';`);
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
