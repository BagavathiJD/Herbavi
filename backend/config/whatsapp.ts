function readBool(value: string | undefined, defaultValue = false): boolean {
  if (value == null || value.trim() === "") {
    return defaultValue;
  }

  return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
}

function readString(value: string | undefined): string {
  return (value ?? "").trim().replace(/^"|"$/g, "");
}

export function normalizeWhatsAppNumber(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+${digits}`;
  }

  return digits.startsWith("+") ? digits : `+${digits}`;
}

export function formatCallMeBotPhone(phone: string): string {
  return normalizeWhatsAppNumber(phone).replace(/\D/g, "");
}

export const whatsappConfig = {
  enabled: readBool(process.env.LOW_STOCK_WHATSAPP_ENABLED, false),
  notifyTo: normalizeWhatsAppNumber(readString(process.env.LOW_STOCK_WHATSAPP_TO)),
  callMeBotApiKey: readString(process.env.CALLMEBOT_API_KEY),
};

export function isLowStockWhatsAppConfigured(): boolean {
  return (
    whatsappConfig.enabled &&
    whatsappConfig.notifyTo.length > 0 &&
    whatsappConfig.callMeBotApiKey.length > 0
  );
}
