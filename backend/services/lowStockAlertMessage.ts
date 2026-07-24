export interface LowStockAlertPayload {
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
}

export function buildLowStockAlertText(payload: LowStockAlertPayload): string {
  const { productName, newStock } = payload;
  const isSoldOut = newStock <= 0;
  const stockLabel = isSoldOut ? "Out of stock" : String(newStock);
  const intro = isSoldOut
    ? "The following product is now out of stock. Please restock soon."
    : "The following product has low stock (under 10 units left). Please restock soon.";

  return [
    "Herbavi low stock alert",
    "",
    intro,
    "",
    `Product: ${productName}`,
    `Stock left: ${stockLabel}`,
    "",
    "Please restock this product in the admin panel.",
  ].join("\n");
}
