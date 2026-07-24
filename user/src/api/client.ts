import type { Product, ProductDetailResult } from '../types/product.tsx';
import { formatMoney, defaultProductDescription, deriveListPrice, formatProductTitle } from '../utils/format.tsx';
import staticProducts from '../data/products.json';

const TOKEN_KEY = 'herbavi_auth_token';
const SESSION_KEY = 'herbavi_session_active';

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  galleryImages?: string[];
  measurementId: string;
  measurementValue: string;
  measurementName?: string;
  price: number;
  originalPrice?: number | null;
  stock?: number;
  status: 'Active' | 'Inactive';
  category: 'Siddha' | 'Ayurveda' | 'Unani';
  createdAt: string;
}

export interface Measurement {
  id: string;
  name: string;
  status: 'Enabled' | 'Disabled';
  createdAt: string;
}

export async function fetchMeasurements(): Promise<Measurement[]> {
  try {
    const res = await fetch('/api/measurements');
    if (!res.ok) {
      throw new Error('Failed to load measurements');
    }
    return (await res.json()) as Measurement[];
  } catch {
    return [];
  }
}

function mapApiCategory(value: ApiProduct['category'] | undefined): Product['category'] {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');

  if (normalized === 'siddha' || normalized === 'sidha') return 'siddha';
  if (normalized === 'unani') return 'unani';
  return 'ayurveda';
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role: string;
  createdAt: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function markSessionActive(): void {
  sessionStorage.setItem(SESSION_KEY, '1');
}

export function activateAuthSession(token: string): void {
  setToken(token);
  markSessionActive();
}

export function hasActiveSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === '1';
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function resolveProductImages(api: ApiProduct): string[] {
  const gallery = (api.galleryImages ?? [])
    .map((item) => item?.trim())
    .filter(Boolean)
    .slice(0, 4);
  const primary = api.imageUrl?.trim();
  if (gallery.length > 0) {
    return gallery;
  }
  return primary ? [primary] : [];
}

function resolveProductImagePath(raw: string, fallbackIndex: number): string {
  const image = raw.trim() || 'assets/images/product/product-1.jpg';
  const localFallback = `assets/images/product/product-${fallbackIndex}.jpg`;
  if (image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  if (image.startsWith('assets/') || image.startsWith('/assets/')) {
    return image.replace(/^\/?assets\//, 'assets/');
  }
  return localFallback;
}

function formatMeasurementLabel(value?: string, unitName?: string): string {
  const amount = value?.trim();
  const unit = unitName?.trim();
  if (amount && unit) return `${amount} ${unit}`;
  if (unit) return unit;
  if (amount) return amount;
  return '';
}

function resolveOriginalAmount(sellingPrice: number, originalPrice?: number | null): number | null {
  if (originalPrice != null && Number.isFinite(originalPrice) && originalPrice > sellingPrice) {
    return originalPrice;
  }

  if (originalPrice == null) {
    const derived = deriveListPrice(sellingPrice);
    return derived > sellingPrice ? derived : null;
  }

  return null;
}

export function mapApiProduct(api: ApiProduct): Product {
  const fallbackIndex = Math.abs(api.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)) % 12 + 1;
  const galleryImages = resolveProductImages(api).map((item) =>
    resolveProductImagePath(item, fallbackIndex)
  );
  const resolvedImage = galleryImages[0] ?? resolveProductImagePath(api.imageUrl ?? '', fallbackIndex);

  const productName = formatProductTitle(api.name);
  const originalAmount = resolveOriginalAmount(api.price, api.originalPrice);

  return {
    id: api.id,
    name: productName,
    price: api.price,
    priceDisplay: formatMoney(api.price),
    oldPrice: originalAmount != null ? formatMoney(originalAmount) : '',
    image: resolvedImage,
    galleryImages: galleryImages.length > 0 ? galleryImages : [resolvedImage],
    measurementLabel: formatMeasurementLabel(api.measurementValue, api.measurementName),
    measurementId: api.measurementId,
    measurementValue: api.measurementValue,
    measurementName: api.measurementName ?? '',
    brand: 'Herbavi',
    badge: api.status === 'Active' ? 'New' : '',
    rating: 4.5,
    url: `/product-detail?id=${encodeURIComponent(api.id)}`,
    description: defaultProductDescription(productName, api.description),
    category: mapApiCategory(api.category),
    stock: Math.max(0, Math.floor(Number(api.stock ?? 100))),
  };
}

function mapStaticProduct(product: Product): Product {
  const productName = formatProductTitle(product.name);
  const listPrice = product.oldPrice?.trim()
    ? product.oldPrice
    : formatMoney(deriveListPrice(product.price));

  return {
    ...product,
    name: productName,
    priceDisplay: formatMoney(product.price, product.priceDisplay),
    oldPrice: listPrice.replace(/^\$/, '₹'),
    galleryImages: product.galleryImages?.length ? product.galleryImages : [product.image],
    measurementLabel: product.measurementLabel ?? '',
    description: defaultProductDescription(productName, product.description),
    url: product.url?.startsWith('/') ? product.url : `/product-detail`,
    category: product.category ?? 'ayurveda',
    stock: Math.max(0, Math.floor(Number(product.stock ?? 100))),
  };
}

export async function fetchProducts(category?: Product['category'] | 'all'): Promise<Product[]> {
  try {
    const params = new URLSearchParams({ status: 'Active' });
    if (category && category !== 'all') {
      params.set('category', category);
    }
    const res = await fetch(`/api/products?${params.toString()}`);
    if (!res.ok) {
      throw new Error('Failed to load products');
    }
    const data = (await res.json()) as ApiProduct[];
    const active = data.filter((item) => item.status === 'Active');
    if (active.length === 0) {
      return (staticProducts as Product[]).map(mapStaticProduct);
    }
    return active.map(mapApiProduct);
  } catch {
    return (staticProducts as Product[]).map(mapStaticProduct);
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const detail = await fetchProductDetail(id);
  return detail?.product ?? null;
}

function buildProductDetailFromList(data: ApiProduct[], id: string): ProductDetailResult | null {
  const product = data.find((item) => item.id === id);
  if (!product) {
    return null;
  }

  const mapped = mapApiProduct(product);
  const normalizedName = product.name.trim().toLowerCase();
  const variants = data
    .filter((item) => item.name.trim().toLowerCase() === normalizedName)
    .map(mapApiProduct);

  return {
    product: mapped,
    variants: variants.length > 0 ? variants : [mapped],
  };
}

export async function fetchProductDetail(id: string): Promise<ProductDetailResult | null> {
  try {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = (await res.json()) as { product: ApiProduct; variants: ApiProduct[] };
      return {
        product: mapApiProduct(data.product),
        variants: data.variants.map(mapApiProduct),
      };
    }
  } catch {
    // Fall back to the list endpoint below.
  }

  try {
    const listRes = await fetch('/api/products?status=Active');
    if (listRes.ok) {
      const data = (await listRes.json()) as ApiProduct[];
      const fromList = buildProductDetailFromList(data, id);
      if (fromList) {
        return fromList;
      }
    }
  } catch {
    // Fall back to bundled static products below.
  }

  const fallback = (staticProducts as Product[]).find((item) => item.id === id);
  if (!fallback) return null;
  const product = mapStaticProduct(fallback);
  return { product, variants: [product] };
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed.');
  }

  return data as { token: string; user: AuthUser };
}

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  phone: string;
  dob: string;
}): Promise<{ token: string; user: AuthUser }> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed.');
  }

  return data as { token: string; user: AuthUser };
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', { headers: authHeaders() });
    if (!res.ok) {
      clearToken();
      return null;
    }
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

