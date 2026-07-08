import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../types/product.tsx';
import { formatMoney } from '../utils/format.tsx';

interface CartContextValue {
  cart: CartItem[];
  wishlist: Product[];
  cartCount: number;
  wishlistCount: number;
  cartTotal: number;
  wishlistIds: string[];
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
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
    () => cart.reduce((sum, item) => sum + item.price * (item.qty || 1), 0),
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
      addToCart(product) {
        setCart((current) => {
          const existing = current.find((item) => item.id === product.id);
          if (existing) {
            return current.map((item) =>
              item.id === product.id ? { ...item, qty: (item.qty || 1) + 1 } : item,
            );
          }
          return [...current, { ...product, qty: 1 }];
        });
      },
      removeFromCart(id) {
        setCart((current) => current.filter((item) => item.id !== id));
      },
      updateCartQty(id, qty) {
        setCart((current) =>
          current.map((item) =>
            item.id === id ? { ...item, qty: Math.max(1, qty) } : item,
          ),
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
