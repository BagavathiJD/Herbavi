import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts } from '../api/client.ts';
import type { Product } from '../types/product.tsx';
import ProductCard from '../components/ProductCard.tsx';
import { assetUrl } from '../utils/assets.ts';

type TraditionFilter = 'all' | 'siddha' | 'ayurveda';

const SHOP_BANNERS = [
  {
    title: 'Siddha Skincare Collection',
    description:
      'Explore heritage Siddha remedies blended with botanical actives for deep nourishment and a naturally luminous complexion.',
    image: 'assets/images/section/ayurvedha-banner1.jpg',
  },
  {
    title: 'Ayurvedic Beauty Rituals',
    description:
      'Restore balance with plant-powered Ayurvedic formulas designed to calm, hydrate, and renew your skin every day.',
    image: 'assets/images/section/ayurvedha-banner2.jpg',
  },
] as const;

const TRADITION_FILTERS: { id: TraditionFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'siddha', label: 'Siddha' },
  { id: 'ayurveda', label: 'Ayurveda' },
];

function productTradition(product: Product): 'siddha' | 'ayurveda' {
  const hash = product.id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return hash % 2 === 0 ? 'siddha' : 'ayurveda';
}

function matchesSearchQuery(product: Product, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;

  return [product.name, product.description, product.brand]
    .join(' ')
    .toLowerCase()
    .includes(normalized);
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';
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
    let results = productList;

    if (activeTradition !== 'all') {
      results = results.filter((product) => productTradition(product) === activeTradition);
    }

    if (searchQuery.trim()) {
      results = results.filter((product) => matchesSearchQuery(product, searchQuery));
    }

    return results;
  }, [activeTradition, productList, searchQuery]);

  const activeTraditionIndex = Math.max(
    0,
    TRADITION_FILTERS.findIndex((option) => option.id === activeTradition)
  );

  return (
    <>
      <section className="herbavi-shop-banner-slider position-relative">
        <div
          dir="ltr"
          className="swiper tf-swiper herbavi-shop-banner-swiper"
          data-preview="1"
          data-tablet="1"
          data-mobile="1"
          data-space="0"
          data-auto={1}
          data-loop={1}
          data-delay={4500}
          data-speed={900}
          data-effect="fade"
          data-pagination="1"
          data-pagination-sm="1"
          data-pagination-md="1"
          data-pagination-lg="1"
        >
          <div className="swiper-wrapper">
            {SHOP_BANNERS.map((banner, index) => (
              <div key={banner.title} className="swiper-slide">
                <div className="tf-page-heading herbavi-shop-banner flat-spacing-5 position-relative banner-connected">
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
                          <h3 className="page-title font-instrument_serif fw-normal">{banner.title}</h3>
                          <p className="page-desc">{banner.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-img-item">
                    <img
                      loading={index === 0 ? 'eager' : 'lazy'}
                      width={1920}
                      height={498}
                      src={assetUrl(banner.image)}
                      alt={banner.title}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="sw-line-default style-3 tf-sw-pagination herbavi-shop-banner-pagination" />
        </div>
      </section>

      <div className="flat-spacing herbavi-products-page">
        <div className="herbavi-tradition-bar">
          <div className="container-full">
            <nav className="herbavi-tradition-nav" aria-label="Shop by tradition">
              <div
                className="herbavi-tradition-filter"
                role="tablist"
                style={{ '--active-index': activeTraditionIndex } as React.CSSProperties}
              >
                <span className="herbavi-tradition-indicator" aria-hidden="true" />
                {TRADITION_FILTERS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTradition === option.id}
                    className={activeTradition === option.id ? 'is-active' : undefined}
                    onClick={() => setActiveTradition(option.id)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>
        <div className="container-full">
          <div
            key={activeTradition}
            className="wrapper-control-shop gridLayout-wrapper herbavi-products-grid herbavi-products-grid--animate"
          >
            <div className="tf-grid-layout tf-col-2 md-col-3 xl-col-4 wrapper-shop" id="gridLayout">
              {loading ? (
                <div className="col-12 text-center py-5">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="col-12 text-center py-5">
                  {searchQuery.trim()
                    ? `No products found for "${searchQuery.trim()}".`
                    : 'No products found for this category.'}
                </div>
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
