import type { Product } from '../types/product.tsx';

export function formatMoney(amount: number, _sampleDisplay = ''): string {
  return `₹${amount.toFixed(2)}`;
}

export function displayPrice(priceDisplay: string, fallbackPrice?: number): string {
  if (!priceDisplay.trim()) {
    return fallbackPrice != null ? formatMoney(fallbackPrice) : '';
  }
  return priceDisplay.replace(/^\$/, '₹');
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
