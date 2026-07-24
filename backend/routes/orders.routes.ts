import { Router, Request, Response, NextFunction } from "express";
import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { mapOrder } from "../db/rowMappers.js";
import { logSqlQuery } from "../services/sqlLogger.js";
import { notifyLowStockIfNeeded } from "../services/lowStockNotifier.js";
import { isLowStock, LOW_STOCK_THRESHOLD, validateAndDecrementStock } from "../services/productStock.js";

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, status } = req.query;
    let sql = "SELECT * FROM orders o";
    const conditions: string[] = [];
    const params: unknown[] = [];

    if (search) {
      conditions.push(
        "(o.user_name LIKE ? OR o.product_name LIKE ? OR o.id LIKE ?)"
      );
      const term = `%${String(search)}%`;
      params.push(term, term, term);
    }
    if (status) {
      conditions.push("o.order_status = ?");
      params.push(String(status));
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY o.order_date DESC";

    logSqlQuery(sql + ";");
    const rows = await query<RowDataPacket[]>(sql, params);
    res.json(rows.map(mapOrder));
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      res.status(400).json({ error: "Order status is required" });
      return;
    }

    const existing = await query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    const oldStatus = existing[0].order_status;

    await query("UPDATE orders SET order_status = ? WHERE id = ?", [
      orderStatus,
      id,
    ]);

    if (orderStatus === "Delivered" && oldStatus !== "Delivered") {
      await query(
        `UPDATE customers SET total_orders = total_orders + 1, total_spend = total_spend + ? WHERE id = ?`,
        [existing[0].total_amount, existing[0].user_id]
      );
    }

    logSqlQuery(
      `UPDATE orders \nSET order_status = '${orderStatus}' \nWHERE id = '${id}';`
    );

    const rows = await query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE id = ?",
      [id]
    );
    res.json(mapOrder(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.post(
  "/simulate",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const products = await query<RowDataPacket[]>(
        "SELECT id, name, image_url, measurement_id, measurement_value, price FROM products LIMIT 100"
      );
      const customers = await query<RowDataPacket[]>(
        "SELECT id, name FROM customers LIMIT 100"
      );

      if (products.length === 0) {
        res.status(400).json({
          error: "Cannot simulate orders. Product database is currently empty.",
        });
        return;
      }
      if (customers.length === 0) {
        res.status(400).json({
          error: "Cannot simulate orders. Customer database is empty.",
        });
        return;
      }

      const randomProduct =
        products[Math.floor(Math.random() * products.length)];
      const randomCustomer =
        customers[Math.floor(Math.random() * customers.length)];
      const qty = Math.floor(Math.random() * 4) + 1;

      const stockResult = await validateAndDecrementStock(
        String(randomProduct.id),
        qty,
        String(randomProduct.name)
      );

      const measureRows = await query<RowDataPacket[]>(
        "SELECT name FROM measurements WHERE id = ?",
        [randomProduct.measurement_id]
      );
      const measureName =
        measureRows.length > 0
          ? `${randomProduct.measurement_value ?? "1"} ${measureRows[0].name}`
          : "1 Piece (pcs)";
      const total = parseFloat(
        (Number(randomProduct.price) * qty).toFixed(2)
      );
      const id = "o-" + Date.now();

      await query(
        `INSERT INTO orders (
          id, user_id, user_name, product_id, product_name, product_image_url,
          quantity, measurement_name, price, total_amount, order_status, order_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())`,
        [
          id,
          randomCustomer.id,
          randomCustomer.name,
          randomProduct.id,
          randomProduct.name,
          randomProduct.image_url,
          qty,
          measureName,
          randomProduct.price,
          total,
        ]
      );

      logSqlQuery(
        `INSERT INTO orders (\n  id, user_id, user_name, product_id, product_name, \n  product_image_url, quantity, measurement_name, price, \n  total_amount, order_status, order_date\n) VALUES (\n  '${id}', '${randomCustomer.id}', '${String(randomCustomer.name).replace(/'/g, "''")}', \n  '${randomProduct.id}', '${String(randomProduct.name).replace(/'/g, "''")}', '${randomProduct.image_url}', \n  ${qty}, '${measureName}', ${randomProduct.price}, \n  ${total}, 'Pending', NOW()\n);`
      );

      if (isLowStock(stockResult.stock)) {
        logSqlQuery(
          `LOW STOCK: ${stockResult.name} now has ${stockResult.stock} unit(s) (threshold ${LOW_STOCK_THRESHOLD}).`
        );
      }

      await notifyLowStockIfNeeded({
        productId: stockResult.productId,
        productName: stockResult.name,
        previousStock: stockResult.previousStock,
        newStock: stockResult.stock,
      });

      const rows = await query<RowDataPacket[]>(
        "SELECT * FROM orders WHERE id = ?",
        [id]
      );
      res.status(201).json(mapOrder(rows[0]));
    } catch (err) {
      next(err);
    }
  }
);

export default router;
