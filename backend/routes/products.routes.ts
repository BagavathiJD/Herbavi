import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool";
import { mapProduct } from "../db/rowMappers";
import { logSqlQuery } from "../services/sqlLogger";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status } = req.query;
    let sql =
      "SELECT p.id, p.name, p.description, p.image_url, p.measurement_id, p.measurement_value, p.price, p.status, p.created_at FROM products p";
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

    logSqlQuery(
      "SELECT p.*, m.name AS measurement_name FROM products p LEFT JOIN measurements m ON p.measurement_id = m.id ORDER BY p.created_at DESC;"
    );

    const rows = await query<RowDataPacket[]>(sql, params);
    res.json(rows.map(mapProduct));
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, imageUrl, measurementId, measurementValue, price, status } =
      req.body;

    if (!name || !String(name).trim()) {
      res.status(400).json({ error: "Product name is required." });
      return;
    }

    if (!measurementId) {
      res.status(400).json({ error: "Measurement is required." });
      return;
    }

    if (
      measurementValue === undefined ||
      measurementValue === null ||
      !String(measurementValue).trim()
    ) {
      res.status(400).json({ error: "Measurement volume is required (e.g. 1, 2)." });
      return;
    }

    if (price === undefined || price === null || price === "") {
      res.status(400).json({ error: "Price is required." });
      return;
    }

    if (!imageUrl || !String(imageUrl).trim()) {
      res.status(400).json({ error: "Product image is required. Please upload an image." });
      return;
    }

    const resolvedName = String(name).trim();
    const resolvedDescription = String(description || "").trim();
    const resolvedImageUrl = String(imageUrl).trim();
    const resolvedMeasurementId = String(measurementId);
    const resolvedMeasurementValue = String(measurementValue).trim();
    const resolvedPrice = Number(price);
    const resolvedStatus = status === "Inactive" ? "Inactive" : "Active";

    if (isNaN(resolvedPrice) || resolvedPrice <= 0) {
      res.status(400).json({ error: "Price must be a valid number greater than 0." });
      return;
    }

    const parsedMeasurementValue = Number(resolvedMeasurementValue);
    if (isNaN(parsedMeasurementValue) || parsedMeasurementValue <= 0) {
      res.status(400).json({
        error: "Measurement volume must be a valid number greater than 0 (e.g. 1, 2).",
      });
      return;
    }

    const productNameRow = await query<RowDataPacket[]>(
      "SELECT id, status FROM product_names WHERE name = ?",
      [resolvedName]
    );
    if (productNameRow.length === 0) {
      res.status(400).json({
        error: "Product name must exist in Product Name master. Add it there first.",
      });
      return;
    }
    if (productNameRow[0].status === "Disabled") {
      res.status(400).json({
        error: "Selected product name is disabled in Product Name master.",
      });
      return;
    }

    const measurement = await query<RowDataPacket[]>(
      "SELECT id, status FROM measurements WHERE id = ?",
      [resolvedMeasurementId]
    );
    if (measurement.length === 0) {
      res.status(400).json({ error: "Measurement not found." });
      return;
    }
    if (measurement[0].status === "Disabled") {
      res.status(400).json({
        error: "Selected measurement is disabled. Choose an enabled unit.",
      });
      return;
    }

    const id = "p-" + Date.now();

    await query(
      `INSERT INTO products (id, name, description, image_url, measurement_id, measurement_value, price, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        resolvedName,
        resolvedDescription,
        resolvedImageUrl,
        resolvedMeasurementId,
        resolvedMeasurementValue,
        resolvedPrice,
        resolvedStatus,
      ]
    );

    const imageLog =
      resolvedImageUrl.length > 80
        ? resolvedImageUrl.slice(0, 40) + "...[uploaded image]"
        : resolvedImageUrl;

    logSqlQuery(
      `INSERT INTO products (id, name, description, image_url, measurement_id, measurement_value, price, status, created_at) \nVALUES ('${id}', '${resolvedName.replace(/'/g, "''")}', '${resolvedDescription.replace(/'/g, "''")}', '${imageLog}', '${resolvedMeasurementId}', '${resolvedMeasurementValue.replace(/'/g, "''")}', ${resolvedPrice}, '${resolvedStatus}', NOW());`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, description, image_url, measurement_id, measurement_value, price, status, created_at FROM products WHERE id = ?",
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
    const { name, description, imageUrl, measurementId, measurementValue, price, status } =
      req.body;

    const existing = await query<RowDataPacket[]>(
      "SELECT id, name, description, image_url, measurement_id, measurement_value, price, status, created_at FROM products WHERE id = ?",
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
    const updatedMeasurementValue =
      measurementValue !== undefined
        ? String(measurementValue).trim()
        : row.measurement_value;
    const updatedPrice =
      price !== undefined ? Number(price) : Number(row.price);
    const updatedStatus = status !== undefined ? status : row.status;

    if (measurementValue !== undefined) {
      const parsedMeasurementValue = Number(updatedMeasurementValue);
      if (isNaN(parsedMeasurementValue) || parsedMeasurementValue <= 0) {
        res.status(400).json({
          error: "Measurement volume must be a valid number greater than 0 (e.g. 1, 2).",
        });
        return;
      }
    }

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
      `UPDATE products SET name = ?, description = ?, image_url = ?, measurement_id = ?, measurement_value = ?, price = ?, status = ? WHERE id = ?`,
      [
        updatedName,
        updatedDescription,
        updatedImageUrl,
        updatedMeasurementId,
        updatedMeasurementValue,
        updatedPrice,
        updatedStatus,
        id,
      ]
    );

    logSqlQuery(
      `UPDATE products SET name = '${String(updatedName).replace(/'/g, "''")}', price = ${updatedPrice}, status = '${updatedStatus}' WHERE id = '${id}';`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT id, name, description, image_url, measurement_id, measurement_value, price, status, created_at FROM products WHERE id = ?",
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
      logSqlQuery(`DELETE FROM products WHERE id = '${id}';`);
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
