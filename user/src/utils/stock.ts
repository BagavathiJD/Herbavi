export const LOW_STOCK_THRESHOLD = 10;

export type StockDisplayVariant = 'out' | 'low';

export function normalizeStock(stock: unknown): number {
  return Math.max(0, Math.floor(Number(stock ?? 0)));
}

export function getStockDisplay(
  stock: unknown,
): { text: string; variant: StockDisplayVariant } | null {
  const normalized = normalizeStock(stock);

  if (normalized <= 0) {
    return { text: 'Out of stock', variant: 'out' };
  }

  if (normalized < LOW_STOCK_THRESHOLD) {
    return { text: `Hurry! Only ${normalized} left`, variant: 'low' };
  }

  return null;
}

export function getStockClassName(baseClass: string, variant: StockDisplayVariant): string {
  if (variant === 'out') return `${baseClass} is-out`;
  if (variant === 'low') return `${baseClass} is-low`;
  return baseClass;
}
