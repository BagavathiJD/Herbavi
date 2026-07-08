const USER_PREFIX = '/user';
const FALLBACK_PRODUCT_IMAGE = 'assets/images/product/product-1.jpg';

export function assetUrl(path: string): string {
  if (!path) return `${USER_PREFIX}/${FALLBACK_PRODUCT_IMAGE}`;

  const normalized = path.replace(/\\/g, '/');

  if (
    normalized.startsWith('data:') ||
    normalized.startsWith('http://') ||
    normalized.startsWith('https://') ||
    normalized.startsWith('blob:')
  ) {
    return normalized;
  }

  if (normalized.startsWith('/user/')) return normalized;
  if (normalized.startsWith('user/')) return `/${normalized}`;
  if (normalized.startsWith('/assets/')) return `${USER_PREFIX}${normalized}`;
  if (normalized.startsWith('assets/')) return `${USER_PREFIX}/${normalized}`;
  return `${USER_PREFIX}/assets/${normalized.replace(/^\//, '')}`;
}

export const LEGACY_SCRIPT_BASE = `${USER_PREFIX}/assets/js`;
