import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { mapProductName } from "../db/rowMappers.js";
import { logSqlQuery } from "../services/sqlLogger.js";
import { deleteProductCascade } from "../services/productDeletion.js";

const router = Router();

router.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sql =
      "SELECT id, name, status, created_at FROM product_names ORDER BY name ASC";
    logSqlQuery(sql + ";");
    const rows = await query<RowDataPacket[]>(sql);
    res.json(rows.map(mapProductName));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, status } = req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "Product name is required" });
      return;
    }

    const trimmedName = String(name).trim();
    const resolvedStatus = status === "Disabled" ? "Disabled" : "Enabled";
    const id = "pn-" + Date.now();

    const existing = await query<RowDataPacket[]>(
      "SELECT id FROM product_names WHERE name = ?",
      [trimmedName]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "Product name already exists" });
      return;
    }

    await query(
      "INSERT INTO product_names (id, name, status, created_at) VALUES (?, ?, ?, NOW())",
      [id, trimmedName, resolvedStatus]
    );

    logSqlQuery(
      `INSERT INTO product_names (id, name, status, created_at) \nVALUES ('${id}', '${trimmedName.replace(/'/g, "''")}', '${resolvedStatus}', NOW());`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, status, created_at FROM product_names WHERE id = ?",
      [id]
    );
    res.status(201).json(mapProductName(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const existing = await query<RowDataPacket[]>(
      "SELECT id, name, status, created_at FROM product_names WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "Product name not found" });
      return;
    }

    const row = existing[0];
    const oldName = row.name;
    const updatedName = name !== undefined ? String(name).trim() : oldName;
    const updatedStatus =
      status !== undefined ? status : existing[0].status;

    if (name !== undefined) {
      const duplicate = await query<RowDataPacket[]>(
        "SELECT id FROM product_names WHERE name = ? AND id != ?",
        [updatedName, id]
      );
      if (duplicate.length > 0) {
        res.status(409).json({ error: "Product name already exists" });
        return;
      }
    }

    await query(
      "UPDATE product_names SET name = ?, status = ? WHERE id = ?",
      [updatedName, updatedStatus, id]
    );

    if (name !== undefined && updatedName !== oldName) {
      await query("UPDATE products SET name = ? WHERE name = ?", [
        updatedName,
        oldName,
      ]);
      await query("UPDATE orders SET product_name = ? WHERE product_name = ?", [
        updatedName,
        oldName,
      ]);

      logSqlQuery(
        `UPDATE products SET name = '${String(updatedName).replace(/'/g, "''")}' WHERE name = '${String(oldName).replace(/'/g, "''")}';`
      );
      logSqlQuery(
        `UPDATE orders SET product_name = '${String(updatedName).replace(/'/g, "''")}' WHERE product_name = '${String(oldName).replace(/'/g, "''")}';`
      );
    }

    logSqlQuery(
      `UPDATE product_names \nSET name = '${String(updatedName).replace(/'/g, "''")}', status = '${updatedStatus}' \nWHERE id = '${id}';`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, status, created_at FROM product_names WHERE id = ?",
      [id]
    );
    res.json(mapProductName(rows[0]));
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
        "SELECT id, name FROM product_names WHERE id = ?",
        [id]
      );
      if (existing.length === 0) {
        res.status(404).json({ error: "Product name not found" });
        return;
      }

      const productName = existing[0].name;
      const linkedProducts = await query<RowDataPacket[]>(
        "SELECT id FROM products WHERE name = ?",
        [productName]
      );

      let removedOrders = 0;
      for (const product of linkedProducts) {
        const result = await deleteProductCascade(String(product.id));
        removedOrders += result.deletedOrders;
      }

      await query("DELETE FROM product_names WHERE id = ?", [id]);
      logSqlQuery(`DELETE FROM product_names \nWHERE id = '${id}';`);

      const removedProducts = linkedProducts.length;
      let message = "Product name deleted successfully";
      if (removedProducts > 0) {
        message += ` (${removedProducts} product(s) and ${removedOrders} related order(s) removed)`;
      }

      res.json({ message });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
