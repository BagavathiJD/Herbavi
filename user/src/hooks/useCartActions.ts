import { useCallback } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useNotification } from '../context/NotificationContext.tsx';
import type { CartItem, Product } from '../types/product.tsx';
import { formatProductTitle } from '../utils/format.tsx';

function productLabel(name: string) {
  return formatProductTitle(name);
}

export function useCartActions() {
  const cart = useCart();
  const { showSuccess, confirm } = useNotification();

  const addProductToCart = useCallback(
    (product: Product, quantity = 1) => {
      const qty = Math.max(1, quantity);
      for (let index = 0; index < qty; index += 1) {
        cart.addToCart(product);
      }

      const label = productLabel(product.name);
      showSuccess(
        qty > 1 ? `${qty} × ${label} added to cart successfully.` : `${label} added to cart successfully.`,
      );
    },
    [cart, showSuccess],
  );

  const removeCartItem = useCallback(
    async (item: Pick<CartItem, 'id' | 'name'>) => {
      const accepted = await confirm({
        title: 'Remove from cart',
        message: `Are you sure you want to remove "${productLabel(item.name)}" from your cart?`,
        confirmLabel: 'Yes, remove',
        cancelLabel: 'Cancel',
      });

      if (!accepted) {
        return false;
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
    removeCartItem,
    toggleWishlistItem,
    removeWishlistItem,
  };
}
