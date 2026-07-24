import { useCallback } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import type { CartItem, Product } from '../types/product.tsx';
import { formatProductTitle } from '../utils/format.tsx';

function productLabel(name: string) {
  return formatProductTitle(name);
}

function getMaxStock(product: Pick<Product, 'stock'>): number {
  return Math.max(0, Math.floor(Number(product.stock ?? 0)));
}

export function useCartActions() {
  const cart = useCart();
  const { showSuccess, showError, confirm } = useNotification();

  const addProductToCart = useCallback(
    (product: Product, quantity = 1) => {
      const maxStock = getMaxStock(product);
      if (maxStock <= 0) {
        showError('This product is out of stock.');
        return false;
      }

      const existing = cart.cart.find((item) => item.id === product.id);
      const currentQty = existing ? Number(existing.qty) || 1 : 0;
      const requested = Math.max(1, Math.floor(Number(quantity) || 1));

      if (currentQty + requested > maxStock) {
        showError('Stock exceeds available quantity.');
        if (currentQty >= maxStock) {
          return false;
        }
      }

      cart.addToCart(product, requested);

      const label = productLabel(product.name);
      const addedQty = Math.min(requested, maxStock - currentQty);
      showSuccess(
        addedQty > 1
          ? `${addedQty} × ${label} added to cart successfully.`
          : `${label} added to cart successfully.`,
      );
      return true;
    },
    [cart, showError, showSuccess],
  );

  const changeCartQty = useCallback(
    (item: CartItem, nextQty: number) => {
      const maxStock = getMaxStock(item);
      const normalized = Math.max(1, Math.floor(Number(nextQty) || 1));

      if (maxStock <= 0) {
        showError('This product is out of stock.');
        return false;
      }

      if (normalized > maxStock) {
        showError('Stock exceeds available quantity.');
        return false;
      }

      cart.updateCartQty(item.id, normalized);
      return true;
    },
    [cart, showError],
  );

  const removeCartItem = useCallback(
    async (item: Pick<CartItem, 'id' | 'name'>, skipConfirm = false) => {
      if (!skipConfirm) {
        const accepted = await confirm({
          title: 'Remove from cart',
          message: `Are you sure you want to remove "${productLabel(item.name)}" from your cart?`,
          confirmLabel: 'Yes, remove',
          cancelLabel: 'Cancel',
        });

        if (!accepted) {
          return false;
        }
      }

      cart.removeFromCart(item.id);
      showSuccess('Product removed from cart successfully.');
      return true;
    },
    [cart, confirm, showSuccess],
  );

  const toggleWishlistItem = useCallback(
    async (product: Product) => {
      if (cart.isInWishlist(product.id)) {
        const accepted = await confirm({
          title: 'Remove from wishlist',
          message: `Are you sure you want to remove "${productLabel(product.name)}" from your wishlist?`,
          confirmLabel: 'Yes, remove',
          cancelLabel: 'Cancel',
        });

        if (!accepted) {
          return cart.isInWishlist(product.id);
        }

        cart.removeFromWishlist(product.id);
        showSuccess('Product removed from wishlist successfully.');
        return false;
      }

      cart.toggleWishlist(product);
      showSuccess(`${productLabel(product.name)} added to wishlist.`);
      return true;
    },
    [cart, confirm, showSuccess],
  );

  const removeWishlistItem = useCallback(
    async (item: Pick<Product, 'id' | 'name'>) => {
      const accepted = await confirm({
        title: 'Remove from wishlist',
        message: `Are you sure you want to remove "${productLabel(item.name)}" from your wishlist?`,
        confirmLabel: 'Yes, remove',
        cancelLabel: 'Cancel',
      });

      if (!accepted) {
        return false;
      }

      cart.removeFromWishlist(item.id);
      showSuccess('Product removed from wishlist successfully.');
      return true;
    },
    [cart, confirm, showSuccess],
  );

  return {
    ...cart,
    addProductToCart,
    changeCartQty,
    removeCartItem,
    toggleWishlistItem,
    removeWishlistItem,
  };
}
