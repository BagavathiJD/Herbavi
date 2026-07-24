import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types/product.tsx';
import { formatMoney, parsePriceAmount } from '../utils/format.tsx';

interface CartContextValue {
  cart: CartItem[];
  wishlist: Product[];
  cartCount: number;
  wishlistCount: number;
  cartTotal: number;
  wishlistIds: string[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateCartQty: (id: string, qty: number) => boolean;
  syncStockFromProducts: (products: Product[]) => void;
  toggleWishlist: (product: Product) => boolean;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

const CART_KEY = 'herbavi-cart';
const WISHLIST_KEY = 'herbavi-wishlist';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getMaxStock(product: Pick<Product, 'stock'>): number {
  return Math.max(0, Math.floor(Number(product.stock ?? 0)));
}

function clampQty(qty: number, maxStock: number): number {
  if (maxStock <= 0) return 0;
  return Math.min(Math.max(1, Math.floor(Number(qty) || 1)), maxStock);
}

function getItemUnitPrice(item: CartItem): number {
  const numericPrice = Number(item.price);
  if (Number.isFinite(numericPrice) && numericPrice > 0) {
    return numericPrice;
  }
  return parsePriceAmount(item.priceDisplay) ?? 0;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => readStorage(CART_KEY, []));
  const [wishlist, setWishlist] = useState<Product[]>(() => readStorage(WISHLIST_KEY, []));

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.qty || 1), 0),
    [cart],
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + getItemUnitPrice(item) * (Number(item.qty) || 1), 0),
    [cart],
  );

  const wishlistIds = useMemo(() => wishlist.map((item) => item.id), [wishlist]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      wishlist,
      cartCount,
      wishlistCount: wishlist.length,
      cartTotal,
      wishlistIds,
      addToCart(product, quantity = 1) {
        const maxStock = getMaxStock(product);
        if (maxStock <= 0) return;

        const requested = Math.max(1, Math.floor(Number(quantity) || 1));
        setCart((current) => {
          const existing = current.find((item) => item.id === product.id);
          if (existing) {
            const currentQty = Number(existing.qty) || 1;
            const nextQty = clampQty(currentQty + requested, maxStock);
            if (nextQty === currentQty) return current;
            return current.map((item) =>
              item.id === product.id
                ? { ...item, ...product, qty: nextQty, stock: maxStock }
                : item,
            );
          }

          return [...current, { ...product, qty: clampQty(requested, maxStock), stock: maxStock }];
        });
      },
      removeFromCart(id) {
        setCart((current) => current.filter((item) => item.id !== id));
      },
      clearCart() {
        setCart([]);
      },
      updateCartQty(id, qty) {
        let updated = false;
        setCart((current) =>
          current.map((item) => {
            if (item.id !== id) return item;
            const maxStock = getMaxStock(item);
            const nextQty = clampQty(qty, maxStock);
            if (nextQty === (Number(item.qty) || 1)) {
              return item;
            }
            updated = nextQty !== (Number(item.qty) || 1);
            return { ...item, qty: nextQty };
          }),
        );
        return updated;
      },
      syncStockFromProducts(products) {
        const stockById = new Map(products.map((product) => [product.id, getMaxStock(product)]));
        setCart((current) =>
          current
            .map((item) => {
              const maxStock = stockById.get(item.id) ?? getMaxStock(item);
              const nextQty = clampQty(Number(item.qty) || 1, maxStock);
              return { ...item, stock: maxStock, qty: nextQty };
            })
            .filter((item) => getMaxStock(item) > 0 && (Number(item.qty) || 0) > 0),
        );
      },
      toggleWishlist(product) {
        const exists = wishlist.some((item) => item.id === product.id);
        if (exists) {
          setWishlist((current) => current.filter((item) => item.id !== product.id));
          return false;
        }
        setWishlist((current) => [...current, product]);
        return true;
      },
      removeFromWishlist(id) {
        setWishlist((current) => current.filter((item) => item.id !== id));
      },
      isInWishlist(id) {
        return wishlist.some((item) => item.id === id);
      },
    }),
    [cart, wishlist, cartCount, cartTotal, wishlistIds],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

export function useCartTotalDisplay(cart: CartItem[], total: number) {
  return formatMoney(total, cart[0]?.priceDisplay ?? '');
}
