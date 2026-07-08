import type { Product } from '../types/product.tsx';
import { formatMoney, defaultProductDescription } from '../utils/format.tsx';
import staticProducts from '../data/products.json';

const TOKEN_KEY = 'herbavi_auth_token';
const SESSION_KEY = 'herbavi_session_active';

export interface ApiProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  measurementId: string;
  measurementValue: string;
  price: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
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

export function mapApiProduct(api: ApiProduct): Product {
  const image = api.imageUrl?.trim() || 'assets/images/product/product-1.jpg';
  const fallbackIndex = Math.abs(api.id.split('').reduce((sum, ch) => sum + ch.charCodeAt(0), 0)) % 12 + 1;
  const localFallback = `assets/images/product/product-${fallbackIndex}.jpg`;
  const resolvedImage =
    image.startsWith('data:') || image.startsWith('http://') || image.startsWith('https://')
      ? image
      : image.startsWith('assets/') || image.startsWith('/assets/')
        ? image.replace(/^\/?assets\//, 'assets/')
        : localFallback;

  return {
    id: api.id,
    name: api.name,
    price: api.price,
    priceDisplay: formatMoney(api.price),
    oldPrice: '',
    image: resolvedImage,
    brand: 'Herbavi',
    badge: api.status === 'Active' ? 'New' : '',
    rating: 4.5,
    url: `/product-detail?id=${encodeURIComponent(api.id)}`,
    description: defaultProductDescription(api.name, api.description),
  };
}

function mapStaticProduct(product: Product): Product {
  return {
    ...product,
    priceDisplay: formatMoney(product.price, product.priceDisplay),
    oldPrice: product.oldPrice ? product.oldPrice.replace(/^\$/, '₹') : '',
    description: defaultProductDescription(product.name, product.description),
    url: product.url?.startsWith('/') ? product.url : `/product-detail`,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products?status=Active');
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
  try {
    const res = await fetch('/api/products?status=Active');
    if (!res.ok) {
      throw new Error('Failed to load product');
    }
    const data = (await res.json()) as ApiProduct[];
    const match = data.find((item) => item.id === id);
    return match ? mapApiProduct(match) : null;
  } catch {
    const fallback = (staticProducts as Product[]).find((item) => item.id === id);
    return fallback ? mapStaticProduct(fallback) : null;
  }
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
  address: string;
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
