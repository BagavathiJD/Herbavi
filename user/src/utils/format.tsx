import type { Product } from '../types/product.tsx';

export function formatMoney(amount: number, _sampleDisplay = ''): string {
  return `₹${amount.toFixed(2)}`;
}

export function formatCardPrice(amount: number): string {
  return Number.isInteger(amount) ? `Rs. ${amount}` : `Rs. ${amount.toFixed(2)}`;
}

export function displayPrice(priceDisplay: string, fallbackPrice?: number): string {
  if (!priceDisplay.trim()) {
    return fallbackPrice != null ? formatCardPrice(fallbackPrice) : '';
  }

  const amount = parsePriceAmount(priceDisplay);
  return amount != null ? formatCardPrice(amount) : priceDisplay.replace(/^₹/, 'Rs. ');
}

export function parsePriceAmount(value: string | number): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  const cleaned = value.replace(/[^\d.]/g, '');
  const amount = Number(cleaned);
  return Number.isFinite(amount) ? amount : null;
}

export function getDiscountPercent(current: number, original: number): number | null {
  if (!original || original <= current) {
    return null;
  }

  return Math.round(((original - current) / original) * 100);
}

export function deriveListPrice(price: number): number {
  if (price <= 0) {
    return 0;
  }

  return Math.ceil(price * 1.33);
}

export function defaultProductDescription(name: string, description?: string): string {
  const trimmed = description?.trim();
  if (trimmed) return trimmed;
  return `Premium ${name} — crafted with natural ingredients for healthy, radiant skin.`;
}

export { assetUrl as assetPath } from './assets.ts';

export function productFromCard(product: Product) {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    priceDisplay: product.priceDisplay,
    oldPrice: product.oldPrice,
    image: product.image,
    url: product.url,
  };
}
