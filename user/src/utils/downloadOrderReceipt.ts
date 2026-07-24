import { formatMoney } from './format.tsx';

export interface OrderReceiptItem {
  name: string;
  qty: number;
  price: number;
  priceDisplay?: string;
}

export interface OrderReceiptData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryMethod: string;
  discountCode?: string;
  discountAmount: number;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  items: OrderReceiptItem[];
  placedAt?: string;
}

function formatDate(value?: string): string {
  if (!value) return new Date().toLocaleString('en-IN');
  return new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function buildReceiptHtml(data: OrderReceiptData): string {
  const rows = data.items
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td style="text-align:center">${item.qty}</td>
        <td style="text-align:right">${formatMoney(item.price * item.qty, item.priceDisplay)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Herbavi Order Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; color: #2c4a34; margin: 32px; }
    h1 { color: #355e3b; margin-bottom: 4px; }
    .meta { color: #666; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .section h2 { font-size: 16px; color: #355e3b; border-bottom: 1px solid #ddd; padding-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { padding: 8px 4px; border-bottom: 1px solid #eee; font-size: 14px; }
    th { text-align: left; color: #355e3b; }
    .totals { margin-top: 16px; width: 280px; margin-left: auto; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .total { font-weight: bold; font-size: 16px; border-top: 1px solid #ccc; margin-top: 8px; padding-top: 8px; }
  </style>
</head>
<body>
  <h1>Herbavi — Order Receipt</h1>
  <p class="meta">${formatDate(data.placedAt)}</p>

  <div class="section">
    <h2>Customer Details</h2>
    <p><strong>${data.fullName}</strong><br />
    ${data.email}<br />
    +91 ${data.phone}</p>
    ${
      data.address
        ? `<p>${data.address.replace(/\n/g, '<br />')}</p>`
        : ''
    }
    <p>${data.city}, ${data.state} ${data.zipCode}<br />${data.country}</p>
    <p>Delivery method: <strong>${data.deliveryMethod}</strong></p>
  </div>

  <div class="section">
    <h2>Products</h2>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="totals">
      <div><span>Subtotal</span><span>${formatMoney(data.subtotal)}</span></div>
      <div><span>Shipping</span><span>${data.shippingAmount === 0 ? 'Free' : formatMoney(data.shippingAmount)}</span></div>
      ${
        data.discountAmount > 0
          ? `<div><span>Discount${data.discountCode ? ` (${data.discountCode})` : ''}</span><span>-${formatMoney(data.discountAmount)}</span></div>`
          : ''
      }
      <div class="total"><span>Total</span><span>${formatMoney(data.totalAmount)}</span></div>
    </div>
  </div>

  <p class="meta">Thank you for shopping with Herbavi.</p>
</body>
</html>`;
}

export function downloadOrderReceipt(data: OrderReceiptData): void {
  const stamp = data.placedAt ? new Date(data.placedAt).getTime() : Date.now();
  const html = buildReceiptHtml(data);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `herbavi-receipt-${stamp}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