export async function updateUserProfile(payload: {
  name: string;
  email: string;
  phone: string;
}): Promise<AuthUser> {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Profile update failed.');
  }

  return data as AuthUser;
}

export async function resetPassword(email: string, newPassword: string): Promise<string> {
  const res = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, newPassword }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Password reset failed.');
  }
  return data.message as string;
}

export interface CheckoutCartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  priceDisplay?: string;
  image?: string;
}

export interface CheckoutPayload {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  city: string;
  state: string;
  zipCode: string;
  deliveryMethod: 'Delivery' | 'Pickup';
  discountCode?: string;
  discountAmount: number;
  subtotal: number;
  shippingAmount: number;
  totalAmount: number;
  cartItems: CheckoutCartItem[];
  termsAccepted: boolean;
}

export interface CheckoutResult {
  message: string;
  ordersCreated?: number;
  checkout?: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    city: string;
    state: string;
    zipCode: string;
    deliveryMethod: string;
    discountCode: string;
    discountAmount: number;
    subtotal: number;
    shippingAmount: number;
    totalAmount: number;
    createdAt: string;
  };
}

export async function submitCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const res = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    if (res.status === 404) {
      throw new Error('Checkout service is unavailable. Please restart the server and try again.');
    }
    throw new Error('Checkout failed. Unexpected server response.');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Checkout failed.');
  }

  return data as CheckoutResult;
}
