import "dotenv/config";
import { RowDataPacket } from "mysql2";
import { isLowStockWhatsAppConfigured, whatsappConfig } from "../backend/config/whatsapp.js";
import { query } from "../backend/db/pool.js";
import { sendLowStockAlertWhatsApp } from "../backend/services/whatsapp.js";

async function main() {
  console.log("Low stock WhatsApp config:");
  console.log("  enabled:", whatsappConfig.enabled);
  console.log("  notifyTo:", whatsappConfig.notifyTo || "(missing)");
  console.log("  callmebot api key:", whatsappConfig.callMeBotApiKey ? "(set)" : "(missing)");

  if (!isLowStockWhatsAppConfigured()) {
    console.error("\nWhatsApp alerts are not fully configured.");
    console.error("Set LOW_STOCK_WHATSAPP_ENABLED, LOW_STOCK_WHATSAPP_TO, and CALLMEBOT_API_KEY in .env");
    process.exit(1);
  }

  const products = await query<RowDataPacket[]>(
    "SELECT id, name, stock FROM products ORDER BY name ASC LIMIT 1"
  );

  if (products.length === 0) {
    console.error("\nNo products found in the database. Add a product first.");
    process.exit(1);
  }

  const product = products[0];
  const productName = String(product.name);

  console.log(`\nSending low stock WhatsApp sample for: ${productName}`);

  await sendLowStockAlertWhatsApp({
    productId: String(product.id),
    productName,
    previousStock: 10,
    newStock: 9,
  });

  console.log("WhatsApp message queued successfully for:", whatsappConfig.notifyTo);
}

main().catch((error) => {
  console.error("\nFailed to send WhatsApp message:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
