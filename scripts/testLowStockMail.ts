import "dotenv/config";
import { RowDataPacket } from "mysql2";
import { isLowStockMailConfigured, mailConfig } from "../backend/config/mail.js";
import { query } from "../backend/db/pool.js";
import { sendLowStockAlertEmail } from "../backend/services/mail.js";

async function main() {
  console.log("Low stock mail config:");
  console.log("  enabled:", mailConfig.enabled);
  console.log("  notifyTo:", mailConfig.notifyTo || "(missing)");
  console.log("  threshold:", mailConfig.threshold);
  console.log("  smtp host:", mailConfig.smtp.host || "(missing)");
  console.log("  smtp user:", mailConfig.smtp.user || "(missing)");
  console.log("  smtp pass:", mailConfig.smtp.pass ? "(set)" : "(missing)");

  if (!isLowStockMailConfigured()) {
    console.error("\nMail is not fully configured. Check LOW_STOCK_* and SMTP_* in .env");
    process.exit(1);
  }

  if (mailConfig.smtp.pass === "your-app-password") {
    console.error("\nSMTP_PASS is still the placeholder 'your-app-password'.");
    console.error("Replace it with a real Gmail App Password from:");
    console.error("https://myaccount.google.com/apppasswords");
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
  const currentStock = Math.max(0, Math.floor(Number(product.stock ?? 0)));
  const samplePreviousStock = Math.max(mailConfig.threshold, currentStock + 1);
  const sampleNewStock = Math.max(0, mailConfig.threshold - 1);

  console.log(`\nSending low stock sample email for: ${productName}`);

  await sendLowStockAlertEmail({
    productId: String(product.id),
    productName,
    previousStock: samplePreviousStock,
    newStock: sampleNewStock,
  });

  console.log("Email sent successfully to:", mailConfig.notifyTo);
}

main().catch((error) => {
  console.error("\nFailed to send email:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
