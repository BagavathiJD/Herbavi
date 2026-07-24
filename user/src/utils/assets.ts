const FALLBACK_PRODUCT_IMAGE = 'assets/images/product/product-1.jpg';

export function assetUrl(path: string): string {
  if (!path) return `/${FALLBACK_PRODUCT_IMAGE}`;

  const normalized = path.replace(/\\/g, '/');

  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  if (normalized.startsWith('/user/')) {
    return normalized.replace(/^\/user/, '');
  }
  if (normalized.startsWith('user/')) {
    return `/${normalized.replace(/^user\//, '')}`;
  }
  if (normalized.startsWith('/assets/')) return normalized;
  if (normalized.startsWith('assets/')) return `/${normalized}`;
  return `/assets/${normalized.replace(/^\//, '')}`;
}

export const LEGACY_SCRIPT_BASE = '/assets/js';
