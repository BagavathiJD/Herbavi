import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../api/client.ts';
import type { Product } from '../types/product.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { assetUrl } from '../utils/assets.ts';

type TraditionFilter = 'all' | 'siddha' | 'ayurveda';

const TRADITION_FILTERS: { id: TraditionFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'siddha', label: 'Siddha' },
  { id: 'ayurveda', label: 'Ayurveda' },
];

function productTradition(product: Product): 'siddha' | 'ayurveda' {
  const hash = product.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'siddha' : 'ayurveda';
}

export default function Products() {
  const [productList, setProductList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTradition, setActiveTradition] = useState<TraditionFilter>('all');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const products = await fetchProducts();
      if (!cancelled) {
        setProductList(products);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeTradition === 'all') {
      return productList;
    }

    return productList.filter((product) => productTradition(product) === activeTradition);
  }, [activeTradition, productList]);

  return (
    <>
      <section className="tf-page-heading herbavi-shop-banner flat-spacing-5 position-relative banner-connected">
        <div className="container banner-content">
          <div className="row">
            <div className="col-12 col-md-7 col-lg-6">
              <div className="content text-start">
                <ul className="breadcrumb">
                  <li>
                    <Link to="/" className="link">
                      HOME
                    </Link>
                  </li>
                  <li>
                    <i className="icon icon-ArrowCaretRight"></i>
                  </li>
                  <li>SHOP</li>
                </ul>
                <h3 className="page-title font-instrument_serif fw-normal">Shop All Products</h3>
                <p className="page-desc cl-text-main">
                  From gentle cleansers to powerful serums, find your skin&apos;s perfect match among our best-selling
                  and newest skincare formulas.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-img-item">
          <img
            loading="lazy"
            width={1920}
            height={498}
            src={assetUrl('assets/images/section/page-title-shop.jpg')}
            alt="Shop banner"
          />
        </div>
      </section>

      <div className="flat-spacing herbavi-products-page">
        <div className="herbavi-tradition-bar tf-shop-control sticky-top no-offset">
          <div className="container-full">
            <div className="col-left">
              <div className="herbavi-tradition-filter fw-normal text-uppercase">
                {TRADITION_FILTERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={activeTradition === option.id ? 'is-active' : undefined}
                    onClick={() => setActiveTradition(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="container-full">
          <div className="wrapper-control-shop gridLayout-wrapper herbavi-products-grid">
            <div className="tf-grid-layout tf-col-2 md-col-3 xl-col-4 wrapper-shop" id="gridLayout">
              {loading ? (
                <div className="col-12 text-center py-5">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-12 text-center py-5">No products found for this category.</div>
              ) : (
                filteredProducts.map((product) => <ProductCard key={product.id} product={product} layout="grid" />)
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container-full">
        <span className="br-line bg-line-5"></span>
      </div>
    </>
  );
}
