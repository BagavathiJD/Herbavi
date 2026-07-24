export const PRODUCT_CATEGORIES = ['Siddha', 'Ayurveda', 'Unani'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export function normalizeProductCategory(value: unknown): ProductCategory {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (normalized === 'siddha' || normalized === 'sidha') return 'Siddha';
  if (normalized === 'unani') return 'Unani';
  return 'Ayurveda';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  measurementId: string; // references Measurement
  measurementValue: string; // e.g. "1", "2" — combined with unit as "1 Kilogram (Kg)"
  price: number;
  originalPrice?: number | null;
  stock: number;
  status: 'Active' | 'Inactive';
  category: ProductCategory;
  createdAt: string;
}

export function formatProductMeasurement(
  measurementValue: string | undefined,
  unitName: string | undefined
): string {
  const value = measurementValue?.trim();
  const unit = unitName?.trim();
  if (value && unit) return `${value} ${unit}`;
  if (unit) return unit;
  if (value) return value;
  return "—";
}

export const CURRENCY_SYMBOL = "₹";

export function formatCurrency(
  amount: number,
  options?: { minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const minimumFractionDigits = options?.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2;
  return `${CURRENCY_SYMBOL}${amount.toLocaleString("en-IN", {
    minimumFractionDigits,
    maximumFractionDigits,
  })}`;
}

export function getProductDiscountPercent(
  actualPrice: number,
  discountPrice: number
): number | null {
  if (!actualPrice || actualPrice <= discountPrice) {
    return null;
  }

  return Math.round(((actualPrice - discountPrice) / actualPrice) * 100);
}

export function calculateDiscountPrice(
  actualPrice: number,
  discountPercent: number
): number {
  const sellingPrice = actualPrice * (1 - discountPercent / 100);
  return Math.round(sellingPrice * 100) / 100;
}

export const LOW_STOCK_THRESHOLD = 10;

export function isLowStock(stock: number): boolean {
  return stock < LOW_STOCK_THRESHOLD;
}

export function formatStockLabel(stock: number): string {
  if (stock <= 0) return "Out of stock";
  return `${stock} left`;
}

export interface Measurement {
  id: string;
  name: string;
  status: 'Enabled' | 'Disabled';
  createdAt: string;
}

export interface ProductName {
  id: string;
  name: string;
  status: 'Enabled' | 'Disabled';
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  productId: string;
  productName: string;
  productImageUrl: string;
  quantity: number;
  measurementName: string;
  price: number;
  totalAmount: number;
  orderStatus: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpend: number;
  status: 'Active' | 'Blocked';
  joinDate: string;
}

export interface SqlQueryLog {
  id: string;
  query: string;
  executedAt: string;
  durationMs: number;
  success: boolean;
  error?: string;
}

export interface DbMetrics {
  totalQueries: number;
  connectionPool: number;
  storageSizeKb: number;
  activeTransactions: number;
}

export interface AppUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber: string;
  role: 'Admin' | 'User';
  createdAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  dob?: string;
  role: 'Admin' | 'User';
  createdAt: string;
}
