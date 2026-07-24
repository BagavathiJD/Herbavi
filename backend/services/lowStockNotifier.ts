import { isLowStockMailConfigured, mailConfig } from "../config/mail.js";
import { isLowStockWhatsAppConfigured, whatsappConfig } from "../config/whatsapp.js";
import { sendLowStockAlertEmail } from "./mail.js";
import { type LowStockAlertPayload } from "./lowStockAlertMessage.js";
import { LOW_STOCK_THRESHOLD } from "./productStock.js";
import { sendLowStockAlertWhatsApp } from "./whatsapp.js";

export function getLowStockThreshold(): number {
  return mailConfig.threshold || LOW_STOCK_THRESHOLD;
}

export function shouldNotifyLowStock(previousStock: number, newStock: number): boolean {
  const threshold = getLowStockThreshold();
  const previous = Math.max(0, Math.floor(Number(previousStock) || 0));
  const next = Math.max(0, Math.floor(Number(newStock) || 0));

  if (next >= threshold) {
    return false;
  }

  if (previous === next) {
    return false;
  }

  if (previous >= threshold) {
    return true;
  }

  if (next < previous) {
    return true;
  }

  return false;
}

export async function notifyLowStockIfNeeded(params: LowStockAlertPayload): Promise<void> {
  if (!shouldNotifyLowStock(params.previousStock, params.newStock)) {
    console.log(
      `[alerts] No low stock alert for "${params.productName}" (stock ${params.previousStock} → ${params.newStock}).`
    );
    return;
  }

  const tasks: Array<Promise<void>> = [];

  if (isLowStockMailConfigured()) {
    tasks.push(
      sendLowStockAlertEmail(params)
        .then(() => {
          console.log(
            `[mail] Low stock alert sent for "${params.productName}" (${params.newStock} left) → ${mailConfig.notifyTo}`
          );
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error(
            `[mail] Failed to send low stock alert for "${params.productName}": ${message}`
          );
        })
    );
  } else if (mailConfig.enabled) {
    console.warn(
      `[mail] Low stock detected for "${params.productName}" but SMTP settings are incomplete.`
    );
  }

  if (isLowStockWhatsAppConfigured()) {
    tasks.push(
      sendLowStockAlertWhatsApp(params)
        .then(() => {
          console.log(
            `[whatsapp] Low stock alert sent for "${params.productName}" (${params.newStock} left) → ${whatsappConfig.notifyTo}`
          );
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : String(error);
          console.error(
            `[whatsapp] Failed to send low stock alert for "${params.productName}": ${message}`
          );
        })
    );
  } else if (whatsappConfig.enabled) {
    console.warn(
      `[whatsapp] Low stock detected for "${params.productName}" but CallMeBot settings are incomplete.`
    );
  }

  if (tasks.length === 0) {
    console.warn(
      `[alerts] Low stock detected for "${params.productName}" (${params.newStock} left) but no alert channels are configured.`
    );
    return;
  }

  await Promise.all(tasks);
}
