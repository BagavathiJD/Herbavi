import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProductById } from '../api/client.ts';
import type { Product } from '../types/product.tsx';
import { assetUrl } from '../utils/assets.ts';

export default function ProductRightThumbnail() {
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = searchParams.get('id');
    let cancelled = false;

    (async () => {
      setLoading(true);
      const result = id ? await fetchProductById(id) : null;
      if (!cancelled) {
        setProduct(result);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  if (loading) {
    return (
      <section className="flat-spacing">
        <div className="container text-center py-5">Loading product...</div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="flat-spacing">
        <div className="container text-center py-5">
          <h1 className="font-instrument_serif mb-16">Product not found</h1>
          <Link to="/products" className="tf-btn style-2 type-2">
            Back to shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="flat-spacing">
      <div className="container">
        <div className="row g-30">
          <div className="col-lg-6">
            <img
              src={assetUrl(product.image)}
              alt={product.name}
              className="w-100"
              loading="lazy"
            />
          </div>
          <div className="col-lg-6">
            <h1 className="font-instrument_serif mb-16">{product.name}</h1>
            <p className="price-new fw-normal mb-24">{product.priceDisplay}</p>
            <p className="cl-text-5 mb-24">
              {product.description || 'A lightweight formula with botanical actives for clearer, smoother-looking skin.'}
            </p>
            <Link to="/products" className="tf-btn style-2 type-2">
              Back to shop
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
