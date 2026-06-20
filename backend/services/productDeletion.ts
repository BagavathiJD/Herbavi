import { RowDataPacket } from "mysql2";
import { query } from "../db/pool.js";
import { logSqlQuery } from "./sqlLogger.js";

export async function deleteProductCascade(
  productId: string
): Promise<{ deletedOrders: number }> {
  const orders = await query<RowDataPacket[]>(
    "SELECT id, user_id, order_status, total_amount FROM orders WHERE product_id = ?",
    [productId]
  );

  for (const order of orders) {
    if (order.order_status === "Delivered") {
      await query(
        `UPDATE customers SET
          total_orders = GREATEST(0, total_orders - 1),
          total_spend = GREATEST(0, total_spend - ?)
        WHERE id = ?`,
        [order.total_amount, order.user_id]
      );
    }
  }

  if (orders.length > 0) {
    await query("DELETE FROM orders WHERE product_id = ?", [productId]);
    logSqlQuery(
      `DELETE FROM orders WHERE product_id = '${productId}'; -- ${orders.length} related order(s) removed`
    );
  }

  await query("DELETE FROM products WHERE id = ?", [productId]);
  logSqlQuery(`DELETE FROM products WHERE id = '${productId}';`);

  return { deletedOrders: orders.length };
}
