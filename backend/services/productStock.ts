import { RowDataPacket } from "mysql2";
import { query } from "../db/pool";

export const LOW_STOCK_THRESHOLD = 10;

export async function validateAndDecrementStock(
  productId: string,
  qty: number,
  fallbackName = "Product"
): Promise<{ productId: string; name: string; stock: number }> {
  const productRows = await query<RowDataPacket[]>(
    `SELECT id, name, stock FROM products WHERE id = ? LIMIT 1`,
    [productId]
  );

  if (productRows.length === 0) {
    throw new Error(`Product "${fallbackName}" is no longer available.`);
  }

  const product = productRows[0];
  const requestedQty = Math.max(1, Math.floor(Number(qty) || 1));
  const availableStock = Math.max(0, Math.floor(Number(product.stock ?? 0)));

  if (availableStock < requestedQty) {
    throw new Error(
      availableStock <= 0
        ? `"${product.name}" is out of stock.`
        : `Only ${availableStock} unit(s) left for "${product.name}".`
    );
  }

  await query("UPDATE products SET stock = GREATEST(stock - ?, 0) WHERE id = ?", [
    requestedQty,
    product.id,
  ]);

  const nextStock = Math.max(0, availableStock - requestedQty);
  return {
    productId: String(product.id),
    name: String(product.name),
    stock: nextStock,
    previousStock: availableStock,
  };
}

export function isLowStock(stock: number): boolean {
  return stock < LOW_STOCK_THRESHOLD;
}
