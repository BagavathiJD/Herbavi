import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/client.ts';
import ProductCard from './ProductCard.tsx';
import type { Product } from '../types/product.tsx';

const RECENT_COUNT = 6;

export default function RecentProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const list = await fetchProducts('all');
      if (!cancelled) {
        setProducts(list.slice(0, RECENT_COUNT));
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const marqueeItems = useMemo(() => {
    if (products.length === 0) return [];
    return [...products, ...products];
  }, [products]);

  if (!loading && products.length === 0) {
    return null;
  }

  return (
    <section className="herbavi-recent-products flat-spacing" aria-label="Recent products">
      <div className="container">
        <div className="herbavi-recent-products-heading">
          <p className="eyebrow-label herbavi-eyebrow">
            <span className="herbavi-br-dot" aria-hidden="true" />
            <span className="eyebrow-text">Shop</span>
          </p>
          <h2 className="herbavi-recent-products-title font-instrument_serif">Recent Products</h2>
          <p className="herbavi-recent-products-subtitle font-geist">
            Discover our latest ayurvedic and siddha wellness essentials.
          </p>
        </div>
      </div>

      <div className="herbavi-recent-products-marquee">
        {loading ? (
          <div className="container">
            <div className="herbavi-recent-products-loading font-geist">Loading products...</div>
          </div>
        ) : (
          <div className="herbavi-recent-products-track-wrap">
            <div className="herbavi-recent-products-track">
              {marqueeItems.map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="herbavi-recent-products-slide"
                  aria-hidden={index >= products.length}
                >
                  <ProductCard product={product} layout="grid" showBuyNow={false} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!loading && (
        <div className="herbavi-recent-products-footer">
          <Link to="/products" className="herbavi-recent-products-more">
            Show more
            <i className="icon icon-ArrowRight" aria-hidden="true" />
          </Link>
        </div>
      )}
    </section>
  );
}
