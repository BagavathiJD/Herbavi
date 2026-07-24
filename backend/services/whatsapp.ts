import {
  formatCallMeBotPhone,
  isLowStockWhatsAppConfigured,
  whatsappConfig,
} from "../config/whatsapp.js";
import {
  buildLowStockAlertText,
  type LowStockAlertPayload,
} from "./lowStockAlertMessage.js";

const CALLMEBOT_API_URL = "https://api.callmebot.com/whatsapp.php";

export async function sendLowStockAlertWhatsApp(payload: LowStockAlertPayload): Promise<void> {
  if (!isLowStockWhatsAppConfigured()) {
    return;
  }

  const phone = formatCallMeBotPhone(whatsappConfig.notifyTo);
  const text = buildLowStockAlertText(payload);
  const url = new URL(CALLMEBOT_API_URL);
  url.searchParams.set("phone", phone);
  url.searchParams.set("text", text);
  url.searchParams.set("apikey", whatsappConfig.callMeBotApiKey);

  const response = await fetch(url);
  const body = (await response.text()).trim();

  if (!response.ok) {
    throw new Error(body || `CallMeBot request failed (${response.status})`);
  }

  const lowerBody = body.toLowerCase();
  if (lowerBody.includes("error") || lowerBody.includes("invalid")) {
    throw new Error(body || "CallMeBot rejected the WhatsApp message.");
  }
}
