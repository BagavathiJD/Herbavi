import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Product } from '../types/product.tsx';

interface QuickViewContextValue {
  product: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextValue | null>(null);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);

  const value = useMemo<QuickViewContextValue>(
    () => ({
      product,
      openQuickView(selected) {
        setProduct(selected);
        const el = document.getElementById('modalQuickView');
        const bootstrap = (
          window as Window & {
            bootstrap?: { Modal: { getOrCreateInstance: (el: HTMLElement) => { show: () => void } } };
          }
        ).bootstrap;
        if (el && bootstrap) {
          bootstrap.Modal.getOrCreateInstance(el).show();
        }
      },
      closeQuickView() {
        setProduct(null);
      },
    }),
    [product],
  );

  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (!context) {
    throw new Error('useQuickView must be used within QuickViewProvider');
  }
  return context;
}
