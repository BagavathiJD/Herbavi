function readBool(value: string | undefined, defaultValue = false): boolean {
  if (value == null || value.trim() === "") {
    return defaultValue;
  }

  return ["true", "1", "yes", "on"].includes(value.trim().toLowerCase());
}

function readString(value: string | undefined): string {
  return (value ?? "").trim().replace(/^"|"$/g, "");
}

export const mailConfig = {
  enabled: readBool(process.env.LOW_STOCK_EMAIL_ENABLED, false),
  notifyTo: readString(process.env.LOW_STOCK_NOTIFY_EMAIL),
  threshold: Math.max(1, Math.floor(Number(process.env.LOW_STOCK_THRESHOLD) || 10)),
  smtp: {
    host: readString(process.env.SMTP_HOST),
    port: Math.max(1, Math.floor(Number(process.env.SMTP_PORT) || 587)),
    secure: readBool(process.env.SMTP_SECURE, false),
    user: readString(process.env.SMTP_USER),
    pass: readString(process.env.SMTP_PASS),
    from: readString(process.env.SMTP_FROM) || readString(process.env.SMTP_USER) || "herbavi@localhost",
  },
};

export function isLowStockMailConfigured(): boolean {
  return (
    mailConfig.enabled &&
    mailConfig.notifyTo.length > 0 &&
    mailConfig.smtp.host.length > 0 &&
    mailConfig.smtp.user.length > 0 &&
    mailConfig.smtp.pass.length > 0
  );
}
