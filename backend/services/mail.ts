import nodemailer from "nodemailer";
import { isLowStockMailConfigured, mailConfig } from "../config/mail.js";
import {
  buildLowStockAlertText,
  type LowStockAlertPayload,
} from "./lowStockAlertMessage.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: mailConfig.smtp.host,
      port: mailConfig.smtp.port,
      secure: mailConfig.smtp.secure,
      auth: {
        user: mailConfig.smtp.user,
        pass: mailConfig.smtp.pass,
      },
    });
  }

  return transporter;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildEmailContent(payload: LowStockAlertPayload) {
  const { productName, newStock } = payload;
  const safeName = escapeHtml(productName);
  const isSoldOut = newStock <= 0;
  const stockLabel = isSoldOut ? "Out of stock" : String(newStock);
  const subject = isSoldOut
    ? `[Herbavi] Out of stock: ${productName}`
    : `[Herbavi] Low stock: ${productName}`;

  const intro = isSoldOut
    ? "The following product is now out of stock. Please restock soon."
    : "The following product has low stock (under 10 units left). Please restock soon.";

  const text = buildLowStockAlertText(payload);

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:640px;">
      <h2 style="color:#14532d;margin:0 0 8px;font-size:22px;">Herbavi low stock alert</h2>
      <p style="margin:0 0 20px;color:#4b5563;">${intro}</p>
      <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#f0fdf4;">
            <th style="padding:12px 14px;text-align:left;font-size:13px;color:#14532d;border-bottom:1px solid #e5e7eb;">Product name</th>
            <th style="padding:12px 14px;text-align:left;font-size:13px;color:#14532d;border-bottom:1px solid #e5e7eb;">Stock left</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:14px;vertical-align:middle;font-size:15px;font-weight:600;color:#111827;">${safeName}</td>
            <td style="padding:14px;vertical-align:middle;font-size:15px;font-weight:700;color:${isSoldOut ? "#b91c1c" : "#c2410c"};">${stockLabel}</td>
          </tr>
        </tbody>
      </table>
      <p style="margin:18px 0 0;color:#6b7280;font-size:13px;">Please restock this product in the admin panel.</p>
    </div>
  `;

  return { subject, text, html };
}

export async function sendLowStockAlertEmail(payload: LowStockAlertPayload): Promise<void> {
  if (!isLowStockMailConfigured()) {
    return;
  }

  const { subject, text, html } = buildEmailContent(payload);

  await getTransporter().sendMail({
    from: mailConfig.smtp.from,
    to: mailConfig.notifyTo,
    subject,
    text,
    html,
  });
}
